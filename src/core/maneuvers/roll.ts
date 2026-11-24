import { pchip } from "../interpolate.ts";
import type { AttitudeKey, Maneuver, StickKey } from "./types.ts";
import { disputed, est, gap } from "./helpers.ts";
import { stripFrom } from "./strip-from.ts";

const ROLL_START = 3;
const ROLL_END = 7.5;
/** One full roll to the left (negative roll angle). The sources do not give the direction. */
const FULL = -360;

const attitude: AttitudeKey[] = [[0, 0, 0, 0], [ROLL_START, 0, 0, 0], [ROLL_END, 0, 0, FULL], [10, 0, 0, FULL]];

/**
 * Sticks follow what the sources agree on: the aileron makes the roll, some up elevator on the way up to the knife edge, a little down
 * elevator while inverted, sticks centred when upright again. The values illustrate that pattern.
 */
function rollSticks(): StickKey[] {
  const roll = pchip(attitude, 3);
  const keys: StickKey[] = [];
  for (let t = ROLL_START + 0.3; t < ROLL_END - 0.1; t += 0.3) {
    const phi = (roll(t) * Math.PI) / 180;
    keys.push([+t.toFixed(2), 0, 70, -0.8, +(-0.1 - 0.15 * Math.cos(phi)).toFixed(3)]);
  }
  return keys;
}

const position: [number, number, number, number][] = [[0, -42, 14, 0], [10, 42, 14, 0]];

/** The roll (slow roll with ailerons). Every instruction comes from docs/research/roll.md. */
export const roll: Maneuver = {
  id: "roll",
  category: "motorglider",
  illustrationNotes: ["direction", "rudder"],
  duration: 10,
  position,
  attitude,
  sticks: [
    [0, 0, 70, 0, 0], [ROLL_START - 0.01, 0, 70, 0, 0], [ROLL_START, 0, 70, -0.8, -0.25],
    ...rollSticks(),
    [ROLL_END - 0.1, 0, 70, -0.8, -0.1], [ROLL_END + 0.2, 0, 70, 0, 0], [10, 0, 70, 0, 0],
  ],
  phases: [
    {
      id: "approach", start: 0, end: 3,
      instructions: [est("level-entry", "rcaw-basic", "stevens-pattern")],
      values: { level: "guideline", illustrates: ["level-entry"] },
    },
    {
      id: "roll-start", start: 3, end: 4.5,
      instructions: [
        est("aileron-rolls", "rcaw-basic", "stevens-pattern", "iac-figures"),
        est("up-elevator", "rcaw-basic", "stevens-pattern"),
      ],
      notes: [disputed("elevator-order", "rcaw-basic", "stevens-pattern"), gap("rudder")],
      values: { level: "guideline", illustrates: ["aileron-rolls", "up-elevator"] },
    },
    {
      id: "inverted", start: 4.5, end: 6.3,
      instructions: [est("down-elevator-inverted", "rcaw-basic", "stevens-pattern")],
      values: { level: "guideline", illustrates: ["down-elevator-inverted"] },
    },
    {
      id: "finish", start: 6.3, end: 7.5,
      instructions: [est("stop-upright", "rcaw-basic", "stevens-pattern")],
      values: { level: "guideline", illustrates: ["stop-upright"] },
    },
    {
      id: "exit", start: 7.5, end: 10,
      instructions: [est("level-flight", "rcaw-basic", "stevens-pattern")],
      values: { level: "guideline", illustrates: ["level-flight"] },
    },
  ],
  strip: {
    ...stripFrom(position, { scale: 11, x0: -42, y0: 14, ox: 40, oy: 230, pathTimes: [0, 10], snapshotTimes: [0, 3.2, 5.25, 7.5, 9.8], rolls: { 3.2: -1 } }),
  },
};
