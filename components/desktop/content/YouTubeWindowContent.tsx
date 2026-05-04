"use client";

import { useCallback, useMemo, useState, type FormEvent } from "react";

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

type FavoriteChannel = {
  name: string;
  handle: string;
  description: string;
  channelId: string;
  imageSrc: string;
};

type FeedCategory = "All" | "Vlogs" | "Tech" | "Gaming" | "Music" | "Podcasts";

type SideNavItem = {
  label: string;
  emoji: string;
};

type FeaturedVideo = {
  videoId: string;
  title: string;
  channelName: string;
  metaLabel: string;
};

const FAVORITE_CHANNELS: FavoriteChannel[] = [
  {
    name: "Casey Neistat",
    handle: "@casey",
    description: "Cinematic vlogs and storytelling.",
    channelId: "UCtinbF-Q-fVthA0qrFQTgXQ",
    imageSrc: "/Casey.jpg",
  },
  {
    name: "Ryan Trahan",
    handle: "@ryan",
    description: "Challenges, travel, and creator experiments.",
    channelId: "UCnmGIkw-KdI0W5siakKPKog",
    imageSrc: "/Ryan.jpg",
  },
  {
    name: "Ludwig",
    handle: "@ludwig",
    description: "Live content, commentary, and creator events.",
    channelId: "UCmbSGFM9OU8FwjxZCevr6zw",
    imageSrc: "/ludwig.jpg",
  },
];

const SIDE_NAV_ITEMS: SideNavItem[] = [
  { label: "Home", emoji: "🏠" },
  { label: "Shorts", emoji: "🎬" },
  { label: "Subscriptions", emoji: "📺" },
  { label: "You", emoji: "👤" },
  { label: "History", emoji: "🕒" },
];

const FEED_CATEGORIES: FeedCategory[] = ["All", "Vlogs", "Tech", "Gaming", "Music", "Podcasts"];

const QUICK_SEARCH_TERMS = [
  "Casey Neistat",
  "Ryan Trahan challenge",
  "Ludwig clips",
  "MKBHD",
  "AI tools",
  "iOS dev",
] as const;

const FEATURED_VIDEOS: FeaturedVideo[] = [
  {
    videoId: "jG7dSXcfVqE",
    title: "Do what you cant",
    channelName: "Casey Neistat",
    metaLabel: "Featured pick",
  },
  {
    videoId: "z2kUM-xuwy8",
    title: "I Visited 50 States in 50 Days - Day 36",
    channelName: "Ryan Trahan",
    metaLabel: "Featured pick",
  },
  {
    videoId: "B-tL7220WYc",
    title: "How I Accidentally Became the Best Mario Party Player in the World",
    channelName: "Ludwig",
    metaLabel: "Featured pick",
  },
];

