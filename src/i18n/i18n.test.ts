import { describe, expect, it } from "vitest";
import { MANEUVERS } from "../core/maneuvers/index.ts";
import { CATEGORIES } from "../core/maneuvers/categories.ts";
import de from "./de.json";
import en from "./en.json";

/** All message keys, so both languages stay in step. */
function keys(o: unknown, prefix = ""): string[] {
  if (o && typeof o === "object") return Object.entries(o).flatMap(([k, v]) => keys(v, prefix ? `${prefix}.${k}` : k));
  return [prefix];
}
const flat = (o: Record<string, unknown>, p = ""): [string, string][] =>
  Object.entries(o).flatMap(([k, v]) => (typeof v === "string" ? [[p + k, v] as [string, string]] : v && typeof v === "object" ? flat(v as Record<string, unknown>, `${p}${k}.`) : []));

describe("translations", () => {
  it("have the same keys in English and German", () => {
    expect(keys(de).sort()).toEqual(keys(en).sort());
  });

  it("have no empty texts", () => {
    for (const [k, v] of [...flat(en), ...flat(de)]) expect(v.trim(), k).not.toBe("");
  });

  it("use the same placeholders in both languages", () => {
    // Placeholders, not plural branches such as "one {# figure}".
    const placeholders = (s: string) => [...s.matchAll(/(?<!(?:one|other|zero|two|few|many|=\d+)\s)\{(\w+)/g)].map((m) => m[1]).sort();
    const deMap = new Map(flat(de));
    for (const [k, v] of flat(en)) expect(placeholders(deMap.get(k) ?? ""), k).toEqual(placeholders(v));
  });

  it("use the same markup in both languages, and only the bold tag", () => {
    const tags = (s: string) => [...s.matchAll(/<(\/?\w+)>/g)].map((m) => m[1]).sort();
    const deMap = new Map(flat(de));
    for (const [k, v] of flat(en)) {
      expect(tags(deMap.get(k) ?? ""), k).toEqual(tags(v));
      for (const tag of tags(v)) expect(["b", "/b"], `${k}: <${tag}>`).toContain(tag);
    }
  });

  it("avoid the apostrophe, which is an escape character in message syntax", () => {
    for (const [k, v] of [...flat(en), ...flat(de)]) expect(v, k).not.toContain("'");
  });
});

describe("content texts", () => {
  const msgs = { en, de } as unknown as Record<"en" | "de", { figures: Record<string, any>; categories: Record<string, any> }>; // eslint-disable-line @typescript-eslint/no-explicit-any
  for (const lang of ["en", "de"] as const) {
    it(`has a complete ${lang} text for every figure, phase, instruction, note and category`, () => {
      for (const c of CATEGORIES) {
        expect(msgs[lang].categories[c]?.name, `category ${c}`).toBeTruthy();
        expect(msgs[lang].categories[c]?.description, `category ${c}`).toBeTruthy();
      }
      for (const m of MANEUVERS) {
        const f = msgs[lang].figures[m.id];
        expect(f?.name, `${m.id}.name`).toBeTruthy();
        expect(f?.idea, `${m.id}.idea`).toBeTruthy();
        for (const n of m.illustrationNotes ?? []) expect(f?.illustration?.[n], `${m.id}.illustration.${n}`).toBeTruthy();
        for (const p of m.phases) {
          const t = f?.phases?.[p.id];
          expect(t?.title, `${m.id}.${p.id}.title`).toBeTruthy();
          for (const i of p.instructions) expect(t?.instructions?.[i.id], `${m.id}.${p.id}.${i.id}`).toBeTruthy();
          for (const n of p.notes ?? []) expect(t?.notes?.[n.id], `${m.id}.${p.id}.note.${n.id}`).toBeTruthy();
        }
      }
    });
    it(`has no ${lang} text without a matching entry in the data`, () => {
      for (const [id, f] of Object.entries(msgs[lang].figures)) {
        const m = MANEUVERS.find((x) => x.id === id);
        expect(m, `figure ${id}`).toBeDefined();
        for (const n of Object.keys(f.illustration ?? {})) expect(m!.illustrationNotes, `${id}.illustration.${n}`).toContain(n);
        for (const [pid, pt] of Object.entries<any>(f.phases)) { // eslint-disable-line @typescript-eslint/no-explicit-any
          const p = m!.phases.find((x) => x.id === pid);
          expect(p, `${id}.${pid}`).toBeDefined();
          for (const iid of Object.keys(pt.instructions)) expect(p!.instructions.map((x) => x.id), `${id}.${pid}.${iid}`).toContain(iid);
          for (const nid of Object.keys(pt.notes ?? {})) expect((p!.notes ?? []).map((x) => x.id), `${id}.${pid}.note.${nid}`).toContain(nid);
        }
      }
    });
  }
});
