import { Barlow_Semi_Condensed, JetBrains_Mono, Source_Sans_3 } from "next/font/google";

// Same fonts as TLMscope: Barlow Semi Condensed for headings, Source Sans 3 for text, JetBrains Mono for numbers and code.
const display = Barlow_Semi_Condensed({ variable: "--font-display", subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const body = Source_Sans_3({ variable: "--font-body", subsets: ["latin"] });
const mono = JetBrains_Mono({ variable: "--font-mono", subsets: ["latin"], weight: ["400", "500"] });

/** Class names for the <html> element: they define the font variables used in tokens.css. */
export const fontClasses = `${display.variable} ${body.variable} ${mono.variable}`;
