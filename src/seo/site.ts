/** The one place for what search engines and link previews are told about the site. */
export const SITE_URL = "https://stickscope.andreasknoor.com";
export const SITE_NAME = "StickScope";

export type Lang = "en" | "de";
export const LANGS: Lang[] = ["en", "de"];
/** Pages that exist in both languages. `undefined` is the home page. */
export type PageId = "faq" | "legal";
export const PAGE_IDS: PageId[] = ["faq", "legal"];

export const absolute = (path: string) => new URL(path, SITE_URL).toString();

export function pathOf(lang: Lang, id?: PageId): string {
  if (lang === "en") return id ? `/${id}` : "/";
  return id ? `/de/${id}` : "/de";
}

/** hreflang alternatives of a page; English is the default. */
export const languageAlternates = (id?: PageId): Record<string, string> => ({
  en: pathOf("en", id),
  de: pathOf("de", id),
  "x-default": pathOf("en", id),
});

/** Home page texts. `title` is the search result title, `tagline` the line under the name in the link preview. */
export const HOME_META: Record<Lang, { title: string; description: string; tagline: string }> = {
  en: {
    title: "StickScope – 3D manoeuvre trainer for RC pilots",
    description: "An animated 3D manoeuvre trainer for RC pilots: the model and both transmitter sticks move together in slow motion. Free, in your browser.",
    tagline: "3D manoeuvre trainer for RC pilots",
  },
  de: {
    title: "StickScope – 3D-Figurentrainer für RC-Piloten",
    description: "Ein animierter 3D-Figurentrainer für RC-Piloten: Modell und beide Senderknüppel bewegen sich gemeinsam in Zeitlupe. Kostenlos, im Browser.",
    tagline: "3D-Figurentrainer für RC-Piloten",
  },
};

/** Pages for the sitemap: every page in both languages, with the language alternatives. */
export const SITEMAP: { path: string; alternates: Record<Lang, string> }[] = [undefined, ...PAGE_IDS].flatMap((id) =>
  LANGS.map((lang) => ({ path: pathOf(lang, id), alternates: { en: pathOf("en", id), de: pathOf("de", id) } })),
);

/** Questions of the FAQ page, in display order. The texts are in `faq.items.<id>` of en.json and de.json. */
export const FAQ_IDS = ["what", "sources", "real", "glow", "mode", "simulator", "phone", "sound", "privacy", "more", "mistake"] as const;
