export type MeterLevel = 1 | 2 | 3 | 4;

const COLOR: Record<MeterLevel, string> = { 4: "var(--good)", 3: "var(--good)", 2: "var(--warn)", 1: "var(--crit)" };

/** Four bars like a phone signal meter. Level 1 is the lowest. */
export function Meter({ level }: { level: MeterLevel }) {
  return (
    <span className="meter" aria-hidden="true">
      {[1, 2, 3, 4].map((k) => (
        <i key={k} style={k <= level ? { background: COLOR[level], opacity: level === 3 ? 0.55 : 1 } : undefined} />
      ))}
    </span>
  );
}
