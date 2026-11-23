import type { Metadata } from "next";
import { RootShell } from "@/ui/RootShell";

export const metadata: Metadata = {
  title: "StickScope – 3D-Figurentrainer",
  description: "Ein animierter 3D-Figurentrainer für RC-Piloten: Modell und beide Senderknüppel bewegen sich gemeinsam in Zeitlupe.",
};

export default function GermanLayout({ children }: { children: React.ReactNode }) {
  return <RootShell lang="de">{children}</RootShell>;
}
