# Theme (copied from TLMscope)

Look and feel copied once from TLMscope 2.25 (2026-11-23): colours, fonts, base styles, line icons, light/dark switch, error boundary. It is **not** kept in sync. If TLMscope's design changes and StickScope should follow, copy the change by hand.

| File | From TLMscope | Changed |
| --- | --- | --- |
| `tokens.css` | `src/app/globals.css` (`:root` and dark lists) | removed the telemetry series colours, added `--deflect` |
| `base.css` | `src/app/globals.css` (elements, buttons, switch, card, pill, dialog, alert, meter, icon) | only the parts a trainer app needs |
| `fonts.ts` | `src/seo/RootShell.tsx` | fonts only |
| `theme.ts` | `src/ui/theme.ts` | storage key `stickscope.settings` |
| `Icon.tsx` | `src/ui/icons.tsx` | own icon set, same drawing style |
| `Brand.tsx` | `src/ui/brand.tsx` | StickScope's own mark (two sticks) plus the wordmark |
| `Meter.tsx` | `src/ui/bits.tsx` | no dependency on the analysis types |
| `ErrorBoundary.tsx` | `src/ui/ErrorBoundary.tsx` | log text |

Not copied on purpose: the TLMscope logo and icons (they identify TLMscope), the telemetry-specific styles, the analytics script.
