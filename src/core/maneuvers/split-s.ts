import type { AttitudeKey, Maneuver, PositionKey, StickKey } from "./types.ts";
import { est, gap } from "./helpers.ts";
import { stripFrom } from "./strip-from.ts";

const R = 11;
const Y0 = 32;
const X1 = -12;
const T0 = 4.5;
const T1 = 8.5;
const STEPS = 12;

const position: PositionKey[] = [[0, -42, Y0, 0], [3, -26, Y0, 0], [4.5, X1, Y0, 0]];
// Upright, then rolled to inverted (roll 180) and pulled through a half loop downwards: pitch runs from 0 to -180 and
// the model ends upright on the reverse heading (roll 180 and pitch -180 together are upright, heading back).
const attitude: AttitudeKey[] = [[0, 0, 0, 0], [3, 0, 0, 0], [4.5, 0, 0, 180]];
for (let k = 1; k <= STEPS; k++) {
  const f = k / STEPS;
  const a = f * Math.PI;
  const t = +(T0 + (T1 - T0) * f).toFixed(3);
  position.push([t, +(X1 + R * Math.sin(a)).toFixed(2), +(Y0 - R + R * Math.cos(a)).toFixed(2), 0]);
  attitude.push([t, 0, +(-f * 180).toFixed(1), 180]);
}
position.push([12, -46, Y0 - 2 * R, 0]);
attitude.push([12, 0, -180, 180]);

// [t, rudder, throttle, aileron, elevator]: throttle back, half roll with the aileron, then pull at once.
const sticks: StickKey[] = [
  [0, 0, 70, 0, 0], [2.8, 0, 70, 0, 0], [3.3, 0, 30, 0.8, 0], [4.3, 0, 30, 0.8, 0], [4.6, 0, 30, 0, -0.6],
  [8.2, 0, 30, 0, -0.6], [8.8, 0, 50, 0, 0], [12, 0, 50, 0, 0],
];

/** The split S. Every instruction comes from docs/research/split-s.md. */
export const splitS: Maneuver = {
  id: "split-s",
  category: "motorglider",
  illustrationNotes: ["direction"],
  duration: 12,
  position,
  attitude,
  sticks,
  phases: [
    {
      id: "approach", start: 0, end: 3,
      instructions: [
        est("start-high", "stevens-pattern", "wikipedia-split-s"),
        est("level-entry", "rcaw-more", "stevens-pattern", "wikipedia-split-s"),
      ],
      notes: [gap("min-height")],
      values: { level: "guideline", illustrates: ["level-entry"] },
    },
    {
      id: "half-roll", start: 3, end: 4.5,
      instructions: [
        est("half-roll", "iac-figures", "rcaw-more", "stevens-pattern", "wikipedia-split-s"),
        est("reduce-throttle", "rcaw-more", "stevens-pattern"),
      ],
      values: { level: "guideline", illustrates: ["half-roll", "reduce-throttle"] },
    },
    {
      id: "half-loop", start: 4.5, end: 8.5,
      instructions: [
        est("pull-at-once", "rcaw-more", "stevens-pattern"),
        est("altitude-for-speed", "iac-figures", "stevens-pattern", "wikipedia-split-s"),
      ],
      values: { level: "guideline", illustrates: ["pull-at-once"] },
    },
    {
      id: "exit", start: 8.5, end: 12,
      instructions: [est("level-reverse", "iac-figures", "rcaw-more", "stevens-pattern", "wikipedia-split-s")],
      values: { level: "guideline", illustrates: ["level-reverse"] },
    },
  ],
  strip: stripFrom(position, { scale: 9.4, x0: -46, y0: Y0 - 2 * R, ox: 60, oy: 60, pathTimes: [0, 3, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9.5, 12], snapshotTimes: [0, 3.6, 6.5, 8.6, 11.5], rolls: { 3.6: 1 }, compactSize: 108 }),
};
