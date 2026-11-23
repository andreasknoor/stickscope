import type { Maneuver } from "./types.ts";
import { disputed, est, gap } from "./helpers.ts";

/** The elevator (a 3D figure, not the control surface). Every instruction comes from docs/research/elevator.md. */
export const elevator: Maneuver = {
  id: "elevator",
  category: "beginner",
  duration: 12,
  position: [[0, -40, 34, 0], [3, -18, 34, 0], [5, -9, 32.5, 0], [9.5, -6, 15, 0], [11, 2, 13.5, 0], [12, 10, 13.5, 0]],
  attitude: [[0, 0, 0, 0], [3, 0, 8, 0], [5, 0, 42, 0], [9.4, 0, 45, 0], [10.8, 0, 3, 0], [12, 0, 0, 0]],
  sticks: [
    [0, 0, 0, 0, 0], [2.8, 0, 0, 0, -0.2], [4.6, 0, 0, 0, -1], [5, 0, 12, 0, -1],
    [9.4, 0, 12, 0, -1], [9.7, 0, 70, 0, 0], [12, 0, 70, 0, 0],
  ],
  phases: [
    {
      id: "approach", start: 0, end: 3,
      instructions: [est("height", "goldberg-ex330", "rcline-3d-figuren")],
      values: { level: "guideline", illustrates: ["height"] },
    },
    {
      id: "nose-up", start: 3, end: 5,
      instructions: [
        est("slow-to-stall", "man-scott-elev", "gsn-njswede-elev", "goldberg-ex330", "ma-hurley-2001", "rcline-3d-figuren"),
        est("progressive", "man-scott-elev", "rcline-3d-figuren"),
      ],
      values: { level: "guideline", illustrates: ["slow-to-stall", "progressive"] },
    },
    {
      id: "hold", start: 5, end: 9.5,
      instructions: [
        est("full-up", "man-scott-elev", "gsn-njswede-elev", "goldberg-ex330", "ma-hurley-2001", "stevens-3d", "rcline-3d-figuren"),
        est("steep-descent", "man-scott-elev", "goldberg-ex330", "ma-hurley-2001", "rcline-3d-figuren"),
        est("throttle-little", "man-scott-elev", "gsn-njswede-elev", "goldberg-ex330", "ma-hurley-2001", "stevens-3d"),
        est("rudder-heading", "man-scott-elev", "gsn-njswede-elev", "goldberg-ex330", "ma-hurley-2001", "stevens-3d", "rcline-3d-figuren"),
        est("aileron-small", "man-scott-elev", "gsn-njswede-elev", "ma-hurley-2001", "stevens-3d", "rcline-3d-figuren"),
      ],
      notes: [
        disputed("throttle", "rcline-3d-figuren", "man-scott-elev", "gsn-njswede-elev", "goldberg-ex330", "ma-hurley-2001", "stevens-3d"),
        disputed("levelling", "man-scott-elev", "gsn-njswede-elev", "ma-hurley-2001", "stevens-3d", "rcline-3d-figuren"),
      ],
      values: { level: "guideline", illustrates: ["full-up", "throttle-little", "aileron-small"] },
      wobble: { roll: 4, yaw: 2 },
    },
    {
      id: "exit", start: 9.5, end: 12,
      instructions: [
        est("release", "man-scott-elev", "gsn-njswede-elev", "goldberg-ex330", "stevens-3d", "rcline-3d-figuren"),
        est("into-harrier", "gsn-njswede-elev", "stevens-3d", "rcline-3d-figuren"),
      ],
      notes: [gap("min-height")],
      values: { level: "guideline", illustrates: ["release"] },
    },
  ],
  strip: {
    view: "front",
    path: [[20, 340], [330, 340], [500, 328], [560, 260], [570, 140], [600, 72], [700, 58], [960, 58]],
    snapshots: [[0, 90, 340], [3, 330, 340], [4.9, 520, 312], [7.3, 568, 180], [11, 800, 58]],
  },
};
