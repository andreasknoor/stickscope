import { pchip } from "../interpolate.ts";
import type { AttitudeKey, Maneuver, StickKey } from "./types.ts";
import { disputed, est, gap } from "./helpers.ts";

const ROLL_START = 5.5;
const ROLL_END = 11.5;
/** Left rolls (negative roll angle), three rolls in the roll phase. The sources do not give the direction. */
const ROLLS = -1080;

const attitude: AttitudeKey[] = [
  [0, 0, 0, 0], [2.5, 0, 3, 0], [4.5, 0, 30, 0], [ROLL_START, 0, 45, 0],
  [ROLL_END, 0, 45, ROLLS], [12.5, 0, 20, ROLLS], [14, 0, 2, ROLLS], [15, 0, 0, ROLLS],
];

/**
 * Sticks during the roll follow the confirmed pattern: aileron full and fixed; rudder strongest on the knife edges (shown toward the
 * top of the model), elevator doing the work near upright (up) and inverted (down). The numbers illustrate that pattern.
 */
function rollSticks(): StickKey[] {
  const roll = pchip(attitude, 3);
  const keys: StickKey[] = [];
  for (let t = ROLL_START + 0.25; t < ROLL_END; t += 0.25) {
    const phi = (roll(t) * Math.PI) / 180;
    keys.push([+t.toFixed(2), +(-0.8 * Math.sin(phi)).toFixed(3), 60, -1, +(-0.2 - 0.45 * Math.cos(phi)).toFixed(3)]);
  }
  return keys;
}

/** The rolling harrier. Every instruction comes from docs/research/rolling-harrier.md. */
export const rollingHarrier: Maneuver = {
  id: "rolling-harrier",
  category: "advanced",
  illustrationNotes: ["direction"],
  duration: 15,
  position: [[0, -42, 15, 0], [2.5, -20, 15, 0], [4.5, -8, 15, 0], [12, 12, 15, 0], [15, 38, 15, 0]],
  attitude,
  sticks: [
    [0, 0, 35, 0, 0], [2.5, 0, 35, 0, 0], [3, 0, 45, 0, -0.5], [4.5, 0, 55, 0, -0.65], [ROLL_START - 0.01, 0, 58, 0, -0.65],
    [ROLL_START, 0, 60, -1, -0.65],
    ...rollSticks(),
    [ROLL_END, 0, 60, -1, -0.65], [ROLL_END + 0.3, 0, 90, 0, -0.1], [15, 0, 90, 0, -0.05],
  ],
  phases: [
    {
      id: "prepare", start: 0, end: 2.5,
      instructions: [
        est("harrier-first", "gsn-gyro-rh", "ma-graham-2008"),
        est("slow-rolls", "gsn-gyro-rh", "rcn-powerrolle"),
        est("high-rates", "man-somenzini-rh", "gsn-gyro-rh", "rcn-powerrolle"),
        est("advanced", "man-somenzini-rh", "gsn-gyro-rh", "rcn-powerrolle"),
      ],
      values: { level: "guideline", illustrates: ["harrier-first"] },
    },
    {
      id: "entry", start: 2.5, end: ROLL_START,
      instructions: [
        est("from-harrier", "man-somenzini-rh", "gsn-gyro-rh"),
        est("attitude", "man-somenzini-rh", "gsn-gyro-rh"),
      ],
      values: { level: "guideline", illustrates: ["from-harrier", "attitude"] },
    },
    {
      id: "roll", start: ROLL_START, end: ROLL_END,
      instructions: [
        est("aileron-full", "man-somenzini-rh", "gsn-gyro-rh", "rcn-powerrolle"),
        est("alternate", "man-somenzini-rh", "gsn-gyro-rh", "rcn-powerrolle"),
        est("rudder-knife", "man-somenzini-rh", "gsn-gyro-rh"),
        est("elevator-sequence", "man-somenzini-rh", "gsn-gyro-rh"),
        est("throttle-hold", "man-somenzini-rh", "gsn-gyro-rh", "rcn-powerrolle"),
        est("timing-drift", "gsn-gyro-rh", "rcn-powerrolle"),
        est("slow-roll", "man-somenzini-rh", "gsn-gyro-rh"),
      ],
      notes: [
        disputed("throttle-start", "man-somenzini-rh", "gsn-gyro-rh", "rcn-powerrolle"),
        disputed("rudder-needed", "man-somenzini-rh", "gsn-gyro-rh", "rcn-powerrolle"),
        gap("rudder-direction"),
      ],
      values: { level: "guideline", illustrates: ["aileron-full", "alternate", "rudder-knife", "elevator-sequence", "throttle-hold"] },
    },
    {
      id: "exit", start: ROLL_END, end: 15,
      instructions: [est("exit-inputs", "man-somenzini-rh", "gsn-gyro-rh", "flyrc-stoops-harrier")],
      values: { level: "guideline", illustrates: ["exit-inputs"] },
    },
  ],
  strip: {
    view: "front",
    path: [[20, 215], [960, 215]],
    snapshots: [[0, 90, 215], [3.8, 300, 215], [7, 500, 222, -1], [9.5, 680, 215, -1], [14, 880, 215]],
  },
};
