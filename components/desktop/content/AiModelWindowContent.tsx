"use client";

import { useCallback, useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
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
      setMessages((previous) => [...previous, userMessage]);
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
          }),
        });

        const data = (await response.json().catch(() => ({}))) as AiChatResponse;
        if (!response.ok) {
          setChatError(data.message ?? "AI request failed.");
          return;
        }

        setMessages((previous) => [
          ...previous,
          {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            text: data.answer ?? "No response returned.",
          },
        ]);
      } catch {
        setChatError("Could not reach the AI service.");
      } finally {
        setLoading(false);
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
    <div className="-m-6 flex h-[calc(100%+3rem)] flex-col overflow-hidden bg-[#f8fafc] md:-m-8 md:h-[calc(100%+4rem)]">
      <header className="flex items-center justify-between border-b border-black/10 bg-white px-4 py-3">
        <p className="text-sm font-semibold text-black">Model: llama4:latest</p>
        <button
          type="button"
          onClick={() => setMessages([])}
          className="rounded-md border border-black/15 px-2.5 py-1.5 text-xs font-medium text-black hover:bg-black/5"
        >
          Clear chat
        </button>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="rounded-xl border border-dashed border-black/20 bg-white p-5 text-sm text-black/60">
            Ask a question or upload an image for the model to analyze.
          </div>
        ) : (
          <ul className="space-y-3">
            {messages.map((message) => (
              <li
                key={message.id}
                className={`max-w-[90%] rounded-xl border px-3 py-2 text-sm ${
                  message.role === "user"
                    ? "ml-auto border-[#cddbfd] bg-[#e9f0ff] text-[#0f172a]"
                    : "border-black/10 bg-white text-black"
                }`}
              >
                {message.role === "assistant" && (
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-black/45">
                    assistant
                  </p>
                )}
                <div className="ai-markdown text-sm leading-relaxed">
                  <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                    {message.text}
                  </ReactMarkdown>
                </div>
                {message.imagePreviewUrl && (
                  <img
                    src={message.imagePreviewUrl}
                    alt="Uploaded context"
                    className="mt-2 max-h-40 w-auto rounded-lg border border-black/10 object-contain"
                  />
                )}
              </li>
            ))}
            {loading && (
              <li className="max-w-[90%] rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-black">
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-black/45">
                  assistant
                </p>
                <p className="text-sm text-black/70">Thinking...</p>
              </li>
            )}
          </ul>
        )}
      </main>

      <form onSubmit={sendPrompt} className="border-t border-black/10 bg-white p-3">
        <div className="mb-2 flex items-center gap-2">
          <input
            type="file"
            accept="image/*"
            onChange={onImageChange}
            className="max-w-[220px] text-xs text-black/70 file:mr-2 file:rounded-md file:border-0 file:bg-[#f0f2f6] file:px-2.5 file:py-1.5 file:text-xs file:font-medium file:text-black"
          />
          {imagePreviewUrl && (
            <button
              type="button"
              onClick={resetImage}
              className="rounded-md border border-black/15 px-2 py-1 text-xs hover:bg-black/5"
            >
              Remove image
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <label htmlFor="ai-prompt" className="sr-only">
            Ask AI model
          </label>
          <input
            id="ai-prompt"
            type="text"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="Ask anything..."
            className="min-w-0 flex-1 rounded-lg border border-black/20 px-3 py-2 text-sm outline-none ring-black/20 focus:ring-2"
          />
          <button
            type="submit"
            disabled={!canSubmit}
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-65"
          >
            {loading ? "Sending..." : "Send"}
          </button>
        </div>
        {chatError && <p className="mt-2 text-xs text-[#b42339]">{chatError}</p>}
      </form>
    </div>
  );
}
