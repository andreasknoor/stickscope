import { describe, expect, it } from "vitest";
import de from "../i18n/de.json";
import en from "../i18n/en.json";
import { GLOSSARY, GLOSSARY_GROUPS, GLOSSARY_IDS } from "./glossary.ts";

type Entry = { name: string; text: string };
const terms = { en: en.glossary.terms as Record<string, Entry>, de: de.glossary.terms as Record<string, Entry> };

describe("glossary", () => {
  it("has unique term ids and known groups", () => {
    expect(new Set(GLOSSARY_IDS).size).toBe(GLOSSARY_IDS.length);
    for (const t of GLOSSARY) expect(GLOSSARY_GROUPS, t.id).toContain(t.group);
  });

  it("has a name and an explanation in both languages for every term, and no text without a term", () => {
    for (const lang of ["en", "de"] as const) {
      expect(Object.keys(terms[lang]).sort()).toEqual([...GLOSSARY_IDS].sort());
      for (const id of GLOSSARY_IDS) {
        expect(terms[lang][id].name.trim(), `${lang}.${id}.name`).not.toBe("");
        expect(terms[lang][id].text.trim(), `${lang}.${id}.text`).not.toBe("");
      }
    }
    for (const g of GLOSSARY_GROUPS) {
      expect(en.glossary.groups[g]).toBeTruthy();
      expect(de.glossary.groups[g]).toBeTruthy();
    }
  });

  it("points only to terms that exist", () => {
    for (const t of GLOSSARY) for (const s of t.see) expect(GLOSSARY_IDS, `${t.id} -> ${s}`).toContain(s);
  });

  it("shows the English term in brackets after every German name, unless the name is the English one", () => {
    for (const id of GLOSSARY_IDS) {
      const deName = terms.de[id].name;
      const enName = terms.en[id].name;
      const same = deName.toLowerCase() === enName.toLowerCase();
      expect(same || /\([^)]+\)\s*$/.test(deName), `${id}: ${deName}`).toBe(true);
    }
  });
});
