import type { Confidence, Instruction, PhaseNote } from "./types.ts";

/** An instruction confirmed by the given sources (at least two independent ones; a test enforces it). */
export const est = (id: string, ...sources: string[]): Instruction => ({ id, confidence: { level: "established", sources } as Confidence });

/** Sources contradict each other: `sources` lists both sides. */
export const disputed = (id: string, ...sources: string[]): PhaseNote => ({ id, kind: "disputed", sources });

/** The sources give no confirmed instruction here. */
export const gap = (id: string): PhaseNote => ({ id, kind: "gap" });
