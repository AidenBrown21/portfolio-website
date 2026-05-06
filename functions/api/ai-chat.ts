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

  let upstreamJson: UpstreamChatResponse;
  try {
    const upstreamResponse = await fetch(getChatEndpoint(baseUrl), {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(upstreamPayload),
    });
    upstreamJson = (await upstreamResponse.json()) as UpstreamChatResponse;

    if (!upstreamResponse.ok || upstreamJson.error?.message) {
      return Response.json({ message: "Purdue AI request failed." }, { status: 502 });
    }
  } catch {
    return Response.json({ message: "Could not reach Purdue AI service." }, { status: 502 });
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
