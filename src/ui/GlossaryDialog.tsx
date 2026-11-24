"use client";

import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { GLOSSARY, GLOSSARY_GROUPS, type GlossaryGroup } from "../core/glossary.ts";
import { Icon } from "../theme/Icon.tsx";
import { glossaryDialog } from "./glossaryStore.ts";

const plain = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** The glossary: every term with a short explanation, searchable, in four groups. Opened by the header button or from a term in a text. */
export function GlossaryDialog({ lang }: { lang: "en" | "de" }) {
  const t = useTranslations("glossary");
  const ref = useRef<HTMLDialogElement>(null);
  const state = useSyncExternalStore(glossaryDialog.subscribe, glossaryDialog.getSnapshot, glossaryDialog.getServerSnapshot);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (state.open && !d.open) d.showModal();
    if (!state.open && d.open) d.close();
  }, [state.open]);

  return (
    <dialog ref={ref} className="helpdlg glodlg" aria-labelledby="glodlg-title" onClose={() => glossaryDialog.close()}
      onClick={(e) => { if (e.target === e.currentTarget) glossaryDialog.close(); }}>
      {state.open && <GlossaryBody key={state.nonce} lang={lang} first={state.term} t={t} />}
    </dialog>
  );
}

function GlossaryBody({ lang, first, t }: { lang: "en" | "de"; first: string | null; t: ReturnType<typeof useTranslations> }) {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<"all" | GlossaryGroup>("all");
  const listRef = useRef<HTMLDivElement>(null);

  const entries = useMemo(
    () => GLOSSARY.map((g) => ({ ...g, name: t(`terms.${g.id}.name`), text: t(`terms.${g.id}.text`) }))
      .sort((a, b) => a.name.localeCompare(b.name, lang)),
    [t, lang],
  );
  const q = plain(query.trim());
  const shown = entries.filter((e) => (group === "all" || e.group === group) && (!q || plain(e.name).includes(q) || plain(e.text).includes(q)));
  const nameOf = (id: string) => entries.find((e) => e.id === id)?.name ?? id;

  const scrollTo = (id: string) => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-term="${id}"]`);
    if (!el) return;
    el.scrollIntoView({ block: "start" });
    el.classList.add("flash");
    setTimeout(() => el.classList.remove("flash"), 1600);
  };
  // Opened from a term in a text: jump to that term once the dialog is on screen.
  useEffect(() => {
    if (!first) return;
    const id = setTimeout(() => scrollTo(first), 60);
    return () => clearTimeout(id);
  }, [first]);

  const jump = (id: string) => {
    setQuery("");
    setGroup("all");
    setTimeout(() => scrollTo(id), 30);
  };

  return (
    <>
      <div className="hd glohd">
        <div className="glotop">
          <h2 id="glodlg-title">{t("title")}</h2>
          <button className="btn sm" onClick={() => glossaryDialog.close()} aria-label={t("close")}><Icon name="x" /></button>
        </div>
        <input type="search" className="glosearch" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("search")} aria-label={t("search")} />
        <div className="seg glogroups" role="group">
          <button aria-pressed={group === "all"} onClick={() => setGroup("all")}>{t("all")}</button>
          {GLOSSARY_GROUPS.map((g) => (
            <button key={g} aria-pressed={group === g} onClick={() => setGroup(g)}>{t(`groups.${g}`)}</button>
          ))}
        </div>
      </div>
      <div className="bd" ref={listRef}>
        <p className="hint">{t("intro")} {t("note")}</p>
        {shown.length === 0 && <p>{t("empty")}</p>}
        {GLOSSARY_GROUPS.map((g) => {
          const list = shown.filter((e) => e.group === g);
          if (!list.length) return null;
          return (
            <section key={g} className="glogroup">
              <h3>{t(`groups.${g}`)} <span className="hint">{t("count", { count: list.length })}</span></h3>
              {list.map((e) => (
                <article key={e.id} className="gloterm" data-term={e.id}>
                  <h4>{e.name}</h4>
                  <p>{e.text}</p>
                  {e.see.length > 0 && (
                    <p className="glosee hint">{t("seeAlso")}: {e.see.map((s, i) => (
                      <span key={s}>{i > 0 && ", "}<button type="button" className="gloref" onClick={() => jump(s)}>{nameOf(s)}</button></span>
                    ))}</p>
                  )}
                </article>
              ))}
            </section>
          );
        })}
      </div>
    </>
  );
}
