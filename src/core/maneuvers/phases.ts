import type { Maneuver } from "./types.ts";

/** Index of the phase containing time t; the last phase after the end. */
export function phaseIndexAt(m: Maneuver, t: number): number {
  const i = m.phases.findIndex((p) => t >= p.start && t < p.end);
  return i < 0 ? m.phases.length - 1 : i;
}
