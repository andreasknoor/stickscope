import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };

// Colours as in the app: the logo tile and accent, the model's teal, the deflection colour.
const TILE = "#08485c";
const ACCENT = "#0d6a83";
const TEAL = "#1D9E75";
const CORAL = "#D85A30";
const DEFLECT = "#f5a300";

type P = [number, number];

/** A level flight that climbs into one loop (prolate cycloid) and flies out level, side view. Returns lead-in, loop, lead-out and the top of the loop. */
function path(): { before: P[]; loop: P[]; top: P[]; after: P[] } {
  const a = 26;
  const b = 76;
  const pt = (t: number): P => [600 + a * t - b * Math.sin(t), 330 - b - b * Math.cos(t)];
  const ts = Array.from({ length: 81 }, (_, k) => -Math.PI + (2 * Math.PI * k) / 80);
  const loop = ts.map(pt);
  return { before: [[285, 330], loop[0]], loop, top: ts.filter((t) => Math.abs(t) < 1.9).map(pt), after: [loop[80], [915, 330]] };
}
const pts = (ps: P[]) => ps.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

/** One transmitter stick: a gimbal ring with a knob pushed to one side (the knob in the deflection colour). */
// A plain function, not a component: the image renderer only accepts intrinsic elements inside <svg>.
function stick(key: string, cx: number, cy: number, dx: number, dy: number, knob: string) {
  return (
    <g key={key}>
      <circle cx={cx} cy={cy} r="50" fill="none" stroke="#ffffff" strokeOpacity="0.55" strokeWidth="4" />
      <path d={`M${cx} ${cy}L${cx + dx} ${cy + dy}`} stroke="#ffffff" strokeWidth="7" strokeLinecap="round" />
      <circle cx={cx + dx} cy={cy + dy} r="15" fill={knob} stroke="#ffffff" strokeWidth="4" />
    </g>
  );
}

/**
 * Preview image for links shared on social networks and in messengers.
 * Everything that matters sits in the centre square (x 285…915), because compact previews
 * (phones, iMessage, Facebook) crop the wide image to a square around its middle.
 */
export function renderOgImage(tagline: string) {
  const f = path();
  const line = { fill: "none", strokeWidth: 10, strokeLinecap: "round", strokeLinejoin: "round" } as const;
  const end = f.after[f.after.length - 1];
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: `linear-gradient(180deg, ${TILE} 0%, ${ACCENT} 100%)`, color: "#ffffff", fontFamily: "sans-serif" }}>
        <svg width="1200" height="630" viewBox="0 0 1200 630" style={{ position: "absolute", left: 0, top: 0 }}>
          <polyline points={pts(f.before)} stroke={TEAL} {...line} />
          <polyline points={pts(f.loop)} stroke={CORAL} {...line} />
          <polyline points={pts(f.top)} stroke={DEFLECT} {...line} />
          <polyline points={pts(f.after)} stroke={TEAL} {...line} />
          <circle cx={end[0]} cy={end[1]} r="14" fill="#ffffff" stroke={TILE} strokeWidth="5" />
          {stick("l", 470, 478, -20, -24, DEFLECT)}
          {stick("r", 730, 478, 22, 16, "#ffffff")}
        </svg>
        <div style={{ position: "absolute", left: 0, right: 0, top: 46, display: "flex", justifyContent: "center", alignItems: "center", gap: 20 }}>
          <svg width="84" height="84" viewBox="0 0 64 64">
            <rect width="64" height="64" rx="14" fill={TILE} />
            <rect x="1" y="1" width="62" height="62" rx="13" fill="none" stroke="#ffffff" strokeOpacity=".35" strokeWidth="2" />
            <g fill="none" stroke="#ffffff" strokeLinecap="round">
              <circle cx="19.5" cy="32" r="12" strokeOpacity=".9" strokeWidth="3" />
              <circle cx="44.5" cy="32" r="12" strokeOpacity=".9" strokeWidth="3" />
              <path d="M19.5 32l-5-5.5M44.5 32l4.5 5" strokeWidth="4" />
            </g>
            <circle cx="14.5" cy="26" r="5.5" fill={DEFLECT} stroke="#ffffff" strokeWidth="2.5" />
            <circle cx="49" cy="37.5" r="5.5" fill="#ffffff" />
          </svg>
          {/* The built-in font has no bold, so the two halves of the name differ in colour. */}
          <div style={{ display: "flex", fontSize: 76, letterSpacing: -1 }}>
            <span style={{ color: "#8fd3e6" }}>Stick</span>
            <span>scope</span>
          </div>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 30, display: "flex", justifyContent: "center", fontSize: 27, fontWeight: 600 }}>
          {tagline}
        </div>
      </div>
    ),
    OG_SIZE,
  );
}

/** App icon at a given size: the logo on the tile colour, full bleed (the phone rounds the corners). */
export function renderIcon(size: number, scale = 0.78) {
  const s = Math.round(size * scale);
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: TILE }}>
        <svg width={s} height={s} viewBox="0 0 64 64">
          <g fill="none" stroke="#ffffff" strokeLinecap="round">
            <circle cx="19.5" cy="32" r="12" strokeOpacity=".9" strokeWidth="3" />
            <circle cx="44.5" cy="32" r="12" strokeOpacity=".9" strokeWidth="3" />
            <path d="M19.5 32l-5-5.5M44.5 32l4.5 5" strokeWidth="4" />
          </g>
          <circle cx="14.5" cy="26" r="5.5" fill={DEFLECT} stroke="#ffffff" strokeWidth="2.5" />
          <circle cx="49" cy="37.5" r="5.5" fill="#ffffff" />
        </svg>
      </div>
    ),
    { width: size, height: size },
  );
}
