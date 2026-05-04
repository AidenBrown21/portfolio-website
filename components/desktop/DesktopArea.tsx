'use client';

import { useMemo, useRef, useState, type PointerEvent, type ReactNode } from "react";

interface DesktopAreaProps {
  children: ReactNode;
}

interface Point {
  x: number;
  y: number;
}

export default function DesktopArea({ children }: DesktopAreaProps) {
  const desktopRef = useRef<HTMLElement | null>(null);
  const [dragStart, setDragStart] = useState<Point | null>(null);
  const [dragCurrent, setDragCurrent] = useState<Point | null>(null);

  const selectionBox = useMemo(() => {
    if (!dragStart || !dragCurrent) {
      return null;
    }

    const left = Math.min(dragStart.x, dragCurrent.x);
    const top = Math.min(dragStart.y, dragCurrent.y);
    const width = Math.abs(dragCurrent.x - dragStart.x);
    const height = Math.abs(dragCurrent.y - dragStart.y);

    return { left, top, width, height };
  }, [dragCurrent, dragStart]);

  const getRelativePoint = (event: PointerEvent<HTMLElement>) => {
    const bounds = desktopRef.current?.getBoundingClientRect();
    if (!bounds) {
      return null;
    }

    return {
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    };
  };

  const handlePointerDown = (event: PointerEvent<HTMLElement>) => {
    if (event.button !== 0 || event.target !== event.currentTarget) {
      return;
    }

    const nextPoint = getRelativePoint(event);
    if (!nextPoint) {
      return;
    }

    setDragStart(nextPoint);
    setDragCurrent(nextPoint);
  };

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    if (!dragStart) {
      return;
    }

    const nextPoint = getRelativePoint(event);
    if (!nextPoint) {
      return;
    }

    setDragCurrent(nextPoint);
  };

  const clearSelection = () => {
    setDragStart(null);
    setDragCurrent(null);
  };

  return (
    <main
      ref={desktopRef}
      className="relative overflow-hidden bg-[#d8deea] bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "url('/wallpaper.jpg')",
        height: "100vh",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={clearSelection}
      onPointerCancel={clearSelection}
    >
      {selectionBox && (
        <div
          className="pointer-events-none absolute border border-dashed border-blue-700 bg-blue-500/10"
          style={{
            left: selectionBox.left,
            top: selectionBox.top,
            width: selectionBox.width,
            height: selectionBox.height,
          }}
          aria-hidden="true"
        />
      )}
      {children}
    </main>
  );
}
