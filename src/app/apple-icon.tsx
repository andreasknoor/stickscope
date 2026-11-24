import { renderIcon } from "@/seo/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";
export const dynamic = "force-static";

/** Home-screen icon: the two sticks on the tile colour, full bleed (the phone rounds the corners). */
export default function AppleIcon() {
  return renderIcon(180);
}
