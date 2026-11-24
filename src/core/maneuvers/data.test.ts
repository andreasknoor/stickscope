import { describe, expect, it } from "vitest";
import { pchip } from "../interpolate.ts";
import { EYE_FOR_TESTS } from "./test-eye.ts";
import { viewerSide } from "./facing.ts";
import { CATEGORIES } from "./categories.ts";
import { getManeuver, inCategory, MANEUVERS } from "./index.ts";
import { sourceById, SOURCES } from "./sources.ts";
import { stateAt } from "./state.ts";

const groupsOf = (ids: string[]) => new Set(ids.map((id) => sourceById(id)?.independenceGroup));

describe("sources", () => {
  it("have unique ids and complete data", () => {
    expect(new Set(SOURCES.map((s) => s.id)).size).toBe(SOURCES.length);
    for (const s of SOURCES) {
      expect(s.title, s.id).not.toBe("");
      expect(s.url, s.id).toMatch(/^https?:\/\//);
      expect(s.accessed, s.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(s.independenceGroup, s.id).not.toBe("");
    }
  });
});

describe.each(MANEUVERS.map((m) => [m.id, m] as const))("figure %s", (_id, m) => {
  it("has a known category", () => expect(CATEGORIES).toContain(m.category));

  it("has phases that cover the duration without gaps", () => {
    expect(m.phases[0].start).toBe(0);
    expect(m.phases[m.phases.length - 1].end).toBe(m.duration);
    for (let i = 1; i < m.phases.length; i++) expect(m.phases[i].start).toBe(m.phases[i - 1].end);
  });

  it("has ascending keyframes inside the duration, ending at the duration", () => {
    for (const keys of [m.position, m.attitude, m.sticks]) {
      expect(keys[0][0]).toBe(0);
      expect(keys[keys.length - 1][0]).toBe(m.duration);
      for (let i = 1; i < keys.length; i++) expect(keys[i][0]).toBeGreaterThan(keys[i - 1][0]);
    }
  });

  it("keeps sticks within [-1, 1] and throttle within [0, 100]", () => {
    for (let t = 0; t <= m.duration; t += 0.05) {
      const s = stateAt(m, t);
      expect(Math.abs(s.rud), `rudder at ${t}`).toBeLessThanOrEqual(1 + 1e-9);
      expect(Math.abs(s.ail), `aileron at ${t}`).toBeLessThanOrEqual(1 + 1e-9);
      expect(Math.abs(s.elev), `elevator at ${t}`).toBeLessThanOrEqual(1 + 1e-9);
      expect(s.thr, `throttle at ${t}`).toBeGreaterThanOrEqual(-1e-9);
      expect(s.thr, `throttle at ${t}`).toBeLessThanOrEqual(100 + 1e-9);
    }
  });

  it("interpolates position and attitude through every keyframe", () => {
    for (const keys of [m.position, m.attitude]) {
      for (const col of [1, 2, 3]) {
        const f = pchip(keys, col);
        for (const k of keys) expect(f(k[0])).toBeCloseTo(k[col], 6);
      }
    }
  });

  it("has strip snapshots inside the duration", () => {
    for (const [t] of m.strip.snapshots) expect(t).toBeLessThanOrEqual(m.duration);
  });

  it("gives every instruction a level, and every established one at least two independent sources", () => {
    for (const p of m.phases) {
      for (const i of p.instructions) {
        expect(i.confidence.level, `${p.id}.${i.id}`).toBeTruthy();
        if (i.confidence.level === "established") {
          const ids = i.confidence.sources ?? [];
          for (const s of ids) expect(sourceById(s), `${p.id}.${i.id}: ${s}`).toBeDefined();
          expect(groupsOf(ids).size, `${p.id}.${i.id} needs two independent sources`).toBeGreaterThanOrEqual(2);
        }
      }
    }
  });

  it("shows only established instructions", () => {
    for (const p of m.phases) for (const i of p.instructions) expect(i.confidence.level, `${p.id}.${i.id}`).toBe("established");
  });

  it("has unique instruction ids per phase and phase ids per figure", () => {
    expect(new Set(m.phases.map((p) => p.id)).size).toBe(m.phases.length);
    for (const p of m.phases) expect(new Set(p.instructions.map((i) => i.id)).size).toBe(p.instructions.length);
  });

  it("lets every phase's illustration values refer to instructions of that phase", () => {
    for (const p of m.phases) {
      expect(p.values.level).toBe("guideline");
      for (const id of p.values.illustrates) expect(p.instructions.map((i) => i.id), `${p.id}: ${id}`).toContain(id);
    }
  });

  it("backs every disputed note with sources from at least two groups", () => {
    for (const p of m.phases) {
      for (const n of p.notes ?? []) {
        if (n.kind !== "disputed") continue;
        for (const s of n.sources ?? []) expect(sourceById(s), `${p.id}.${n.id}: ${s}`).toBeDefined();
        expect(groupsOf(n.sources ?? []).size, `${p.id}.${n.id}`).toBeGreaterThanOrEqual(2);
      }
    }
  });
});

describe("registry", () => {
  it("has unique figure ids that do not clash with category ids", () => {
    const ids = MANEUVERS.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const c of CATEGORIES) expect(ids).not.toContain(c);
  });
  it("lists every figure in exactly one category", () => {
    expect(CATEGORIES.flatMap(inCategory).length).toBe(MANEUVERS.length);
  });
});

describe("orientation conventions in the animation", () => {
  const hover = getManeuver("hover")!;
  const torque = getManeuver("torque-roll")!;
  const knife = getManeuver("knife-edge")!;

  it("hover hold shows the canopy to the pilot", () => {
    const s = stateAt(hover, 8);
    expect(viewerSide(s.R, s.pos, EYE_FOR_TESTS)).toBe("top");
  });
  it("torque roll shows the belly at half a turn", () => {
    let t = 4.6;
    while (stateAt(torque, t).R && Math.abs(rollAt(torque, t) + 180) > 1 && t < 11) t += 0.01;
    const s = stateAt(torque, t);
    expect(viewerSide(s.R, s.pos, EYE_FOR_TESTS)).toBe("bottom");
  });
  it("torque roll turns to the left: the roll angle only decreases", () => {
    let prev = rollAt(torque, 0);
    for (let t = 0; t <= torque.duration; t += 0.05) {
      const r = rollAt(torque, t);
      expect(r).toBeLessThanOrEqual(prev + 1e-6);
      prev = r;
    }
    expect(rollAt(torque, torque.duration)).toBeCloseTo(-720, 6);
  });
  it("knife edge: rudder is opposite to the entry roll, and the quarter roll back is the other way", () => {
    const entry = stateAt(knife, 3);
    const hold = stateAt(knife, 6);
    const exit = stateAt(knife, 8.7);
    expect(entry.ail).toBeGreaterThan(0.3);
    expect(hold.rud).toBeLessThan(-0.3);
    expect(exit.ail).toBeLessThan(-0.3);
    expect(knife.sticks.find((k) => k[0] === 3.5)![3]).toBe(0);
  });
  it("elevator hold: full up elevator (pull = negative)", () => {
    expect(stateAt(getManeuver("elevator")!, 7).elev).toBeCloseTo(-1, 6);
  });
  it("harrier holds about 45 degrees nose up", () => {
    const m = getManeuver("harrier")!;
    expect(pchip(m.attitude, 2)(7)).toBeCloseTo(45, 6);
  });
});

function rollAt(m: ReturnType<typeof getManeuver> & object, t: number): number {
  return pchip(m.attitude, 3)(t);
}

describe("rolling harrier and flat spin animation", () => {
  const rh = getManeuver("rolling-harrier")!;
  const fs = getManeuver("flat-spin")!;

  it("rolling harrier: aileron stays full and fixed for the whole roll, then is released", () => {
    for (let t = 5.6; t < 11.4; t += 0.2) expect(stateAt(rh, t).ail).toBeCloseTo(-1, 6);
    expect(stateAt(rh, 13).ail).toBeCloseTo(0, 6);
  });
  it("rolling harrier: three rolls to the left, nose about 45 degrees up during the roll", () => {
    expect(pchip(rh.attitude, 3)(11.5)).toBeCloseTo(-1080, 6);
    expect(pchip(rh.attitude, 2)(8)).toBeCloseTo(45, 6);
  });
  it("rolling harrier: rudder is strongest on the knife edges and elevator works near upright and inverted", () => {
    const rollAtT = (t: number) => pchip(rh.attitude, 3)(t);
    let knife = 0, upright = 0, inverted = 0;
    let tKnife = 0;
    for (let t = 5.6; t < 11.4; t += 0.05) {
      const phi = (((rollAtT(t) % 360) + 360) % 360);
      const s = stateAt(rh, t);
      if (Math.abs(s.rud) > knife) {
        knife = Math.abs(s.rud);
        tKnife = phi;
      }
      if (phi < 10 || phi > 350) upright = Math.max(upright, -s.elev);
      if (Math.abs(phi - 180) < 10) inverted = Math.max(inverted, s.elev);
    }
    expect(Math.abs(Math.sin((tKnife * Math.PI) / 180))).toBeGreaterThan(0.9);
    expect(upright).toBeGreaterThan(0.5); // up elevator (pull) near upright
    expect(inverted).toBeGreaterThan(0); // down elevator (push) near inverted
  });
  it("flat spin: the model turns about the vertical axis while staying nearly level, and the animation shows no aileron", () => {
    let prev = 0;
    for (let t = 5; t <= 15; t += 0.1) {
      const yaw = pchip(fs.attitude, 1)(t);
      expect(yaw).toBeGreaterThanOrEqual(prev - 1e-9);
      prev = yaw;
      expect(Math.abs(pchip(fs.attitude, 2)(t))).toBeLessThanOrEqual(12.5);
      expect(Math.abs(pchip(fs.attitude, 3)(t))).toBe(0);
    }
    for (const k of fs.sticks) expect(k[3]).toBe(0);
  });
  it("flat spin: entry has full up elevator and full rudder into the spin, the exit centres the sticks first", () => {
    const s = stateAt(fs, 5.5);
    expect(s.elev).toBeCloseTo(-1, 6);
    expect(Math.abs(s.rud)).toBeCloseTo(1, 6);
    const e = stateAt(fs, 11.6);
    expect(Math.abs(e.rud)).toBeLessThan(1e-6);
    expect(Math.abs(e.elev)).toBeLessThan(1e-6);
  });
});

describe("motor glider figures", () => {
  const nose = (m: ReturnType<typeof getManeuver> & object, t: number) => {
    const R = stateAt(m, t).R;
    return { nose: [R[0][0], R[1][0], R[2][0]], top: [R[0][1], R[1][1], R[2][1]] };
  };
  const loop = getManeuver("loop")!;
  const splitS = getManeuver("split-s")!;
  const roll = getManeuver("roll")!;
  const stall = getManeuver("stall-turn")!;
  const inverted = getManeuver("inverted-flight")!;

  it("are all in the motor glider category", () => {
    for (const m of [loop, splitS, roll, stall, inverted]) expect(m.category).toBe("motorglider");
    expect(inCategory("motorglider").map((m) => m.id)).toEqual(["loop", "split-s", "roll", "stall-turn", "inverted-flight"]);
  });
  it("loop: one full inside loop, upright and level at the end, nose up at a quarter and inverted on the top", () => {
    expect(pchip(loop.attitude, 2)(loop.duration)).toBeCloseTo(360, 6);
    expect(nose(loop, 6).top[1]).toBeLessThan(-0.9);
    expect(nose(loop, 12).top[1]).toBeCloseTo(1, 6);
    expect(stateAt(loop, 12).pos[1]).toBeCloseTo(stateAt(loop, 0).pos[1], 6);
  });
  it("loop: pulls (negative elevator) in the loop and has the throttle back on the way down", () => {
    expect(stateAt(loop, 5).elev).toBeLessThan(-0.3);
    expect(stateAt(loop, 7).thr).toBeLessThan(stateAt(loop, 2).thr);
  });
  it("split S: ends upright, level, flying the opposite way and lower; the half roll is aileron, the half loop is pull", () => {
    const end = nose(splitS, splitS.duration);
    expect(end.nose[0]).toBeCloseTo(-1, 6);
    expect(end.top[1]).toBeCloseTo(1, 6);
    expect(stateAt(splitS, splitS.duration).pos[1]).toBeLessThan(stateAt(splitS, 0).pos[1] - 10);
    expect(nose(splitS, 4.5).top[1]).toBeCloseTo(-1, 6);
    expect(Math.abs(stateAt(splitS, 3.8).ail)).toBeGreaterThan(0.5);
    expect(stateAt(splitS, 6).elev).toBeLessThan(-0.3);
  });
  it("roll: one full roll to the left on a straight, level line, aileron held and centred afterwards", () => {
    expect(rollAt(roll, roll.duration)).toBeCloseTo(-360, 6);
    for (let t = 0; t <= roll.duration; t += 0.1) expect(stateAt(roll, t).pos[1]).toBeCloseTo(14, 6);
    expect(stateAt(roll, 5).ail).toBeCloseTo(-0.8, 6);
    expect(Math.abs(stateAt(roll, 9).ail)).toBeLessThan(1e-6);
  });
  it("stall turn: vertical climb, the nose swings over with the top kept facing backwards, vertical dive, level exit the other way", () => {
    expect(nose(stall, 6).nose[1]).toBeCloseTo(1, 6);
    expect(nose(stall, 6).top[0]).toBeCloseTo(-1, 6);
    expect(nose(stall, 9).nose[1]).toBeCloseTo(-1, 6);
    expect(nose(stall, 9).top[0]).toBeCloseTo(-1, 6);
    const end = nose(stall, stall.duration);
    expect(end.nose[0]).toBeCloseTo(-1, 6);
    expect(end.top[1]).toBeCloseTo(1, 6);
  });
  it("stall turn: the switch of the angle description at the vertical does not move the model", () => {
    const a = nose(stall, 6.2);
    const b = nose(stall, 7.5);
    for (let i = 0; i < 3; i++) {
      expect(a.nose[i]).toBeCloseTo(b.nose[i], 6);
      expect(a.top[i]).toBeCloseTo(b.top[i], 6);
    }
    const c = nose(stall, 10);
    const d = nose(stall, 10.8);
    for (let i = 0; i < 3; i++) {
      expect(c.nose[i]).toBeCloseTo(d.nose[i], 3);
      expect(c.top[i]).toBeCloseTo(d.top[i], 3);
    }
  });
  it("stall turn: the throttle is reduced in the climb but not closed, full rudder in the pivot", () => {
    expect(stateAt(stall, 7).thr).toBeGreaterThan(20);
    expect(stateAt(stall, 7).thr).toBeLessThan(stateAt(stall, 2).thr);
    expect(Math.abs(stateAt(stall, 8).rud)).toBeCloseTo(1, 6);
  });
  it("inverted flight: half roll onto the back, a straight and level line inverted with a little forward elevator and the aileron centred, half roll back the same way", () => {
    expect(nose(inverted, 3).top[1]).toBeCloseTo(1, 6);
    // the small-corrections wobble keeps it a few degrees off exactly inverted
    expect(nose(inverted, 7).top[1]).toBeLessThan(-0.99);
    expect(nose(inverted, 7).nose[0]).toBeGreaterThan(0.99);
    expect(rollAt(inverted, inverted.duration)).toBeCloseTo(360, 6);
    for (let t = 0; t <= inverted.duration; t += 0.1) expect(stateAt(inverted, t).pos[1]).toBeCloseTo(16, 6);
    // the wobble adds small corrections of up to about 0.13 stick units
    expect(Math.abs(stateAt(inverted, 7).ail)).toBeLessThan(0.14);
    expect(stateAt(inverted, 7).elev).toBeGreaterThan(0.03);
    expect(stateAt(inverted, 3.7).ail).toBeGreaterThan(0.5);
    expect(stateAt(inverted, 10).ail).toBeGreaterThan(0.5);
  });
});
