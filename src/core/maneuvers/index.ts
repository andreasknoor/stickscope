import type { Category, Maneuver } from "./types.ts";
import { elevator } from "./elevator.ts";
import { harrier } from "./harrier.ts";
import { hover } from "./hover.ts";
import { knifeEdge } from "./knife-edge.ts";
import { torqueRoll } from "./torque-roll.ts";
import { rollingHarrier } from "./rolling-harrier.ts";
import { flatSpin } from "./flat-spin.ts";
import { loop } from "./loop.ts";
import { splitS } from "./split-s.ts";
import { roll } from "./roll.ts";
import { stallTurn } from "./stall-turn.ts";
import { invertedFlight } from "./inverted-flight.ts";

/** All figures, in display order within their category. Adding a figure: see README.md. */
export const MANEUVERS: Maneuver[] = [elevator, knifeEdge, harrier, hover, torqueRoll, rollingHarrier, flatSpin, loop, splitS, roll, stallTurn, invertedFlight];

export const getManeuver = (id: string): Maneuver | undefined => MANEUVERS.find((m) => m.id === id);
export const inCategory = (c: Category): Maneuver[] => MANEUVERS.filter((m) => m.category === c);
