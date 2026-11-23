import type { Maneuver } from "./types.ts";
import { disputed, est } from "./helpers.ts";

/** The harrier. Every instruction comes from docs/research/harrier.md. */
export const harrier: Maneuver = {
  id: "harrier",
  category: "beginner",
  duration: 13,
  position: [[0, -42, 15, 0], [2.5, -20, 15, 0], [4.5, -8, 15, 0], [10, 10, 15, 0], [13, 38, 15, 0]],
  // The sources give about 45 degrees nose up.
  attitude: [[0, 0, 0, 0], [2.5, 0, 3, 0], [4.5, 0, 30, 0], [5.5, 0, 45, 0], [10, 0, 45, 0], [11.2, 0, 10, 0], [13, 0, 2, 0]],
  sticks: [
    [0, 0, 35, 0, 0], [2.5, 0, 35, 0, 0], [3, 0, 45, 0, -0.5], [4.5, 0, 55, 0, -0.65], [5.3, 0, 60, 0, -0.7],
    [10, 0, 60, 0, -0.7], [10.5, 0, 90, 0, -0.1], [13, 0, 90, 0, -0.05],
  ],
  phases: [
    {
      id: "prepare", start: 0, end: 2.5,
      instructions: [
        est("height", "goldberg-ex330", "flyrc-stoops-harrier", "gsn-3dnater"),
        est("rates", "goldberg-ex330", "flyrc-stoops-harrier"),
      ],
      values: { level: "guideline", illustrates: ["height"] },
    },
    {
      id: "entry", start: 2.5, end: 5,
      instructions: [
        est("reduce-and-pull", "goldberg-ex330", "gsn-njswede-harrier"),
        est("from-elevator", "goldberg-ex330", "gsn-njswede-harrier"),
      ],
      values: { level: "guideline", illustrates: ["reduce-and-pull"] },
    },
    {
      id: "hold", start: 5, end: 10,
      instructions: [
        est("elevator-attitude", "goldberg-ex330", "flyrc-stoops-harrier", "man-scott-harrier"),
        est("angle", "goldberg-ex330", "flyrc-stoops-harrier", "man-scott-harrier"),
        est("more-thrust", "flyrc-stoops-harrier", "man-scott-harrier"),
        est("throttle-pumps", "goldberg-ex330", "man-scott-harrier"),
        est("rudder-steers", "goldberg-ex330", "flyrc-stoops-harrier", "gsn-njswede-harrier"),
        est("rudder-rolls", "flyrc-stoops-harrier", "man-scott-harrier", "gsn-njswede-harrier"),
        est("torque-rudder", "flyrc-stoops-harrier", "man-scott-harrier"),
      ],
      notes: [disputed("aileron", "goldberg-ex330", "flyrc-stoops-harrier", "man-scott-harrier", "gsn-njswede-harrier")],
      values: { level: "guideline", illustrates: ["elevator-attitude", "angle", "throttle-pumps"] },
      wobble: { roll: 5, yaw: 2.5 },
    },
    {
      id: "exit", start: 10, end: 13,
      instructions: [
        est("throttle-up", "goldberg-ex330", "flyrc-stoops-harrier", "gsn-njswede-harrier"),
        est("emergency", "flyrc-stoops-harrier", "man-scott-harrier"),
      ],
      values: { level: "guideline", illustrates: ["throttle-up"] },
    },
  ],
  strip: {
    view: "front",
    path: [[20, 215], [960, 215]],
    snapshots: [[0, 90, 215], [3.4, 320, 215], [7.5, 560, 222], [11.4, 800, 215]],
  },
};
