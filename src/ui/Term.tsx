"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useSyncExternalStore, type ReactNode } from "react";
import { GLOSSARY_IDS } from "../core/glossary.ts";
import { glossaryDialog, termPopover } from "./glossaryStore.ts";

/** A word in a text that has a glossary entry: tapping it opens the explanation. */
function Term({ id, children }: { id: string; children: ReactNode }) {
  return (
    <button type="button" className="term" aria-haspopup="dialog" onClick={(e) => termPopover.toggle(id, e.currentTarget.getBoundingClientRect())}>
      {children}
    </button>
  );
}

/** Handlers for `t.rich`: the bold tag and one tag per glossary term (for example `<aileron>aileron</aileron>`). */
export const rich: Record<string, (chunks: ReactNode) => ReactNode> = {
  b: (chunks) => <b>{chunks}</b>,
  ...Object.fromEntries(GLOSSARY_IDS.map((id) => [id, (chunks: ReactNode) => <Term id={id}>{chunks}</Term>])),
};

/** The explanation of the tapped term, as a small card next to the word. One instance for the whole page. */
export function TermPopover() {
  const t = useTranslations("glossary");
  const state = useSyncExternalStore(termPopover.subscribe, termPopover.getSnapshot, termPopover.getServerSnapshot);
  const ref = useRef<HTMLDivElement>(null);
  const open = state !== null;

  useEffect(() => {
    if (!open) return;
    const close = () => termPopover.close();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    const onDown = (e: PointerEvent) => {
      const el = e.target as Element;
      if (!ref.current?.contains(el) && !el.closest(".term")) close();
    };
    addEventListener("keydown", onKey);
    addEventListener("pointerdown", onDown);
    addEventListener("scroll", close, true);
    addEventListener("resize", close);
    return () => {
      removeEventListener("keydown", onKey);
      removeEventListener("pointerdown", onDown);
      removeEventListener("scroll", close, true);
      removeEventListener("resize", close);
    };
  }, [open]);

  if (!state) return null;
  const width = Math.min(340, innerWidth - 24);
  const left = Math.max(12, Math.min(state.rect.left, innerWidth - width - 12));
  const above = state.rect.bottom > innerHeight * 0.62;
  const style = above ? { left, width, bottom: innerHeight - state.rect.top + 8 } : { left, width, top: state.rect.bottom + 8 };
  return (
    <div ref={ref} className="termpop" role="dialog" aria-label={t(`terms.${state.id}.name`)} style={style}>
      <b>{t(`terms.${state.id}.name`)}</b>
      <p>{t(`terms.${state.id}.text`)}</p>
      <button type="button" className="btn sm" onClick={() => { termPopover.close(); glossaryDialog.open(state.id); }}>{t("more")}</button>
    </div>
  );
}
