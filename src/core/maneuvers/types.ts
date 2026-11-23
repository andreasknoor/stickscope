/** Data types for manoeuvres. Pure data, no text: all user-facing text lives in src/i18n. */

/**
 * How well an instruction is backed. Only `established` content is shown as an instruction in the app:
 * it needs at least two sources from distinct independence groups (see sources.ts).
 * The other levels exist for drafts and for the illustrative animation values.
 */
export type Level = "established" | "typical" | "guideline" | "assumption";

export interface Confidence {
  level: Level;
  /** Ids from the source registry (sources.ts). */
  sources?: string[];
}

export type Category = "beginner" | "advanced" | "pro";

/** [t, x, y, z] in seconds and metres. x runs left to right, y up, z towards the pilot. */
export type PositionKey = [t: number, x: number, y: number, z: number];
/** [t, yaw, pitch, roll] in degrees. Roll: positive = right wing down. */
export type AttitudeKey = [t: number, yaw: number, pitch: number, roll: number];
/** [t, rudder, throttle, aileron, elevator]. Throttle 0..100, the others -1..1; pull = negative elevator = nose up. */
export type StickKey = [t: number, rudder: number, throttle: number, aileron: number, elevator: number];

export interface Instruction {
  id: string;
  confidence: Confidence;
}

/** Amplitudes of the small-corrections wobble, in degrees. */
export interface Wobble {
  pitch?: number;
  yaw?: number;
  roll?: number;
}

/**
 * A note in a phase that is not an instruction:
 * - "disputed": sources contradict each other (listed in `sources`, at least two);
 * - "gap": the sources give no confirmed instruction for this, or only one source does.
 */
export interface PhaseNote {
  id: string;
  kind: "disputed" | "gap";
  sources?: string[];
}

export interface Phase {
  id: string;
  /** Seconds. A phase runs from `start` up to, not including, `end`. */
  start: number;
  end: number;
  instructions: Instruction[];
  notes?: PhaseNote[];
  /**
   * The timings and stick/throttle travel of the animation in this phase. These illustrate the instructions;
   * the sources are qualitative, so they are never "established".
   */
  values: { level: "guideline"; illustrates: string[] };
  wobble?: Wobble;
}

/** One snapshot of the "figure at a glance" strip: [time, x, y, roll arrow (1 right, -1 left)] in strip units (1000 wide). */
export type StripSnapshot = [t: number, x: number, y: number, roll?: 1 | -1];

export interface StripLayout {
  /** "front" = seen from the pilot, "side" = seen from the side. */
  view: "front" | "side";
  path: [x: number, y: number][];
  snapshots: StripSnapshot[];
}

export interface Maneuver {
  id: string;
  /** Part of the figure the animation shows that the sources do not confirm (for example which side faces the pilot); shown as an illustration notice. */
  illustrationNotes?: string[];
  category: Category;
  duration: number;
  position: PositionKey[];
  attitude: AttitudeKey[];
  sticks: StickKey[];
  phases: Phase[];
  strip: StripLayout;
}

export interface Source {
  id: string;
  title: string;
  author: string;
  url: string;
  /** ISO date the page was read. */
  accessed: string;
  language: "en" | "de";
  /** Sources with the same group are not independent (same author, copies, quotes of one original). */
  independenceGroup: string;
}
