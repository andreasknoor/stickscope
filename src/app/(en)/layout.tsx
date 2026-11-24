import { baseMetadata, sharedViewport } from "@/seo/meta";
import { RootShell } from "@/ui/RootShell";

export const metadata = baseMetadata;
export const viewport = sharedViewport;

export default function EnglishLayout({ children }: { children: React.ReactNode }) {
  return <RootShell lang="en">{children}</RootShell>;
}
