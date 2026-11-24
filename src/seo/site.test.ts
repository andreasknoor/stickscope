import { describe, expect, it } from "vitest";
import de from "../i18n/de.json";
import en from "../i18n/en.json";
import { FAQ_IDS, HOME_META, LANGS, languageAlternates, pathOf, SITEMAP } from "./site.ts";

describe("site", () => {
  it("has a sitemap entry for every page in both languages, without duplicates", () => {
    const paths = SITEMAP.map((p) => p.path);
    expect(new Set(paths).size).toBe(paths.length);
    expect(paths).toEqual(expect.arrayContaining(["/", "/de", "/faq", "/de/faq", "/legal", "/de/legal"]));
    for (const p of paths) expect(p.startsWith("/")).toBe(true);
  });

  it("points the language alternatives at both languages and uses English as default", () => {
    expect(languageAlternates("faq")).toEqual({ en: "/faq", de: "/de/faq", "x-default": "/faq" });
    expect(LANGS.map((l) => pathOf(l))).toEqual(["/", "/de"]);
  });

  it("has a title, description and preview line in both languages, with a description of sensible length", () => {
    for (const l of LANGS) {
      const m = HOME_META[l];
      expect(m.title.length).toBeGreaterThan(10);
      expect(m.description.length).toBeGreaterThan(60);
      expect(m.description.length).toBeLessThanOrEqual(170);
      expect(m.tagline).toBeTruthy();
    }
  });

  it("has a question and an answer in both languages for every FAQ entry", () => {
    for (const [lang, m] of [["en", en], ["de", de]] as const) {
      const items = m.faq.items as Record<string, { q: string; a: string }>;
      for (const id of FAQ_IDS) {
        expect(items[id]?.q, `${lang}.${id}.q`).toBeTruthy();
        expect(items[id]?.a, `${lang}.${id}.a`).toBeTruthy();
      }
      expect(Object.keys(items).sort()).toEqual([...FAQ_IDS].sort());
    }
  });
});
