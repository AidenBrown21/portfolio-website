import { useState } from "react";
import Image from "next/image";
import type { BaseWindowId, DockItem, MinimizedDockEntry } from "@/components/desktop/types";

const DOCK_EXTERNAL_LINKS = [
  {
    href: "https://github.com/AidenBrown21",
    label: "GitHub",
    iconSrc: "/githublogo.png",
    iconAlt: "GitHub",
  },
  {
    href: "https://linkedin.com/in/aidenbrown21",
    label: "LinkedIn",
    iconSrc: "/linkedinlogo.png",
    iconAlt: "LinkedIn",
  },
] as const;

interface DockProps {
  items: DockItem[];
  openApps: BaseWindowId[];
  focusedApp: BaseWindowId | null;
  minimizedEntries: MinimizedDockEntry[];
  onActivate: (id: BaseWindowId) => void;
  onRestoreWindow: (windowId: MinimizedDockEntry["windowId"]) => void;
}

export default function Dock({
  items,
  openApps,
  focusedApp,
  minimizedEntries,
  onActivate,
  onRestoreWindow,
}: DockProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const sortedMinimizedEntries = [...minimizedEntries].sort(
    (left, right) => left.minimizedAt - right.minimizedAt,
  );

  const dockRowEntries = [
    ...DOCK_EXTERNAL_LINKS.map((link) => ({ kind: "external" as const, ...link })),
    ...items.map((item) => ({ kind: "app" as const, item })),
  ];

  const renderIcon = (id: BaseWindowId) => {
    if (id === "finder") {
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
          <path
            d="M3.75 8.25A2.25 2.25 0 0 1 6 6h4.2l1.2 1.5H18a2.25 2.25 0 0 1 2.25 2.25v6A2.25 2.25 0 0 1 18 18H6a2.25 2.25 0 0 1-2.25-2.25v-7.5z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3.9 11.1h16.2"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    }

    if (id === "home") {
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
          <path
            d="M3.75 10.5L12 3.75l8.25 6.75V20.25H14.25V14.25H9.75V20.25H3.75V10.5z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    }

    if (id === "photos") {
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.4" />
          <path
            d="M12 3.75v4.05M12 16.2v4.05M3.75 12h4.05M16.2 12h4.05M5.7 5.7l2.85 2.85M15.45 15.45l2.85 2.85M18.3 5.7l-2.85 2.85M8.55 15.45l-2.85 2.85"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    }

    if (id === "projects") {
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
          <path
            d="M3.75 7.5A2.25 2.25 0 0 1 6 5.25h4.5l1.5 2.25H18a2.25 2.25 0 0 1 2.25 2.25v6.75A2.25 2.25 0 0 1 18 18.75H6a2.25 2.25 0 0 1-2.25-2.25V7.5z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    }

    if (id === "about") {
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
          <path
            d="M12 12a3 3 0 1 0-3-3 3 3 0 0 0 3 3zm0 1.5c-3.18 0-5.625 1.62-5.625 3.75v.75h11.25v-.75c0-2.13-2.445-3.75-5.625-3.75z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    }

    if (id === "youtube") {
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <rect
            x="2.25"
            y="5.25"
            width="19.5"
            height="13.5"
            rx="3.5"
            className="fill-[#FF0000]"
          />
          <path
            className="fill-white"
            d="M10.35 9.45v5.1L15.45 12l-5.1-2.55z"
          />
        </svg>
      );
    }

    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
        <path
          d="M4.5 6.75h15A1.5 1.5 0 0 1 21 8.25v7.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 15.75v-7.5a1.5 1.5 0 0 1 1.5-1.5z"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M3.75 8.25l8.25 6 8.25-6"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  const getScale = (index: number) => {
    if (hoveredIndex === null) {
      return 1;
    }

    const distance = Math.abs(index - hoveredIndex);
    if (distance === 0) return 1.18;
    if (distance === 1) return 1.1;
    if (distance === 2) return 1.04;
    return 1;
  };

  return (
    <footer className="pointer-events-none fixed inset-x-0 bottom-0 z-[400] h-20">
      <div className="mx-auto flex h-full items-center justify-center px-4 pb-2">
        <div
          className="dock-glass pointer-events-auto flex items-end gap-1.5 px-2.5 py-1.5"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {dockRowEntries.map((entry, index) => {
            const scale = getScale(index);
            const dockTileClass =
              "dock-button relative flex min-w-[70px] flex-col items-center gap-1 rounded-2xl border px-2 py-1 text-[10px] font-medium text-black transition-[transform,background-color,border-color] duration-150 border-transparent bg-transparent hover:border-white/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black/25";

            if (entry.kind === "external") {
              return (
                <a
                  key={entry.label}
                  href={entry.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={dockTileClass}
                  style={{ transform: `scale(${scale})` }}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onFocus={() => setHoveredIndex(index)}
                >
                  <span className="flex h-8 w-8 items-center justify-center">
                    <Image
                      src={entry.iconSrc}
                      alt={entry.iconAlt}
                      width={28}
                      height={28}
                      className="h-7 w-7 object-contain"
                    />
                  </span>
                  <span>{entry.label}</span>
                </a>
              );
            }

            const { item } = entry;
            const isOpen = openApps.includes(item.id);
            const isFocused = focusedApp === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onActivate(item.id)}
                onMouseEnter={() => setHoveredIndex(index)}
                onFocus={() => setHoveredIndex(index)}
                className={`dock-button relative flex min-w-[70px] flex-col items-center gap-1 rounded-2xl border px-2 py-1 text-[10px] font-medium text-black transition-[transform,background-color,border-color] duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black/25 ${
                  isFocused
                    ? "border-white/55 bg-transparent"
                    : "border-transparent bg-transparent hover:border-white/30"
                }`}
                style={{ transform: `scale(${scale})` }}
                aria-pressed={isFocused}
              >
                <span className="flex h-8 w-8 items-center justify-center text-base">
                  {renderIcon(item.id)}
                </span>
                <span>{item.label}</span>
                {isOpen && (
                  <span
                    className="block h-1.5 w-1.5 rounded-full bg-black/60"
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}

          {sortedMinimizedEntries.length > 0 && (
            <div className="dock-minimized-divider ml-1 h-10 w-px bg-black/15" aria-hidden="true" />
          )}

          {sortedMinimizedEntries.map((entry) => (
            <button
              key={entry.windowId}
              type="button"
              onClick={() => onRestoreWindow(entry.windowId)}
              onMouseEnter={() => setHoveredIndex(null)}
              className={
                entry.windowId === "projects" || entry.windowId === "finder"
                  ? "dock-minimized-project-tile relative flex h-16 w-24 flex-col items-center justify-center gap-1 rounded-xl border border-black/10 px-2 py-1 text-center"
                  : "dock-minimized-tile relative flex h-16 w-32 flex-col items-start justify-end overflow-hidden rounded-xl border border-black/10 px-2 py-1 text-left"
              }
              title={`Restore ${entry.title}`}
            >
              {entry.windowId === "projects" || entry.windowId === "finder" ? (
                <>
                  {entry.windowId === "projects" ? (
                    <Image
                      src="/folder-icon.png"
                      alt="Projects"
                      width={42}
                      height={32}
                      className="h-8 w-auto"
                    />
                  ) : (
                    <span
                      className="flex h-10 w-10 items-center justify-center text-black/80"
                      aria-hidden="true"
                    >
                      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none">
                        <path
                          d="M3.75 8.25A2.25 2.25 0 0 1 6 6h4.2l1.2 1.5H18a2.25 2.25 0 0 1 2.25 2.25v6A2.25 2.25 0 0 1 18 18H6a2.25 2.25 0 0 1-2.25-2.25v-7.5z"
                          stroke="currentColor"
                          strokeWidth="1.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M3.9 11.1h16.2"
                          stroke="currentColor"
                          strokeWidth="1.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  )}
                  <span className="text-[10px] font-semibold text-black/80">
                    {entry.windowId === "projects" ? "Projects" : "Finder"}
                  </span>
                </>
              ) : (
                <>
                  <div className="dock-minimized-preview absolute inset-0">
                    {entry.previewUrl ? (
                      <Image
                        src={entry.previewUrl}
                        alt={`${entry.title} preview`}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="dock-minimized-fade absolute inset-0" />
                  <span className="dock-minimized-app text-[10px] uppercase tracking-wide text-black/45">
                    {entry.appId}
                  </span>
                  <span className="line-clamp-1 w-full text-[10px] font-semibold text-black/80">
                    {entry.title}
                  </span>
                  <span className="line-clamp-1 w-full text-[9px] text-black/65">
                    {entry.previewText}
                  </span>
                </>
              )}
            </button>
          ))}
        </div>
      </div>
    </footer>
  );
}
