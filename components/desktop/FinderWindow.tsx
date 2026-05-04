import type { DesktopFileEntry } from "@/components/desktop/types";
import { useMemo, useState } from "react";

interface FinderWindowProps {
  pathLabel: string;
  files: DesktopFileEntry[];
  onOpenFile: (file: DesktopFileEntry) => void;
  showStatusDescription?: boolean;
}

export default function FinderWindow({
  pathLabel,
  files,
  onOpenFile,
  showStatusDescription = true,
}: FinderWindowProps) {
  const [selectedFileId, setSelectedFileId] = useState<string | null>(
    files[0]?.id ?? null,
  );
  const selectedFile = useMemo(
    () => files.find((file) => file.id === selectedFileId) ?? null,
    [files, selectedFileId],
  );

  const sidebarGroups = [
    {
      title: "Favorites",
      items: ["Recents", "Applications", "Desktop", "Documents", "Downloads"],
    },
    {
      title: "iCloud",
      items: ["iCloud Drive", "Shared"],
    },
  ] as const;

  return (
    <div className="-m-6 flex h-[calc(100%+3rem)] flex-col overflow-hidden md:-m-8 md:h-[calc(100%+4rem)]">
      <div className="flex h-12 items-center justify-between border-b border-black/10 bg-[#f5f5f6] px-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex h-6 w-6 items-center justify-center rounded-md border border-black/10 bg-white text-[12px] text-black/55"
            aria-label="Back"
          >
            ‹
          </button>
          <button
            type="button"
            className="flex h-6 w-6 items-center justify-center rounded-md border border-black/10 bg-white text-[12px] text-black/55"
            aria-label="Forward"
          >
            ›
          </button>
          <div className="ml-1 rounded-md border border-black/10 bg-white/80 px-2 py-1 text-[11px] font-medium text-black/60">
            {pathLabel}
          </div>
        </div>
        <div className="w-44 rounded-md border border-black/10 bg-white px-2 py-1 text-[11px] text-black/45">
          Search
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-[200px_1fr]">
        <aside className="border-r border-black/10 bg-[#f0f1f3] px-3 py-3">
          {sidebarGroups.map((group) => (
            <div key={group.title} className="mb-4">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-black/40">
                {group.title}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isSelected = item === "Desktop";
                  return (
                    <div
                      key={item}
                      className={`rounded-md px-2 py-1 text-[12px] ${
                        isSelected
                          ? "bg-[#dbe8ff] font-semibold text-[#0b57d0]"
                          : "text-black/70"
                      }`}
                    >
                      {item}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </aside>

        <div className="min-h-0 bg-white">
          <div className="grid grid-cols-[minmax(260px,1fr)_180px_90px_140px] border-b border-black/10 bg-[#f7f7f8] px-3 py-1.5 text-[11px] font-semibold text-black/60">
            <span>Name</span>
            <span>Date Modified</span>
            <span>Size</span>
            <span>Kind</span>
          </div>

          <div className="h-[calc(100%-26px)] overflow-auto">
            {files.map((file) => {
              const isSelected = file.id === selectedFile?.id;
              return (
                <button
                  key={file.id}
                  type="button"
                  onClick={() => {
                    setSelectedFileId(file.id);
                    onOpenFile(file);
                  }}
                  className={`grid w-full grid-cols-[minmax(260px,1fr)_180px_90px_140px] items-center border-b border-black/10 px-3 py-1.5 text-left text-[12px] last:border-b-0 ${
                    isSelected ? "bg-[#dbe8ff]" : "hover:bg-[#f5f9ff]"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <span className="text-base leading-none" aria-hidden="true">
                      {file.icon === "folder" ? "📁" : "📄"}
                    </span>
                    <span className="truncate font-medium text-black">{file.label}</span>
                  </span>
                  <span className="truncate text-black/65">{file.modifiedLabel ?? "Today"}</span>
                  <span className="text-black/65">{file.sizeLabel ?? "--"}</span>
                  <span className="truncate text-black/65">{file.typeLabel}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="flex h-7 items-center justify-between border-t border-black/10 bg-[#f7f7f8] px-3 text-[11px] text-black/55">
        <span>{files.length} items</span>
        <span>
          {showStatusDescription ? selectedFile?.description ?? "Ready" : ""}
        </span>
      </div>
    </div>
  );
}
