import type { AttitudeKey, Maneuver, PositionKey, StickKey } from "./types.ts";
import { est, gap } from "./helpers.ts";
import { stripFrom } from "./strip-from.ts";

const R = 12;
const X0 = -8;
const Y0 = 10;
/** The loop drifts forward by this much, so the path does not close on itself. */
const DRIFT = 14;
const T0 = 3;
const T1 = 9;
const STEPS = 18;

const position: PositionKey[] = [[0, -42, Y0, 0]];
const attitude: AttitudeKey[] = [[0, 0, 0, 0]];
// The nose follows the path (pitch = direction of travel), unwrapped to run from 0 to 360 degrees.
let prev = 0;
for (let k = 0; k <= STEPS; k++) {
  const f = k / STEPS;
  const a = f * 2 * Math.PI;
  const t = +(T0 + (T1 - T0) * f).toFixed(3);
  position.push([t, +(X0 + R * Math.sin(a) + DRIFT * f).toFixed(2), +(Y0 + R - R * Math.cos(a)).toFixed(2), 0]);
  let deg = (Math.atan2(R * Math.sin(a), R * Math.cos(a) + DRIFT / (2 * Math.PI)) * 180) / Math.PI;
  while (deg < prev - 180) deg += 360;
  prev = f === 1 ? 360 : deg;
  attitude.push([t, 0, +(f === 1 ? 360 : deg).toFixed(1), 0]);
}
position.push([12, 44, Y0, 0]);
attitude.push([12, 0, 360, 0]);

// [t, rudder, throttle, aileron, elevator]: pull from the pull-up on, throttle back on the way over, level out.
const sticks: StickKey[] = [
  [0, 0, 100, 0, 0], [2.8, 0, 100, 0, 0], [3.4, 0, 100, 0, -0.45], [5.5, 0, 100, 0, -0.45],
  [6.5, 0, 40, 0, -0.45], [8.5, 0, 40, 0, -0.4], [9.3, 0, 90, 0, 0], [12, 0, 90, 0, 0],
];

/** The inside loop. Every instruction comes from docs/research/loop.md. */
export const loop: Maneuver = {
  id: "loop",
  category: "motorglider",
  duration: 12,
  position,
  attitude,
  sticks,
  phases: [
    {
      id: "approach", start: 0, end: 3,
      instructions: [est("full-power", "rcaw-basic", "stevens-pattern")],
      notes: [gap("power"), gap("min-height")],
      values: { level: "guideline", illustrates: ["full-power"] },
    },
    {
      id: "pull-up", start: 3, end: 5.5,
      instructions: [
        est("up-elevator", "rcaw-basic", "stevens-pattern"),
        est("vertical-plane", "rcaw-basic", "stevens-pattern", "iac-figures"),
      ],
      values: { level: "guideline", illustrates: ["up-elevator"] },
    },
    {
      id: "back", start: 5.5, end: 8.5,
      instructions: [est("throttle-back", "rcaw-basic", "stevens-pattern")],
      values: { level: "guideline", illustrates: ["throttle-back"] },
    },
    {
      id: "exit", start: 8.5, end: 12,
      instructions: [est("level-out", "iac-figures", "rcaw-basic")],
      values: { level: "guideline", illustrates: ["level-out"] },
    },
  ],
  strip: stripFrom(position, { scale: 9.4, x0: -42, y0: Y0, ox: 90, oy: 100, pathTimes: [0, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 10, 12], snapshotTimes: [0, 3.2, 4.5, 6, 7.5, 9.6, 11.8] }),
};
