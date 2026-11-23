import { assignSticks, type Gimbal, type Mode, type StickValues } from "../core/model/sticks.ts";
import { fit } from "./canvas.ts";

export interface StickSample {
  left: Gimbal;
  right: Gimbal;
}

/** Number of frames kept for the one-second stick trail. */
export const TRAIL_FRAMES = 45;

export interface StickLabels {
  /** [above, below] per stick: throttle sticks say "full/off", elevator sticks "push/pull". */
  left: [string, string];
  right: [string, string];
}

/** Both gimbals with the throttle track and the one-second trail. `trail` holds recent samples, oldest first. */
export function drawSticks(cv: HTMLCanvasElement, values: StickValues, mode: Mode, trail: StickSample[], labels: StickLabels): StickSample {
  const [c, W, H] = fit(cv);
  c.clearRect(0, 0, W, H);
  const sample = assignSticks(values, mode);
  const sz = Math.min(W * 0.44, H * 0.92);
  const k = sz * 0.38;
  const all = [...trail, sample];
  const gimbals: [Gimbal, number, "left" | "right"][] = [[sample.left, W * 0.25, "left"], [sample.right, W * 0.75, "right"]];
  for (const [g, cx, side] of gimbals) {
    const cy = H / 2;
    const x0 = cx - sz / 2;
    const y0 = cy - sz / 2;
    c.fillStyle = "#1a1d21";
    c.beginPath();
    c.roundRect(x0, y0, sz, sz, sz * 0.14);
    c.fill();
    c.strokeStyle = "#3b4148";
    c.lineWidth = 1.5;
    c.stroke();
    c.setLineDash([3, 4]);
    c.beginPath();
    c.moveTo(cx, y0 + 10);
    c.lineTo(cx, y0 + sz - 10);
    c.moveTo(x0 + 10, cy);
    c.lineTo(x0 + sz - 10, cy);
    c.stroke();
    c.setLineDash([]);
    if (g.throttleAxis) {
      c.fillStyle = "#2c3137";
      c.fillRect(cx - 3, cy - k, 6, 2 * k);
      c.fillStyle = "rgba(224,89,47,.45)";
      c.fillRect(cx - 3, cy - g.y * k, 6, cy + k - (cy - g.y * k));
    }
    c.strokeStyle = "rgba(227,163,58,.75)";
    c.lineWidth = 2;
    c.beginPath();
    all.forEach((tr, i) => {
      const q = tr[side];
      const px = cx + q.x * k;
      const py = cy - q.y * k;
      if (i) c.lineTo(px, py);
      else c.moveTo(px, py);
    });
    c.stroke();
    const px = cx + g.x * k;
    const py = cy - g.y * k;
    c.strokeStyle = "#6b737b";
    c.lineWidth = 5;
    c.lineCap = "round";
    c.beginPath();
    c.moveTo(cx, cy);
    c.lineTo(px, py);
    c.stroke();
    c.fillStyle = "#e0592f";
    c.beginPath();
    c.arc(px, py, sz * 0.075, 0, 7);
    c.fill();
    c.strokeStyle = "#fff";
    c.lineWidth = 2;
    c.stroke();
    c.fillStyle = "#a9b3bb";
    c.font = "600 11.5px sans-serif";
    c.textAlign = "center";
    const lab = labels[side];
    c.fillText(lab[0], cx, y0 - 5);
    c.fillText(lab[1], cx, y0 + sz + 14);
    c.textAlign = "start";
  }
  return sample;
}
