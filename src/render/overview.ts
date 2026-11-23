import { DEG, type Vec3 } from "../core/math3.ts";
import type { Maneuver } from "../core/maneuvers/types.ts";
import { stateAt } from "../core/maneuvers/state.ts";
import type { Deflections } from "../core/model/highlight.ts";
import { camFrom } from "./camera.ts";
import { fit, type CssColors } from "./canvas.ts";
import { drawPlane } from "./plane.ts";
import { drawEnvironment } from "./scene.ts";

const SAMPLES = 160;
/** The overview is seen from behind the pilot's place, so the whole path fits and the horizon is visible. */
const EYE_BACK: Vec3 = [0, 1.7, 75];

const pathCache = new WeakMap<Maneuver, Vec3[]>();
function pathOf(m: Maneuver): Vec3[] {
  let pts = pathCache.get(m);
  if (!pts) {
    pts = [];
    for (let i = 0; i <= SAMPLES; i++) pts.push(stateAt(m, (m.duration * i) / SAMPLES).pos);
    pathCache.set(m, pts);
  }
  return pts;
}

export interface OverviewOptions {
  /** Heading drawn top left; omitted in the small window. */
  title?: string;
  /** Length of the model on screen as a fraction of the canvas width. */
  modelFrac: number;
}

/**
 * The whole flight path with sky, ground and horizon; the part flown so far is drawn solid and the model sits at time t.
 * The camera stands behind the pilot's place and is pitched so that the ground line stays in view.
 */
export function drawOverview(cv: HTMLCanvasElement, m: Maneuver, t: number, glow: Deflections, colors: CssColors, now: number, opt: OverviewOptions): void {
  const [c, W, H] = fit(cv);
  const pts = pathOf(m);
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const maxY = Math.max(...ys);
  const halfX = (Math.max(...xs) - Math.min(...xs)) / 2 + 9;
  const cx = (Math.max(...xs) + Math.min(...xs)) / 2;
  const cz = pts.reduce((a, p) => a + p[2], 0) / pts.length;
  const depth = EYE_BACK[2] - cz;
  const targetY = Math.max(maxY / 2, 3);
  const halfY = Math.max(targetY + 1.5, maxY + 10 - targetY);
  const fovV = (2 * Math.atan(halfY / depth)) / DEG;
  const fovFromWidth = (2 * Math.atan((halfX / depth) * (H / W))) / DEG;
  const fov = Math.min(85, Math.max(fovV, fovFromWidth) * 1.06);
  const cam = camFrom(EYE_BACK, [cx, targetY, cz], fov, W, H);
  drawEnvironment(c, cam, W, H, colors, true);
  const trace = (until: number) => {
    c.beginPath();
    for (let i = 0; i <= SAMPLES && (m.duration * i) / SAMPLES <= until; i++) {
      const q = cam.pr(pts[i]);
      if (i) c.lineTo(q[0], q[1]);
      else c.moveTo(q[0], q[1]);
    }
    c.stroke();
  };
  c.lineWidth = 2;
  c.setLineDash([5, 5]);
  c.strokeStyle = colors.get("--ink-2");
  c.globalAlpha = 0.7;
  trace(m.duration);
  c.globalAlpha = 1;
  c.setLineDash([]);
  c.strokeStyle = colors.get("--accent");
  c.lineWidth = 2.5;
  trace(t);
  const s = stateAt(m, t);
  // Scale so that the model is `modelFrac` of the width long on screen.
  const scale = (opt.modelFrac * W * depth) / cam.F;
  drawPlane(c, cam, s, scale, { glow, deflect: colors.rgb("--deflect"), now });
  if (opt.title) {
    c.fillStyle = colors.get("--ink");
    c.font = "600 13px sans-serif";
    c.fillText(opt.title, 12, 20);
  }
}
