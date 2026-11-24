import { PRIVACY_DATE } from "./contact.ts";
import { address, ext, mail } from "./parts.tsx";

/** Impressum (§ 5 DDG) und Datenschutzerklärung (DSGVO). German is the binding version. */
export function LegalDe() {
  return (
    <>
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
        Farbschema, Sprache (nur wenn du sie selbst wählst), Knüppelbelegung (Mode 1 oder 2), zuletzt gewählte Kategorie und welche der kleinen Fenster in der Animation eingeklappt sind werden im lokalen Speicher deines Browsers (localStorage) abgelegt,
        damit sie beim nächsten Besuch erhalten bleiben. Diese Daten verlassen dein Gerät nicht und du kannst sie jederzeit über die Browser-Einstellungen löschen (§ 25 Abs. 2 Nr. 2 TDDDG).
      </p>
      <p>
        Auf der englischen Startseite liest ein Skript in deinem Browser die Browsersprache und führt dich bei deutscher Einstellung zur deutschen Version. Die Browsersprache wird nirgendwohin übertragen.
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
    </>
  );
}
