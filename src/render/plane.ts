import { airplaneFaces } from "../core/model/airplane.ts";
import { apply, cross, dot, norm, sub, type Mat3, type Vec3 } from "../core/math3.ts";
import { blend, highlightOf, type Deflections, type Rgb } from "../core/model/highlight.ts";
import type { FlightState } from "../core/maneuvers/state.ts";
import type { Camera } from "./camera.ts";
import { MODEL, parseHex, shade } from "./palette.ts";

const LIGHT = norm([0.3, 1, 0.5]);

export interface PlaneOptions {
  /** Glow levels per control surface; defaults to the live stick values (no afterglow). */
  glow?: Deflections;
  /** The colour a fully deflected surface blends towards (CSS token `--deflect`). */
  deflect: Rgb;
  /** Seconds, for the spinning propeller. */
  now: number;
}

interface Drawn {
  pts: [number, number, number][];
  z: number;
  col: string;
  e: number;
}

/** Draws the model with the painter's algorithm. `scale` enlarges it (1 = metres). Returns nothing; the model is at `s.pos`. */
export function drawPlane(c: CanvasRenderingContext2D, cam: Camera, s: FlightState, scale: number, opt: PlaneOptions): void {
  const glow = opt.glow ?? highlightOf(s);
  const faces: Drawn[] = [];
  const toWorld = (p: Vec3): Vec3 => {
    const v = apply(s.R, [p[0] * scale, p[1] * scale, p[2] * scale]);
    return [v[0] + s.pos[0], v[1] + s.pos[1], v[2] + s.pos[2]];
  };
  const up = apply(s.R, [0, 1, 0]);
  for (const fc of airplaneFaces(s)) {
    const w = fc.p.map(toWorld);
    const cen = w.reduce<Vec3>((a, b) => [a[0] + b[0] / w.length, a[1] + b[1] / w.length, a[2] + b[2] / w.length], [0, 0, 0]);
    let n = norm(cross(sub(w[1], w[0]), sub(w[2], w[0])));
    if (!isFinite(n[0])) n = [0, 1, 0];
    const view = sub(cam.eye, cen);
    if (fc.n) {
      if (dot(n, apply(s.R, fc.n)) < 0) n = [-n[0], -n[1], -n[2]];
      if (dot(n, view) < 0) continue; // inside of a solid part
    }
    let base: string;
    if (fc.kind === "w") {
      const top = dot(up, view) > 0;
      base = (top ? MODEL.top : MODEL.bottom)[0];
      n = top ? up : [-up[0], -up[1], -up[2]];
    } else if (fc.kind === "ft") base = MODEL.top[0];
    else if (fc.kind === "fb") base = MODEL.bottom[0];
    else if (fc.kind === "c") base = MODEL.canopy;
    else if (fc.kind === "r") base = MODEL.rudder;
    else base = MODEL.body;
    if (dot(n, view) < 0) n = [-n[0], -n[1], -n[2]];
    const k = 0.72 + 0.38 * Math.abs(dot(n, LIGHT));
    const e = fc.ctl ? glow[fc.ctl] : 0;
    let rgb = parseHex(base);
    if (e > 0) rgb = blend(rgb, opt.deflect, Math.min(1, e * 0.95));
    faces.push({ pts: w.map((p) => cam.pr(p)), z: dot(sub(cen, cam.eye), cam.f) - (fc.bias ?? 0) * scale, col: shade(rgb, k), e });
  }
  faces.sort((a, b) => b.z - a.z);
  for (const fc of faces) {
    if (fc.pts.some((p) => p[2] <= 0.05)) continue;
    c.beginPath();
    fc.pts.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])));
    c.closePath();
    c.fillStyle = fc.col;
    c.fill();
    // A deflected surface gets a darker, thicker outline.
    c.strokeStyle = fc.e > 0 ? `rgba(28,20,0,${0.4 + 0.55 * fc.e})` : "rgba(0,0,0,.25)";
    c.lineWidth = 0.8 + 2.4 * fc.e;
    c.lineJoin = "round";
    c.stroke();
  }
  drawPropeller(c, cam, s, scale, opt.now);
}

const DISC = 0.14;
const HUB_X = 0.38;

function drawPropeller(c: CanvasRenderingContext2D, cam: Camera, s: FlightState, scale: number, now: number): void {
  const R: Mat3 = s.R;
  const at = (y: number, z: number): [number, number, number] => {
    const v = apply(R, [HUB_X * scale, y * scale, z * scale]);
    return cam.pr([v[0] + s.pos[0], v[1] + s.pos[1], v[2] + s.pos[2]]);
  };
  const ring: [number, number, number][] = [];
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * 2 * Math.PI;
    ring.push(at(Math.cos(a) * DISC, Math.sin(a) * DISC));
  }
  c.beginPath();
  ring.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])));
  c.closePath();
  c.fillStyle = "rgba(120,130,135,.22)";
  c.fill();
  if (s.thr > 2) {
    const blade = now * (4 + s.thr / 6);
    const b: [number, number] = [Math.cos(blade) * DISC, Math.sin(blade) * DISC];
    const p1 = at(b[0], b[1]);
    const p2 = at(-b[0], -b[1]);
    c.strokeStyle = "rgba(60,65,70,.75)";
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(p1[0], p1[1]);
    c.lineTo(p2[0], p2[1]);
    c.stroke();
  }
}
