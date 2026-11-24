import { describe, expect, it } from "vitest";
import { LANG_SCRIPT } from "./langRedirect.ts";

/** Runs the script against a fake page and returns where it redirected to (null = stayed). */
function run(opts: { lang: "en" | "de"; path: string; saved?: unknown; browser?: string; hash?: string }): string | null {
  let target: string | null = null;
  const document = { documentElement: { lang: opts.lang } };
  const location = { pathname: opts.path, search: "", hash: opts.hash ?? "", replace: (u: string) => { target = u; } };
  const localStorage = { getItem: () => (opts.saved === undefined ? null : JSON.stringify({ lang: opts.saved })) };
  const navigator = { languages: [opts.browser ?? "en-US"], language: opts.browser ?? "en-US" };
  new Function("document", "location", "localStorage", "navigator", LANG_SCRIPT)(document, location, localStorage, navigator);
  return target;
}

describe("language redirect", () => {
  it("sends a German browser from the English home page to /de, keeping the hash", () => {
    expect(run({ lang: "en", path: "/", browser: "de-DE" })).toBe("/de");
    expect(run({ lang: "en", path: "/", browser: "de-AT", hash: "#hover" })).toBe("/de#hover");
  });

  it("leaves other browsers and other pages alone when nothing was chosen", () => {
    expect(run({ lang: "en", path: "/", browser: "fr-FR" })).toBeNull();
    expect(run({ lang: "en", path: "/faq", browser: "de-DE" })).toBeNull();
    expect(run({ lang: "de", path: "/de", browser: "en-US" })).toBeNull();
    expect(run({ lang: "de", path: "/de/legal", browser: "en-GB" })).toBeNull();
  });

  it("follows an explicit choice on every page, in both directions", () => {
    expect(run({ lang: "en", path: "/", saved: "de" })).toBe("/de");
    expect(run({ lang: "en", path: "/faq", saved: "de" })).toBe("/de/faq");
    expect(run({ lang: "en", path: "/legal", saved: "de", hash: "#x" })).toBe("/de/legal#x");
    expect(run({ lang: "de", path: "/de", saved: "en" })).toBe("/");
    expect(run({ lang: "de", path: "/de/faq", saved: "en" })).toBe("/faq");
  });

  it("does not redirect when the page already has the chosen language", () => {
    expect(run({ lang: "en", path: "/", saved: "en", browser: "de-DE" })).toBeNull();
    expect(run({ lang: "de", path: "/de", saved: "de", browser: "en-US" })).toBeNull();
  });

  it("ignores a broken saved value", () => {
    expect(run({ lang: "en", path: "/", saved: "xx", browser: "en-US" })).toBeNull();
    expect(run({ lang: "en", path: "/", saved: "xx", browser: "de-DE" })).toBe("/de");
  });
});
