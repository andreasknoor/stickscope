"use client";

import { NextIntlClientProvider, useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { useEffect, useSyncExternalStore } from "react";
import { CATEGORIES } from "../core/maneuvers/categories.ts";
import { getManeuver, inCategory } from "../core/maneuvers/index.ts";
import type { Category } from "../core/maneuvers/types.ts";
import type { Mode } from "../core/model/sticks.ts";
import { ErrorBoundary } from "../theme/ErrorBoundary.tsx";
import { Wordmark } from "../theme/Brand.tsx";
import { applyTheme, THEMES, type Theme } from "../theme/theme.ts";
import de from "../i18n/de.json";
import en from "../i18n/en.json";
import { Browser } from "./Browser.tsx";
import { ReliabilityPanel } from "./Instructions.tsx";
import { OPERATOR, REPO_URL } from "../legal/contact.ts";
import { hashStore, settingsStore } from "./settings.ts";

// The animation parts are heavy: load them after the page shell has painted.
const Trainer = dynamic(() => import("./Trainer.tsx").then((m) => m.Trainer), { ssr: false, loading: () => <div className="card" aria-busy="true">…</div> });

const MESSAGES = { en, de };
type Lang = "en" | "de";

/** What the hash selects: a figure, a category (the browser) or nothing (the browser). */
function parseHash(hash: string): { figure: string | null; category: Category | null } {
  const id = hash.replace(/^#/, "");
  if (getManeuver(id)) return { figure: id, category: null };
  const c = CATEGORIES.find((x) => x === id);
  return { figure: null, category: c ?? null };
}

function Shell({ lang }: { lang: Lang }) {
  const t = useTranslations();
  const settings = useSyncExternalStore(settingsStore.subscribe, settingsStore.getSnapshot, settingsStore.getServerSnapshot);
  const hash = useSyncExternalStore(hashStore.subscribe, hashStore.getSnapshot, hashStore.getServerSnapshot);
  const update = settingsStore.update;

  // The theme script in <head> already applied the saved scheme; keep <html> in step when it changes.
  useEffect(() => applyTheme(settings.theme), [settings.theme]);

  const { figure, category: hashCategory } = parseHash(hash);
  const maneuver = figure ? getManeuver(figure) ?? null : null;
  const category: Category = hashCategory ?? maneuver?.category ?? settings.category;

  useEffect(() => {
    document.title = maneuver ? `${t(`figures.${maneuver.id}.name`)} – ${t("app.title")}` : `${t("app.title")} – ${t("app.subtitle")}`;
  }, [maneuver, t]);

  const siblings = maneuver ? inCategory(maneuver.category) : [];
  const index = maneuver ? siblings.findIndex((m) => m.id === maneuver.id) : -1;
  const prev = index > 0 ? siblings[index - 1] : null;
  const next = index >= 0 && index < siblings.length - 1 ? siblings[index + 1] : null;
  const otherPath = lang === "en" ? "/de" : "/";

  return (
    <>
      <header className="top">
        <a className="brand" href={`#${maneuver ? maneuver.category : ""}`}><Wordmark /></a>
        <small className="ver num">v{process.env.NEXT_PUBLIC_APP_VERSION ?? "dev"}</small>
        <span className="tagline">{t("app.subtitle")}</span>
        <span className="spacer" />
        <div className="controls">
          <div className="seg" role="group" aria-label={t("header.theme")}>
            {THEMES.map((th: Theme) => (
              <button key={th} aria-pressed={settings.theme === th} onClick={() => update({ theme: th })}>
                {t(`header.theme${th[0].toUpperCase()}${th.slice(1)}`)}
              </button>
            ))}
          </div>
          <a className="btn sm" href={`${otherPath}${hash}`} hrefLang={lang === "en" ? "de" : "en"} lang={lang === "en" ? "de" : "en"} aria-label={t("header.language")}>{t("header.otherLanguage")}</a>
        </div>
      </header>
      <main className="wrap">
        {maneuver ? (
          <>
            <p className="intro">{t("app.intro")}</p>
            <nav className="figurenav" aria-label={t("browser.title")}>
              <a className="btn sm" href={`#${maneuver.category}`}>← {t("browser.back")}</a>
              <span className="spacer" />
              {prev && <a className="btn sm" href={`#${prev.id}`}>← {t(`figures.${prev.id}.name`)}</a>}
              {next && <a className="btn sm" href={`#${next.id}`}>{t(`figures.${next.id}.name`)} →</a>}
            </nav>
            <div className="sectionhead">
              <h1>{t(`figures.${maneuver.id}.name`)}</h1>
              <span className="pill">{t(`categories.${maneuver.category}.name`)}</span>
            </div>
            <ErrorBoundary resetKey={maneuver.id} fallback={(reset) => <div className="alert"><button className="btn" onClick={reset}>{t("browser.back")}</button></div>}>
              <Trainer maneuver={maneuver} mode={settings.mode as Mode} onMode={(m) => update({ mode: m })} />
            </ErrorBoundary>
          </>
        ) : (
          <Browser category={category} onCategory={(c) => { update({ category: c }); location.hash = c; }} />
        )}
        {maneuver && (
          <>
            <ReliabilityPanel />
            <p className="foot">{t("footer.colours")}</p>
          </>
        )}
      </main>
      <footer className="sitefoot">
        <span>{t("app.title")} {t("footer.by", { name: OPERATOR.name })}</span>
        <a href={REPO_URL} target="_blank" rel="noopener noreferrer">{t("footer.source")}</a>
        <a href={`/legal#${lang}`}>{t("footer.legal")}</a>
      </footer>
    </>
  );
}

export function App({ lang }: { lang: Lang }) {
  return (
    <NextIntlClientProvider locale={lang} messages={MESSAGES[lang]} timeZone="UTC">
      <Shell lang={lang} />
    </NextIntlClientProvider>
  );
}
