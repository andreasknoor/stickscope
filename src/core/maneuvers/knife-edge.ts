import type { Maneuver } from "./types.ts";
import { disputed, est, gap } from "./helpers.ts";

/** Knife edge. Every instruction comes from docs/research/knife-edge.md; the numbers in the keyframes only illustrate them. */
export const knifeEdge: Maneuver = {
  id: "knife-edge",
  category: "beginner",
  illustrationNotes: ["sides"],
  duration: 11.5,
  position: [[0, -42, 20, 0], [11.5, 42, 20, 0]],
  attitude: [[0, 0, 0, 0], [2.6, 0, 0, 0], [3.3, 0, 4, 90], [8.4, 0, 5, 90], [9.1, 0, 2, 0], [11.5, 0, 0, 0]],
  // [t, rudder, throttle, aileron, elevator]; rudder is opposite to the entry roll, a little up elevator for a tuck toward the landing gear.
  sticks: [
    [0, 0, 70, 0, 0], [2.5, 0, 70, 0, 0], [2.7, 0, 70, 0.7, 0], [3.2, 0, 70, 0.7, 0],
    [3.5, -0.55, 70, 0, -0.2], [8.3, -0.55, 70, 0, -0.2],
    [8.5, 0, 70, -0.7, 0], [9, 0, 70, -0.7, 0], [9.2, 0, 70, 0, 0], [11.5, 0, 70, 0, 0],
  ],
  phases: [
    {
      id: "approach", start: 0, end: 2.5,
      instructions: [
        est("across", "flyrc-ke", "pa-tips"),
        est("height", "flyrc-ke", "man-scott-ke"),
        est("throttle", "rcn-magazin-ke", "flyrc-ke"),
      ],
      values: { level: "guideline", illustrates: ["across", "throttle"] },
    },
    {
      id: "entry", start: 2.5, end: 3.4,
      instructions: [
        est("quarter-roll", "flyrc-ke", "man-scott-ke", "gsn-njswede-ke"),
        est("rudder-opposite", "man-scott-ke", "gsn-njswede-ke", "scootworks-ke", "pa-tips", "flyrc-ke"),
        est("two-steps", "man-scott-ke", "flyrc-ke"),
      ],
      values: { level: "guideline", illustrates: ["quarter-roll", "rudder-opposite"] },
    },
    {
      id: "hold", start: 3.4, end: 8.4,
      instructions: [
        est("rudder-holds", "pa-tips", "flyrc-ke", "man-scott-ke"),
        est("rudder-cue", "pa-tips", "gsn-njswede-ke"),
        est("rudder-amount", "rcline-ke", "gsn-njswede-ke", "pa-tips"),
        est("tuck", "ma-glezellis", "man-scott-ke", "rcn-magazin-ke"),
        est("tuck-elevator", "flyrc-ke", "man-scott-ke"),
        est("roll-aileron", "ma-glezellis", "man-scott-ke", "rcn-magazin-ke"),
        est("throttle-height", "pa-tips", "gsn-njswede-ke", "flyrc-ke"),
      ],
      notes: [
        disputed("altitude", "flyrc-ke", "rcn-magazin-ke", "rcline-ke", "scootworks-ke", "pa-tips", "gsn-njswede-ke"),
        gap("duration"),
      ],
      values: { level: "guideline", illustrates: ["rudder-holds", "tuck-elevator", "throttle-height"] },
      wobble: { pitch: 2.5, roll: 3 },
    },
    {
      id: "exit", start: 8.4, end: 11.5,
      instructions: [est("quarter-back", "gsn-njswede-ke", "rcn-magazin-ke", "flyrc-ke", "man-scott-ke")],
      values: { level: "guideline", illustrates: ["quarter-back"] },
    },
  ],
  strip: {
    view: "front",
    path: [[20, 230], [960, 230]],
    snapshots: [[0, 90, 230], [2.95, 320, 230, 1], [5.8, 560, 236], [8.75, 790, 230, -1], [11.4, 950, 230]],
  },
};
