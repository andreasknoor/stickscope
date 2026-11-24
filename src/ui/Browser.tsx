"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { CATEGORIES } from "../core/maneuvers/categories.ts";
import { inCategory } from "../core/maneuvers/index.ts";
import type { Category, Maneuver } from "../core/maneuvers/types.ts";
import { CssColors, watchColorScheme } from "../render/canvas.ts";
import { drawStrip } from "../render/strip.ts";
import { Icon, type IconName } from "../theme/Icon.tsx";

const CATEGORY_ICON: Record<Category, IconName> = { beginner: "level1", advanced: "level2", pro: "level3", motorglider: "glider" };

/** A small version of "The figure at a glance": the model drawn along the flight path. */
function Thumb({ maneuver }: { maneuver: Maneuver }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const colors = new CssColors();
    const draw = () => drawStrip(cv, maneuver, 0, colors, "", 0, true);
    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(cv);
    const stop = watchColorScheme(() => {
      colors.reset();
      draw();
    });
    return () => {
      ro.disconnect();
      stop();
      colors.dispose();
    };
  }, [maneuver]);
  return (
    <div className="thumb">
      <canvas ref={ref} aria-hidden="true" />
    </div>
  );
}

/** The manoeuvre browser: choose a category, then a figure. */
export function Browser({ category, onCategory }: { category: Category; onCategory: (c: Category) => void }) {
  const t = useTranslations();
  const figures = inCategory(category);
  return (
    <section aria-labelledby="browser-title">
      <div className="sectionhead">
        <h2 id="browser-title">{t("browser.title")}</h2>
      </div>
      <div className="seg" role="group" aria-label={t("browser.categories")}>
        {CATEGORIES.map((c) => (
          <button key={c} aria-pressed={c === category} onClick={() => onCategory(c)}>
            <Icon name={CATEGORY_ICON[c]} /> {t(`categories.${c}.name`)} <span className="num">({inCategory(c).length})</span>
          </button>
        ))}
      </div>
      <p className="hint catdesc">{t(`categories.${category}.description`)} · {t("browser.count", { count: figures.length })}</p>
      {category === "motorglider" && <p className="note gap">{t("categories.motorglider.notice")}</p>}
      {figures.length === 0 ? (
        <p className="card">{t("browser.empty")}</p>
      ) : (
        <ul className="cards">
          {figures.map((m) => (
            <li key={m.id}>
              <a className="card figure-card" href={`#${m.id}`}>
                <h3>{t(`figures.${m.id}.name`)} <Icon name="arrow" className="go" /></h3>
                <Thumb maneuver={m} />
                <p className="hint">{t(`figures.${m.id}.idea`)}</p>
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
