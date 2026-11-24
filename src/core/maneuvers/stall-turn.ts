import type { AttitudeKey, Maneuver, PositionKey, StickKey } from "./types.ts";
import { disputed, est, gap } from "./helpers.ts";

const R = 10;
const X0 = -14;
const Y0 = 10;
const XU = X0 + R;
const YT = 40;

// Quarter loop into the vertical, from t = 3 to 4.5.
const position: PositionKey[] = [[0, -42, Y0, 0], [3, X0, Y0, 0]];
const attitude: AttitudeKey[] = [[0, 0, 0, 0], [3, 0, 0, 0]];
for (let k = 1; k <= 4; k++) {
  const f = k / 4;
  const a = f * (Math.PI / 2);
  const t = +(3 + 1.5 * f).toFixed(3);
  position.push([t, +(X0 + R * Math.sin(a)).toFixed(2), +(Y0 + R - R * Math.cos(a)).toFixed(2), 0]);
  attitude.push([t, 0, +(f * 90).toFixed(1), 0]);
}
// Vertical climb that slows down, the pivot at the top, the dive, and the pull-out to the opposite heading.
position.push([5.5, XU, 30, 0], [6.5, XU, 37, 0], [7.5, XU, YT, 0], [9, XU, 38, 0], [10, XU, 32, 0], [11, XU, 20, 0]);
for (let k = 1; k <= 3; k++) {
  const f = k / 3;
  const a = f * (Math.PI / 2);
  position.push([+(11 + 1.5 * f).toFixed(3), +(XU - R + R * Math.cos(a)).toFixed(2), +(Y0 + R - R * Math.sin(a)).toFixed(2), 0]);
}
position.push([15.5, -44, Y0, 0]);

// Attitude as yaw, pitch, roll. While the nose points straight up or down, yaw and roll turn the same axis, so the keys that change
// them together (yaw +90 with roll -90 on the way up, yaw +90 with roll +90 on the way down) do not move the model; they only switch to
// a description in which the pitch can swing over the top, away from the pilot, with the model's top kept facing backwards.
attitude.push(
  [5.5, 0, 90, 0], [6.3, 0, 90, 0], [6.9, 90, 90, -90], [7.5, 90, 90, -90],
  [9, 90, -90, -90], [10, 90, -90, -90], [10.8, 180, -90, 0], [11, 180, -90, 0],
  [11.5, 180, -60, 0], [12, 180, -30, 0], [12.5, 180, 0, 0], [15.5, 180, 0, 0],
);

// [t, rudder, throttle, aileron, elevator]: full power, throttle reduced but not closed in the climb, full rudder for the pivot, pull out.
const sticks: StickKey[] = [
  [0, 0, 100, 0, 0], [2.8, 0, 100, 0, 0], [3.3, 0, 100, 0, -0.5], [4.4, 0, 100, 0, -0.5], [4.8, 0, 90, 0, 0],
  [6.5, 0, 55, 0, 0], [7.2, 0, 45, 0, 0], [7.5, -1, 45, 0, 0], [8.8, -1, 45, 0, 0], [9.2, 0, 25, 0, 0],
  [10.8, 0, 25, 0, 0], [11.1, 0, 25, 0, -0.8], [12.4, 0, 70, 0, -0.8], [12.9, 0, 70, 0, 0], [15.5, 0, 70, 0, 0],
];

/** The stall turn (hammerhead). Every instruction comes from docs/research/stall-turn.md. */
export const stallTurn: Maneuver = {
  id: "stall-turn",
  category: "motorglider",
  illustrationNotes: ["direction", "aileron"],
  duration: 15.5,
  position,
  attitude,
  sticks,
  phases: [
    {
      id: "approach", start: 0, end: 3,
      instructions: [est("full-power", "rcaw-basic", "wikipedia-stall-turn")],
      notes: [gap("min-height")],
      values: { level: "guideline", illustrates: ["full-power"] },
    },
    {
      id: "climb", start: 3, end: 7.5,
      instructions: [
        est("vertical-climb", "rcaw-basic", "stevens-pattern", "iac-figures", "wikipedia-stall-turn"),
        est("throttle-not-closed", "rcaw-basic", "stevens-pattern", "wikipedia-stall-turn"),
      ],
      notes: [gap("propwash")],
      values: { level: "guideline", illustrates: ["vertical-climb", "throttle-not-closed"] },
    },
    {
      id: "pivot", start: 7.5, end: 9.2,
      instructions: [
        est("full-rudder", "rcaw-basic", "stevens-pattern", "wikipedia-stall-turn"),
        est("tight-pivot", "stevens-pattern", "iac-figures"),
      ],
      values: { level: "guideline", illustrates: ["full-rudder"] },
    },
    {
      id: "dive", start: 9.2, end: 12.5,
      instructions: [est("dive-and-pull-out", "rcaw-basic", "iac-figures", "wikipedia-stall-turn")],
      notes: [disputed("throttle-dive", "rcaw-basic", "wikipedia-stall-turn")],
      values: { level: "guideline", illustrates: ["dive-and-pull-out"] },
    },
    {
      id: "exit", start: 12.5, end: 15.5,
      instructions: [est("opposite-direction", "rcaw-basic", "iac-figures", "wikipedia-stall-turn")],
      values: { level: "guideline", illustrates: ["opposite-direction"] },
    },
  ],
  // The up and down lines are the same line in the air; the sketch draws the down line to the right and the way out below the way in,
  // so the model and the path do not cover each other.
  strip: {
    view: "front",
    path: [[20, 190], [330, 190], [420, 200], [490, 260], [500, 330], [505, 385], [560, 392], [610, 370], [615, 300], [612, 230], [590, 165], [520, 118], [420, 105], [60, 105]],
    snapshots: [[0, 90, 190], [3, 330, 190], [8.2, 560, 392], [10.4, 615, 235], [12.5, 440, 108], [14.8, 130, 105]],
    compactSize: 118,
  },
};
