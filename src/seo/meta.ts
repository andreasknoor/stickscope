import type { Metadata, Viewport } from "next";
import { languageAlternates, pathOf, SITE_NAME, SITE_URL, type Lang, type PageId } from "./site.ts";

const PREVIEW_ALT: Record<Lang, string> = {
  en: "StickScope: logo and name above a looping flight path and two transmitter sticks.",
  de: "StickScope: Logo und Name über einem Loop-Flugweg und zwei Senderknüppeln.",
};

/** Shared by both language root layouts. */
export const baseMetadata: Metadata = { metadataBase: new URL(SITE_URL), applicationName: SITE_NAME };

export const sharedViewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#151f25" },
  ],
};

/**
 * Metadata of a page: title and description, the canonical address, the language alternatives (hreflang)
 * and what link previews (Open Graph, X) show. The preview image is a plain file per language
 * (app/og-en.png, app/og-de.png), named here so every page has it.
 */
export function buildMetadata({ lang, id, title, description }: { lang: Lang; id?: PageId; title: string; description: string }): Metadata {
  const path = pathOf(lang, id);
  const image = { url: lang === "de" ? "/og-de.png" : "/og-en.png", width: 1200, height: 630, alt: PREVIEW_ALT[lang] };
  return {
    title,
    description,
    alternates: { canonical: path, languages: languageAlternates(id) },
    openGraph: {
      type: "website",
      url: path,
      siteName: SITE_NAME,
      title,
      description,
      locale: lang === "de" ? "de_DE" : "en_US",
      alternateLocale: [lang === "de" ? "en_US" : "de_DE"],
      images: [image],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}
