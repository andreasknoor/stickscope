import { describe, expect, it } from "vitest";
import { pchip, smoothstep } from "./interpolate.ts";
import { blend, decayGlow, deflectionLevel, DEAD_ZONE } from "./model/highlight.ts";
import { assignSticks, amountOf, throttleWord } from "./model/sticks.ts";
import { viewerSide } from "./maneuvers/facing.ts";
import { phaseIndexAt } from "./maneuvers/phases.ts";
import { stateAt } from "./maneuvers/state.ts";
import { FIXTURE } from "./test-fixture.ts";

const KEYS = [[0, 0], [1, 2], [2, 2], [4, 9], [5, 10]];

describe("interpolation", () => {
  it("pchip hits every keyframe", () => {
    const f = pchip(KEYS, 1);
    for (const [t, y] of KEYS) expect(f(t)).toBeCloseTo(y, 9);
  });
  it("pchip is monotone for monotone keyframes and does not overshoot", () => {
    const f = pchip(KEYS, 1);
    let prev = f(0);
    for (let t = 0.01; t <= 5; t += 0.01) {
      const v = f(t);
      expect(v).toBeGreaterThanOrEqual(prev - 1e-9);
      expect(v).toBeLessThanOrEqual(10 + 1e-9);
      prev = v;
    }
  });
  it("smoothstep hits keyframes and stays between neighbours", () => {
    const f = smoothstep(KEYS, 1);
    for (const [t, y] of KEYS) expect(f(t)).toBeCloseTo(y, 9);
    for (let t = 2; t <= 4; t += 0.05) {
      expect(f(t)).toBeGreaterThanOrEqual(2 - 1e-9);
      expect(f(t)).toBeLessThanOrEqual(9 + 1e-9);
    }
  });
  it("holds the first and last value outside the keyframes", () => {
    expect(pchip(KEYS, 1)(-3)).toBe(0);
    expect(pchip(KEYS, 1)(99)).toBe(10);
    expect(smoothstep(KEYS, 1)(99)).toBe(10);
  });
});

describe("control-surface highlight", () => {
  it("is 0 in the dead zone and at neutral", () => {
    expect(deflectionLevel(0)).toBe(0);
    expect(deflectionLevel(DEAD_ZONE * 0.99)).toBe(0);
    expect(deflectionLevel(-DEAD_ZONE * 0.99)).toBe(0);
  });
  it("is monotone in the deflection and sign-symmetric", () => {
    let prev = 0;
    for (let v = 0; v <= 1; v += 0.01) {
      const l = deflectionLevel(v);
      expect(l).toBeGreaterThanOrEqual(prev);
      expect(deflectionLevel(-v)).toBe(l);
      prev = l;
    }
  });
  it("is 1 at full deflection", () => {
    expect(deflectionLevel(1)).toBe(1);
    expect(deflectionLevel(-1)).toBe(1);
  });
  it("blends from the base colour (0) to the accent colour (1)", () => {
    expect(blend([10, 20, 30], [250, 200, 0], 0)).toEqual([10, 20, 30]);
    expect(blend([10, 20, 30], [250, 200, 0], 1)).toEqual([250, 200, 0]);
  });
  it("afterglow never drops below the live level and fades without input", () => {
    const hot = { ail: 1, elev: 0, rud: 0 };
    const off = { ail: 0, elev: 0, rud: 0 };
    expect(decayGlow(hot, { ail: 0.5, elev: 0, rud: 0 }, 0.016).ail).toBeGreaterThan(0.9);
    expect(decayGlow(hot, off, 1).ail).toBeLessThan(0.06);
    expect(decayGlow(off, { ail: 0.7, elev: 0, rud: 0 }, 0.016).ail).toBe(0.7);
  });
});

describe("sticks", () => {
  const s = { rudder: 0.2, throttle: 75, aileron: -0.4, elevator: -1 };
  it("Mode 2 puts throttle and rudder left, elevator and aileron right", () => {
    const a = assignSticks(s, 2);
    expect(a.left).toEqual({ x: 0.2, y: 0.5, throttleAxis: true });
    expect(a.right).toEqual({ x: -0.4, y: -1, throttleAxis: false });
  });
  it("Mode 1 puts elevator and rudder left, throttle and aileron right", () => {
    const a = assignSticks(s, 1);
    expect(a.left).toEqual({ x: 0.2, y: -1, throttleAxis: false });
    expect(a.right).toEqual({ x: -0.4, y: 0.5, throttleAxis: true });
  });
  it("the mode only reassigns: the same four values appear in both", () => {
    const vals = (m: 1 | 2) => {
      const a = assignSticks(s, m);
      return [a.left.x, a.left.y, a.right.x, a.right.y].sort();
    };
    expect(vals(1)).toEqual(vals(2));
  });
  it("names stick amounts and throttle in plain words", () => {
    expect([0, 0.05, 0.2, 0.5, 0.8, 1].map(amountOf)).toEqual([null, null, "little", "half", "strong", "full"]);
    expect([0, 20, 50, 80, 100].map(throttleWord)).toEqual(["off", "low", "medium", "high", "full"]);
  });
});

