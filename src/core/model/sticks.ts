/** How stick positions are assigned to the two physical sticks. The mode never changes the figure data. */

export type Mode = 1 | 2;

export interface StickValues {
  rudder: number;
  /** 0..100 */
  throttle: number;
  aileron: number;
  elevator: number;
}

export interface Gimbal {
  /** -1..1, right is positive. */
  x: number;
  /** -1..1, up is positive. Pulling the elevator is down. */
  y: number;
  /** True if this stick's vertical axis is the throttle (a track without spring-back). */
  throttleAxis: boolean;
}

export const throttleToAxis = (throttle: number): number => throttle / 50 - 1;

/** Mode 2: left stick = throttle and rudder, right stick = elevator and aileron. Mode 1: left = elevator and rudder, right = throttle and aileron. */
export function assignSticks(s: StickValues, mode: Mode): { left: Gimbal; right: Gimbal } {
  const thr = throttleToAxis(s.throttle);
  return mode === 2
    ? { left: { x: s.rudder, y: thr, throttleAxis: true }, right: { x: s.aileron, y: s.elevator, throttleAxis: false } }
    : { left: { x: s.rudder, y: s.elevator, throttleAxis: false }, right: { x: s.aileron, y: thr, throttleAxis: true } };
}

export type Amount = "little" | "half" | "strong" | "full";

/** Plain-word size of a stick deflection, or null if the stick is (nearly) neutral. */
export function amountOf(v: number): Amount | null {
  const a = Math.abs(v);
  return a < 0.06 ? null : a <= 0.3 ? "little" : a <= 0.6 ? "half" : a < 0.9 ? "strong" : "full";
}

export type ThrottleWord = "off" | "low" | "medium" | "high" | "full";

/** Plain-word throttle position; the animation does not claim percentages. */
export function throttleWord(throttle: number): ThrottleWord {
  return throttle <= 1 ? "off" : throttle >= 99 ? "full" : throttle < 34 ? "low" : throttle < 67 ? "medium" : "high";
}

export type ReadoutKind = "rudder" | "aileron" | "elevator" | "throttle";

export interface Readout {
  kind: ReadoutKind;
  /** "left" | "right" for rudder and aileron, "pull" | "push" for the elevator; absent when neutral. */
  dir?: "left" | "right" | "pull" | "push";
  amount?: Amount;
  word?: ThrottleWord;
}

function readoutOf(kind: ReadoutKind, v: StickValues): Readout {
  if (kind === "throttle") return { kind, word: throttleWord(v.throttle) };
  const x = kind === "rudder" ? v.rudder : kind === "aileron" ? v.aileron : v.elevator;
  const amount = amountOf(x);
  if (!amount) return { kind };
  const dir = kind === "elevator" ? (x < 0 ? "pull" : "push") : x < 0 ? "left" : "right";
  return { kind, dir, amount };
}

/** Plain-word readouts under the two sticks, top line first. */
export function readoutsFor(v: StickValues, mode: Mode): { left: [Readout, Readout]; right: [Readout, Readout] } {
  const r = (k: ReadoutKind) => readoutOf(k, v);
  return mode === 2
    ? { left: [r("throttle"), r("rudder")], right: [r("elevator"), r("aileron")] }
    : { left: [r("elevator"), r("rudder")], right: [r("throttle"), r("aileron")] };
}
