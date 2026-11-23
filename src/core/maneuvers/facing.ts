import { apply, dot, norm, sub, type Mat3, type Vec3 } from "../math3.ts";

export type ViewerSide = "top" | "bottom" | "side";

/**
 * Which side of the model faces the viewer: the top (canopy), the underside (belly) or neither (seen from the side).
 * `R` is the attitude matrix of the model, `pos` its position and `eye` the viewer.
 */
export function viewerSide(R: Mat3, pos: Vec3, eye: Vec3): ViewerSide {
  const up = apply(R, [0, 1, 0]);
  const d = dot(up, norm(sub(eye, pos)));
  return Math.abs(d) < 0.3 ? "side" : d > 0 ? "top" : "bottom";
}
