import type { Metadata } from "next";
import { RootShell } from "@/ui/RootShell";

export const metadata: Metadata = {
  title: "StickScope – 3D manoeuvre trainer",
  description: "An animated 3D manoeuvre trainer for RC pilots: the model and both transmitter sticks move together in slow motion.",
};

export default function EnglishLayout({ children }: { children: React.ReactNode }) {
  return <RootShell lang="en">{children}</RootShell>;
}
