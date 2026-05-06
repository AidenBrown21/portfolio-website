"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { projects } from "@/data/projects";
import type {
  AppWindowId,
  BaseWindowConfig,
  BaseWindowId,
  DesktopFileEntry,
  DockItem,
  MinimizedDockEntry,
  WindowAnimationPhase,
  WindowFrameRecord,
} from "@/components/desktop/types";
import DesktopArea from "@/components/desktop/DesktopArea";
import Dock from "@/components/desktop/Dock";
import DesktopProjectIcons from "@/components/desktop/DesktopProjectIcons";
import DesktopWidgets from "@/components/desktop/DesktopWidgets";
import FinderWindow from "@/components/desktop/FinderWindow";
import MenuBar from "@/components/desktop/MenuBar";
import Window from "@/components/desktop/Window";
import AboutWindowContent from "@/components/desktop/content/AboutWindowContent";
import ContactWindowContent from "@/components/desktop/content/ContactWindowContent";
import HomeWindowContent from "@/components/desktop/content/HomeWindowContent";
import PhotosWindowContent, {
  type PhotosLibraryItem,
} from "@/components/desktop/content/PhotosWindowContent";
import ProjectWindowContent from "@/components/desktop/content/ProjectWindowContent";
import ResumeWindowContent from "@/components/desktop/content/ResumeWindowContent";
import YouTubeWindowContent from "@/components/desktop/content/YouTubeWindowContent";
import AiModelWindowContent from "@/components/desktop/content/AiModelWindowContent";
import VsCodeWindowContent from "@/components/desktop/content/VsCodeWindowContent";

const baseWindowConfigs: Record<BaseWindowId, BaseWindowConfig> = {
  finder: {
    id: "finder",
    title: "Finder",
    frame: { x: 88, y: 62, width: 820, height: 500 },
  },
  home: {
    id: "home",
    title: "Home",
    frame: { x: 48, y: 56, width: 520, height: 330 },
  },
  photos: {
    id: "photos",
    title: "Photos",
    frame: { x: 112, y: 64, width: 840, height: 520 },
  },
  about: {
    id: "about",
    title: "About",
    frame: { x: 130, y: 120, width: 560, height: 330 },
  },
  projects: {
    id: "projects",
    title: "Projects",
    frame: { x: 210, y: 82, width: 760, height: 450 },
  },
  contact: {
    id: "contact",
    title: "Contact",
    frame: { x: 290, y: 138, width: 520, height: 430 },
  },
  resume: {
    id: "resume",
    title: "Resume",
    frame: { x: 166, y: 76, width: 760, height: 560 },
  },
  youtube: {
    id: "youtube",
    title: "YouTube",
    frame: { x: 72, y: 52, width: 900, height: 560 },
  },
  vscode: {
    id: "vscode",
    title: "VS Code",
    frame: { x: 96, y: 54, width: 940, height: 580 },
  },
  ai: {
    id: "ai",
    title: "AI Model",
    frame: { x: 180, y: 82, width: 860, height: 560 },
  },
};

