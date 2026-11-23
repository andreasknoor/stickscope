import { cross, dot, norm, sub, type Vec3 } from "../core/math3.ts";

export interface Camera {
  eye: Vec3;
  /** Viewing direction. */
  f: Vec3;
  /** Focal length in pixels. */
  F: number;
  /** Projects a world point to [x, y, depth] in canvas pixels. */
  pr(p: Vec3): [number, number, number];
}

export function camFrom(eye: Vec3, target: Vec3, fovDeg: number, W: number, H: number): Camera {
  const f = norm(sub(target, eye));
  const r = norm(cross(f, [0, 1, 0]));
  const u = cross(r, f);
  const F = H / 2 / Math.tan((fovDeg * Math.PI) / 180 / 2);
  return {
    eye,
    f,
    F,
    pr(p) {
      const d = sub(p, eye);
      const z = dot(d, f);
      return [W / 2 + (F * dot(d, r)) / z, H / 2 - (F * dot(d, u)) / z, z];
    },
  };
}

/** The pilot's eye position: standing at the origin side of the flight area, looking along -z. */
export const EYE: Vec3 = [0, 1.7, 30];