export default function YouTubeWindowContent() {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<YoutubeSearchItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeChannel, setActiveChannel] = useState<FavoriteChannel | null>(null);
  const [activeCategory, setActiveCategory] = useState<FeedCategory>("All");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeSearch = useCallback(async (rawQuery: string, channelId?: string) => {
    const q = rawQuery.trim();
    if (!q) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const searchParams = new URLSearchParams({ q });
      if (channelId) {
        searchParams.set("channelId", channelId);
      }
      const response = await fetch(`/api/youtube-search?${searchParams.toString()}`);
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
      setSelectedId(null);
    } catch {
      setItems([]);
      setSelectedId(null);
      setError("Could not reach the search service.");
    } finally {
      setLoading(false);
    }
  }, []);

  const runSearch = useCallback(
    (event?: FormEvent) => {
      event?.preventDefault();
      setActiveChannel(null);
      void executeSearch(query);
    },
    [executeSearch, query],
  );

  const quickSearch = useCallback(
    (term: string) => {
      setQuery(term);
      setActiveChannel(null);
      void executeSearch(term);
    },
    [executeSearch],
  );
  const goToHome = useCallback(() => {
    setQuery("");
    setItems([]);
    setSelectedId(null);
    setActiveChannel(null);
    setError(null);
  }, []);
  const openFeaturedVideo = useCallback((videoId: string) => {
    setSelectedId(videoId);
  }, []);
  const openFavoriteChannel = useCallback(
    (channel: FavoriteChannel) => {
      setQuery(channel.name);
      setActiveChannel(channel);
      void executeSearch(channel.name, channel.channelId);
    },
    [executeSearch],
  );

  const featuredItems = useMemo<YoutubeSearchItem[]>(
    () =>
      FEATURED_VIDEOS.map((video) => ({
        videoId: video.videoId,
        title: video.title,
        channelTitle: video.channelName,
        thumbnailUrl: `https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`,
      })),
    [],
  );
  const selectedItem = useMemo(() => {
    if (!selectedId) {
      return null;
    }
    return (
      items.find((item) => item.videoId === selectedId) ??
      featuredItems.find((item) => item.videoId === selectedId) ??
      null
    );
  }, [featuredItems, items, selectedId]);
  const upNextItems = items.length > 0 ? items.slice(0, 6) : featuredItems;
  const showStarterHome = !loading && !error && items.length === 0 && !selectedId;
  const showSearchGrid = !loading && !selectedId && items.length > 0;

  return (
    <div className="-m-6 flex h-[calc(100%+3rem)] flex-col overflow-hidden bg-[#ffffff] text-[#0f0f0f] md:-m-8 md:h-[calc(100%+4rem)]">
      <form
        onSubmit={runSearch}
        className="flex shrink-0 items-center gap-2 border-b border-black/10 bg-white px-3 py-2 md:px-4"
      >
        <label htmlFor="youtube-search" className="sr-only">
          Search YouTube
        </label>
        <button
          type="button"
          onClick={goToHome}
          className="inline-flex shrink-0 items-center justify-center rounded-full border border-black/20 bg-[#f8f8f8] px-2.5 py-2 text-black transition-colors hover:bg-[#ececec]"
          aria-label="Go to YouTube home"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-[34px]" fill="none" aria-hidden="true">
            <path
              fill="#FF0000"
              d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"
            />
            <path fill="#fff" d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
        </button>
        <input
          id="youtube-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search"
          autoComplete="off"
          className="min-w-0 flex-1 rounded-full border border-black/20 bg-white px-4 py-2 text-sm text-black placeholder:text-black/45 outline-none ring-black/20 focus:ring-2"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="shrink-0 rounded-full border border-black/20 bg-[#f8f8f8] px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-[#ececec] disabled:cursor-not-allowed disabled:text-black/70"
          aria-label="Search videos"
        >
          <span className="inline-flex items-center gap-1.5">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
              <circle
                cx="11"
                cy="11"
                r="6"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <path
                d="M16 16l4 4"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
            <span>{loading ? "Searching..." : "Search"}</span>
          </span>
        </button>
      </form>

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-[220px] shrink-0 border-r border-black/10 bg-white p-2 lg:block">
          <ul className="space-y-1">
            {SIDE_NAV_ITEMS.map((item) => (
              <li key={item.label}>
                <button
                  type="button"
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm ${
                    item.label === "Home" ? "bg-black/6 font-semibold" : "hover:bg-black/5"
                  }`}
                >
                  <span className="text-base">{item.emoji}</span>
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-4 border-t border-black/10 pt-3">
            <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-black/45">
              Subscriptions
            </p>
            <ul className="mt-2 space-y-1">
              {FAVORITE_CHANNELS.slice(0, 5).map((channel) => (
                <li key={channel.handle}>
                  <button
                    type="button"
                    onClick={() => openFavoriteChannel(channel)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-black/5"
                  >
                    <img
                      src={channel.imageSrc}
                      alt={channel.name}
                      width={24}
                      height={24}
                      className="h-6 w-6 rounded-full object-cover"
                    />
                    <span className="truncate">{channel.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="scrollbar-thin flex shrink-0 items-center gap-2 overflow-x-auto border-b border-black/10 bg-white px-3 py-2">
            {FEED_CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeCategory === category
                    ? "bg-[#0f0f0f] text-white"
                    : "bg-[#f2f2f2] text-black hover:bg-[#e5e5e5]"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {selectedId ? (
            <div className="flex min-h-0 flex-1 flex-col gap-3 bg-white p-3 md:flex-row md:p-4">
              <div className="min-w-0 flex-1">
                <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
                  <iframe
                    title="YouTube video player"
                    src={`https://www.youtube.com/embed/${selectedId}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full border-0"
                  />
                </div>
                {selectedItem && (
                  <div className="mt-3 space-y-1">
                    <p className="line-clamp-2 text-base font-semibold text-black">
                      {selectedItem.title}
                    </p>
                    <p className="text-sm text-black/60">{selectedItem.channelTitle}</p>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  className="mt-3 rounded-full border border-black/15 px-3 py-1.5 text-xs font-medium hover:bg-black/5"
                >
                  Back to feed
                </button>
              </div>
              <div className="md:w-[320px]">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-black/45">
                  Up next
                </p>
                <ul className="space-y-2">
                  {upNextItems.map((item) => (
                    <li key={item.videoId}>
                      <button
                        type="button"
                        onClick={() => setSelectedId(item.videoId)}
                        className={`flex w-full gap-2 rounded-lg p-2 text-left transition-colors hover:bg-black/5 ${
                          item.videoId === selectedId ? "bg-black/6" : ""
                        }`}
                      >
                        <img
                          src={item.thumbnailUrl}
                          alt=""
                          width={120}
                          height={68}
                          className="h-[68px] w-[120px] shrink-0 rounded-lg object-cover"
                        />
                        <span className="min-w-0">
                          <span className="line-clamp-2 block text-xs font-medium text-black">
                            {item.title}
                          </span>
                          <span className="mt-1 block text-[11px] text-black/55">
                            {item.channelTitle}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : showStarterHome ? (
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 md:px-5">
              <div className="mb-4 flex items-end justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-black/45">
                    Favorite Channels
                  </p>
                  <h2 className="mt-1 text-xl font-semibold text-black">
                    These are my favorite channels
                  </h2>
                </div>
                <span className="text-xs text-black/45">Category: {activeCategory}</span>
              </div>
              <ul className="flex gap-4 overflow-x-auto pb-1">
                {FAVORITE_CHANNELS.map((channel) => (
                  <li
                    key={channel.handle}
                    className="h-[255px] w-[260px] min-w-[260px] max-w-[260px] shrink-0"
                  >
                    <button
                      type="button"
                      onClick={() => openFavoriteChannel(channel)}
                      className="group flex h-full w-full flex-col overflow-hidden rounded-xl border border-black/10 bg-white text-left transition hover:border-black/25 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
                    >
                      <div className="relative aspect-video overflow-hidden text-white">
                        <img
                          src={channel.imageSrc}
                          alt={channel.name}
                          width={480}
                          height={270}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-3">
                          <div className="flex h-full flex-col justify-between">
                          <span className="inline-flex w-fit rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-medium">
                            Featured creator
                          </span>
                          <span className="text-sm font-semibold">{channel.name}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex min-h-0 flex-1 flex-col p-3">
                        <p className="line-clamp-1 text-sm font-semibold text-black">
                          {channel.name}
                        </p>
                        <p className="text-xs text-black/55">{channel.handle}</p>
                        <p className="mt-2 line-clamp-2 min-h-[2.5rem] text-xs text-black/75">
                          {channel.description}
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-black/45">
                  Featured Videos
                </p>
                <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {FEATURED_VIDEOS.map((video) => (
                    <li key={video.videoId}>
                      <button
                        type="button"
                        onClick={() => openFeaturedVideo(video.videoId)}
                        className="group block w-full text-left"
                      >
                        <img
                          src={`https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`}
                          alt={video.title}
                          width={480}
                          height={270}
                          className="aspect-video w-full rounded-2xl object-cover transition group-hover:brightness-95"
                        />
                        <div className="mt-2 flex items-start gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="line-clamp-2 text-[18px] font-semibold leading-7 text-black">
                              {video.title}
                            </p>
                            <p className="mt-1 text-sm text-black/65">{video.channelName}</p>
                            <p className="mt-0.5 text-sm text-black/55">{video.metaLabel}</p>
                          </div>
                          <span
                            className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-black/70 transition group-hover:bg-black/5"
                            aria-hidden="true"
                          >
                            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                              <circle cx="12" cy="5" r="1.7" />
                              <circle cx="12" cy="12" r="1.7" />
                              <circle cx="12" cy="19" r="1.7" />
                            </svg>
                          </span>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-6">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-black/45">
                  Quick searches
                </p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_SEARCH_TERMS.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => quickSearch(term)}
                      className="rounded-full border border-black/15 bg-[#f2f2f2] px-3 py-1.5 text-xs font-medium text-black hover:bg-[#e5e5e5]"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : showSearchGrid ? (
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 md:px-5">
              <div className="mb-4 flex items-end justify-between gap-3">
                <p className="text-sm font-semibold text-black">
                  {activeChannel ? (
                    <>
                      Channel videos for <span className="text-black/60">{activeChannel.name}</span>
                    </>
                  ) : (
                    <>
                      Search results for <span className="text-black/60">{query.trim()}</span>
                    </>
                  )}
                </p>
                <span className="text-xs text-black/45">{items.length} videos</span>
              </div>
              <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((item) => (
                  <li key={item.videoId}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(item.videoId)}
                      className="group block w-full text-left"
                    >
                      <img
                        src={item.thumbnailUrl}
                        alt=""
                        width={480}
                        height={270}
                        className="aspect-video w-full rounded-xl object-cover transition group-hover:brightness-95"
                      />
                      <div className="mt-2">
                        <p className="line-clamp-2 text-sm font-semibold text-black">
                          {item.title}
                        </p>
                        <p className="mt-1 text-xs text-black/55">{item.channelTitle}</p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center px-4 py-8 text-center text-sm text-black/55">
              {loading ? "Loading..." : "No results found. Try another search."}
            </div>
          )}
        </div>
      </div>
      {error && (
        <p className="border-t border-black/10 bg-[#fff5f6] px-3 py-2 text-xs text-[#b42339]">
          {error}
        </p>
      )}
    </div>
  );
}
