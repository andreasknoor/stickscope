import type { Maneuver } from "./types.ts";
import { disputed, est, gap } from "./helpers.ts";

/**
 * The flat spin (upright, powered). Every instruction comes from docs/research/flat-spin.md.
 * The sources disagree on the aileron, so the animation shows none. Yaw increases: the model spins to the left seen from above.
 */
export const flatSpin: Maneuver = {
  id: "flat-spin",
  category: "advanced",
  illustrationNotes: ["illustration"],
  duration: 15,
  position: [[0, -36, 30, 18], [2.5, -14, 30, 18], [5, -3, 29.5, 18], [8, 0, 27, 18], [11, 0, 23, 18], [15, 0, 18, 18]],
  attitude: [[0, 0, 0, 0], [2.5, 0, 2, 0], [4, 0, 12, 0], [5, 0, 12, 0], [6, 150, 6, 0], [8, 560, 2, 0], [11, 1280, 0, 0], [12.5, 1700, 0, 0], [14, 1960, 0, 0], [15, 2040, 0, 0]],
  // [t, rudder, throttle, aileron, elevator]: rudder full to the left (into the spin), elevator full up (pull = negative).
  sticks: [
    [0, 0, 35, 0, 0], [2.5, 0, 10, 0, -0.2], [4, 0, 10, 0, -0.5], [4.8, -1, 10, 0, -1], [5.5, -1, 10, 0, -1],
    [8, -1, 50, 0, -1], [11, -1, 50, 0, -1], [11.6, 0, 50, 0, 0], [12.6, 0.5, 50, 0, 0], [13.8, 0, 50, 0, 0], [15, 0, 50, 0, 0],
  ],
  phases: [
    {
      id: "prepare", start: 0, end: 2.5,
      instructions: [
        est("height", "flyrc-ronge-fs", "rdrc-fs", "rcn-flachtrudeln"),
        est("models-differ", "flyrc-ronge-fs", "rcn-flachtrudeln", "rcline-flachtrudeln"),
        est("cg", "flyrc-ronge-fs", "rcn-flachtrudeln", "rcline-flachtrudeln", "rcn-wiki-trudeln"),
        est("throws", "flyrc-ronge-fs", "rcn-flachtrudeln", "rcline-flachtrudeln"),
        est("simulator", "flyrc-ronge-fs", "rdrc-fs", "rcline-flachtrudeln"),
      ],
      values: { level: "guideline", illustrates: ["height"] },
    },
    {
      id: "entry", start: 2.5, end: 5,
      instructions: [
        est("from-spin", "flyrc-ronge-fs", "rdrc-fs", "rcn-flachtrudeln", "rcline-flachtrudeln"),
        est("bleed-speed", "flyrc-ronge-fs", "rcline-flachtrudeln", "rcn-flachtrudeln"),
        est("full-inputs", "flyrc-ronge-fs", "wikipedia-3d", "rcline-flachtrudeln"),
      ],
      notes: [disputed("aileron-entry", "flyrc-ronge-fs", "wikipedia-3d", "rcline-flachtrudeln", "rcn-flachtrudeln")],
      values: { level: "guideline", illustrates: ["bleed-speed", "full-inputs"] },
    },
    {
      id: "flatten", start: 5, end: 8,
      instructions: [
        est("hold-inputs", "flyrc-ronge-fs", "rcline-flachtrudeln", "rcn-flachtrudeln"),
        est("aileron-ease", "flyrc-ronge-fs", "rdrc-fs", "wikipedia-3d", "rcn-flachtrudeln", "rcline-flachtrudeln"),
        est("add-throttle", "flyrc-ronge-fs", "wikipedia-3d", "rcn-flachtrudeln"),
        est("tail-authority", "rcline-flachtrudeln", "rcn-flachtrudeln"),
      ],
      values: { level: "guideline", illustrates: ["hold-inputs", "add-throttle"] },
    },
    {
      id: "hold", start: 8, end: 11.5,
      instructions: [est("throttle-height", "flyrc-ronge-fs", "rcn-flachtrudeln")],
      notes: [gap("spin-rate")],
      values: { level: "guideline", illustrates: ["throttle-height"] },
    },
    {
      id: "exit", start: 11.5, end: 15,
      instructions: [
        est("release", "flyrc-ronge-fs", "rdrc-fs", "rcn-flachtrudeln", "rcline-flachtrudeln"),
        est("opposite-rudder", "flyrc-ronge-fs", "rdrc-fs", "rcn-flachtrudeln", "rcn-wiki-trudeln"),
        est("more-turns", "rdrc-fs", "flyrc-ronge-fs"),
      ],
      notes: [
        disputed("exit-throttle", "flyrc-ronge-fs", "rcn-flachtrudeln"),
        disputed("recoverable", "rcn-wiki-trudeln", "wikipedia-3d", "flyrc-ronge-fs", "rcn-flachtrudeln"),
      ],
      values: { level: "guideline", illustrates: ["release", "opposite-rudder"] },
    },
  ],
  strip: {
    view: "front",
    path: [[20, 330], [330, 330], [470, 320], [520, 290], [530, 240], [535, 120]],
    snapshots: [[0, 90, 330], [3.5, 330, 322], [6.5, 515, 290], [9, 530, 240], [12, 534, 190], [14.8, 536, 125]],
  },
};
