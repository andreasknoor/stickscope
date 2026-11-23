// Writes docs/verification/<figure>.md: one checkbox line per phase for the owner to fill in after testing.
// Run with: node scripts/make-verification.ts (only creates files that do not exist yet).
import { existsSync, writeFileSync } from "node:fs";
import { MANEUVERS } from "../src/core/maneuvers/index.ts";
import en from "../src/i18n/en.json" with { type: "json" };

const figures = en.figures as Record<string, { name: string; phases: Record<string, { title: string }> }>;

for (const m of MANEUVERS) {
  const path = new URL(`../docs/verification/${m.id}.md`, import.meta.url);
  if (existsSync(path)) continue;
  const f = figures[m.id];
  const lines = [
    `# Verification: ${f.name}`,
    "",
    "Fill in after testing in aerofly RC 10 and against independent sources. Mark one box per phase. See `docs/research/" + m.id + ".md` for the sources behind each instruction.",
    "",
    "Tested model / simulator / date: ",
    "",
    ...m.phases.flatMap((p, i) => [
      `## ${i + 1} ${f.phases[p.id].title}`,
      "",
      "- [ ] verified in simulator",
      "- [ ] matches source",
      "- [ ] wrong",
      "",
      "Notes: ",
      "",
    ]),
  ];
  writeFileSync(path, lines.join("\n"));
  console.log("wrote", m.id);
}
