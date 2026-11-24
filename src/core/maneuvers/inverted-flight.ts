import type { Maneuver, StickKey } from "./types.ts";
import { est, gap } from "./helpers.ts";
import { stripFrom } from "./strip-from.ts";

// One half roll onto the back, a straight line inverted, one half roll back the same way. The height stays the same throughout.
const position: [number, number, number, number][] = [[0, -44, 16, 0], [12, 44, 16, 0]];
const attitude: [number, number, number, number][] = [[0, 0, 0, 0], [3, 0, 0, 0], [4.5, 0, 0, 180], [9.5, 0, 0, 180], [11, 0, 0, 360], [12, 0, 0, 360]];

// [t, rudder, throttle, aileron, elevator]: a little more throttle, aileron for the half rolls, centred when inverted, a little forward elevator while inverted.
const sticks: StickKey[] = [
  [0, 0, 55, 0, 0], [2.5, 0, 68, 0, 0], [2.9, 0, 68, 0.8, 0], [4.3, 0, 68, 0.8, 0.12], [4.6, 0, 68, 0, 0.18],
  [9.2, 0, 68, 0, 0.18], [9.5, 0, 68, 0.8, 0], [10.9, 0, 68, 0.8, 0], [11.2, 0, 68, 0, 0], [12, 0, 60, 0, 0],
];

/** Inverted flight. Every instruction comes from docs/research/inverted-flight.md. */
export const invertedFlight: Maneuver = {
  id: "inverted-flight",
  category: "motorglider",
  illustrationNotes: ["direction"],
  duration: 12,
  position,
  attitude,
  sticks,
  phases: [
    {
      id: "approach", start: 0, end: 3,
      instructions: [est("level-add-power", "wikipedia-rc-aerobatics", "rcsky-rueckenflug")],
      values: { level: "guideline", illustrates: ["level-add-power"] },
    },
    {
      id: "half-roll-in", start: 3, end: 4.5,
      instructions: [
        est("half-roll", "wikipedia-rc-aerobatics", "rcsky-rueckenflug", "flitetest-inverted"),
        est("centre-aileron", "wikipedia-rc-aerobatics", "rcsky-rueckenflug"),
      ],
      values: { level: "guideline", illustrates: ["half-roll", "centre-aileron"] },
    },
    {
      id: "inverted", start: 4.5, end: 9.5,
      instructions: [
        est("hold-elevator", "wikipedia-rc-aerobatics", "flitetest-inverted", "rcsky-rueckenflug", "rcaw-basic", "stevens-pattern"),
        est("reversed", "wikipedia-rc-aerobatics", "flitetest-inverted", "rcsky-rueckenflug"),
        est("push-amount", "flitetest-inverted", "rcsky-rueckenflug"),
        est("stall-speed", "flitetest-inverted", "rcsky-rueckenflug"),
        est("dihedral", "flitetest-inverted", "rcsky-rueckenflug"),
      ],
      notes: [gap("duration"), gap("motor-glider"), gap("amount")],
      values: { level: "guideline", illustrates: ["hold-elevator"] },
      wobble: { pitch: 2, roll: 3 },
    },
    {
      id: "roll-out", start: 9.5, end: 12,
      instructions: [
        est("roll-out", "flitetest-inverted", "rcsky-rueckenflug"),
        est("enough-height", "flitetest-inverted", "rcsky-rueckenflug"),
      ],
      values: { level: "guideline", illustrates: ["roll-out"] },
    },
  ],
  strip: stripFrom(position, { scale: 9.6, x0: -44, y0: 16, ox: 100, oy: 220, pathTimes: [0, 12], snapshotTimes: [0, 3.8, 7, 10.2], rolls: { 3.8: 1, 10.2: 1 } }),
};
