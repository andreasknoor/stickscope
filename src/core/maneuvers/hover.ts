import type { Maneuver } from "./types.ts";
import { disputed, est, gap } from "./helpers.ts";

/**
 * The hover. Every instruction comes from docs/research/hover.md. The sources do not say which side faces the pilot or
 * from which direction the hover is entered; the animation shows the canopy toward the pilot as an illustration.
 */
export const hover: Maneuver = {
  id: "hover",
  category: "advanced",
  illustrationNotes: ["orientation"],
  duration: 11,
  position: [[0, 0, 15, 20], [3, 0, 15.5, 2], [4.5, 0, 17.5, -3], [5.2, 0, 18, -4], [11, 0, 18, -4]],
  attitude: [[0, 90, 0, 0], [3, 90, 5, 0], [4.6, 90, 85, 0], [5.2, 90, 90, 0], [11, 90, 90, 0]],
  sticks: [
    [0, 0, 50, 0, 0], [2.9, 0, 50, 0, 0], [3.3, 0, 60, 0, -0.6], [4.6, 0, 60, 0, -0.6],
    [5, 0, 55, 0.1, 0], [11, 0, 55, 0.1, 0],
  ],
  phases: [
    {
      id: "prepare", start: 0, end: 3,
      instructions: [
        est("simulator", "rcwithjim", "rcsky-torquen", "rcn-hoovern-2008", "atlantahobby-3d-basics"),
        est("safe-height", "stevens-3d", "rcsky-torquen", "atlantahobby-3d-basics"),
        est("large-throws", "rcsky-torquen", "rcn-hovern-2004", "atlantahobby-3d-basics"),
      ],
      notes: [disputed("start-height", "stevens-3d", "rcwithjim", "rcn-hovern-2004")],
      values: { level: "guideline", illustrates: ["safe-height"] },
    },
    {
      id: "pull-up", start: 3, end: 5.1,
      instructions: [est("from-harrier", "stevens-3d", "rcwithjim")],
      notes: [gap("entry-orientation"), disputed("entry-start", "stevens-3d", "rcwithjim", "atlantahobby-3d-basics")],
      values: { level: "guideline", illustrates: ["from-harrier"] },
    },
    {
      id: "hold", start: 5.1, end: 11,
      instructions: [
        est("throttle-height", "stevens-3d", "rcwithjim", "rcsky-torquen", "rcn-hovern-2004", "man-hover", "atlantahobby-3d-basics"),
        est("throttle-bursts", "stevens-3d", "man-hover"),
        est("aileron-torque", "stevens-3d", "rcsky-torquen", "rcn-hoovern-2008", "gsn-torque-roll", "atlantahobby-3d-basics"),
        est("rudder-elevator", "stevens-3d", "rcwithjim", "rcsky-torquen", "atlantahobby-3d-basics"),
        est("small-early", "stevens-3d", "rcwithjim", "rcsky-torquen", "rcn-hovern-2004"),
        est("belly-in-rudder", "pa-tips", "gsn-torque-roll"),
        est("exit-throttle", "rcwithjim", "atlantahobby-3d-basics"),
      ],
      notes: [gap("elevator-direction"), gap("exit"), disputed("throttle-style", "stevens-3d", "man-hover", "atlantahobby-3d-basics")],
      values: { level: "guideline", illustrates: ["throttle-height", "aileron-torque", "small-early"] },
      wobble: { pitch: 4, yaw: 4, roll: 6 },
    },
  ],
  strip: {
    view: "side",
    path: [[20, 60], [300, 62], [420, 88], [490, 140], [510, 190], [512, 390]],
    snapshots: [[0, 90, 60], [3.5, 380, 74], [8, 510, 180], [10.6, 512, 330]],
  },
};
