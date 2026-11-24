import { App } from "@/ui/App";
import { JsonLd } from "@/seo/JsonLd";
import { buildMetadata } from "@/seo/meta";
import { absolute, HOME_META, SITE_NAME } from "@/seo/site";

export const metadata = buildMetadata({ lang: "en", title: HOME_META.en.title, description: HOME_META.en.description });

export default function Page() {
  return (
    <>
      <App lang="en" />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: SITE_NAME,
        url: absolute("/"),
        description: HOME_META.en.description,
        applicationCategory: "EducationalApplication",
        operatingSystem: "Any (web browser)",
        inLanguage: ["en", "de"],
        offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
      }} />
    </>
  );
}
