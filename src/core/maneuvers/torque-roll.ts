import type { Maneuver } from "./types.ts";
import { est, gap } from "./helpers.ts";

/**
 * The torque roll. Every instruction comes from docs/research/torque-roll.md. The sources do not say which side faces
 * the pilot or from which viewpoint "left" is meant; the animation shows the hover of the hover figure and a rotation
 * to the left as an illustration. The exit is not covered by the sources.
 */
export const torqueRoll: Maneuver = {
  id: "torque-roll",
  category: "advanced",
  illustrationNotes: ["orientation", "viewpoint"],
  duration: 13,
  position: [[0, 0, 18, -4], [13, 0, 18.3, -4]],
  // Roll goes negative: to the left (positive roll = right wing down).
  attitude: [[0, 90, 90, 0], [3, 90, 90, 0], [4.5, 90, 90, -50], [10.8, 90, 90, -690], [11.8, 90, 90, -720], [13, 90, 90, -720]],
  sticks: [
    [0, 0, 55, 0.1, 0], [3, 0, 55, 0.1, 0], [3.4, 0, 62, 0, 0], [10.8, 0, 62, 0, 0],
    [11, 0, 62, 0.35, 0], [11.8, 0, 62, 0.35, 0], [13, 0, 62, 0.1, 0],
  ],
  phases: [
    {
      id: "hover", start: 0, end: 3,
      instructions: [
        est("hover-first", "parkpilot", "stevens-3d", "wikipedia-3d", "atlantahobby-3d-basics"),
        est("calm-air", "man-cooper-torque", "rcn-torquen-25657", "parkpilot", "modelflying-want-fly-3d"),
        est("height", "parkpilot", "rcn-torquen-25657", "atlantahobby-3d-basics"),
        est("simulator", "parkpilot", "rcn-torquen-6090", "atlantahobby-3d-basics"),
      ],
      values: { level: "guideline", illustrates: ["hover-first"] },
      wobble: { pitch: 3, yaw: 3 },
    },
    {
      id: "start", start: 3, end: 4.6,
      instructions: [
        est("pull-vertical", "parkpilot", "gsn-kris-3d", "wikipedia-3d"),
        est("let-it-turn", "gsn-kris-3d", "rcn-torquen-6090", "atlantahobby-3d-basics"),
      ],
      values: { level: "guideline", illustrates: ["let-it-turn"] },
    },
    {
      id: "rotate", start: 4.6, end: 10.9,
      instructions: [
        est("torque-turns", "parkpilot", "gsn-kris-3d", "wikipedia-3d"),
        est("turns-left", "parkpilot", "gsn-kris-3d", "flyrc-humpty-bump"),
        est("rudder-elevator", "man-cooper-torque", "gsn-kris-3d", "parkpilot", "atlantahobby-3d-basics", "modelflying-want-fly-3d"),
        est("throttle-steps", "man-cooper-torque", "parkpilot", "atlantahobby-3d-basics"),
        est("large-throws", "rcn-torquen-6090", "rcline-torquen", "atlantahobby-3d-basics"),
        est("corrections-reverse", "parkpilot", "atlantahobby-3d-basics"),
      ],
      values: { level: "guideline", illustrates: ["rudder-elevator", "throttle-steps"] },
      wobble: { pitch: 3, yaw: 3 },
    },
    {
      id: "stop", start: 10.9, end: 13,
      instructions: [est("aileron-stops", "parkpilot", "gsn-kris-3d", "rcline-torquen", "atlantahobby-3d-basics")],
      notes: [gap("exit")],
      values: { level: "guideline", illustrates: ["aileron-stops"] },
    },
  ],
  strip: {
    view: "front",
    path: [[40, 170], [760, 170], [840, 200], [880, 300], [884, 390]],
    snapshots: [[1.5, 110, 170], [4.0, 300, 170, -1], [6.05, 490, 170, -1], [7.6, 680, 170, -1], [12.5, 884, 330]],
  },
};
