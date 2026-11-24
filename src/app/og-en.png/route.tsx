import { renderOgImage } from "@/seo/og";
import { HOME_META } from "@/seo/site";

export const dynamic = "force-static";

/** The link preview image for EN pages: a plain file address (with .png) that any page can name. */
export function GET() {
  return renderOgImage(HOME_META.en.tagline);
}
