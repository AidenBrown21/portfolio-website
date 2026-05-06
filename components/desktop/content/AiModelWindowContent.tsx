"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  imagePreviewUrl?: string;
};

type ChatHistoryTurn = {
  role: "user" | "assistant";
  text: string;
};

type AiChatResponse = {
  answer?: string;
  message?: string;
};

type UnlockResponse = {
  ok?: boolean;
  message?: string;
};

const SESSION_UNLOCK_KEY = "aiModelUnlocked";
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const MAX_CONTEXT_TURNS = 20;
const STREAM_DONE = "[DONE]";
const QUICK_PROMPTS = [
  "Summarize this for me",
  "Write anything",
  "Help me learn",
  "Plan my day",
] as const;

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("Could not read selected image."));
        return;
      }
      resolve(reader.result);
    };
    reader.onerror = () => reject(new Error("Could not read selected image."));
    reader.readAsDataURL(file);
  });

export default function AiModelWindowContent() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [unlocking, setUnlocking] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [prompt, setPrompt] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [chatError, setChatError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAttachMenuOpen, setIsAttachMenuOpen] = useState(false);
  const messageListRef = useRef<HTMLDivElement | null>(null);
  const promptInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    messageListRef.current?.scrollTo({
      top: messageListRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  useEffect(() => {
    if (window.sessionStorage.getItem(SESSION_UNLOCK_KEY) === "true") {
      setIsUnlocked(true);
    }
  }, []);

  const resetImage = useCallback(() => {
    setImageFile(null);
    setImagePreviewUrl(null);
  }, []);

  const canSubmit = useMemo(
    () => !loading && (!!prompt.trim() || imageFile !== null),
    [imageFile, loading, prompt],
  );

  const unlockModel = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!passwordInput.trim()) {
        setUnlockError("Password is required.");
        return;
      }

      setUnlocking(true);
      setUnlockError(null);

      try {
        const response = await fetch("/api/ai-auth", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ password: passwordInput }),
        });
        const data = (await response.json().catch(() => ({}))) as UnlockResponse;

        if (!response.ok || !data.ok) {
          setUnlockError(data.message ?? `Unlock failed (${response.status}).`);
          return;
        }

        window.sessionStorage.setItem(SESSION_UNLOCK_KEY, "true");
        setIsUnlocked(true);
        setPasswordInput("");
      } catch {
        setUnlockError("Could not verify password right now.");
      } finally {
        setUnlocking(false);
      }
    },
    [passwordInput],
  );

  const onImageChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) {
      resetImage();
      return;
    }

    if (!file.type.startsWith("image/")) {
      setChatError("Please select an image file.");
      event.target.value = "";
      resetImage();
      return;
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      setChatError("Image must be 5MB or smaller.");
      event.target.value = "";
      resetImage();
      return;
    }

    setChatError(null);
    setImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
  }, [resetImage]);

  const sendPrompt = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!canSubmit) {
        return;
      }

      setLoading(true);
      setChatError(null);

      const promptText = prompt.trim();
      const history: ChatHistoryTurn[] = messages
        .slice(-MAX_CONTEXT_TURNS)
        .map((message) => ({
          role: message.role,
          text:
            message.role === "user" && message.imagePreviewUrl
              ? `${message.text}\n[User also shared an image in this turn.]`
              : message.text,
        }));
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        text: promptText || "(Image question)",
        imagePreviewUrl: imagePreviewUrl ?? undefined,
      };
      const assistantMessageId = `assistant-${Date.now()}`;
      setMessages((previous) => [
        ...previous,
        userMessage,
        { id: assistantMessageId, role: "assistant", text: "" },
      ]);
      setPrompt("");

      try {
        const imageDataUrl = imageFile ? await fileToDataUrl(imageFile) : undefined;
        const response = await fetch("/api/ai-chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            prompt: promptText,
            imageDataUrl,
            history,
            stream: true,
          }),
        });

        if (!response.ok) {
          const data = (await response.json().catch(() => ({}))) as AiChatResponse;
          setChatError(data.message ?? "AI request failed.");
          setMessages((previous) =>
            previous.filter((message) => message.id !== assistantMessageId),
          );
          return;
        }

        const contentType = response.headers.get("content-type") ?? "";
        if (contentType.includes("text/event-stream")) {
          const reader = response.body?.getReader();
          if (!reader) {
            throw new Error("Missing stream body");
          }

          const decoder = new TextDecoder();
          let buffer = "";
          let finalText = "";
          let done = false;

          while (!done) {
            const chunk = await reader.read();
            done = chunk.done;
            buffer += decoder.decode(chunk.value ?? new Uint8Array(), { stream: !done });

            const events = buffer.split("\n\n");
            buffer = events.pop() ?? "";

            for (const eventBlock of events) {
              const dataLines = eventBlock
                .split("\n")
                .filter((line) => line.startsWith("data:"))
                .map((line) => line.replace(/^data:\s?/, "").trim());

              for (const payload of dataLines) {
                if (!payload) continue;
                if (payload === STREAM_DONE) {
                  continue;
                }

                try {
                  const parsed = JSON.parse(payload) as {
                    type?: "delta" | "done" | "error";
                    delta?: string;
                    message?: string;
                  };

                  if (parsed.type === "delta" && parsed.delta) {
                    finalText += parsed.delta;
                    setMessages((previous) =>
                      previous.map((message) =>
                        message.id === assistantMessageId
                          ? { ...message, text: finalText }
                          : message,
                      ),
                    );
                  }

                  if (parsed.type === "error") {
                    throw new Error(parsed.message ?? "Streaming failed.");
                  }
                } catch {
                  // Ignore malformed stream chunks and continue parsing.
                }
              }
            }
          }

          setMessages((previous) =>
            previous.map((message) =>
              message.id === assistantMessageId
                ? {
                    ...message,
                    text: message.text.trim() || "No response returned.",
                  }
                : message,
            ),
          );
          return;
        }

        const data = (await response.json().catch(() => ({}))) as AiChatResponse;
        setMessages((previous) =>
          previous.map((message) =>
            message.id === assistantMessageId
              ? { ...message, text: data.answer ?? "No response returned." }
              : message,
          ),
        );
      } catch {
        setChatError("Could not reach the AI service.");
        setMessages((previous) =>
          previous.filter((message) => message.id !== assistantMessageId),
        );
      } finally {
        setLoading(false);
        setIsAttachMenuOpen(false);
        resetImage();
      }
    },
    [canSubmit, imageFile, imagePreviewUrl, prompt, resetImage],
  );

  if (!isUnlocked) {
    return (
      <div className="-m-6 flex h-[calc(100%+3rem)] items-center justify-center bg-[#f6f7fb] p-6 md:-m-8 md:h-[calc(100%+4rem)]">
        <div className="w-full max-w-md rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-black/45">
            Private Access
          </p>
          <h2 className="mt-2 text-xl font-semibold text-black">Insert password</h2>
          <p className="mt-1 text-sm text-black/60">
            This AI model app is restricted to trusted users.
          </p>
          <form className="mt-4 space-y-3" onSubmit={unlockModel}>
            <label htmlFor="ai-password" className="sr-only">
              App password
            </label>
            <input
              id="ai-password"
              type="password"
              value={passwordInput}
              onChange={(event) => setPasswordInput(event.target.value)}
              className="w-full rounded-lg border border-black/20 px-3 py-2 text-sm outline-none ring-black/20 focus:ring-2"
              placeholder="Password"
              autoComplete="current-password"
            />
            <button
              type="submit"
              disabled={unlocking}
              className="w-full rounded-lg bg-black px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-70"
            >
              {unlocking ? "Checking..." : "Unlock AI Model"}
            </button>
          </form>
          {unlockError && <p className="mt-3 text-xs text-[#b42339]">{unlockError}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="-m-6 flex h-[calc(100%+3rem)] overflow-hidden bg-[#eef3fb] md:-m-8 md:h-[calc(100%+4rem)]">
      <aside className="hidden w-14 shrink-0 border-r border-black/10 bg-white/65 backdrop-blur md:flex md:flex-col md:items-center md:justify-between md:py-3">
        <button
          type="button"
          className="rounded-xl border border-black/10 bg-white/70 p-2 text-black/65 hover:bg-white"
          aria-label="Menu"
        >
          ≡
        </button>
        <button
          type="button"
          className="rounded-xl border border-black/10 bg-white/70 p-2 text-black/65 hover:bg-white"
          aria-label="Settings"
        >
          ⚙
        </button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-black/10 bg-white/70 px-4 py-3 backdrop-blur">
          <p className="text-sm font-semibold text-black/70">AI Model</p>
          <button
            type="button"
            onClick={() => setMessages([])}
            className="rounded-full border border-black/15 bg-white/70 px-3 py-1.5 text-xs font-medium text-black/80 hover:bg-white"
          >
            Clear chat
          </button>
        </header>

        <main ref={messageListRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-6">
          <div className="mx-auto flex min-h-full w-full max-w-4xl flex-col">
            {messages.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
                <p className="text-sm font-medium text-black/55">Hi there</p>
                <h2 className="mt-1 text-4xl font-medium tracking-tight text-black/80">
                  Where should we start?
                </h2>
              </div>
            ) : (
              <ul className="mx-auto flex w-full max-w-3xl flex-col gap-3 pb-24">
                {messages.map((message) => (
                  <li
                    key={message.id}
                  className={`ai-chat-bubble max-w-[92%] border px-4 py-3 text-sm shadow-[0_6px_24px_rgba(22,28,45,0.08)] ${
                      message.role === "user"
                      ? "ai-chat-bubble-user ml-auto border-[#c8d8fb] bg-[#e8f0ff]"
                        : "border-white/70 bg-white/80 backdrop-blur"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-black/45">
                        assistant
                      </p>
                    )}
                    <div className="ai-markdown text-sm leading-relaxed text-black/85">
                      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                        {message.text || "Thinking..."}
                      </ReactMarkdown>
                    </div>
                    {message.imagePreviewUrl && (
                      <img
                        src={message.imagePreviewUrl}
                        alt="Uploaded context"
                        className="mt-3 max-h-44 w-auto rounded-2xl border border-black/10 object-contain"
                      />
                    )}
                  </li>
                ))}
              </ul>
            )}

            <form onSubmit={sendPrompt} className="sticky bottom-0 z-10 mt-3 pb-2">
              <div className="ai-glass-panel mx-auto max-w-3xl p-3">
                <label htmlFor="ai-prompt" className="sr-only">
                  Ask AI model
                </label>
                <input
                  ref={promptInputRef}
                  id="ai-prompt"
                  type="text"
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  placeholder="Ask AI Model"
                  className="ai-glass-input w-full border-none bg-transparent px-2 py-1.5 text-sm text-black/90 outline-none placeholder:text-black/40 focus:ring-0"
                />

                <div className="mt-2 flex items-center justify-between gap-2">
                  <div className="relative flex items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={onImageChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setIsAttachMenuOpen((previous) => !previous)}
                      className="ai-glass-chip inline-flex h-8 w-8 items-center justify-center text-lg leading-none text-black/75"
                      aria-label="Open attachment options"
                    >
                      +
                    </button>
                    {isAttachMenuOpen && (
                      <div className="ai-glass-menu absolute bottom-11 left-0 min-w-[140px] p-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setIsAttachMenuOpen(false);
                            fileInputRef.current?.click();
                          }}
                          className="w-full rounded-xl px-3 py-2 text-left text-xs font-medium text-black/80 hover:bg-black/5"
                        >
                          Upload image
                        </button>
                      </div>
                    )}
                    {imagePreviewUrl && (
                      <button
                        type="button"
                        onClick={resetImage}
                        className="ai-glass-chip px-2.5 py-1 text-xs text-black/70"
                      >
                        Remove image
                      </button>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className="ai-glass-send px-4 py-2 text-sm font-medium text-black/85 disabled:cursor-not-allowed disabled:opacity-65"
                  >
                    {loading ? "Sending..." : "Send"}
                  </button>
                </div>
              </div>

              {messages.length === 0 && (
                <div className="mx-auto mt-3 flex max-w-3xl flex-wrap justify-center gap-2">
                  {QUICK_PROMPTS.map((quickPrompt) => (
                    <button
                      key={quickPrompt}
                      type="button"
                      onClick={() => {
                        setPrompt(quickPrompt);
                        setIsAttachMenuOpen(false);
                        promptInputRef.current?.focus();
                      }}
                      className="ai-glass-chip px-3 py-1.5 text-xs font-medium text-black/70"
                    >
                      {quickPrompt}
                    </button>
                  ))}
                </div>
              )}

              {chatError && (
                <p className="mx-auto mt-2 max-w-3xl text-xs text-[#b42339]">{chatError}</p>
              )}
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
