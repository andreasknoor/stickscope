"use client";

import { useTranslations } from "next-intl";
import { sourceById } from "../core/maneuvers/sources.ts";
import type { Maneuver, Phase } from "../core/maneuvers/types.ts";

const rich = { b: (chunks: React.ReactNode) => <b>{chunks}</b> };

/** The source list of an instruction or note: title, author, link, and when it was read. */
function SourceList({ ids }: { ids: string[] }) {
  const t = useTranslations("sources");
  return (
    <ul className="sources">
      {ids.map((id) => {
        const s = sourceById(id);
        if (!s) return null;
        return (
          <li key={id}>
            <a href={s.url} target="_blank" rel="noopener noreferrer">{s.title}</a>
            <span className="hint"> — {s.author}, {t("accessed", { date: s.accessed })}</span>
          </li>
        );
      })}
    </ul>
  );
}

/** The phase card: the current phase with its instructions, each with a confidence badge and its sources one click away. */
export function PhaseCard({ maneuver, index }: { maneuver: Maneuver; index: number }) {
  const phase: Phase = maneuver.phases[index];
  const t = useTranslations(`figures.${maneuver.id}.phases.${phase.id}`);
  const ui = useTranslations("phaseCard");
  return (
    <div className="card phasecard">
      <h2><span className="n">{index + 1}</span>{t("title")}</h2>
      <ul className="instructions" aria-label={ui("instructions")}>
        {phase.instructions.map((i) => (
          <li key={i.id}>
            <span>{t.rich(`instructions.${i.id}`, rich)}</span>
            <details className="conf">
              <summary className={`badge-level ${i.confidence.level}`}>{ui("confirmed", { count: i.confidence.sources?.length ?? 0 })}</summary>
              <SourceList ids={i.confidence.sources ?? []} />
            </details>
          </li>
        ))}
      </ul>
      {(phase.notes ?? []).map((n) => (
        <div key={n.id} className={`note ${n.kind}`}>
          <b>{ui(n.kind)}:</b> {t(`notes.${n.id}`)}
          {n.kind === "disputed" && n.sources && (
            <details className="conf">
              <summary>{ui("sources")}</summary>
              <SourceList ids={n.sources} />
            </details>
          )}
        </div>
      ))}
    </div>
  );
}

/** Notices for parts of the animation that the sources do not confirm. */
export function IllustrationNotes({ maneuver }: { maneuver: Maneuver }) {
  const t = useTranslations(`figures.${maneuver.id}.illustration`);
  const ui = useTranslations("phaseCard");
  if (!maneuver.illustrationNotes?.length) return null;
  return (
    <div className="note illustration">
      <b>{ui("illustration")}:</b>
      <ul>
        {maneuver.illustrationNotes.map((n) => <li key={n}>{t(n)}</li>)}
      </ul>
    </div>
  );
}

export function ReliabilityPanel() {
  const t = useTranslations("reliability");
  return (
    <details className="card reliability">
      <summary>{t("button")}</summary>
      <p>{t("p1")}</p>
      <p>{t("p2")}</p>
      <p>{t("p3")}</p>
      <h3>{t("legendTitle")}</h3>
      <ul>
        <li><span className="badge-level established" /> {t("legendConfirmed")}</li>
        <li><span className="badge-level disputed" /> {t("legendDisputed")}</li>
        <li><span className="badge-level gap" /> {t("legendGap")}</li>
        <li><span className="badge-level illustration" /> {t("legendIllustration")}</li>
      </ul>
    </details>
  );
}
