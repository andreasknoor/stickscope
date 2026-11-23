/** Control-surface highlighting: how strongly a deflected surface glows. */

export const DEAD_ZONE = 0.04;
/** Deflection (0..1) at which the glow reaches full strength; slightly below 1 so full stick glows fully. */
const FULL_SPAN = 0.9;

/** Glow level 0..1 for a deflection -1..1: 0 in the dead zone, square-root curve above it, 1 at full deflection. */
export function deflectionLevel(v: number): number {
  const a = Math.abs(v);
  return a < DEAD_ZONE ? 0 : Math.min(1, Math.sqrt((a - DEAD_ZONE) / FULL_SPAN));
}

export interface Deflections {
  ail: number;
  elev: number;
  rud: number;
}

/** Glow levels of the three control surfaces for the current stick values. */
export const highlightOf = (s: Deflections): Deflections => ({
  ail: deflectionLevel(s.ail),
  elev: deflectionLevel(s.elev),
  rud: deflectionLevel(s.rud),
});

export type Rgb = [number, number, number];

/** Blends `base` towards `accent`; e = 0 gives base, e = 1 gives accent. */
export const blend = (base: Rgb, accent: Rgb, e: number): Rgb =>
  [0, 1, 2].map((i) => Math.round(base[i] + (accent[i] - base[i]) * e)) as Rgb;

/** The afterglow: a glow level drops by about 1/e every third of a second but never below the live level. */
export function decayGlow(previous: Deflections, live: Deflections, dt: number): Deflections {
  const k = Math.exp(-3 * dt);
  return {
    ail: Math.max(live.ail, previous.ail * k),
    elev: Math.max(live.elev, previous.elev * k),
    rud: Math.max(live.rud, previous.rud * k),
  };
}
