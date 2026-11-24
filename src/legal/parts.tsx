import type { ReactNode } from "react";
import { OPERATOR } from "./contact.ts";

export const ext = (href: string, text: ReactNode = href) => <a href={href} target="_blank" rel="noopener noreferrer">{text}</a>;
export const mail = <a href={`mailto:${OPERATOR.email}`}>{OPERATOR.email}</a>;
export const address = (lang: "de" | "en") => (
  <p>
    {OPERATOR.name}<br />
    {OPERATOR.street}<br />
    {OPERATOR.city}<br />
    {OPERATOR.country[lang]}
  </p>
);
