"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { Icon } from "../theme/Icon.tsx";
import { THEMES, type Theme } from "../theme/theme.ts";
import { settingsDialog, settingsStore } from "./settings.ts";

/** The settings: language, colour scheme and stick mode. A modal dialog, opened by the header gear (or the stick-mode label). */
export function SettingsDialog({ lang, hash }: { lang: "en" | "de"; hash: string }) {
  const t = useTranslations();
  const ref = useRef<HTMLDialogElement>(null);
  const open = useSyncExternalStore(settingsDialog.subscribe, settingsDialog.getSnapshot, settingsDialog.getServerSnapshot);
  const settings = useSyncExternalStore(settingsStore.subscribe, settingsStore.getSnapshot, settingsStore.getServerSnapshot);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const other = lang === "en" ? "/de" : "/";
  return (
    <dialog ref={ref} className="helpdlg setdlg" aria-labelledby="setdlg-title" onClose={() => settingsDialog.set(false)}
      onClick={(e) => { if (e.target === e.currentTarget) settingsDialog.set(false); }}>
      <div className="hd">
        <h2 id="setdlg-title">{t("settings.title")}</h2>
        <button className="btn sm" onClick={() => settingsDialog.set(false)} aria-label={t("settings.close")}><Icon name="x" /></button>
      </div>
      <div className="bd">
        <div className="setrow">
          <span id="set-lang">{t("settings.language")}</span>
          <div className="seg" role="group" aria-labelledby="set-lang">
            {lang === "en" ? <button aria-pressed="true" lang="en">{t("settings.english")}</button> : <a className="segitem" href={`${other}${hash}`} hrefLang="en" lang="en">{t("settings.english")}</a>}
            {lang === "de" ? <button aria-pressed="true" lang="de">{t("settings.german")}</button> : <a className="segitem" href={`${other}${hash}`} hrefLang="de" lang="de">{t("settings.german")}</a>}
          </div>
        </div>
        <div className="setrow">
          <span id="set-theme">{t("settings.theme")}</span>
          <div className="seg" role="group" aria-labelledby="set-theme">
            {THEMES.map((th: Theme) => (
              <button key={th} aria-pressed={settings.theme === th} onClick={() => settingsStore.update({ theme: th })}>
                {t(`header.theme${th[0].toUpperCase()}${th.slice(1)}`)}
              </button>
            ))}
          </div>
        </div>
        <div className="setrow">
          <span id="set-mode">{t("settings.mode")}</span>
          <div className="seg" role="group" aria-labelledby="set-mode">
            <button aria-pressed={settings.mode === 2} onClick={() => settingsStore.update({ mode: 2 })}>{t("transmitter.mode2")}</button>
            <button aria-pressed={settings.mode === 1} onClick={() => settingsStore.update({ mode: 1 })}>{t("transmitter.mode1")}</button>
          </div>
        </div>
        <p className="hint">{t("settings.modeHint")}</p>
      </div>
    </dialog>
  );
}
