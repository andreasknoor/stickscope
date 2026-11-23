import type { Camera } from "./camera.ts";
import type { CssColors } from "./canvas.ts";

/** Sky above, ground below, horizon line between; colours from the theme tokens. `haze` adds a lighter band above the horizon. */
export function drawEnvironment(c: CanvasRenderingContext2D, cam: Camera, W: number, H: number, colors: CssColors, haze = false): void {
  const a = Math.asin(Math.max(-0.99, Math.min(0.99, cam.f[1])));
  const horizon = H / 2 + cam.F * Math.tan(a);
  c.fillStyle = colors.get("--sky");
  c.fillRect(0, 0, W, H);
  if (haze && horizon > 0 && horizon < H) {
    // A lighter band above the horizon gives the distance.
    const g = c.createLinearGradient(0, Math.max(0, horizon - H * 0.25), 0, horizon);
    g.addColorStop(0, "rgba(255,255,255,0)");
    g.addColorStop(1, "rgba(255,255,255,.35)");
    c.fillStyle = g;
    c.fillRect(0, Math.max(0, horizon - H * 0.25), W, Math.min(horizon, H * 0.25));
  }
  if (horizon < H) {
    c.fillStyle = colors.get("--ground");
    c.fillRect(0, Math.max(0, horizon), W, H);
    c.strokeStyle = colors.get("--horizon");
    c.lineWidth = 1.5;
    c.beginPath();
    c.moveTo(0, horizon);
    c.lineTo(W, horizon);
    c.stroke();
  }
}
