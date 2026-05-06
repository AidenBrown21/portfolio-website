const MAX_PROMPT_LENGTH = 4000;
const MAX_IMAGE_DATA_URL_LENGTH = 7 * 1024 * 1024;
const MAX_HISTORY_TURNS = 20;

type Env = {
  PURDUE_GENAI_API_KEY?: string;
  PURDUE_GENAI_MODEL?: string;
  PURDUE_GENAI_BASE_URL?: string;
};

type AiChatRequestBody = {
  prompt?: unknown;
  imageDataUrl?: unknown;
  history?: unknown;
  stream?: unknown;
};

type HistoryTurn = {
  role: "user" | "assistant";
  text: string;
};

type UpstreamChatResponse = {
  choices?: Array<{
    message?: {
      content?: string | Array<{ type?: string; text?: string }>;
    };
  }>;
  error?: {
    message?: string;
  };
};

const getChatEndpoint = (baseUrl: string): string => {
  const trimmedBase = baseUrl.trim().replace(/\/+$/, "");
  if (trimmedBase.endsWith("/chat/completions")) {
    return trimmedBase;
  }
  return `${trimmedBase}/chat/completions`;
};

const extractAssistantText = (upstreamJson: UpstreamChatResponse): string => {
  const content = upstreamJson.choices?.[0]?.message?.content;
  if (typeof content === "string") {
    return content.trim();
  }
  if (Array.isArray(content)) {
    return content
      .filter((part) => part.type === "text" && typeof part.text === "string")
      .map((part) => part.text?.trim() ?? "")
      .join("\n")
      .trim();
  }
  return "";
};

const extractDeltaText = (payload: Record<string, unknown>): string => {
  const choice = Array.isArray(payload.choices) ? payload.choices[0] : undefined;
  if (!choice || typeof choice !== "object") {
    return "";
  }
  const delta = (choice as { delta?: unknown }).delta;
  if (!delta || typeof delta !== "object") {
    return "";
  }
  const content = (delta as { content?: unknown }).content;
  if (typeof content === "string") {
    return content;
  }
  if (Array.isArray(content)) {
    return content
      .map((item) =>
        typeof item === "object" && item !== null && typeof (item as { text?: unknown }).text === "string"
          ? ((item as { text?: string }).text ?? "")
          : "",
      )
      .join("");
  }
  return "";
};

const formatSse = (payload: unknown) => `data: ${JSON.stringify(payload)}\n\n`;

