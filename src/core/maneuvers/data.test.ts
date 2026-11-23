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
