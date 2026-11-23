import { DEG, mul, rotX, rotY, rotYInv, rotZ, type Mat3, type Vec3 } from "../math3.ts";
import { pchip, smoothstep } from "../interpolate.ts";
import type { Maneuver, Phase } from "./types.ts";

export interface FlightState {
  pos: Vec3;
  /** Attitude: body axes to world axes. */
  R: Mat3;
  rud: number;
  /** 0..100 */
  thr: number;
  ail: number;
  elev: number;
}

interface Compiled {
  pos: ((t: number) => number)[];
  att: ((t: number) => number)[];
  stick: ((t: number) => number)[];
}

const cache = new WeakMap<Maneuver, Compiled>();

function compile(m: Maneuver): Compiled {
  let c = cache.get(m);
  if (!c) {
    c = {
      pos: [1, 2, 3].map((col) => pchip(m.position, col)),
      att: [1, 2, 3].map((col) => pchip(m.attitude, col)),
      stick: [1, 2, 3, 4].map((col) => smoothstep(m.sticks, col)),
    };
    cache.set(m, c);
  }
  return c;
}

/** Seconds a phase's wobble fades in and out. */
const FADE = 0.6;
/** Stick wobble amplitude (stick units). */
const STICK_WOBBLE = 0.13;

/** Wobble envelope 0..1 at time t, and the wobble of the phase it belongs to. */
function wobbleAt(phases: Phase[], t: number): { phase: Phase | null; amount: number } {
  for (const p of phases) {
    if (p.wobble && t >= p.start && t < p.end) return { phase: p, amount: Math.max(0, Math.min(1, (t - p.start) / FADE, (p.end - t) / FADE)) };
  }
  return { phase: null, amount: 0 };
}

/**
 * Everything that moves at time t: position, attitude, stick values.
 * The small-corrections wobble is a pure function of t, so scrubbing back and forth gives the same picture.
 */
export function stateAt(m: Maneuver, t: number): FlightState {
  const c = compile(m);
  const pos = c.pos.map((g) => g(t)) as Vec3;
  const [yaw, pitch, roll] = c.att.map((g) => g(t) * DEG);
  const [rud0, thr, ail0, elev0] = c.stick.map((g) => g(t));
  let rud = rud0, ail = ail0, elev = elev0;
  let dp = 0, dy = 0, dr = 0;
  const { phase, amount } = wobbleAt(m.phases, t);
  const w = phase?.wobble;
  if (w) {
    if (w.pitch) {
      dp = w.pitch * amount * Math.sin(1.3 * t) * DEG;
      elev += STICK_WOBBLE * amount * Math.sin(1.3 * t + 0.7);
    }
    if (w.yaw) {
      dy = w.yaw * amount * Math.sin(1.7 * t + 1) * DEG;
      rud -= STICK_WOBBLE * amount * Math.sin(1.7 * t + 1.7);
    }
    if (w.roll) {
      dr = w.roll * amount * Math.sin(2.1 * t + 2) * DEG;
      ail -= STICK_WOBBLE * amount * Math.sin(2.1 * t + 2.7);
    }
  }
  const R = mul(mul(mul(rotY(yaw), rotZ(pitch)), rotX(roll)), mul(mul(rotZ(dp), rotYInv(dy)), rotX(dr)));
  return { pos, R, rud, thr, ail, elev };
}