const dockItems: DockItem[] = [
  { id: "finder", label: "Finder" },
  { id: "home", label: "Home" },
  { id: "photos", label: "Photos" },
  { id: "projects", label: "Projects" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
  { id: "youtube", label: "YouTube" },
  { id: "vscode", label: "VS Code" },
];

const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

const formatClock = (date: Date) => {
  const day = WEEKDAY_SHORT[date.getDay()];
  const month = MONTH_SHORT[date.getMonth()];
  const dayOfMonth = date.getDate();
  const time = date
    .toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    .replace(" ", "");

  return `${day} ${month} ${dayOfMonth} ${time}`;
};

const projectWindowId = (id: number) => `project-${id}` as const;
const isBaseWindowId = (windowId: AppWindowId): windowId is BaseWindowId =>
  !windowId.startsWith("project-");
const MENU_BAR_OFFSET = 48;
const SCREEN_EDGE_GAP = 8;
const DOCK_OFFSET = 100;
const MINIMIZE_ANIMATION_MS = 220;
const RESTORE_ANIMATION_MS = 220;
/** Distance from viewport right edge to the home window’s right edge. */
const HOME_STARTUP_RIGHT_INSET = 180;

/** Bottom-right placement using the same safe area as dragging (`moveWindow`). */
function getHomeStartupFrame(frame: {
  x: number;
  y: number;
  width: number;
  height: number;
}) {
  const maxX = Math.max(SCREEN_EDGE_GAP, window.innerWidth - frame.width - SCREEN_EDGE_GAP);
  const maxY = Math.max(
    MENU_BAR_OFFSET,
    window.innerHeight - frame.height - DOCK_OFFSET,
  );
  const xFromRightWall = window.innerWidth - frame.width - HOME_STARTUP_RIGHT_INSET;
  const x = Math.min(maxX, Math.max(SCREEN_EDGE_GAP, xFromRightWall));
  return { ...frame, x, y: maxY };
}

export default function WindowManager() {
  const [openBaseWindows, setOpenBaseWindows] = useState<BaseWindowId[]>(["home"]);
  const [openProjectWindows, setOpenProjectWindows] = useState<number[]>([]);
  const [focusedWindow, setFocusedWindow] = useState<AppWindowId | null>("home");
  const [windowOrder, setWindowOrder] = useState<AppWindowId[]>(["home"]);
  const [windowFrames, setWindowFrames] = useState<WindowFrameRecord>({
    finder: baseWindowConfigs.finder.frame,
    home: baseWindowConfigs.home.frame,
    photos: baseWindowConfigs.photos.frame,
    about: baseWindowConfigs.about.frame,
    projects: baseWindowConfigs.projects.frame,
    contact: baseWindowConfigs.contact.frame,
    resume: baseWindowConfigs.resume.frame,
    youtube: baseWindowConfigs.youtube.frame,
    vscode: baseWindowConfigs.vscode.frame,
    ai: baseWindowConfigs.ai.frame,
  });
  const [minimizedWindows, setMinimizedWindows] = useState<AppWindowId[]>([]);
  const [minimizedDockEntries, setMinimizedDockEntries] = useState<MinimizedDockEntry[]>([]);
  const [windowAnimationPhases, setWindowAnimationPhases] = useState<
    Record<string, WindowAnimationPhase>
  >({});
  const [maximizedWindows, setMaximizedWindows] = useState<AppWindowId[]>([]);
  const [restoreFrames, setRestoreFrames] = useState<WindowFrameRecord>({});
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [clock, setClock] = useState(() => formatClock(new Date()));
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);
  const animationTimersRef = useRef<Record<string, number>>({});

  useEffect(() => {
    const timer = window.setInterval(() => {
      const nextDate = new Date();
      setCurrentDate(nextDate);
      setClock(formatClock(nextDate));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  useLayoutEffect(() => {
    setWindowFrames((previous) => {
      const home = previous.home;
      if (!home) {
        return previous;
      }
      const next = getHomeStartupFrame(home);
      if (next.x === home.x && next.y === home.y) {
        return previous;
      }
      return { ...previous, home: next };
    });
  }, []);

  const clearAnimationTimer = (windowId: AppWindowId) => {
    const timer = animationTimersRef.current[windowId];
    if (timer) {
      window.clearTimeout(timer);
      delete animationTimersRef.current[windowId];
    }
  };

  useEffect(
    () => () => {
      Object.values(animationTimersRef.current).forEach((timer) => {
        window.clearTimeout(timer);
      });
      animationTimersRef.current = {};
    },
    [],
  );

  const projectsById = useMemo(
    () => Object.fromEntries(projects.map((project) => [project.id, project])),
    [],
  );
  const projectPhotos = useMemo<PhotosLibraryItem[]>(
    () =>
      projects.flatMap((project) =>
        (project.projectImages ?? []).map((src, index) => ({
          id: `project-${project.id}-photo-${index}`,
          src,
          title: project.title,
          subtitle: `Project ${index + 1}`,
        })),
      ),
    [],
  );
  const photosLibrary = useMemo<PhotosLibraryItem[]>(() => {
    const uniquePhotos = new Map<string, PhotosLibraryItem>();
    const addPhoto = (photo: PhotosLibraryItem) => {
      if (!uniquePhotos.has(photo.src)) {
        uniquePhotos.set(photo.src, photo);
      }
    };

    addPhoto({
      id: "library-wallpaper",
      src: "/wallpaper.jpg",
      title: "Wallpaper",
      subtitle: "Desktop",
    });
    addPhoto({
      id: "library-aiden",
      src: "/Aiden Brown.jpg",
      title: "Aiden Brown",
      subtitle: "Library",
    });
    addPhoto({
      id: "library-sigma-nu",
      src: "/SigmaNu.jpg",
      title: "Sigma Nu",
      subtitle: "Library",
    });
    addPhoto({
      id: "library-portfolio",
      src: "/portfoliologo.jpg",
      title: "Portfolio",
      subtitle: "Library",
    });
    projectPhotos.forEach(addPhoto);

    return Array.from(uniquePhotos.values());
  }, [projectPhotos]);
  const projectDesktopFiles = useMemo<DesktopFileEntry[]>(
    () =>
      projects.map((project) => ({
        id: `project-file-${project.id}`,
        label: project.title,
        typeLabel: "Project Folder",
        icon: "folder",
        modifiedLabel: "Today",
        sizeLabel: "--",
        desktopSide: "right",
        ...(project.title.startsWith("Pebbl")
          ? { desktopColumn: 1 as const, desktopRow: 2 as const }
          : {}),
        target: { kind: "project-window", projectId: project.id },
      })),
    [],
  );
  const desktopFiles = useMemo<DesktopFileEntry[]>(
    () => [
      {
        id: "desktop-resume",
        label: "Resume",
        typeLabel: "PDF document",
        icon: "pdf",
        description: "Aiden Brown resume - May 2026",
        modifiedLabel: "May 2026",
        sizeLabel: "PDF",
        desktopSide: "left",
        desktopColumn: 1,
        desktopRow: 0,
        target: { kind: "base-window", windowId: "resume" },
      },
      {
        id: "desktop-home",
        label: "Home",
        typeLabel: "Application",
        icon: "app",
        description: "Portfolio home window",
        modifiedLabel: "Today",
        sizeLabel: "4 KB",
        target: { kind: "base-window", windowId: "home" },
      },
      {
        id: "desktop-about",
        label: "About",
        typeLabel: "Application",
        icon: "app",
        description: "About me and background",
        modifiedLabel: "Today",
        sizeLabel: "4 KB",
        target: { kind: "base-window", windowId: "about" },
      },
      {
        id: "desktop-contact",
        label: "Contact",
        typeLabel: "Application",
        icon: "app",
        description: "Contact form and links",
        modifiedLabel: "Today",
        sizeLabel: "4 KB",
        target: { kind: "base-window", windowId: "contact" },
      },
      {
        id: "desktop-vscode",
        label: "VS Code",
        typeLabel: "Application",
        icon: "app",
        description: "Read-only portfolio source viewer",
        modifiedLabel: "Today",
        sizeLabel: "6 KB",
        target: { kind: "base-window", windowId: "vscode" },
      },
      {
        id: "desktop-ai-model",
        label: "AI Model",
        typeLabel: "Application",
        icon: "app",
        description: "Private Purdue GenAI assistant",
        modifiedLabel: "Today",
        sizeLabel: "8 KB",
        target: { kind: "base-window", windowId: "ai" },
      },
      ...projectDesktopFiles,
    ],
    [projectDesktopFiles],
  );
  const desktopIconFiles = useMemo<DesktopFileEntry[]>(
    () =>
      desktopFiles.filter((file) => file.id === "desktop-resume" || file.target.kind === "project-window"),
    [desktopFiles],
  );

  const getWindowTitle = (windowId: AppWindowId): string => {
    if (windowId.startsWith("project-")) {
      const id = Number(windowId.replace("project-", ""));
      return projectsById[id]?.title ?? "Project";
    }

    return baseWindowConfigs[windowId as BaseWindowId].title;
  };

  const getWindowPreviewData = (windowId: AppWindowId): { previewUrl: string | null; previewText: string } => {
    if (windowId.startsWith("project-")) {
      const id = Number(windowId.replace("project-", ""));
      const project = projectsById[id];
      return {
        previewUrl: project?.projectImages?.[0] ?? null,
        previewText: project?.description ?? "Project preview",
      };
    }

    if (windowId === "home") {
      return {
        previewUrl: "/Aiden Brown.jpg",
        previewText: "Hi, I'm Aiden Brown",
      };
    }

    if (windowId === "photos") {
      return {
        previewUrl: "/wallpaper.jpg",
        previewText: `${photosLibrary.length} photos in library`,
      };
    }

    if (windowId === "finder") {
      return {
        previewUrl: "/folder-icon.png",
        previewText: `${desktopFiles.length} items on Desktop`,
      };
    }

    if (windowId === "projects") {
      return {
        previewUrl: "/folder-icon.png",
        previewText: `${projects.length} projects in Finder`,
      };
    }

    if (windowId === "about") {
      return {
        previewUrl: null,
        previewText: "Recent interests and technologies",
      };
    }

    if (windowId === "resume") {
      return {
        previewUrl: "/pdf.png",
        previewText: "Aiden Brown resume PDF",
      };
    }

    if (windowId === "youtube") {
      return {
        previewUrl: null,
        previewText: "Search and watch videos",
      };
    }

    if (windowId === "vscode") {
      return {
        previewUrl: null,
        previewText: "Read-only portfolio code view",
      };
    }

    if (windowId === "ai") {
      return {
        previewUrl: null,
        previewText: "Private Purdue GenAI assistant",
      };
    }

    return {
      previewUrl: null,
      previewText: "Contact details and message form",
    };
  };

  const getAppIdForWindow = (windowId: AppWindowId): BaseWindowId =>
    isBaseWindowId(windowId) ? windowId : "projects";

  const getWindowAnimationPhase = (windowId: AppWindowId): WindowAnimationPhase =>
    windowAnimationPhases[windowId] ?? "idle";

  const focusWindow = (windowId: AppWindowId) => {
    setFocusedWindow(windowId);
    setWindowOrder((previous) => [
      ...previous.filter((currentId) => currentId !== windowId),
      windowId,
    ]);
  };

  const getMaximizedFrame = useCallback(() => {
    const width = Math.max(320, window.innerWidth - SCREEN_EDGE_GAP * 2);
    const height = Math.max(240, window.innerHeight - MENU_BAR_OFFSET - DOCK_OFFSET);

    return {
      x: SCREEN_EDGE_GAP,
      y: MENU_BAR_OFFSET,
      width,
      height,
    };
  }, []);

  const activateWindow = (windowId: AppWindowId) => {
    clearAnimationTimer(windowId);
    setMinimizedWindows((previous) => previous.filter((currentId) => currentId !== windowId));
    setMinimizedDockEntries((previous) =>
      previous.filter((entry) => entry.windowId !== windowId),
    );
    setWindowAnimationPhases((previous) => {
      const nextPhases = { ...previous };
      delete nextPhases[windowId];
      return nextPhases;
    });
    focusWindow(windowId);
  };

  const openBaseWindow = (windowId: BaseWindowId) => {
    setOpenBaseWindows((previous) =>
      previous.includes(windowId) ? previous : [...previous, windowId],
    );
    setWindowFrames((previous) => ({
      ...previous,
      [windowId]: previous[windowId] ?? baseWindowConfigs[windowId].frame,
    }));
    activateWindow(windowId);
  };

  const openProjectWindow = (id: number) => {
    const nextId = projectWindowId(id);
    setOpenProjectWindows((previous) => (previous.includes(id) ? previous : [...previous, id]));
    setWindowFrames((previous) => {
      if (previous[nextId]) {
        return previous;
      }

      const offset = openProjectWindows.length * 20;
      return {
        ...previous,
        [nextId]: {
          x: 260 + offset,
          y: 98 + offset,
          width: 720,
          height: 500,
        },
      };
    });
    activateWindow(nextId);
  };

  const openDesktopFile = (file: DesktopFileEntry) => {
    if (file.target.kind === "base-window") {
      openBaseWindow(file.target.windowId);
      return;
    }

    openProjectWindow(file.target.projectId);
  };

  const openFeaturedPhoto = () => {
    setSelectedPhotoId("library-sigma-nu");
    openBaseWindow("photos");
  };

  const moveWindow = (windowId: string, x: number, y: number) => {
    if (maximizedWindows.includes(windowId as AppWindowId)) {
      return;
    }

    setWindowFrames((previous) => {
      const frame = previous[windowId];
      if (!frame) {
        return previous;
      }

      const maxX = Math.max(SCREEN_EDGE_GAP, window.innerWidth - frame.width - SCREEN_EDGE_GAP);
      const maxY = Math.max(
        MENU_BAR_OFFSET,
        window.innerHeight - frame.height - DOCK_OFFSET,
      );
      const clampedX = Math.min(Math.max(SCREEN_EDGE_GAP, x), maxX);
      const clampedY = Math.min(Math.max(MENU_BAR_OFFSET, y), maxY);

      return {
        ...previous,
        [windowId]: {
          ...frame,
          x: clampedX,
          y: clampedY,
        },
      };
    });
  };

  const minimizeWindow = (windowId: AppWindowId) => {
    const phase = getWindowAnimationPhase(windowId);
    if (phase === "minimizing" || minimizedWindows.includes(windowId)) {
      return;
    }

    clearAnimationTimer(windowId);
    setWindowAnimationPhases((previous) => ({
      ...previous,
      [windowId]: "minimizing",
    }));

    setFocusedWindow((previous) => {
      if (previous !== windowId) {
        return previous;
      }

      const nextVisibleWindow = [...windowOrder]
        .reverse()
        .find(
          (currentId) =>
            currentId !== windowId &&
            !minimizedWindows.includes(currentId) &&
            getWindowAnimationPhase(currentId) !== "minimizing",
        );
      return nextVisibleWindow ?? null;
    });

    animationTimersRef.current[windowId] = window.setTimeout(() => {
      setMinimizedWindows((previous) =>
        previous.includes(windowId) ? previous : [...previous, windowId],
      );
      setMinimizedDockEntries((previous) => {
        const previewData = getWindowPreviewData(windowId);
        const withoutCurrent = previous.filter((entry) => entry.windowId !== windowId);
        return [
          ...withoutCurrent,
          {
            windowId,
            title: getWindowTitle(windowId),
            appId: getAppIdForWindow(windowId),
            minimizedAt: Date.now(),
            previewUrl: previewData.previewUrl,
            previewText: previewData.previewText,
          },
        ];
      });
      setWindowAnimationPhases((previous) => {
        const nextPhases = { ...previous };
        delete nextPhases[windowId];
        return nextPhases;
      });
      delete animationTimersRef.current[windowId];
    }, MINIMIZE_ANIMATION_MS);
  };

  const restoreMinimizedWindow = (windowId: AppWindowId) => {
    clearAnimationTimer(windowId);
    setMinimizedWindows((previous) => previous.filter((currentId) => currentId !== windowId));
    setMinimizedDockEntries((previous) => previous.filter((entry) => entry.windowId !== windowId));
    setWindowAnimationPhases((previous) => ({
      ...previous,
      [windowId]: "restoring",
    }));
    focusWindow(windowId);

    animationTimersRef.current[windowId] = window.setTimeout(() => {
      setWindowAnimationPhases((previous) => {
        const nextPhases = { ...previous };
        delete nextPhases[windowId];
        return nextPhases;
      });
      delete animationTimersRef.current[windowId];
    }, RESTORE_ANIMATION_MS);
  };

  const toggleMaximizeWindow = (windowId: AppWindowId) => {
    if (maximizedWindows.includes(windowId)) {
      const restoreFrame = restoreFrames[windowId];
      if (restoreFrame) {
        setWindowFrames((previous) => ({
          ...previous,
          [windowId]: restoreFrame,
        }));
      }
      setMaximizedWindows((previous) => previous.filter((currentId) => currentId !== windowId));
      setRestoreFrames((previous) => {
        const nextFrames = { ...previous };
        delete nextFrames[windowId];
        return nextFrames;
      });
      return;
    }

    const frame = windowFrames[windowId];
    if (!frame) {
      return;
    }

    setRestoreFrames((previous) => ({
      ...previous,
      [windowId]: frame,
    }));
    setWindowFrames((previous) => ({
      ...previous,
      [windowId]: getMaximizedFrame(),
    }));
    setMaximizedWindows((previous) =>
      previous.includes(windowId) ? previous : [...previous, windowId],
    );
    activateWindow(windowId);
  };

  const closeWindow = (windowId: AppWindowId) => {
    clearAnimationTimer(windowId);

    if (windowId.startsWith("project-")) {
      const id = Number(windowId.replace("project-", ""));
      setOpenProjectWindows((previous) => previous.filter((projectId) => projectId !== id));
    } else {
      setOpenBaseWindows((previous) => previous.filter((baseId) => baseId !== windowId));
    }

    setWindowOrder((previous) => {
      const nextOrder = previous.filter((currentId) => currentId !== windowId);
      const nextFocus = [...nextOrder]
        .reverse()
        .find((currentId) => !minimizedWindows.includes(currentId));
      setFocusedWindow(nextFocus ?? null);
      return nextOrder;
    });
    setMinimizedWindows((previous) => previous.filter((currentId) => currentId !== windowId));
    setMinimizedDockEntries((previous) => previous.filter((entry) => entry.windowId !== windowId));
    setMaximizedWindows((previous) => previous.filter((currentId) => currentId !== windowId));
    setWindowAnimationPhases((previous) => {
      const nextPhases = { ...previous };
      delete nextPhases[windowId];
      return nextPhases;
    });
    setRestoreFrames((previous) => {
      const nextFrames = { ...previous };
      delete nextFrames[windowId];
      return nextFrames;
    });
  };

  const activateDockApp = (windowId: BaseWindowId) => {
    const minimizedForApp = minimizedDockEntries
      .filter((entry) => entry.appId === windowId)
      .sort((left, right) => right.minimizedAt - left.minimizedAt);
    if (minimizedForApp.length > 0) {
      restoreMinimizedWindow(minimizedForApp[0].windowId);
      return;
    }

    if (windowId === "projects") {
      const projectWindows = windowOrder.filter((currentId) => currentId.startsWith("project-"));
      const visibleProject = [...projectWindows]
        .reverse()
        .find((currentId) => !minimizedWindows.includes(currentId));
      if (visibleProject) {
        focusWindow(visibleProject);
        return;
      }
    }

    openBaseWindow(windowId);
  };

  const activeAppLabel = focusedWindow ? getWindowTitle(focusedWindow) : "Desktop";
  const focusedApp: BaseWindowId | null =
    focusedWindow === null
      ? null
      : isBaseWindowId(focusedWindow)
        ? focusedWindow
        : "projects";
  const openApps: BaseWindowId[] =
    openProjectWindows.length > 0 && !openBaseWindows.includes("projects")
      ? [...openBaseWindows, "projects"]
      : openBaseWindows;

  return (
    <div className="h-screen bg-[#fdfbf7] text-black">
      <MenuBar
        activeAppLabel={activeAppLabel}
        currentTime={clock}
        onOpenHome={() => openBaseWindow("home")}
        onOpenResume={() => openBaseWindow("resume")}
      />

      <DesktopArea>
        <DesktopWidgets currentDate={currentDate} onOpenFeaturedPhoto={openFeaturedPhoto} />
        <DesktopProjectIcons files={desktopIconFiles} onOpenFile={openDesktopFile} />

        {openBaseWindows.map((windowId) => {
          const animationPhase = getWindowAnimationPhase(windowId);
          if (minimizedWindows.includes(windowId) && animationPhase !== "restoring") {
            return null;
          }

          const windowConfig = baseWindowConfigs[windowId];
          const frame = windowFrames[windowId];

          if (!frame) {
            return null;
          }

          const zIndex = 10 + Math.max(windowOrder.indexOf(windowId), 0);
          const isFocused = focusedWindow === windowId;

          return (
            <Window
              key={windowId}
              id={windowId}
              title={windowConfig.title}
              zIndex={zIndex}
              isFocused={isFocused}
              frame={frame}
              isMaximized={maximizedWindows.includes(windowId)}
              animationPhase={animationPhase}
              onFocus={() => focusWindow(windowId)}
              onClose={() => closeWindow(windowId)}
              onMinimize={() => minimizeWindow(windowId)}
              onToggleMaximize={() => toggleMaximizeWindow(windowId)}
              onMove={moveWindow}
              contentPadding={windowId === "vscode" ? "none" : "default"}
            >
              {windowId === "home" && <HomeWindowContent />}
              {windowId === "photos" && (
                <PhotosWindowContent
                  photos={photosLibrary}
                  selectedPhotoId={selectedPhotoId}
                  onSelectedPhotoIdChange={setSelectedPhotoId}
                />
              )}
              {windowId === "about" && <AboutWindowContent />}
              {windowId === "finder" && (
                <FinderWindow
                  pathLabel="Finder / AidenBrown / Desktop"
                  files={desktopFiles}
                  onOpenFile={openDesktopFile}
                />
              )}
              {windowId === "projects" && (
                <FinderWindow
                  pathLabel="Finder / AidenBrown / Projects"
                  files={projectDesktopFiles}
                  onOpenFile={openDesktopFile}
                  showStatusDescription={false}
                />
              )}
              {windowId === "contact" && <ContactWindowContent />}
              {windowId === "resume" && <ResumeWindowContent />}
              {windowId === "youtube" && <YouTubeWindowContent />}
              {windowId === "vscode" && <VsCodeWindowContent />}
              {windowId === "ai" && <AiModelWindowContent />}
            </Window>
          );
        })}

        {openProjectWindows.map((projectId) => {
          const currentProject = projectsById[projectId];

          if (!currentProject) {
            return null;
          }

          const windowId = projectWindowId(projectId);
          const animationPhase = getWindowAnimationPhase(windowId);
          if (minimizedWindows.includes(windowId) && animationPhase !== "restoring") {
            return null;
          }

          const frame = windowFrames[windowId];
          if (!frame) {
            return null;
          }

          const zIndex = 10 + Math.max(windowOrder.indexOf(windowId), 0);
          const isFocused = focusedWindow === windowId;

          return (
            <Window
              key={windowId}
              id={windowId}
              title={currentProject.title}
              zIndex={zIndex}
              isFocused={isFocused}
              frame={frame}
              isMaximized={maximizedWindows.includes(windowId)}
              animationPhase={animationPhase}
              onFocus={() => focusWindow(windowId)}
              onClose={() => closeWindow(windowId)}
              onMinimize={() => minimizeWindow(windowId)}
              onToggleMaximize={() => toggleMaximizeWindow(windowId)}
              onMove={moveWindow}
            >
              <ProjectWindowContent project={currentProject} />
            </Window>
          );
        })}
      </DesktopArea>

      <Dock
        items={dockItems}
        openApps={openApps}
        focusedApp={focusedApp}
        minimizedEntries={minimizedDockEntries}
        onActivate={activateDockApp}
        onRestoreWindow={restoreMinimizedWindow}
      />
    </div>
  );
}
