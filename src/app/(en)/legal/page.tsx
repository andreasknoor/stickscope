import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { OPERATOR, PRIVACY_DATE, REPO_URL } from "@/legal/contact";

export const metadata: Metadata = {
  title: "Impressum & Datenschutz · StickScope",
  description: "Legal notice and privacy policy of StickScope.",
};

const ext = (href: string, text: ReactNode = href) => <a href={href} target="_blank" rel="noopener noreferrer">{text}</a>;
const mail = <a href={`mailto:${OPERATOR.email}`}>{OPERATOR.email}</a>;
const address = (lang: "de" | "en") => (
  <p>
    {OPERATOR.name}<br />
    {OPERATOR.street}<br />
    {OPERATOR.city}<br />
    {OPERATOR.country[lang]}
  </p>
);

/** Legal notice (§ 5 DDG) and privacy policy (GDPR). German is the binding version; English follows for convenience. */
export default function LegalPage() {
  return (
    <main className="legal wrap">
      <p><Link href="/">← StickScope</Link> · <a href="#de">Deutsch</a> · <a href="#en">English</a></p>

      <section id="de" lang="de">
        <h1>Impressum</h1>
        <h2>Angaben gemäß § 5 DDG</h2>
        {address("de")}
        <h2>Kontakt</h2>
        <p>E-Mail: {mail}</p>
        <p>StickScope ist ein privates, nicht kommerzielles Projekt.</p>

        <h1>Datenschutzerklärung</h1>
        <h2>1. Verantwortlicher</h2>
        {address("de")}
        <p>E-Mail: {mail}</p>

        <h2>2. Was die App tut</h2>
        <p>
          StickScope läuft vollständig in deinem Browser. Es gibt kein Benutzerkonto, keine Cookies, keine Besucherzählung und keine
          Analyse-Dienste. Die App überträgt keine Eingaben von dir an mich oder Dritte.
        </p>

        <h2>3. Hosting</h2>
        <p>
          Die Website wird von Vercel Inc. (440 N Barranca Ave #4133, Covina, CA 91723, USA) bereitgestellt.
          Beim Aufruf verarbeitet Vercel technisch notwendige Daten: IP-Adresse, Zeitpunkt, aufgerufene Adresse, Browser-Kennung (User-Agent) und Referrer.
          Das dient der Auslieferung und Sicherheit der Website (Art. 6 Abs. 1 lit. f DSGVO). Die Daten können in die USA übermittelt werden;
          Vercel ist nach dem EU-US Data Privacy Framework zertifiziert. Einzelheiten: {ext("https://vercel.com/legal/privacy-policy")}.
        </p>

        <h2>4. Schriften und Ton</h2>
        <p>
          Die Schriftarten werden von dieser Website selbst ausgeliefert. Es besteht keine Verbindung zu Google Fonts oder anderen Schriftanbietern.
          Das optionale Motorgeräusch wird in deinem Browser erzeugt, es werden keine Audiodateien geladen.
        </p>

        <h2>5. Gespeicherte Einstellungen</h2>
        <p>
          Farbschema, Knüppelbelegung (Mode 1 oder 2), zuletzt gewählte Kategorie und welche der kleinen Fenster in der Animation eingeklappt sind werden im lokalen Speicher deines Browsers (localStorage) abgelegt,
          damit sie beim nächsten Besuch erhalten bleiben. Diese Daten verlassen dein Gerät nicht und du kannst sie jederzeit über die Browser-Einstellungen löschen (§ 25 Abs. 2 Nr. 2 TDDDG).
        </p>

        <h2>6. Externe Links</h2>
        <p>
          Die Quellenangaben zu den Anleitungen, der Quellcode auf GitHub und andere Links führen zu Angeboten anderer Anbieter.
          Erst wenn du einen Link anklickst, wird eine Verbindung dorthin aufgebaut. Dort gelten deren Datenschutzbestimmungen.
        </p>

        <h2>7. Deine Rechte</h2>
        <p>
          Du hast das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung der Verarbeitung, auf Datenübertragbarkeit sowie das Recht,
          der Verarbeitung zu widersprechen (Art. 15–21 DSGVO). Wende dich dazu an die oben genannte E-Mail-Adresse.
          Außerdem kannst du dich bei einer Datenschutz-Aufsichtsbehörde beschweren.
        </p>
        <p className="hint">Stand: {PRIVACY_DATE.de}</p>
      </section>

      <hr />

      <section id="en" lang="en">
        <h1>Legal notice</h1>
        <p className="hint">Translation for convenience; the German version above is binding.</p>
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
          Colour scheme, stick mode (Mode 1 or 2), the category you chose last and which of the small windows in the animation are folded away are kept in your browser&apos;s local storage
          so they are still set on your next visit. This data does not leave your device, and you can delete it at any time in your browser settings (§ 25(2) no. 2 TDDDG).
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
      </section>

      <p><Link href="/">← StickScope</Link> · {ext(REPO_URL, "Source code on GitHub")}</p>
    </main>
  );
}
