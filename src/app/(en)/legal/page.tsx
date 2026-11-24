import { buildMetadata } from "@/seo/meta";
import Link from "next/link";
import { LangLink } from "@/ui/LangLink";
import { LegalEn } from "@/legal/LegalEn";

export const metadata = buildMetadata({ lang: "en", id: "legal", title: "Legal notice & privacy · StickScope", description: "Legal notice and privacy policy of StickScope." });

export default function LegalPage() {
  return (
    <main className="legal wrap">
      <p><Link href="/">← StickScope</Link> · <LangLink to="de" href="/de/legal">Deutsch</LangLink></p>
      <LegalEn />
    </main>
  );
}
