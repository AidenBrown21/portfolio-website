import {
  useCallback,
  useEffect,
  useRef,
  type CSSProperties,
  type MouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import type { WindowAnimationPhase, WindowFrame } from "@/components/desktop/types";

interface WindowProps {
  id: string;
  title: string;
  zIndex: number;
  isFocused: boolean;
  isMaximized: boolean;
  animationPhase: WindowAnimationPhase;
  frame: WindowFrame;
  onFocus: () => void;
  onClose: () => void;
  onMinimize: () => void;
  onToggleMaximize: () => void;
  onMove: (id: string, x: number, y: number) => void;
  children: ReactNode;
}

export default function Window({
  id,
  title,
  zIndex,
  isFocused,
  isMaximized,
  animationPhase,
  frame,
  onFocus,
  onClose,
  onMinimize,
  onToggleMaximize,
  onMove,
  children,
}: WindowProps) {
  const dragStateRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);

  const handleClose = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onClose();
  };

  const handleMinimize = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onMinimize();
  };

  const handleToggleMaximize = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onToggleMaximize();
  };

  const onPointerMove = useCallback(
    (event: PointerEvent) => {
      const dragState = dragStateRef.current;

      if (!dragState || dragState.pointerId !== event.pointerId) {
        return;
      }

      const deltaX = event.clientX - dragState.startX;
      const deltaY = event.clientY - dragState.startY;
      const nextX = Math.max(8, dragState.originX + deltaX);
      const nextY = Math.max(8, dragState.originY + deltaY);

      onMove(id, nextX, nextY);
    },
    [id, onMove],
  );

  const stopDrag = useCallback(() => {
    dragStateRef.current = null;
  }, []);

  useEffect(() => {
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", stopDrag);
    window.addEventListener("pointercancel", stopDrag);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", stopDrag);
      window.removeEventListener("pointercancel", stopDrag);
    };
  }, [onPointerMove, stopDrag]);

  const handleDragStart = (event: ReactPointerEvent<HTMLElement>) => {
    if (isMaximized || animationPhase !== "idle") {
      return;
    }

    const target = event.target as HTMLElement;
    if (target.closest("[data-no-drag='true']")) {
      return;
    }

    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: frame.x,
      originY: frame.y,
    };

    onFocus();
  };

  const windowStyle: CSSProperties = {
    top: frame.y,
    left: frame.x,
    width: `min(${frame.width}px, calc(100vw - 1rem))`,
    height: `min(${frame.height}px, calc(100% - 1rem))`,
    zIndex,
  };

  return (
    <section
      className={`liquid-glass-surface absolute overflow-hidden rounded-[12px] border ${
        isFocused ? "opacity-100" : "opacity-[0.92]"
      } ${
        animationPhase === "minimizing"
          ? "window-minimize-out pointer-events-none"
          : animationPhase === "restoring"
            ? "window-restore-in"
            : ""
      }`}
      style={{
        ...windowStyle,
        borderRadius: 12,
        borderTopColor: "rgba(255, 255, 255, 0.2)",
        borderLeftColor: "rgba(0, 0, 0, 0.1)",
        borderRightColor: "rgba(0, 0, 0, 0.1)",
        borderBottomColor: "rgba(0, 0, 0, 0.1)",
      }}
      data-window-id={id}
      onMouseDown={onFocus}
      aria-label={`${title} window`}
    >
      <div className="window-noise-overlay pointer-events-none absolute inset-0" />
      <header
        className={`window-titlebar relative z-10 flex h-11 items-center px-4 ${
          isMaximized ? "cursor-default" : "cursor-grab active:cursor-grabbing"
        }`}
        onPointerDown={handleDragStart}
      >
        <div className="window-controls flex items-center gap-2" data-no-drag="true">
          <button
            type="button"
            className="traffic-light traffic-light-close"
            onClick={handleClose}
            aria-label={`Close ${title}`}
          >
            <span className="traffic-light-icon traffic-light-icon-close" aria-hidden="true">
              <svg
                viewBox="0 0 8 8"
                className="block h-[8px] w-[8px] fill-none stroke-current stroke-[1.75]"
              >
                <path d="M1.5 1.5l5 5m0-5l-5 5" />
              </svg>
            </span>
          </button>
          <button
            type="button"
            className="traffic-light traffic-light-minimize"
            onClick={handleMinimize}
            aria-label={`Minimize ${title}`}
          >
            <span className="traffic-light-icon traffic-light-icon-minimize" aria-hidden="true">
              <svg
                viewBox="0 0 8 8"
                className="block h-[8px] w-[8px] fill-none stroke-current stroke-[1.75]"
              >
                <path d="M1.5 4h5" />
              </svg>
            </span>
          </button>
          <button
            type="button"
            className="traffic-light traffic-light-maximize"
            onClick={handleToggleMaximize}
            aria-label={`${isMaximized ? "Restore" : "Maximize"} ${title}`}
          >
            <span className="traffic-light-icon traffic-light-icon-maximize" aria-hidden="true">
              <svg
                viewBox="0 0 8 8"
                className="block h-[8px] w-[8px] fill-none stroke-current stroke-[1.75]"
              >
                <path d="M1.5 6.5l5-5" />
                <path d="M4.75 1.5H6.5v1.75" />
                <path d="M1.5 4.75V6.5h1.75" />
              </svg>
            </span>
          </button>
        </div>
        <p className="window-title pointer-events-none absolute left-1/2 -translate-x-1/2">
          {title}
        </p>
      </header>
      <div className="relative z-10 h-[calc(100%-44px)] overflow-auto p-6 md:p-8">{children}</div>
    </section>
  );
}
