"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface MenuBarProps {
  activeAppLabel: string;
  currentTime: string;
  onOpenHome: () => void;
  onOpenResume: () => void;
}

const controlCenterItems = [
  {
    kind: "external" as const,
    href: "https://github.com/AidenBrown21",
    label: "GitHub",
    icon: "/githublogo.png",
    iconAlt: "GitHub",
  },
  {
    kind: "external" as const,
    href: "https://linkedin.com/in/aidenbrown21",
    label: "LinkedIn",
    icon: "/linkedinlogo.png",
    iconAlt: "LinkedIn",
  },
  {
    kind: "resume" as const,
    label: "Resume",
    icon: "/resumelogo.png",
    iconAlt: "Resume",
  },
];

export default function MenuBar({
  activeAppLabel,
  currentTime,
  onOpenHome,
  onOpenResume,
}: MenuBarProps) {
  const [controlCenterOpen, setControlCenterOpen] = useState(false);
  const controlCenterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!controlCenterOpen) return;

    const onPointerDown = (e: PointerEvent) => {
      const el = controlCenterRef.current;
      if (el && !el.contains(e.target as Node)) {
        setControlCenterOpen(false);
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setControlCenterOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [controlCenterOpen]);

  return (
    <header className="menu-bar-glass fixed inset-x-0 top-0 z-[400] h-12">
      <div className="mx-auto flex h-full max-w-[1600px] items-center justify-between px-3 text-[13px] text-white">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenHome}
            className="menu-bar-item flex items-center p-1"
            aria-label="Open Home window"
          >
            <Image
              src="/transparent.png"
              alt="Aiden Brown logo"
              width={36}
              height={36}
              className="h-[22px] w-[22px]"
              priority
            />
          </button>
          <p className="menu-bar-item font-semibold">
            {activeAppLabel}
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div ref={controlCenterRef} className="relative flex items-center">
            <button
              type="button"
              onClick={() => setControlCenterOpen((o) => !o)}
              className="menu-bar-item flex items-center justify-center p-1"
              aria-label="Open links menu"
              aria-expanded={controlCenterOpen}
              aria-haspopup="true"
            >
              <Image
                src="/control-center.png"
                alt=""
                width={36}
                height={36}
                className="h-[22px] w-[22px]"
              />
            </button>

            {controlCenterOpen && (
              <div
                className="control-center-panel fixed top-12 right-3 z-[401] w-[min(100vw-1.5rem,220px)]"
                role="menu"
                aria-label="Links"
              >
                {controlCenterItems.map((item) =>
                  item.kind === "external" ? (
                    <a
                      key={item.href}
                      role="menuitem"
                      className="control-center-row"
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setControlCenterOpen(false)}
                    >
                      <span className="control-center-row-icon">
                        <Image
                          src={item.icon}
                          alt=""
                          width={32}
                          height={32}
                          className="h-5 w-5 object-contain"
                        />
                      </span>
                      <span className="control-center-row-label">{item.label}</span>
                    </a>
                  ) : (
                    <a
                      key="resume"
                      role="menuitem"
                      className="control-center-row"
                      href="#"
                      onClick={(event) => {
                        event.preventDefault();
                        onOpenResume();
                        setControlCenterOpen(false);
                      }}
                    >
                      <span className="control-center-row-icon">
                        <Image
                          src={item.icon}
                          alt=""
                          width={32}
                          height={32}
                          className="h-5 w-5 object-contain"
                        />
                      </span>
                      <span className="control-center-row-label">{item.label}</span>
                    </a>
                  ),
                )}
              </div>
            )}
          </div>
          <p className="menu-bar-item font-semibold">{currentTime}</p>
        </div>
      </div>
    </header>
  );
}
