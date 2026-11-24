import { PRIVACY_DATE } from "./contact.ts";
import { address, ext, mail } from "./parts.tsx";

/** English translation of the legal notice and privacy policy, for convenience; the German version is binding. */
export function LegalEn() {
  return (
    <>
      <h1>Legal notice</h1>
      <p className="hint">Translation for convenience; the German version is binding.</p>
      <h2>Information according to § 5 DDG</h2>
      {address("en")}
      <h2>Contact</h2>
      <p>E-mail: {mail}</p>
      <p>StickScope is a private, non-commercial project.</p>

      <h1>Privacy policy</h1>
      <h2>1. Controller</h2>
      {address("en")}
      <p>E-mail: {mail}</p>

      <h2>2. What the app does</h2>
      <p>
        StickScope runs entirely in your browser. There is no account, there are no cookies, no visitor counting and no analytics services.
        The app does not send anything you do to me or anyone else.
      </p>

      <h2>3. Hosting</h2>
      <p>
        The website is served by Vercel Inc. (440 N Barranca Ave #4133, Covina, CA 91723, USA). When you visit it, Vercel processes technically necessary data:
        IP address, time, requested address, browser identifier (user agent) and referrer, to deliver and protect the website (Art. 6(1)(f) GDPR).
        The data may be transferred to the USA; Vercel is certified under the EU-US Data Privacy Framework. Details: {ext("https://vercel.com/legal/privacy-policy")}.
      </p>

      <h2>4. Fonts and sound</h2>
      <p>
        Fonts are served by this website itself. There is no connection to Google Fonts or other font services.
        The optional motor sound is generated in your browser; no audio files are loaded.
      </p>

      <h2>5. Saved settings</h2>
      <p>
        Colour scheme, language (only if you choose it yourself), stick mode (Mode 1 or 2), the category you chose last and which of the small windows in the animation are folded away are kept in your browser&apos;s local storage
        so they are still set on your next visit. This data does not leave your device, and you can delete it at any time in your browser settings (§ 25(2) no. 2 TDDDG).
      </p>
      <p>
        On the English start page, a script in your browser reads the browser language and, if it is German, takes you to the German version. The browser language is not sent anywhere.
      </p>

      <h2>6. External links</h2>
      <p>
        The sources for the instructions, the source code on GitHub and other links lead to other providers. A connection to them is made only when you click a link.
        Their privacy policies apply there.
      </p>

      <h2>7. Your rights</h2>
      <p>
        You have the right of access, rectification, erasure, restriction of processing, data portability and the right to object (Art. 15–21 GDPR).
        Write to the e-mail address above. You can also lodge a complaint with a data protection supervisory authority.
      </p>
      <p className="hint">Last updated: {PRIVACY_DATE.en}</p>
    </>
  );
}