describe("state", () => {
  it("is deterministic in t, including the wobble", () => {
    expect(stateAt(FIXTURE, 5.3)).toEqual(stateAt(FIXTURE, 5.3));
  });
  it("hits the first and last keyframes", () => {
    expect(stateAt(FIXTURE, 0).pos).toEqual([-10, 20, 0]);
    expect(stateAt(FIXTURE, 10).pos).toEqual([10, 20, 0]);
  });
  it("finds the phase at a time and the last phase after the end", () => {
    expect([0, 3.9, 4, 9.9, 50].map((t) => phaseIndexAt(FIXTURE, t))).toEqual([0, 0, 1, 1, 1]);
  });
});

describe("which side faces the viewer", () => {
  const EYE: [number, number, number] = [0, 1.7, 30];
  const at = (yaw: number, pitch: number, roll: number) => {
    const m = { ...FIXTURE, attitude: [[0, yaw, pitch, roll], [10, yaw, pitch, roll]] as typeof FIXTURE.attitude, position: [[0, 0, 1.7, 0], [10, 0, 1.7, 0]] as typeof FIXTURE.position };
    return viewerSide(stateAt(m, 5).R, stateAt(m, 5).pos, EYE);
  };
  it("level flight at eye height shows the side", () => expect(at(0, 0, 0)).toBe("side"));
  it("a hover entered by flying away and pulling up shows the canopy", () => expect(at(90, 90, 0)).toBe("top"));
  it("the same hover turned half way round (belly to the pilot) shows the belly", () => expect(at(90, 90, 180)).toBe("bottom"));
});

import { Player } from "./player.ts";

describe("player", () => {
  it("advances with the speed and stops while paused", () => {
    const p = new Player(FIXTURE);
    p.speed = 0.5;
    p.tick(0.04);
    expect(p.t).toBeCloseTo(0.02, 9);
    p.playing = false;
    p.tick(0.04);
    expect(p.t).toBeCloseTo(0.02, 9);
  });
  it("loops the current phase", () => {
    const p = new Player(FIXTURE);
    p.speed = 1;
    p.loopPhase = true;
    p.seek(3.99);
    p.tick(0.05);
    expect(p.t).toBe(0);
  });
  it("restarts after the end and clamps seeks", () => {
    const p = new Player(FIXTURE);
    p.seek(99);
    expect(p.t).toBe(FIXTURE.duration);
    p.t = FIXTURE.duration + 1.01;
    p.tick(0.01);
    expect(p.t).toBe(0);
  });
  it("resets the afterglow after a jump in time", () => {
    const p = new Player(FIXTURE);
    p.seek(6);
    p.frame(0.016);
    expect(p.glow.ail).toBeGreaterThan(0);
    p.seek(0);
    expect(p.frame(0.016).glow.ail).toBe(0);
  });
});

import { readoutsFor } from "./model/sticks.ts";

describe("stick readouts", () => {
  const v = { rudder: -0.55, throttle: 100, aileron: 0, elevator: -1 };
  it("name direction and amount in plain words", () => {
    const r = readoutsFor(v, 2);
    expect(r.left[1]).toEqual({ kind: "rudder", dir: "left", amount: "half" });
    expect(r.right[0]).toEqual({ kind: "elevator", dir: "pull", amount: "full" });
    expect(r.right[1]).toEqual({ kind: "aileron" });
    expect(r.left[0]).toEqual({ kind: "throttle", word: "full" });
  });
  it("puts the same readouts on the other sticks in Mode 1", () => {
    const r = readoutsFor(v, 1);
    expect(r.left[0].kind).toBe("elevator");
    expect(r.right[0].kind).toBe("throttle");
  });
});

import { motorParams } from "./model/motor.ts";

describe("motor sound parameters", () => {
  it("is silent when the motor is off or the animation is not running", () => {
    expect(motorParams(0, true).gain).toBe(0);
    expect(motorParams(1, true).gain).toBe(0);
    expect(motorParams(80, false).gain).toBe(0);
  });
  it("rises with the throttle in pitch, brightness and volume, within bounds", () => {
    let prev = motorParams(2, true);
    for (let thr = 3; thr <= 100; thr += 1) {
      const p = motorParams(thr, true);
      expect(p.frequency).toBeGreaterThanOrEqual(prev.frequency);
      expect(p.cutoff).toBeGreaterThanOrEqual(prev.cutoff);
      expect(p.gain).toBeGreaterThanOrEqual(prev.gain);
      prev = p;
    }
    expect(motorParams(100, true).gain).toBeLessThanOrEqual(0.2);
    expect(motorParams(150, true)).toEqual(motorParams(100, true));
  });
});
