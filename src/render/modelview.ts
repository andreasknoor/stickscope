import { DEG, norm, sub, type Vec3 } from "../core/math3.ts";
import type { FlightState } from "../core/maneuvers/state.ts";
import type { Deflections } from "../core/model/highlight.ts";
import { camFrom, EYE } from "./camera.ts";
import { fit, type CssColors } from "./canvas.ts";
import { drawPlane } from "./plane.ts";
import { drawEnvironment } from "./scene.ts";
import { drawParticles, drawTrail } from "./speedcues.ts";
import type { Maneuver } from "../core/maneuvers/types.ts";

export type CameraMode = "pilot" | "orbit";

export interface Orbit {
  /** Degrees. */
  az: number;
  el: number;
}

const ORBIT_DISTANCE = 3.2;

/** Which speed cues to draw, and the figure and time they are computed from. */
export interface Cues {
  particles: boolean;
  trail: boolean;
  maneuver: Maneuver;
  t: number;
}

/** Orbit angles that look at the model from the pilot's position, used when switching to the free camera. */
export function orbitFromPilot(pos: Vec3): Orbit {
  const v = norm(sub(EYE, pos));
  return { az: Math.atan2(-v[2], v[0]) / DEG, el: Math.asin(v[1]) / DEG };
}

/** The large 3D view: either from the pilot's place (auto-zoomed on the model) or orbiting the model. */
export function drawModelView(cv: HTMLCanvasElement, s: FlightState, glow: Deflections, mode: CameraMode, orbit: Orbit, colors: CssColors, now: number, cues: Cues): void {
  const [c, W, H] = fit(cv);
  let cam;
  if (mode === "pilot") {
    const dist = Math.hypot(...sub(s.pos, EYE));
    const fov = (2 * Math.atan(0.62 / dist)) / DEG / 0.42;
    cam = camFrom(EYE, s.pos, fov, W, H);
  } else {
    const { az, el } = orbit;
    const e: Vec3 = [
      s.pos[0] + ORBIT_DISTANCE * Math.cos(el * DEG) * Math.cos(az * DEG),
      s.pos[1] + ORBIT_DISTANCE * Math.sin(el * DEG),
      s.pos[2] - ORBIT_DISTANCE * Math.cos(el * DEG) * Math.sin(az * DEG),
    ];
    cam = camFrom(e, s.pos, 42, W, H);
  }
  drawEnvironment(c, cam, W, H, colors);
  if (cues.particles) drawParticles(c, cam, s.pos, colors);
  if (cues.trail) drawTrail(c, cam, cues.maneuver, cues.t, colors);
  drawPlane(c, cam, s, 1, { glow, deflect: colors.rgb("--deflect"), now });
}

/** The eye used for "which side faces the viewer": the camera in use. */
export function viewEye(mode: CameraMode, orbit: Orbit, pos: Vec3): Vec3 {
  if (mode === "pilot") return EYE;
  const { az, el } = orbit;
  return [
    pos[0] + ORBIT_DISTANCE * Math.cos(el * DEG) * Math.cos(az * DEG),
    pos[1] + ORBIT_DISTANCE * Math.sin(el * DEG),
    pos[2] - ORBIT_DISTANCE * Math.cos(el * DEG) * Math.sin(az * DEG),
  ];
}
