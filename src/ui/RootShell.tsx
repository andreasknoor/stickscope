import "../theme/tokens.css";
import "../theme/base.css";
import "./app.css";
import { fontClasses } from "../theme/fonts.ts";
import { THEME_SCRIPT } from "../theme/theme.ts";
import { LANG_SCRIPT } from "./langRedirect.ts";

/** The <html> element of a language. English and German pages are separate root layouts, so each has the right `lang`. */
export function RootShell({ lang, children }: { lang: "en" | "de"; children: React.ReactNode }) {
  return (
    // The theme script sets data-theme on <html> before React hydrates, hence suppressHydrationWarning.
    <html lang={lang} className={fontClasses} suppressHydrationWarning>
      <body>
        {/* First in <body>: a saved light or dark choice never flashes the other scheme. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        {/* Then the language: a saved choice (or a German browser on the home page) redirects before anything shows. */}
        <script dangerouslySetInnerHTML={{ __html: LANG_SCRIPT }} />
        {children}
      </body>
    </html>
  );
}
