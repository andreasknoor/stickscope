import type { Metadata } from "next";
import Link from "next/link";
import { LegalEn } from "@/legal/LegalEn";

export const metadata: Metadata = {
  title: "Legal notice & privacy · StickScope",
  description: "Legal notice and privacy policy of StickScope.",
  alternates: { languages: { de: "/de/legal" } },
};

export default function LegalPage() {
  return (
    <main className="legal wrap">
      <p><Link href="/">← StickScope</Link> · <Link href="/de/legal" hrefLang="de" lang="de">Deutsch</Link></p>
      <LegalEn />
    </main>
  );
}
