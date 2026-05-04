"use client";

import { useCallback, useState } from "react";

type YoutubeSearchItem = {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
};

type SearchResponse = {
  items?: YoutubeSearchItem[];
  message?: string;
};

export default function YouTubeWindowContent() {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<YoutubeSearchItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runSearch = useCallback(
    async (event?: React.FormEvent) => {
      event?.preventDefault();
      const q = query.trim();
      if (!q) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/youtube-search?q=${encodeURIComponent(q)}`,
        );
        const data = (await response.json().catch(() => ({}))) as SearchResponse;

        if (!response.ok) {
          setItems([]);
          setSelectedId(null);
          setError(
            data.message ??
              "Search is unavailable. On Cloudflare Pages, set the YOUTUBE_API_KEY secret. For local API testing, run wrangler pages dev after npm run build.",
          );
          return;
        }

        const nextItems = data.items ?? [];
        setItems(nextItems);
        setSelectedId(nextItems[0]?.videoId ?? null);
      } catch {
        setItems([]);
        setSelectedId(null);
        setError("Could not reach the search service.");
      } finally {
        setLoading(false);
      }
    },
    [query],
  );

  return (
    <div className="-m-6 flex h-[calc(100%+3rem)] flex-col overflow-hidden bg-[#f4f5f7] text-black md:-m-8 md:h-[calc(100%+4rem)]">
      <form
        onSubmit={runSearch}
        className="flex shrink-0 items-center gap-2 border-b border-black/10 bg-[#eceef2] px-3 py-2 md:px-4"
      >
        <label htmlFor="youtube-search" className="sr-only">
          Search YouTube
        </label>
        <input
          id="youtube-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search videos…"
          autoComplete="off"
          className="min-w-0 flex-1 rounded-lg border border-black/15 bg-white px-3 py-1.5 text-sm outline-none ring-black/20 focus:ring-2"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="shrink-0 rounded-lg border border-black/15 bg-white px-3 py-1.5 text-sm font-medium text-black/80 transition-colors hover:bg-black/[0.04] disabled:pointer-events-none disabled:opacity-45"
        >
          {loading ? "Searching…" : "Search"}
        </button>
      </form>

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col border-b border-black/10 md:border-b-0 md:border-r">
          {selectedId ? (
            <div className="flex min-h-0 flex-1 flex-col bg-black p-2 md:p-3">
              <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-lg bg-black">
                <iframe
                  title="YouTube video player"
                  src={`https://www.youtube.com/embed/${selectedId}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full border-0"
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center px-4 py-8 text-center text-sm text-black/50">
              {loading
                ? "Loading…"
                : "Search for a topic, then pick a result to play here."}
            </div>
          )}
        </div>

        <aside className="flex h-44 shrink-0 flex-col md:h-auto md:w-72 md:shrink-0 md:border-l md:border-black/10">
          <div className="border-b border-black/10 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-black/45">
            Results
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {error && (
              <p className="border-b border-black/10 px-3 py-3 text-xs leading-relaxed text-red-700/90">
                {error}
              </p>
            )}
            {!loading && items.length === 0 && !error && (
              <p className="px-3 py-4 text-xs text-black/45">No results yet.</p>
            )}
            <ul className="divide-y divide-black/10">
              {items.map((item) => {
                const isActive = item.videoId === selectedId;
                return (
                  <li key={item.videoId}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(item.videoId)}
                      className={`flex w-full gap-2 px-2 py-2 text-left text-xs transition-colors hover:bg-black/[0.04] ${
                        isActive ? "bg-black/[0.06]" : ""
                      }`}
                    >
                      <img
                        src={item.thumbnailUrl}
                        alt=""
                        width={88}
                        height={50}
                        className="h-[50px] w-[88px] shrink-0 rounded object-cover"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="line-clamp-2 font-medium text-black/90">
                          {item.title}
                        </span>
                        <span className="mt-0.5 line-clamp-1 text-[10px] text-black/45">
                          {item.channelTitle}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
