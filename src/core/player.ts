import { phaseIndexAt } from "./maneuvers/phases.ts";
import { stateAt, type FlightState } from "./maneuvers/state.ts";
import type { Maneuver } from "./maneuvers/types.ts";
import { decayGlow, highlightOf, type Deflections } from "./model/highlight.ts";

export const SPEEDS = [0.25, 0.5, 1] as const;
export type Speed = (typeof SPEEDS)[number];

/** A jump in time larger than this resets the afterglow, so scrubbing does not smear highlights. */
const JUMP = 0.3;
/** Seconds of rest after the end before the animation starts again. */
const END_PAUSE = 1;
/** Longest frame step in seconds, so a background tab does not make the model leap. */
const MAX_DT = 0.05;

const NO_GLOW: Deflections = { ail: 0, elev: 0, rud: 0 };

/**
 * The one clock of a manoeuvre view. The model, the sticks and the highlights all read their values from here,
 * so they cannot drift apart.
 */
export class Player {
  t = 0;
  playing: boolean;
  speed: Speed = 0.5;
  loopPhase = false;
  glow: Deflections = NO_GLOW;
  private lastT = 0;

  constructor(public maneuver: Maneuver, playing = true) {
    this.playing = playing;
  }

  setManeuver(m: Maneuver): void {
    this.maneuver = m;
    this.seek(0);
  }

  seek(t: number): void {
    this.t = Math.max(0, Math.min(t, this.maneuver.duration));
    this.glow = NO_GLOW;
    this.lastT = this.t;
  }

  /** Advances the clock by `dt` real seconds (if playing). */
  tick(dt: number): void {
    if (!this.playing) return;
    const step = Math.min(MAX_DT, dt) * this.speed;
    const m = this.maneuver;
    const before = this.t;
    this.t += step;
    if (this.loopPhase) {
      const p = m.phases[phaseIndexAt(m, before)];
      if (this.t >= p.end) this.t = p.start;
    }
    if (this.t > m.duration + END_PAUSE) this.t = 0;
  }

  /** Current state, with the afterglow updated for this frame. */
  frame(dt: number): { t: number; state: FlightState; glow: Deflections } {
    const t = Math.min(this.t, this.maneuver.duration);
    const state = stateAt(this.maneuver, t);
    if (Math.abs(t - this.lastT) > JUMP) this.glow = NO_GLOW;
    this.lastT = t;
    this.glow = decayGlow(this.glow, highlightOf(state), Math.min(dt, MAX_DT));
    return { t, state, glow: this.glow };
  }
}
