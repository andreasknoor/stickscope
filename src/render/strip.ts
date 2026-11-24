import { dot, sub, type Vec3 } from "../core/math3.ts";
import type { Maneuver } from "../core/maneuvers/types.ts";
import { phaseIndexAt } from "../core/maneuvers/phases.ts";
import { stateAt } from "../core/maneuvers/state.ts";
import { fit, type CssColors } from "./canvas.ts";
import { drawPlane } from "./plane.ts";
import { ROLL_ARROW } from "./palette.ts";

export interface StripHit {
  x: number;
  y: number;
  t: number;
}

/** Catmull-Rom spline through the control points, `n` samples per segment. */
function catmullRom(P: [number, number][], n = 14): [number, number][] {
  const o: [number, number][] = [];
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[Math.max(0, i - 1)];
    const p1 = P[i];
    const p2 = P[i + 1];
    const p3 = P[Math.min(P.length - 1, i + 2)];
    for (let k = 0; k < n; k++) {
      const t = k / n;
      const t2 = t * t;
      const t3 = t2 * t;
      o.push([0, 1].map((j) => 0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3)) as [number, number]);
    }
  }
  o.push(P[P.length - 1]);
  return o;
}

/**
 * "Figure at a glance": the model drawn several times along a dashed path with direction chevrons, roll arrows and phase numbers.
 * Returns the snapshot positions so a click can jump to that moment. Control surfaces glow without afterglow.
 * `compact` is the thumbnail in the manoeuvre browser: no phase numbers and no note.
 */
export function drawStrip(cv: HTMLCanvasElement, m: Maneuver, t: number, colors: CssColors, note: string, now: number, compact = false): StripHit[] {
  const [c, W, H] = fit(cv);
  const d = m.strip;
  const k = W / 1000;
  const oy = (H / k - 440) / 2;
  c.clearRect(0, 0, W, H);
  const X = (x: number) => x * k;
  const Y = (y: number) => H - (y + oy + 40) * k;
  const pts = catmullRom(d.path).map((p): [number, number] => [X(p[0]), Y(p[1])]);
  const u = Math.max(k, 0.6);
  c.strokeStyle = colors.get("--ink-3");
  c.globalAlpha = 0.55;
  c.lineWidth = 1.6;
  c.setLineDash([5, 6]);
  c.beginPath();
  pts.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])));
  c.stroke();
  c.setLineDash([]);
  // direction chevrons, kept away from the snapshots
  let acc = 0;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    acc += Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (acc < 46 * k) continue;
    if (d.snapshots.some((sn) => Math.hypot(X(sn[1]) - b[0], Y(sn[2]) - b[1]) < 70 * k)) continue;
    acc = 0;
    const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
    const sz = 6 * u;
    c.save();
    c.translate(b[0], b[1]);
    c.rotate(ang);
    c.beginPath();
    c.moveTo(-sz, -sz * 0.8);
    c.lineTo(0, 0);
    c.lineTo(-sz, sz * 0.8);
    c.lineWidth = 1.8;
    c.stroke();
    c.restore();
  }
  c.globalAlpha = 1;
  // a fixed orthographic camera: from the front (pilot) or from the side
  const vd: Vec3 = d.view === "side" ? [1, 0, 0] : [0, 0, 1];
  const r: Vec3 = d.view === "side" ? [0, 0, -1] : [1, 0, 0];
  const up: Vec3 = [0, 1, 0];
  const eye: Vec3 = [vd[0] * 1e6, vd[1] * 1e6, vd[2] * 1e6];
  const f: Vec3 = [-vd[0], -vd[1], -vd[2]];
  const cam = { eye, f, F: 1, pr: (p: Vec3): [number, number, number] => [X(dot(p, r)), Y(dot(p, up)), dot(sub(p, eye), f)] };
  const cur = phaseIndexAt(m, t);
  const hits: StripHit[] = [];
  const deflect = colors.rgb("--deflect");
  for (const [ts, x, y, roll] of d.snapshots) {
    const s = stateAt(m, ts);
    s.pos = [r[0] * x + up[0] * y, r[1] * x + up[1] * y, r[2] * x + up[2] * y];
    if (roll) {
      c.strokeStyle = ROLL_ARROW;
      c.lineWidth = 3 * u;
      const rx = 24 * k, ry = 46 * k, cx = X(x), cy = Y(y);
      const a0 = roll > 0 ? -2.2 : -0.9;
      const a1 = roll > 0 ? 1.9 : 3.9;
      c.beginPath();
      c.ellipse(cx, cy, rx, ry, 0, a0, a1, roll < 0);
      c.stroke();
      const ex = cx + rx * Math.cos(a1);
      const ey = cy + ry * Math.sin(a1);
      const tg = Math.atan2(ry * Math.cos(a1), -rx * Math.sin(a1)) + (roll < 0 ? Math.PI : 0);
      c.fillStyle = ROLL_ARROW;
      c.save();
      c.translate(ex, ey);
      c.rotate(tg);
      c.beginPath();
      c.moveTo(8 * k, 0);
      c.lineTo(-6 * k, -7 * k);
      c.lineTo(-6 * k, 7 * k);
      c.closePath();
      c.fill();
      c.restore();
    }
    drawPlane(c, cam, s, compact ? d.compactSize ?? 160 : W < 520 ? 140 : 110, { deflect, now });
    if (compact) {
      hits.push({ x: X(x), y: Y(y), t: ts });
      continue;
    }
    const pi = phaseIndexAt(m, ts);
    c.fillStyle = pi === cur ? colors.get("--accent") : colors.get("--ink");
    c.beginPath();
    c.arc(X(x) - 52 * k, Y(y) - 46 * k, 11 * Math.max(k, 0.7), 0, 7);
    c.fill();
    c.fillStyle = colors.get("--bg");
    c.font = `700 ${Math.round(13 * Math.max(k, 0.7))}px sans-serif`;
    c.textAlign = "center";
    c.fillText(String(pi + 1), X(x) - 52 * k, Y(y) - 46 * k + 4.5 * Math.max(k, 0.7));
    c.textAlign = "start";
    hits.push({ x: X(x), y: Y(y), t: ts });
  }
  if (!compact) {
    c.fillStyle = colors.get("--ink-3");
    c.font = "500 13px sans-serif";
    c.fillText(note, 8, H - 8);
  }
  return hits;
}
