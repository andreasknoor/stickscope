import type { Rgb } from "../core/model/highlight.ts";

/** Colours that are part of the model drawing itself, not of the page theme. Everything else comes from the CSS tokens. */
export const MODEL = {
  /** [light, dark] shade of the top side (teal) and underside (coral), as in the printed figure sheets. */
  top: ["#1D9E75", "#0F6E56"],
  bottom: ["#D85A30", "#993C1D"],
  canopy: "#20343a",
  rudder: "#5fa596",
  body: "#9db7ae",
} as const;

/** Red arrow showing the roll direction in the strip. */
export const ROLL_ARROW = "#d63a2a";
/** Badge dot for "seen from the side". */
export const SIDE_DOT = "#8fb0a7";

export function parseHex(hex: string): Rgb {
  const n = parseInt(hex.slice(1), 16);
  return [n >> 16, (n >> 8) & 255, n & 255];
}

export const rgbCss = (c: Rgb): string => `rgb(${c[0]},${c[1]},${c[2]})`;

/** Lightens (k > 1) or darkens (k < 1) a colour. */
export function shade(c: Rgb, k: number): string {
  const m = (v: number) => Math.round(v * k + (k > 1 ? (255 - v) * (k - 1) : 0));
  return `rgb(${m(c[0])},${m(c[1])},${m(c[2])})`;
}
