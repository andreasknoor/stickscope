import { FaqPage } from "@/seo/FaqPage";
import { buildMetadata } from "@/seo/meta";
import en from "@/i18n/en.json";

export const metadata = buildMetadata({ lang: "en", id: "faq", title: en.faq.metaTitle, description: en.faq.metaDescription });

export default function Page() {
  return <FaqPage lang="en" />;
}
