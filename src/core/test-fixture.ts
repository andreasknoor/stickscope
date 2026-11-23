import type { Maneuver } from "./maneuvers/types.ts";

/** A small synthetic manoeuvre for engine tests. Not a real figure and never shown in the app. */
export const FIXTURE: Maneuver = {
  id: "fixture",
  category: "beginner",
  duration: 10,
  position: [[0, -10, 20, 0], [10, 10, 20, 0]],
  attitude: [[0, 0, 0, 0], [4, 0, 0, 0], [6, 0, 90, 0], [10, 0, 90, -360]],
  sticks: [[0, 0, 50, 0, 0], [4, 0, 50, 0, 0], [6, 0.5, 80, 1, -1], [10, 0, 50, 0, 0]],
  phases: [
    { id: "a", start: 0, end: 4, instructions: [], values: { level: "guideline", illustrates: [] } },
    { id: "b", start: 4, end: 10, instructions: [], values: { level: "guideline", illustrates: [] }, wobble: { pitch: 3 } },
  ],
  strip: { view: "front", path: [[0, 0], [1000, 0]], snapshots: [[0, 0, 0]] },
};
