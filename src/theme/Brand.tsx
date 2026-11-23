/** The StickScope mark: the two transmitter sticks, each deflected differently (the knob in the deflection colour). */
export function LogoMark({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className="logomark">
      <rect width="64" height="64" rx="14" fill="var(--logo-tile)" />
      <rect x="1" y="1" width="62" height="62" rx="13" fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth="2" />
      <g fill="none" stroke="#fff" strokeLinecap="round">
        <circle cx="19.5" cy="32" r="12" strokeOpacity=".9" strokeWidth="3" />
        <circle cx="44.5" cy="32" r="12" strokeOpacity=".9" strokeWidth="3" />
        <path d="M19.5 32l-5-5.5M44.5 32l4.5 5" strokeWidth="4" />
      </g>
      <circle cx="14.5" cy="26" r="5.5" fill="var(--deflect)" stroke="#fff" strokeWidth="2.5" />
      <circle cx="49" cy="37.5" r="5.5" fill="#fff" />
    </svg>
  );
}

/** Mark and name in the header: first part of the name in the accent colour, like TLMscope. */
export function Wordmark() {
  return (
    <>
      <LogoMark />
      <span className="wordmark"><b>Stick</b>scope</span>
    </>
  );
}
