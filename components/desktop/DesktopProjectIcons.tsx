"use client";

import {
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { motion } from "framer-motion";
import type { DesktopFileEntry } from "@/components/desktop/types";

interface DesktopProjectIconsProps {
  files: DesktopFileEntry[];
  onOpenFile: (file: DesktopFileEntry) => void;
}

type IconPosition = { x: number; y: number };

const PADDING = 24;
const COL_GAP = 20;
const ICON_W = 92;
/** Row stride approximates prior `gap-y-5` + icon stack height */
const ROW_STRIDE = 118;
/** Max pointer movement (px) from down→up to count as a click, not a drag */
const CLICK_MOVE_THRESHOLD_PX = 8;
const CLICK_MOVE_THRESHOLD_SQ =
  CLICK_MOVE_THRESHOLD_PX * CLICK_MOVE_THRESHOLD_PX;

function getInitialPositions(
  files: DesktopFileEntry[],
  containerWidth: number,
  containerHeight: number,
): Record<string, IconPosition> {
  const rightFiles = files.filter((file) => file.desktopSide !== "left");
  const leftFiles = files.filter((file) => file.desktopSide === "left");
  const firstRowY = 8;

  const rightGridW = ICON_W * 2 + COL_GAP;
  let rightBaseX = containerWidth - PADDING - rightGridW;
  if (rightBaseX < 8) {
    rightBaseX = 8;
  }

  const leftBaseX = PADDING + (ICON_W + COL_GAP) * 2;
  const leftStartY = Math.max(firstRowY, Math.round(containerHeight * 0.45));
  const occupiedLeftSlots = new Set<string>();
  let autoLeftRow = 0;

  const occupiedRightSlots = new Set<string>();
  const rightPositions: [string, IconPosition][] = [];
  const explicitRight = rightFiles.filter(
    (file) => file.desktopColumn !== undefined && file.desktopRow !== undefined,
  );
  const autoRight = rightFiles.filter(
    (file) => file.desktopColumn === undefined || file.desktopRow === undefined,
  );

  for (const file of explicitRight) {
    const col = file.desktopColumn!;
    const row = file.desktopRow!;
    occupiedRightSlots.add(`${col}:${row}`);
    rightPositions.push([
      file.id,
      {
        x: rightBaseX + col * (ICON_W + COL_GAP),
        y: firstRowY + row * ROW_STRIDE,
      },
    ]);
  }

  let scanSlot = 0;
  for (const file of autoRight) {
    while (true) {
      const col = scanSlot % 2;
      const row = Math.floor(scanSlot / 2);
      scanSlot += 1;
      const key = `${col}:${row}`;
      if (!occupiedRightSlots.has(key)) {
        occupiedRightSlots.add(key);
        rightPositions.push([
          file.id,
          {
            x: rightBaseX + col * (ICON_W + COL_GAP),
            y: firstRowY + row * ROW_STRIDE,
          },
        ]);
        break;
      }
    }
  }
  const leftPositions = leftFiles.map((file) => {
    const column = file.desktopColumn ?? 0;
    let row = file.desktopRow;
    if (row === undefined) {
      while (occupiedLeftSlots.has(`${column}:${autoLeftRow}`)) {
        autoLeftRow += 1;
      }
      row = autoLeftRow;
      autoLeftRow += 1;
    }
    occupiedLeftSlots.add(`${column}:${row}`);
    const isResumeIcon = file.id === "desktop-resume";
    const offsetX = isResumeIcon ? 160 : 0;
    const offsetY = isResumeIcon ? -10 : 0;

    return [
      file.id,
      {
        x: leftBaseX + column * (ICON_W + COL_GAP) + offsetX,
        y: leftStartY + row * ROW_STRIDE + offsetY,
      },
    ] as const;
  });

  return Object.fromEntries([...leftPositions, ...rightPositions]);
}

export default function DesktopProjectIcons({
  files,
  onOpenFile,
}: DesktopProjectIconsProps) {
  const constraintsRef = useRef<HTMLDivElement>(null);
  const pointerOriginRef = useRef<{
    id: string;
    x: number;
    y: number;
  } | null>(null);
  const [positions, setPositions] = useState<Record<string, IconPosition>>({});
  const [positionsReady, setPositionsReady] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const handleIconPointerDown = (
    fileId: string,
    event: ReactPointerEvent<HTMLDivElement>,
  ) => {
    if (event.button !== 0) {
      return;
    }
    pointerOriginRef.current = {
      id: fileId,
      x: event.clientX,
      y: event.clientY,
    };
  };

  const handleIconPointerUp = (
    file: DesktopFileEntry,
    event: ReactPointerEvent<HTMLDivElement>,
  ) => {
    if (event.button !== 0) {
      return;
    }
    const origin = pointerOriginRef.current;
    pointerOriginRef.current = null;
    if (!origin || origin.id !== file.id) {
      return;
    }
    const dx = event.clientX - origin.x;
    const dy = event.clientY - origin.y;
    if (dx * dx + dy * dy <= CLICK_MOVE_THRESHOLD_SQ) {
      onOpenFile(file);
    }
  };

  const handleIconPointerCancel = (fileId: string) => {
    if (pointerOriginRef.current?.id === fileId) {
      pointerOriginRef.current = null;
    }
  };

  useLayoutEffect(() => {
    const el = constraintsRef.current;
    if (!el) {
      return;
    }

    const { width, height } = el.getBoundingClientRect();
    setPositions(getInitialPositions(files, width, height));
    setPositionsReady(true);
  }, [files]);

  return (
    <div
      ref={constraintsRef}
      className="pointer-events-none absolute inset-x-0 top-12 bottom-24 z-[5]"
    >
      {positionsReady &&
        files.map((file) => {
          const pos = positions[file.id];
          if (!pos) {
            return null;
          }

          return (
            <motion.div
              key={file.id}
              drag
              dragConstraints={constraintsRef}
              dragElastic={0.1}
              dragMomentum={false}
              onDragStart={() => setDraggingId(file.id)}
              onDragEnd={(_, info) => {
                setPositions((prev) => {
                  const current = prev[file.id];
                  if (!current) {
                    return prev;
                  }
                  return {
                    ...prev,
                    [file.id]: {
                      x: current.x + info.offset.x,
                      y: current.y + info.offset.y,
                    },
                  };
                });
                setDraggingId(null);
              }}
              onPointerDown={(e) => handleIconPointerDown(file.id, e)}
              onPointerUp={(e) => handleIconPointerUp(file, e)}
              onPointerCancel={() => handleIconPointerCancel(file.id)}
              whileDrag={{ scale: 1.05, opacity: 0.8 }}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                x: pos.x,
                y: pos.y,
                zIndex: draggingId === file.id ? 50 : 1,
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onOpenFile(file);
                }
              }}
              aria-label={`Open ${file.label}`}
              title={file.label}
              className="desktop-icon-button pointer-events-auto flex w-[92px] cursor-grab select-none flex-col items-center gap-1.5 rounded-xl border border-transparent bg-transparent p-1.5 text-white/95 transition-colors duration-150 hover:bg-white/12 focus-visible:border-white/45 focus-visible:bg-white/16 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45 active:cursor-grabbing"
            >
              <img
                src={
                  file.icon === "folder"
                    ? "/folder-icon.png"
                    : file.icon === "pdf"
                      ? "/pdf.png"
                      : "/file.svg"
                }
                alt=""
                width={72}
                height={54}
                className="h-[48px] w-auto drop-shadow-[0_6px_14px_rgba(0,0,0,0.26)]"
                aria-hidden="true"
                draggable={false}
              />
              <span className="line-clamp-2 text-center text-[12px] font-semibold leading-tight text-white [text-shadow:0_2px_6px_rgba(0,0,0,0.8)]">
                {file.label}
              </span>
            </motion.div>
          );
        })}
    </div>
  );
}
