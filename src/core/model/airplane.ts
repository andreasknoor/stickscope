import { DEG, type Vec3 } from "../math3.ts";

/** What a face of the model is, for colouring. "w" = wing or tail surface (top teal, underside coral). */
export type FaceKind = "w" | "ft" | "fb" | "fs" | "c" | "fin" | "r";
export type Control = "ail" | "elev" | "rud";

export interface Face {
  p: Vec3[];
  kind: FaceKind;
  /** Outward normal in body axes, for solid parts that must not show their inside. */
  n?: Vec3;
  /** Draw-order bias in metres (pulls the canopy in front of the fuselage). */
  bias?: number;
  /** The control surface this face belongs to; it moves and glows with the stick. */
  ctl?: Control;
}

export interface ControlPositions {
  ail: number;
  elev: number;
  rud: number;
}

/** Maximum deflections drawn on the model, in degrees. */
const MAX_ELEVATOR = 30;
const MAX_AILERON = 25;
const MAX_RUDDER = 30;

/** Rotates the point (px, py, pz) by `ang` about a hinge line at x = hx, around the Z axis ("z") or the Y axis ("y"). */
function hinge(px: number, py: number, pz: number, hx: number, ang: number, axis: "z" | "y"): Vec3 {
  const o: Vec3 = [px - hx, py, pz];
  const c = Math.cos(ang);
  const s = Math.sin(ang);
  const r: Vec3 = axis === "z" ? [o[0] * c - o[1] * s, o[0] * s + o[1] * c, o[2]] : [o[0] * c - o[2] * s, o[1], o[0] * s + o[2] * c];
  return [r[0] + hx, r[1], r[2]];
}

/**
 * The model in body axes (X forward, Y up, Z right; metres): box fuselage, wings, tail, canopy.
 * Control surfaces are slightly enlarged so their movement is easy to see.
 */
export function airplaneFaces(s: ControlPositions): Face[] {
  const face = (p: Vec3[], kind: FaceKind, n?: Vec3, bias?: number, ctl?: Control): Face => ({ p, kind, n, bias, ctl });
  const ea = s.elev * MAX_ELEVATOR * DEG;
  const aa = s.ail * MAX_AILERON * DEG;
  const ra = -s.rud * MAX_RUDDER * DEG;
  const f: Face[] = [];
  for (const z of [-1, 1]) {
    f.push(face([[0.14, 0, 0.06 * z], [0.14, 0, 0.5 * z], [-0.1, 0, 0.5 * z], [-0.1, 0, 0.06 * z]], "w"));
    const aileronAngle = z > 0 ? -aa : aa;
    f.push(face([[-0.1, 0, 0.1 * z], [-0.1, 0, 0.5 * z], hinge(-0.215, 0, 0.5 * z, -0.1, aileronAngle, "z"), hinge(-0.215, 0, 0.1 * z, -0.1, aileronAngle, "z")], "w", undefined, undefined, "ail"));
    f.push(face([[-0.1, 0, 0.058 * z], [-0.1, 0, 0.1 * z], [-0.16, 0, 0.1 * z], [-0.16, 0, 0.055 * z]], "w"));
    f.push(face([[-0.42, 0.004, 0.025 * z], [-0.42, 0.004, 0.21 * z], [-0.53, 0.004, 0.21 * z], [-0.53, 0.004, 0.02 * z]], "w"));
    f.push(face([[-0.53, 0.004, 0.02 * z], [-0.53, 0.004, 0.21 * z], hinge(-0.655, 0.004, 0.21 * z, -0.53, ea, "z"), hinge(-0.655, 0.004, 0.016 * z, -0.53, ea, "z")], "w", undefined, undefined, "elev"));
  }
  // Fuselage sections: [x, half width, top, bottom]
  const S: [number, number, number, number][] = [[0.37, 0.04, 0.035, -0.04], [0.24, 0.06, 0.08, -0.07], [0.04, 0.06, 0.09, -0.055], [-0.18, 0.045, 0.06, -0.035], [-0.42, 0.025, 0.036, -0.014], [-0.58, 0.014, 0.026, -0.005]];
  for (let i = 0; i < S.length - 1; i++) {
    const [x0, w0, t0, b0] = S[i];
    const [x1, w1, t1, b1] = S[i + 1];
    f.push(face([[x0, t0, -w0], [x0, t0, w0], [x1, t1, w1], [x1, t1, -w1]], "ft", [0, 1, 0]));
    f.push(face([[x0, b0, -w0], [x0, b0, w0], [x1, b1, w1], [x1, b1, -w1]], "fb", [0, -1, 0]));
    for (const z of [-1, 1]) f.push(face([[x0, t0, w0 * z], [x1, t1, w1 * z], [x1, b1, w1 * z], [x0, b0, w0 * z]], "fs", [0, 0, z]));
  }
  const n0 = S[0];
  const n1 = S[S.length - 1];
  f.push(face([[n0[0], n0[2], -n0[1]], [n0[0], n0[2], n0[1]], [n0[0], n0[3], n0[1]], [n0[0], n0[3], -n0[1]]], "fs", [1, 0, 0]));
  f.push(face([[n1[0], n1[2], -n1[1]], [n1[0], n1[2], n1[1]], [n1[0], n1[3], n1[1]], [n1[0], n1[3], -n1[1]]], "fs", [-1, 0, 0]));
  f.push(face([[0.22, 0.086, -0.04], [0.22, 0.086, 0.04], [0.06, 0.095, 0.04], [0.06, 0.095, -0.04]], "c", [0, 1, 0], 0.08));
  f.push(face([[-0.4, 0.036, 0], [-0.49, 0.27, 0], [-0.54, 0.27, 0], [-0.53, 0.03, 0]], "fin"));
  f.push(face([[-0.53, 0.03, 0], [-0.54, 0.27, 0], hinge(-0.655, 0.27, 0, -0.54, ra, "y"), hinge(-0.645, 0.026, 0, -0.53, ra, "y")], "r", undefined, undefined, "rud"));
  return f;
}
