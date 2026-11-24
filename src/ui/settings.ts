import type { Category } from "../core/maneuvers/types.ts";
import type { Mode } from "../core/model/sticks.ts";
import type { Theme } from "../theme/theme.ts";

/** Light per-user settings, kept in localStorage only. Must match THEME_SCRIPT in src/theme/theme.ts. */
export interface Settings {
  theme: Theme;
  mode: Mode;
  category: Category;
  /** Small windows in the main view: the flight path (top right) and the control schematic (bottom left). */
  miniOpen: boolean;
  schematicOpen: boolean;
}

export const KEY = "stickscope.settings";
export const DEFAULTS: Settings = { theme: "system", mode: 2, category: "beginner", miniOpen: true, schematicOpen: true };

export function loadSettings(): Settings {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "{}") as Partial<Settings>;
    return {
      theme: raw.theme === "light" || raw.theme === "dark" ? raw.theme : "system",
      mode: raw.mode === 1 ? 1 : 2,
      category: raw.category === "advanced" || raw.category === "pro" ? raw.category : "beginner",
      miniOpen: raw.miniOpen !== false,
      schematicOpen: raw.schematicOpen !== false,
    };
  } catch {
    return DEFAULTS;
  }
}

export function saveSettings(s: Settings): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    // Private mode or storage full: the settings just do not persist.
  }
}

/** A tiny store for useSyncExternalStore: the first read happens in the browser, the server render uses the defaults. */
let current: Settings | null = null;
const listeners = new Set<() => void>();

export const settingsStore = {
  subscribe(fn: () => void): () => void {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  getSnapshot(): Settings {
    return (current ??= loadSettings());
  },
  getServerSnapshot(): Settings {
    return DEFAULTS;
  },
  update(patch: Partial<Settings>): void {
    current = { ...(current ?? loadSettings()), ...patch };
    saveSettings(current);
    listeners.forEach((l) => l());
  },
};

/** The URL hash as an external store. */
export const hashStore = {
  subscribe(fn: () => void): () => void {
    addEventListener("hashchange", fn);
    return () => removeEventListener("hashchange", fn);
  },
  getSnapshot: (): string => location.hash,
  getServerSnapshot: (): string => "",
};

/** Whether the settings dialog is open. The header gear and the stick-mode label in the trainer both open it. */
let dialogOpen = false;
const dialogListeners = new Set<() => void>();
export const settingsDialog = {
  subscribe(fn: () => void): () => void {
    dialogListeners.add(fn);
    return () => dialogListeners.delete(fn);
  },
  getSnapshot: (): boolean => dialogOpen,
  getServerSnapshot: (): boolean => false,
  set(open: boolean): void {
    dialogOpen = open;
    dialogListeners.forEach((l) => l());
  },
};
