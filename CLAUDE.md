# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

StickScope is a browser-only, animated 3D manoeuvre trainer for RC pilots. For each figure a 3D model and both transmitter sticks move together in slow motion. Each figure also gets an at-a-glance sketch, the flight path and step-by-step instructions, in English (default) and German. Deflected control surfaces glow yellow-orange on the model, in the control schematic and in the flight-path overview (stronger = more deflection). The sticks can be switched between Mode 1 and Mode 2. Figures are sorted into three categories (beginner, advanced, pro) and chosen in a manoeuvre browser; the set of figures grows step by step.

It is a sibling of TLMscope (`../tlmscope`), a separate app with its own repository, deployment, domain, version and changelog. Only the look and feel is shared, and it is copied, not linked (see `src/theme/README.md`).

## Commands

```
npm run dev | lint | typecheck | test | build     # build = static export to out/
npx vitest run src/core/maneuvers/data.test.ts -t "name"   # one test
node scripts/make-verification.ts                  # create missing docs/verification/<figure>.md
```
Stack: Next.js 16 static export (no server code), React 19, TypeScript strict, next-intl (client provider, messages imported statically), vitest, eslint, plain CSS with tokens. This Next.js version differs from training data: check `node_modules/next/dist/docs/` before using Next APIs. Scripts run TypeScript with `node file.ts`, so imports under `src/core` use explicit `.ts` extensions.

## Correctness is the main property

- **Every instruction must be confirmed by at least two independent sources** (different authors/publishers, not copies or quotes of each other). Nothing is added from general knowledge, and gaps are never filled with something sensible. If sources contradict each other, or contradict a convention below, ask the owner; do not decide.
- Research comes first: `docs/research/<figure>.md` (sources, statements with status confirmed / single-source / conflict, open points). Sources are in `src/core/maneuvers/sources.ts`, each with an `independenceGroup`. Paraphrase only, no long quotes (public repo). Numbers (percent, degrees) appear only if sources give them.
- Levels in the data: `established` (≥2 sources from ≥2 independence groups; the only level shown as an instruction), `typical`, `guideline`, `assumption` (not shown as instructions). Phase `values` (stick travel, timing of the animation) are `guideline`: an illustration, not measured values.
- Where sources disagree the phase gets a `disputed` note, where they are silent or only one source speaks a `gap` note. Parts of the animation that sources do not confirm are listed in the figure's `illustrationNotes` and shown as "Illustration".
- Tests enforce this: ≥2 independent sources for every instruction, every source exists, all instructions are `established`, disputed notes have ≥2 groups.
- `docs/verification/<figure>.md` is for the owner's simulator checks (one checkbox line per phase).

Conventions kept in the animation (not all are confirmed by sources, see the figure's illustration notes): body axes X forward, Y up, Z right; positive roll = right wing down; pull = negative elevator = nose up; hover shown with the canopy toward the pilot; knife edge: rudder opposite to the entry roll; torque roll turns left. The propeller direction depends on the model; never state one as fact.

## Architecture

Layers: figure data (`src/core/maneuvers/`) → animation model (`state.ts`: time → position, attitude, stick values, wobble) → views (`src/render/` canvas drawing, `src/ui/` React). `src/core` has no DOM. One clock (`player.ts`) drives model, sticks and highlights, so they cannot drift apart. The Mode 1 / Mode 2 switch only changes how stick values are assigned to the two sticks (`model/sticks.ts`), never the figure data. Highlight level is computed from the deflection (`model/highlight.ts`) and shared by model, schematic and overview. Position and attitude use PCHIP, sticks smoothstep. The HTML prototype `prototype/3d-maneuvers.html` (kept locally, gitignored, not in the public repository) was the functional and visual spec only; its manoeuvre content is not data.

Runtime: `src/app/(en)` and `src/app/(de)/de` are two root layouts (`/` and `/de`, plus `/legal`) that render `src/ui/App.tsx`, a client shell with hash views (`#<figure-id>` opens a figure, `#<category>` or empty shows the browser; figure ids must not equal category ids). Settings (theme, stick mode, category, folded windows) and the hash are read through `useSyncExternalStore` stores in `src/ui/settings.ts`, so the server render uses the defaults. `Trainer.tsx` (loaded lazily, `ssr: false`) owns the single `requestAnimationFrame` loop: it draws six canvases through `src/render/*`, runs only while visible, and pushes React state only when a phase, side badge or readout string changes. Canvas colours are read from the CSS tokens via `CssColors`. The optional motor sound (`ui/motorSound.ts`, parameters in `core/model/motor.ts`) is created inside a click handler and is off on every load.

i18n JSON files are edited directly and are the only copy of the texts; keep the keys of `en.json` and `de.json` identical (`src/i18n/i18n.test.ts` checks keys, markup and that every figure/phase/instruction/note in the data has a text).

Adding a figure: see `README.md`.

## Language and wording

- **The app is bilingual: English (default) and German.** Both languages are complete for every figure, instruction, note, label; nothing ships in one language only.
- **Artefacts are English**: code, comments, docs, README, commit messages, test names. The chat with the owner is German.
- All user-facing text lives in `src/i18n/en.json` / `de.json`, never inline in components. Tests enforce identical keys, placeholders and markup, and a complete text for every figure, phase, instruction and note. Avoid the apostrophe in messages (escape character).
- Content is written natively in each language (German terms as German pilots say them; sources use "Elevator", not "Fahrstuhl"), not translated word by word. Plain language first.

## Deployment and versioning

- Public GitHub repository, own Vercel project and domain, own CSP in `vercel.json` (`'self'` only). A new external host must be added to the CSP and described in the privacy policy (`src/app/(en)/legal/page.tsx`, German and English). Operator details for the imprint live only in `src/legal/contact.ts`; a placeholder there fails a test and blocks the build. See `docs/deployment.md`.
- Live at https://stickscope.andreasknoor.com/ (Vercel, repo `andreasknoor/stickscope`, CI in `.github/workflows/ci.yml` runs lint, typecheck, test, build).
- Every push to `main` builds and deploys to production. **Push only when the request explicitly says push or deploy.** Local commits only when asked or when an approved plan includes them. For "build", "fix" or "analyse": finish the work, run checks, then ask in one line whether to deploy as X.Y.
- Bump the minor version in `package.json` with every deployed update; the major version changes only on the owner's explicit decision. Commits are titled `StickScope X.Y: …`. The version is shown small in the UI as `major.minor`.
- Every deployed version gets an entry at the top of `CHANGELOG.md`, one short sentence per new feature or fix.

## Look and feel

`src/theme/` is the single place for colours, fonts, base styles, icons and the light/dark switch. Use the CSS variables from `tokens.css`; do not hard-code colours in components (the model's teal/coral and the transmitter drawing live in `src/render/palette.ts`). Both colour schemes (light, dark, plus "system") must work; the dark variable list exists twice in `tokens.css` and both copies must stay the same. `--deflect` is StickScope's own and must stay distinguishable from good/warn/crit.

## Working rules

- Plan first, build after: the owner reviews a written plan before larger new parts.
- Do not mention or build features that were not asked for. Parked ideas and the prioritised to-do list stay in `docs/drafts/todo.md` (not committed), not in code.
- `docs/drafts/`, `prototype/` and `prototypes/` are gitignored (local only, the repository is public); `docs/research`, `docs/verification` and `docs/deployment.md` are committed.
