import type { FlightState } from "../core/maneuvers/state.ts";
import { blend, type Deflections, type Rgb } from "../core/model/highlight.ts";
import { fit } from "./canvas.ts";
import { MODEL, parseHex, rgbCss } from "./palette.ts";

export interface SchematicLabels {
  title: string;
  neutral: string;
  full: string;
}

/** Small top-view of the tail and wings: which control surfaces are deflected right now, with the same glow as the model. */
export function drawSchematic(cv: HTMLCanvasElement, s: FlightState, glow: Deflections, deflect: Rgb, labels: SchematicLabels): void {
  const [c, W, H] = fit(cv);
  c.clearRect(0, 0, W, H);
  const cx = W / 2;
  const tint = (base: string, e: number) => rgbCss(e > 0 ? blend(parseHex(base), deflect, Math.min(1, e * 0.95)) : parseHex(base));
  const box = (x: number, y: number, w: number, h: number, base: string, e: number) => {
    c.fillStyle = tint(base, e);
    c.beginPath();
    c.roundRect(x, y, w, h, 2);
    c.fill();
    if (e > 0) {
      c.strokeStyle = "rgba(255,255,255,.9)";
      c.lineWidth = 0.8 + 2 * e;
      c.stroke();
    }
  };
  const arrow = (x: number, y: number, up: boolean) => {
    c.fillStyle = "#111";
    c.font = "700 10px sans-serif";
    c.textAlign = "center";
    c.fillText(up ? "▲" : "▼", x, y + 3.5);
    c.textAlign = "start";
  };
  c.fillStyle = "#cdd5db";
  c.font = "600 11px sans-serif";
  // leave room for the fold-away button at the top right
  c.fillText(labels.title, 8, 14, W - 42);
  // fuselage with nose triangle
  c.fillStyle = "#9aa7b1";
  c.fillRect(cx - 4, 24, 8, 76);
  c.beginPath();
  c.moveTo(cx - 4, 24);
  c.lineTo(cx, 17);
  c.lineTo(cx + 4, 24);
  c.fill();
  // wing and tailplane (fixed parts), then the moving surfaces
  box(cx - 56, 38, 112, 13, "#2b5e53", 0);
  box(cx - 30, 88, 60, 6, "#2b5e53", 0);
  box(cx - 52, 51, 38, 11, MODEL.top[0], glow.ail);
  box(cx + 14, 51, 38, 11, MODEL.top[0], glow.ail);
  box(cx - 28, 94, 56, 9, MODEL.top[0], glow.elev);
  // rudder swings to the side the trailing edge moves
  const rr = s.rud * 0.6;
  const ex = cx + Math.sin(rr) * 20;
  const ey = 100 + Math.cos(rr) * 20;
  c.lineCap = "round";
  if (glow.rud > 0) {
    c.strokeStyle = "rgba(255,255,255,.9)";
    c.lineWidth = 7 + 2 * glow.rud;
    c.beginPath();
    c.moveTo(cx, 100);
    c.lineTo(ex, ey);
    c.stroke();
  }
  c.strokeStyle = tint(MODEL.rudder, glow.rud);
  c.lineWidth = 6;
  c.beginPath();
  c.moveTo(cx, 100);
  c.lineTo(ex, ey);
  c.stroke();
  // ▲ = trailing edge up, ▼ = down
  if (Math.abs(s.ail) > 0.08) {
    arrow(cx + 33, 56.5, s.ail > 0);
    arrow(cx - 33, 56.5, s.ail < 0);
  }
  if (Math.abs(s.elev) > 0.08) arrow(cx, 98.5, s.elev < 0);
  // legend: neutral to full
  const g = c.createLinearGradient(8, H - 16, W - 8, H - 16);
  g.addColorStop(0, MODEL.top[0]);
  g.addColorStop(1, rgbCss(deflect));
  c.fillStyle = g;
  c.fillRect(8, H - 15, W - 16, 5);
  c.fillStyle = "#9aa7b1";
  c.font = "500 10px sans-serif";
  c.fillText(labels.neutral, 8, H - 3);
  c.textAlign = "right";
  c.fillText(labels.full, W - 8, H - 3);
  c.textAlign = "start";
}
