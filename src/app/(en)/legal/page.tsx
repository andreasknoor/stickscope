import { buildMetadata } from "@/seo/meta";
import Link from "next/link";
import { LegalEn } from "@/legal/LegalEn";

export const metadata = buildMetadata({ lang: "en", id: "legal", title: "Legal notice & privacy · StickScope", description: "Legal notice and privacy policy of StickScope." });

export default function LegalPage() {
  return (
    <main className="legal wrap">
      <p><Link href="/">← StickScope</Link> · <Link href="/de/legal" hrefLang="de" lang="de">Deutsch</Link></p>
      <LegalEn />
    </main>
  );
}
