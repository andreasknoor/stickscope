import Link from "next/link";
import de from "../i18n/de.json";
import en from "../i18n/en.json";
import { JsonLd } from "./JsonLd.tsx";
import { FAQ_IDS, pathOf, type Lang } from "./site.ts";

const MESSAGES = { en, de };

/** The FAQ page of a language: questions and answers from the message files, plus FAQPage structured data. */
export function FaqPage({ lang }: { lang: Lang }) {
  const m = MESSAGES[lang];
  const items = FAQ_IDS.map((id) => ({ id, ...m.faq.items[id] }));
  return (
    <main className="legal wrap">
      <p><Link href={pathOf(lang)}>← {m.faq.back}</Link> · <Link href={pathOf(lang === "en" ? "de" : "en", "faq")} hrefLang={lang === "en" ? "de" : "en"} lang={lang === "en" ? "de" : "en"}>{lang === "en" ? "Deutsch" : "English"}</Link></p>
      <h1>{m.faq.title}</h1>
      {items.map((it) => (
        <section key={it.id} id={it.id}>
          <h2>{it.q}</h2>
          <p>{it.a}</p>
        </section>
      ))}
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        inLanguage: lang,
        mainEntity: items.map((it) => ({ "@type": "Question", name: it.q, acceptedAnswer: { "@type": "Answer", text: it.a } })),
      }} />
    </main>
  );
}
