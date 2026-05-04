"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

export interface PhotosLibraryItem {
  id: string;
  src: string;
  title: string;
  subtitle: string;
}

interface PhotosWindowContentProps {
  photos: PhotosLibraryItem[];
  selectedPhotoId?: string | null;
  onSelectedPhotoIdChange?: (photoId: string | null) => void;
}

export default function PhotosWindowContent({
  photos,
  selectedPhotoId: controlledSelectedPhotoId,
  onSelectedPhotoIdChange,
}: PhotosWindowContentProps) {
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);
  const isControlled = controlledSelectedPhotoId !== undefined;
  const activeSelectedPhotoId = isControlled ? controlledSelectedPhotoId : selectedPhotoId;

  const selectedPhoto = useMemo(
    () => photos.find((photo) => photo.id === activeSelectedPhotoId) ?? null,
    [photos, activeSelectedPhotoId],
  );
  const setActiveSelectedPhotoId = (photoId: string | null) => {
    if (!isControlled) {
      setSelectedPhotoId(photoId);
    }
    onSelectedPhotoIdChange?.(photoId);
  };
  const libraryCountLabel = `${photos.length} Photos`;
  const sidebarSections = [
    {
      title: "Library",
      items: ["Library", "Collections"],
    },
    {
      title: "Pinned",
      items: [
        "Favorites",
        "Recently Saved",
        "Map",
        "Videos",
        "Screenshots",
        "People",
        "Recently Deleted",
      ],
    },
    {
      title: "Albums",
      items: ["Shared Albums", "Activity", "Shared with You"],
    },
    {
      title: "Media Types",
      items: ["Utilities", "Projects"],
    },
  ] as const;

  if (photos.length === 0) {
    return (
      <div className="-m-6 flex h-[calc(100%+3rem)] items-center justify-center bg-[#f4f5f7] text-xs uppercase tracking-wide text-black/45 md:-m-8 md:h-[calc(100%+4rem)]">
        No photos available
      </div>
    );
  }

  return (
    <div className="-m-6 flex h-[calc(100%+3rem)] flex-col overflow-hidden bg-[#f4f5f7] text-black md:-m-8 md:h-[calc(100%+4rem)]">
      <div className="flex h-12 items-center justify-between border-b border-black/10 bg-[#eceef2] px-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="desktop-icon-button flex h-6 w-6 items-center justify-center rounded-md text-sm text-black/55 hover:bg-black/6 hover:text-black/80"
              aria-label="Back"
            >
              ‹
            </button>
            <button
              type="button"
              className="desktop-icon-button flex h-6 w-6 items-center justify-center rounded-md text-sm text-black/55 hover:bg-black/6 hover:text-black/80"
              aria-label="Forward"
            >
              ›
            </button>
          </div>

          <div className="flex rounded-lg border border-black/15 bg-white p-0.5 text-[11px] font-medium">
            {["Years", "Months", "All Photos"].map((tab) => {
              const isActive = tab === "All Photos";
              return (
                <span
                  key={tab}
                  className={`rounded-md px-3 py-1 ${
                    isActive ? "bg-[#dbe2ec] text-black/85" : "text-black/50"
                  }`}
                >
                  {tab}
                </span>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2 text-black/55">
          {["◻", "☰", "⋯", "ⓘ", "♡", "⤴", "⌕"].map((icon) => (
            <span
              key={icon}
              className="inline-flex h-6 w-6 items-center justify-center rounded-md text-[11px] hover:bg-black/6"
            >
              {icon}
            </span>
          ))}
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-[212px_1fr]">
        <aside className="min-h-0 overflow-auto border-r border-black/10 bg-[#f7f8fa] px-3 py-3">
          <p className="mb-4 text-xs font-semibold text-black/75">Library</p>
          <p className="mb-4 text-[11px] text-black/45">Jan 9 - May 2, 2026</p>

          {sidebarSections.map((section) => (
            <section key={section.title} className="mb-4">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-black/35">
                {section.title}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isSelected = item === "Library";
                  return (
                    <div
                      key={item}
                      className={`rounded-md px-2 py-1 text-[12px] ${
                        isSelected
                          ? "bg-[#0a84ff]/14 font-semibold text-[#0a5bcf]"
                          : "text-black/68"
                      }`}
                    >
                      {item}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </aside>

        <main className="min-h-0 bg-[#f1f3f6]">
          {selectedPhoto ? (
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-black/10 px-5 py-2">
                <button
                  type="button"
                  onClick={() => setActiveSelectedPhotoId(null)}
                  className="desktop-icon-button rounded-md bg-black/5 px-3 py-1 text-[11px] font-medium text-black/80 hover:bg-black/10"
                >
                  Back To Library
                </button>
                <div className="text-right">
                  <p className="text-sm font-semibold text-black/85">{selectedPhoto.title}</p>
                  <p className="text-xs text-black/55">{selectedPhoto.subtitle}</p>
                </div>
              </div>
              <div className="relative m-4 flex-1 overflow-hidden rounded-xl border border-black/10 bg-white">
                <Image
                  src={selectedPhoto.src}
                  alt={selectedPhoto.title}
                  fill
                  unoptimized
                  className="object-contain"
                  sizes="(max-width: 1200px) 100vw, 980px"
                />
              </div>
            </div>
          ) : (
            <div className="h-full overflow-auto px-4 py-3">
              <div className="mb-3">
                <p className="text-[11px] uppercase tracking-[0.13em] text-black/45">Library</p>
                <h2 className="text-xl font-semibold text-black/85">All Photos</h2>
                <p className="text-xs text-black/45">{libraryCountLabel}</p>
              </div>

              <div className="grid grid-cols-3 gap-2 lg:grid-cols-5">
                {photos.map((photo) => (
                  <button
                    key={photo.id}
                    type="button"
                    onClick={() => setActiveSelectedPhotoId(photo.id)}
                    className="desktop-icon-button group text-left"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden rounded-md border border-black/10 bg-white transition-transform duration-200 group-hover:scale-[1.01]">
                      <Image
                        src={photo.src}
                        alt={photo.title}
                        fill
                        unoptimized
                        className="object-cover"
                        sizes="(max-width: 1024px) 30vw, 190px"
                      />
                    </div>
                    <p className="mt-1 line-clamp-1 text-[12px] font-medium text-black/85">{photo.title}</p>
                    <p className="line-clamp-1 text-[11px] text-black/48">{photo.subtitle}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
