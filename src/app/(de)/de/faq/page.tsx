import { FaqPage } from "@/seo/FaqPage";
import { buildMetadata } from "@/seo/meta";
import de from "@/i18n/de.json";

export const metadata = buildMetadata({ lang: "de", id: "faq", title: de.faq.metaTitle, description: de.faq.metaDescription });

export default function Page() {
  return <FaqPage lang="de" />;
}
