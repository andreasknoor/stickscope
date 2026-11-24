import { pchip } from "../interpolate.ts";
import type { PositionKey, StripLayout, StripSnapshot } from "./types.ts";

/**
 * Builds the "figure at a glance" layout from the position keyframes, so the sketch follows the animated path.
 * `scale` is strip units per metre, (ox, oy) is where the world point (x0, y0) lands in the strip.
 */
export function stripFrom(position: PositionKey[], o: { scale: number; x0: number; y0: number; ox: number; oy: number; pathTimes: number[]; snapshotTimes: number[]; rolls?: Record<number, 1 | -1> }): StripLayout {
  const fx = pchip(position, 1);
  const fy = pchip(position, 2);
  const at = (t: number): [number, number] => [Math.round(o.ox + (fx(t) - o.x0) * o.scale), Math.round(o.oy + (fy(t) - o.y0) * o.scale)];
  return {
    view: "front",
    path: o.pathTimes.map(at),
    snapshots: o.snapshotTimes.map((t): StripSnapshot => {
      const [x, y] = at(t);
      const roll = o.rolls?.[t];
      return roll ? [t, x, y, roll] : [t, x, y];
    }),
  };
}
