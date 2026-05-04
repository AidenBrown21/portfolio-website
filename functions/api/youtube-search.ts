/**
 * Cloudflare Pages Function — not run by `next dev`.
 * Production: set secret YOUTUBE_API_KEY in the Pages project (Settings → Environment variables).
 * Local API test: `npm run build` then `npx wrangler pages dev ./out` with `.dev.vars` containing YOUTUBE_API_KEY.
 */

const MAX_QUERY_LENGTH = 200;
const MAX_CHANNEL_ID_LENGTH = 64;
const MAX_RESULTS = 12;

type YouTubeSearchListResponse = {
  items?: Array<{
    id?: { videoId?: string };
    snippet?: {
      title?: string;
      channelTitle?: string;
      thumbnails?: {
        medium?: { url?: string };
        default?: { url?: string };
      };
    };
  }>;
  error?: { message?: string };
};

type Env = {
  YOUTUBE_API_KEY?: string;
};

export async function onRequestGet(context: {
  request: Request;
  env: Env;
}): Promise<Response> {
  const apiKey = context.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return Response.json(
      {
        message:
          "YouTube search is not configured (missing YOUTUBE_API_KEY on the server).",
        items: [],
      },
      { status: 503 },
    );
  }

  const url = new URL(context.request.url);
  const rawQ = url.searchParams.get("q") ?? "";
  const q = rawQ.trim();
  const rawChannelId = url.searchParams.get("channelId") ?? "";
  const channelId = rawChannelId.trim();

  if (!q) {
    return Response.json({ message: "Missing search query.", items: [] }, { status: 400 });
  }

  if (q.length > MAX_QUERY_LENGTH) {
    return Response.json({ message: "Query is too long.", items: [] }, { status: 400 });
  }
  if (channelId.length > MAX_CHANNEL_ID_LENGTH) {
    return Response.json({ message: "Channel id is too long.", items: [] }, { status: 400 });
  }

  const upstream = new URL("https://www.googleapis.com/youtube/v3/search");
  upstream.searchParams.set("part", "snippet");
  upstream.searchParams.set("type", "video");
  upstream.searchParams.set("maxResults", String(MAX_RESULTS));
  upstream.searchParams.set("q", q);
  if (channelId) {
    upstream.searchParams.set("channelId", channelId);
  }
  upstream.searchParams.set("key", apiKey);

  let upstreamJson: YouTubeSearchListResponse;
  try {
    const upstreamResponse = await fetch(upstream.toString());
    upstreamJson = (await upstreamResponse.json()) as YouTubeSearchListResponse;

    if (!upstreamResponse.ok) {
      return Response.json(
        {
          message: "YouTube search failed. Try again later.",
          items: [],
        },
        { status: 502 },
      );
    }
  } catch {
    return Response.json(
      { message: "Could not reach YouTube.", items: [] },
      { status: 502 },
    );
  }

  if (upstreamJson.error?.message) {
    return Response.json({ message: "YouTube search failed.", items: [] }, { status: 502 });
  }

  const items =
    upstreamJson.items
      ?.map((row) => {
        const videoId = row.id?.videoId;
        if (!videoId) {
          return null;
        }
        const thumb =
          row.snippet?.thumbnails?.medium?.url ??
          row.snippet?.thumbnails?.default?.url ??
          "";
        return {
          videoId,
          title: row.snippet?.title ?? "Untitled",
          channelTitle: row.snippet?.channelTitle ?? "",
          thumbnailUrl: thumb,
        };
      })
      .filter((row): row is NonNullable<typeof row> => row !== null) ?? [];

  return Response.json({ items }, {
    headers: {
      "cache-control": "public, max-age=60",
    },
  });
}
