/** Line icons with round ends (same drawing style as TLMscope). Add StickScope icons here as they are needed. */
const PATHS = {
  play: <path d="M8 5l11 7-11 7z" />,
  pause: <path d="M8 5v14M16 5v14" />,
  help: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>,
  question: <><circle cx="12" cy="12" r="9" /><path d="M9.6 9.6a2.5 2.5 0 114 2c-.9.7-1.6 1.2-1.6 2.4M12 17h.01" /></>,
  x: <path d="M6 6l12 12M18 6L6 18" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  level1: <><path d="M6 19v-4M12 19V9M18 19V5" strokeOpacity=".3" /><path d="M6 19v-4" /></>,
  level2: <><path d="M6 19v-4M12 19V9M18 19V5" strokeOpacity=".3" /><path d="M6 19v-4M12 19V9" /></>,
  level3: <path d="M6 19v-4M12 19V9M18 19V5" />,
  sound: <><path d="M4 9.5v5h3.5L12 18V6L7.5 9.5z" /><path d="M15.5 9a4 4 0 010 6M18 6.5a7.5 7.5 0 010 11" /></>,
  soundOff: <><path d="M4 9.5v5h3.5L12 18V6L7.5 9.5z" /><path d="M16 9.5l5 5M21 9.5l-5 5" /></>,
  gear: <><circle cx="12" cy="12" r="3" /><path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M5.5 18.5l1.7-1.7M16.8 7.2l1.7-1.7" /></>,
  lock: <><rect x="5.5" y="11" width="13" height="9.5" rx="2" /><path d="M8.5 11V8a3.5 3.5 0 017 0v3" /></>,
} satisfies Record<string, React.ReactNode>;

export type IconName = keyof typeof PATHS;

export function Icon({ name, className = "" }: { name: IconName; className?: string }) {
  return <svg className={`icon ${className}`.trim()} viewBox="0 0 24 24" aria-hidden="true">{PATHS[name]}</svg>;
}
