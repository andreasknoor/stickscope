/** Colour scheme chosen by the user; "system" follows the operating system. */
export type Theme = "system" | "light" | "dark";
export const THEMES: Theme[] = ["system", "light", "dark"];

/** Sets the scheme on <html>: `data-theme` wins over the system setting in tokens.css. */
export function applyTheme(theme: Theme) {
  const el = document.documentElement;
  if (theme === "system") delete el.dataset.theme;
  else el.dataset.theme = theme;
}

/**
 * Runs in <head> before the first paint, so a saved choice shows without flashing the other scheme.
 * Must match the key the settings are stored under; anything unexpected leaves the system setting.
 */
export const THEME_SCRIPT =
  'try{var t=JSON.parse(localStorage.getItem("stickscope.settings")||"{}").theme;if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}';
