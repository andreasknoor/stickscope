"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type { Lang } from "../seo/site.ts";
import { settingsStore } from "./settings.ts";

/** A link to the other language version of a page. It saves the choice first; otherwise the redirect would bring the visitor back. */
export function LangLink({ to, href, children }: { to: Lang; href: string; children: ReactNode }) {
  return <Link href={href} hrefLang={to} lang={to} onClick={() => settingsStore.update({ lang: to })}>{children}</Link>;
}
