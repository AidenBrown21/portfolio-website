export type BaseWindowId =
  | "finder"
  | "home"
  | "photos"
  | "about"
  | "projects"
  | "contact"
  | "resume";
export type ProjectWindowId = `project-${number}`;
export type AppWindowId = BaseWindowId | ProjectWindowId;

export type DesktopFileTarget =
  | { kind: "base-window"; windowId: BaseWindowId }
  | { kind: "project-window"; projectId: number };

export interface DesktopFileEntry {
  id: string;
  label: string;
  typeLabel: string;
  icon: "app" | "folder" | "pdf";
  description?: string;
  modifiedLabel?: string;
  sizeLabel?: string;
  desktopSide?: "left" | "right";
  desktopColumn?: number;
  desktopRow?: number;
  target: DesktopFileTarget;
}

export interface WindowFrame {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type WindowFrameRecord = Record<string, WindowFrame>;

export interface BaseWindowConfig {
  id: BaseWindowId;
  title: string;
  frame: WindowFrame;
}

export interface DockItem {
  id: BaseWindowId;
  label: string;
}

export type WindowAnimationPhase = "idle" | "minimizing" | "restoring";

export interface MinimizedDockEntry {
  windowId: AppWindowId;
  title: string;
  appId: BaseWindowId;
  minimizedAt: number;
  previewUrl: string | null;
  previewText: string;
}