export async function onRequestPost(context: {
  request: Request;
  env: Env;
}): Promise<Response> {
  const apiKey = context.env.PURDUE_GENAI_API_KEY?.trim();
  const baseUrl = context.env.PURDUE_GENAI_BASE_URL?.trim();
  const model = context.env.PURDUE_GENAI_MODEL?.trim() || "llama4:latest";

  if (!apiKey || !baseUrl) {
    return Response.json(
      {
        message: "AI service is not configured on the server.",
      },
      { status: 503 },
    );
  }

  let body: AiChatRequestBody;
  try {
    body = (await context.request.json()) as AiChatRequestBody;
  } catch {
    return Response.json({ message: "Invalid request body." }, { status: 400 });
  }

  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  const imageDataUrl =
    typeof body.imageDataUrl === "string" && body.imageDataUrl.startsWith("data:image/")
      ? body.imageDataUrl
      : "";
  const historyTurns: HistoryTurn[] = Array.isArray(body.history)
    ? body.history
        .filter((item): item is { role: unknown; text: unknown } => typeof item === "object" && item !== null)
        .map((item): HistoryTurn => {
          const role: HistoryTurn["role"] = item.role === "assistant" ? "assistant" : "user";
          const text = typeof item.text === "string" ? item.text.trim() : "";
          return { role, text };
        })
        .filter((turn) => turn.text.length > 0)
        .slice(-MAX_HISTORY_TURNS)
    : [];
  const streamRequested = body.stream === true;

  if (!prompt && !imageDataUrl) {
    return Response.json({ message: "Prompt or image is required." }, { status: 400 });
  }
  if (prompt.length > MAX_PROMPT_LENGTH) {
    return Response.json({ message: "Prompt is too long." }, { status: 400 });
  }
  if (imageDataUrl.length > MAX_IMAGE_DATA_URL_LENGTH) {
    return Response.json({ message: "Image is too large." }, { status: 400 });
  }
  if (historyTurns.some((turn) => turn.text.length > MAX_PROMPT_LENGTH)) {
    return Response.json({ message: "History item is too long." }, { status: 400 });
  }

  const upstreamPayload = {
    model,
    stream: streamRequested,
    messages: [
      ...historyTurns.map((turn) => ({
        role: turn.role,
        content: [{ type: "text", text: turn.text }],
      })),
      {
        role: "user",
        content: [
          ...(prompt ? [{ type: "text", text: prompt }] : [{ type: "text", text: "Analyze this image." }]),
          ...(imageDataUrl
            ? [
                {
                  type: "image_url",
                  image_url: {
                    url: imageDataUrl,
                  },
                },
              ]
            : []),
        ],
      },
    ],
  };

  let upstreamResponse: Response;
  try {
    upstreamResponse = await fetch(getChatEndpoint(baseUrl), {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(upstreamPayload),
    });
  } catch {
    return Response.json({ message: "Could not reach Purdue AI service." }, { status: 502 });
  }

  if (streamRequested) {
    if (!upstreamResponse.ok) {
      return Response.json({ message: "Purdue AI request failed." }, { status: 502 });
    }
    if (!upstreamResponse.body) {
      return Response.json({ message: "No stream body from Purdue AI." }, { status: 502 });
    }

    const decoder = new TextDecoder();
    const encoder = new TextEncoder();
    const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>();
    const writer = writable.getWriter();

    void (async () => {
      const reader = upstreamResponse.body!.getReader();
      let buffer = "";
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const events = buffer.split("\n\n");
          buffer = events.pop() ?? "";

          for (const eventBlock of events) {
            const dataLines = eventBlock
              .split("\n")
              .filter((line) => line.startsWith("data:"))
              .map((line) => line.replace(/^data:\s?/, "").trim());

            for (const dataLine of dataLines) {
              if (!dataLine) continue;
              if (dataLine === "[DONE]") {
                await writer.write(encoder.encode(formatSse({ type: "done" })));
                continue;
              }

              try {
                const parsed = JSON.parse(dataLine) as Record<string, unknown>;
                const delta = extractDeltaText(parsed);
                if (delta) {
                  await writer.write(encoder.encode(formatSse({ type: "delta", delta })));
                }
              } catch {
                // Ignore malformed upstream chunks and continue.
              }
            }
          }
        }
        await writer.write(encoder.encode(formatSse({ type: "done" })));
        await writer.write(encoder.encode("data: [DONE]\n\n"));
      } catch {
        await writer.write(encoder.encode(formatSse({ type: "error", message: "Streaming interrupted." })));
      } finally {
        await writer.close();
        reader.releaseLock();
      }
    })();

    return new Response(readable, {
      headers: {
        "content-type": "text/event-stream; charset=utf-8",
        "cache-control": "no-cache, no-transform",
        connection: "keep-alive",
      },
    });
  }

  let upstreamJson: UpstreamChatResponse;
  try {
    upstreamJson = (await upstreamResponse.json()) as UpstreamChatResponse;
  } catch {
    return Response.json({ message: "Invalid response from Purdue AI." }, { status: 502 });
  }

  if (!upstreamResponse.ok || upstreamJson.error?.message) {
    return Response.json({ message: "Purdue AI request failed." }, { status: 502 });
  }

  const answer = extractAssistantText(upstreamJson);
  if (!answer) {
    return Response.json({ message: "Purdue AI returned an empty response." }, { status: 502 });
  }

  return Response.json(
    { answer },
    {
      headers: {
        "cache-control": "no-store",
      },
    },
  );
}
