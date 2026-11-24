import { App } from "@/ui/App";
import { JsonLd } from "@/seo/JsonLd";
import { buildMetadata } from "@/seo/meta";
import { absolute, HOME_META, SITE_NAME } from "@/seo/site";

export const metadata = buildMetadata({ lang: "de", title: HOME_META.de.title, description: HOME_META.de.description });

export default function Page() {
  return (
    <>
      <App lang="de" />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: SITE_NAME,
        url: absolute("/de"),
        description: HOME_META.de.description,
        applicationCategory: "EducationalApplication",
        operatingSystem: "Any (web browser)",
        inLanguage: ["en", "de"],
        offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
      }} />
    </>
  );
}
