import type { Metadata } from "next";
import Link from "next/link";
import { LegalDe } from "@/legal/LegalDe";

export const metadata: Metadata = {
  title: "Impressum & Datenschutz · StickScope",
  description: "Impressum und Datenschutzerklärung von StickScope.",
  alternates: { languages: { en: "/legal" } },
};

export default function LegalPage() {
  return (
    <main className="legal wrap">
      <p><Link href="/de">← StickScope</Link> · <Link href="/legal" hrefLang="en" lang="en">English</Link></p>
      <LegalDe />
    </main>
  );
}
