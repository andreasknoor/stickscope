import type { Vec3 } from "../core/math3.ts";
import type { Maneuver } from "../core/maneuvers/types.ts";
import { stateAt } from "../core/maneuvers/state.ts";
import type { Camera } from "./camera.ts";
import type { CssColors } from "./canvas.ts";

/**
 * Cues for the speed of the model. The camera follows the model, so the model itself hardly moves on screen;
 * these give the eye something to measure against. All of them derive the speed from the position data of the figure,
 * so they are an illustration (relative speed, no measured values).
 */

const hash = (n: number): number => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

/** Cell size and reach (in cells) of the particle lattice, in metres. */
const CELL = 1.2;
const REACH = 7;
/** Seconds of figure time the trail covers, and the number of segments it is drawn in. */
const TRAIL_SPAN = 2.2;
const TRAIL_SEGMENTS = 40;
/** Seconds of figure time between two time marks on the flight path. */
export const MARK_INTERVAL = 0.5;

/** Small fixed points in the air around the model: they stream past when it moves and stand still when it hovers. */
export function drawParticles(c: CanvasRenderingContext2D, cam: Camera, pos: Vec3, colors: CssColors): void {
  const bx = Math.floor(pos[0] / CELL);
  const by = Math.floor(pos[1] / CELL);
  const bz = Math.floor(pos[2] / CELL);
  const reach = REACH * CELL;
  c.fillStyle = colors.get("--ink-2");
  for (let i = -REACH; i <= REACH; i++) {
    for (let j = -REACH; j <= REACH; j++) {
      for (let k = -REACH; k <= REACH; k++) {
        const gx = bx + i;
        const gy = by + j;
        const gz = bz + k;
        const h = (gx * 73856093) ^ (gy * 19349663) ^ (gz * 83492791);
        if (hash(h) > 0.45) continue;
        const px = (gx + hash(h + 1)) * CELL;
        const py = (gy + hash(h + 2)) * CELL;
        const pz = (gz + hash(h + 3)) * CELL;
        const dist = Math.hypot(px - pos[0], py - pos[1], pz - pos[2]);
        if (dist > reach) continue;
        const q = cam.pr([px, py, pz]);
        if (q[2] <= 0.3) continue;
        c.globalAlpha = 0.55 * (1 - dist / reach);
        c.beginPath();
        c.arc(q[0], q[1], Math.min(7, Math.max(0.8, (0.05 * cam.F) / q[2])), 0, 7);
        c.fill();
      }
    }
  }
  c.globalAlpha = 1;
}

/** The path of the last seconds behind the model: long when it is fast, a short stub when it is slow. */
export function drawTrail(c: CanvasRenderingContext2D, cam: Camera, m: Maneuver, t: number, colors: CssColors): void {
  c.lineCap = "round";
  c.strokeStyle = colors.get("--accent");
  for (let i = TRAIL_SEGMENTS; i >= 1; i--) {
    const t1 = t - (i / TRAIL_SEGMENTS) * TRAIL_SPAN;
    if (t1 < 0) continue;
    const a = cam.pr(stateAt(m, t - ((i - 1) / TRAIL_SEGMENTS) * TRAIL_SPAN).pos);
    const b = cam.pr(stateAt(m, t1).pos);
    if (a[2] <= 0.05 || b[2] <= 0.05) continue;
    c.globalAlpha = (1 - i / TRAIL_SEGMENTS) * 0.85;
    c.lineWidth = 2 + 4 * (1 - i / TRAIL_SEGMENTS);
    c.beginPath();
    c.moveTo(a[0], a[1]);
    c.lineTo(b[0], b[1]);
    c.stroke();
  }
  c.globalAlpha = 1;
}
