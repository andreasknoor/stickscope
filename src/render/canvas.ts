import type { Rgb } from "../core/model/highlight.ts";

/** Sizes a canvas to its CSS box (device pixel ratio capped at 2) and returns its 2D context in CSS pixels. */
export function fit(cv: HTMLCanvasElement): [CanvasRenderingContext2D, number, number] {
  const r = cv.getBoundingClientRect();
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const w = Math.round(r.width * dpr);
  const h = Math.round(r.height * dpr);
  if (cv.width !== w || cv.height !== h) {
    cv.width = w;
    cv.height = h;
  }
  const c = cv.getContext("2d")!;
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  return [c, r.width, r.height];
}

/** Reads CSS custom properties as colours for canvas drawing. Call `reset()` when the colour scheme changes. */
export class CssColors {
  private cache = new Map<string, string>();
  private probe: HTMLElement | null = null;

  /** Colour string of a custom property such as `--surface`. */
  get(name: string): string {
    const hit = this.cache.get(name);
    if (hit) return hit;
    if (!this.probe) {
      this.probe = document.createElement("i");
      this.probe.style.display = "none";
      document.body.appendChild(this.probe);
    }
    this.probe.style.color = `var(${name})`;
    const v = getComputedStyle(this.probe).color || "#ccc";
    this.cache.set(name, v);
    return v;
  }

  rgb(name: string): Rgb {
    const m = this.get(name).match(/[\d.]+/g);
    return m ? [Math.round(+m[0]), Math.round(+m[1]), Math.round(+m[2])] : [204, 204, 204];
  }

  reset(): void {
    this.cache.clear();
  }

  dispose(): void {
    this.probe?.remove();
    this.probe = null;
  }
}

/** Calls `onChange` when the page colour scheme changes (data-theme on <html> or the system setting). Returns a stop function. */
export function watchColorScheme(onChange: () => void): () => void {
  const mo = new MutationObserver(onChange);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  const mq = matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", onChange);
  return () => {
    mo.disconnect();
    mq.removeEventListener("change", onChange);
  };
}
