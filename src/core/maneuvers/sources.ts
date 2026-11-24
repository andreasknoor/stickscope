import type { Source } from "./types.ts";

const D = "2026-11-23";
const D2 = "2026-11-24";
const en = "en" as const;
const de = "de" as const;

/**
 * Registry of every source an instruction can cite. Filled from the research dossiers in docs/research.
 * Sources with the same `independenceGroup` count as one (same author, copies, quotes of one original).
 */
export const SOURCES: Source[] = [
  // knife edge
  { id: "pa-tips", title: "Top 10 R/C Flying Tips", author: "aerofundan, Precision Aerobatics", url: "https://www.precisionaerobatics.com/2018/07/25/top-ten-r-c-flying-tips/", accessed: D, language: en, independenceGroup: "precision-aerobatics" },
  { id: "flyrc-ke", title: "Ins And Outs Of Knife-Edge Flight", author: "Fly RC staff, FlyRC", url: "https://www.flyrc.com/ins-and-outs-of-knife-edge-flight/", accessed: D, language: en, independenceGroup: "flyrc-staff" },
  { id: "man-scott-ke", title: "Knife-edge flight", author: "David Scott, Model Airplane News", url: "https://www.modelairplanenews.com/Knife-edge-flight", accessed: D, language: en, independenceGroup: "scott" },
  { id: "gsn-njswede-ke", title: "The Knife Edge", author: "njswede, Giant Scale News forum", url: "https://www.giantscalenews.com/threads/the-knife-edge.5772/", accessed: D, language: en, independenceGroup: "njswede" },
  { id: "rcn-magazin-ke", title: "Du fliegst, wie Du einstellst (Teil 4, Messerflug)", author: "rc-network.de Magazin", url: "https://rc-network.de/magazin/artikel_06/art_06-099/art_099-01.html", accessed: D, language: de, independenceGroup: "rcn-magazin" },
  { id: "rcline-ke", title: "Perfekter Messerflug (Thread)", author: "Mehrere Forumsnutzer, RCLine", url: "https://www.rclineforum.de/forum/board19-fl%C3%A4chenflugmodelle/board28-kunstflug-forum/164425-perfekter-messerflug/", accessed: D, language: de, independenceGroup: "rcline-ke" },
  { id: "scootworks-ke", title: "Knife Edge Flight", author: "scootworks.com (RDRC)", url: "http://www.scootworks.com/rdrc/aerobatics/kedge.html", accessed: D, language: en, independenceGroup: "scootworks" },
  { id: "ma-glezellis", title: "Properly Mixing Control Surfaces (RC Scale Aerobatics)", author: "John Glezellis, Model Aviation", url: "https://library.modelaviation.com/article/rc-scale-aerobatics-21", accessed: D, language: en, independenceGroup: "glezellis" },
  // elevator
  { id: "man-scott-elev", title: "RC Aerobatics: Fly the Elevator", author: "David Scott, Model Airplane News", url: "https://www.modelairplanenews.com/fly-the-elevator/", accessed: D, language: en, independenceGroup: "scott" },
  { id: "gsn-njswede-elev", title: "The elevator", author: "njswede, Giant Scale News forum", url: "https://giantscalenews.com/threads/the-elevator.5783", accessed: D, language: en, independenceGroup: "njswede" },
  { id: "goldberg-ex330", title: "Ex-treme 330 3-D ARF manual: The Elevator, The Harrier", author: "Carl Goldberg Products", url: "https://www.manualsdir.com/manuals/661962/carl-goldberg-gbga1070.html?page=16", accessed: D, language: en, independenceGroup: "goldberg" },
  { id: "ma-hurley-2001", title: "RC Scale Aerobatics (column, 2001)", author: "Michael Hurley, Model Aviation", url: "https://library.modelaviation.com/article/rc-scale-aerobatics-7", accessed: D, language: en, independenceGroup: "hurley" },
  { id: "stevens-3d", title: "An Introduction to 3D Aerobatics: Five Maneuvers Beyond the Stall", author: "Stevens Aeromodel", url: "https://www.stevensaero.com/an-introduction-to-3d-aerobatics-five-maneuvers-beyond-the-stall/", accessed: D, language: en, independenceGroup: "stevens" },
  { id: "rcline-3d-figuren", title: "3D Kunstflugfiguren (Beitrag nach Mike McConville)", author: "Jean-Claude Spillmann, RCLine", url: "https://www.rclineforum.de/forum/board19-fl%C3%A4chenflugmodelle/board28-kunstflug-forum/34553-3d-kunstflugfiguren/", accessed: D, language: de, independenceGroup: "mcconville" },
  // harrier
  { id: "flyrc-stoops-harrier", title: "Harrier (reprint of an IAC pilot's text)", author: "Scott Stoops, Fly RC", url: "https://www.flyrc.com/?p=1878", accessed: D, language: en, independenceGroup: "stoops" },
  { id: "man-scott-harrier", title: "Master the Harrier Pass", author: "Dave Scott, Model Airplane News", url: "https://www.modelairplanenews.com/master-the-harrier-pass/", accessed: D, language: en, independenceGroup: "scott" },
  { id: "ma-graham-2008", title: "Born to Fly (Model Aviation, March 2008)", author: "Jim T. Graham, Model Aviation", url: "https://library.modelaviation.com/article/born-fly-200803", accessed: D, language: en, independenceGroup: "graham" },
  { id: "gsn-njswede-harrier", title: "The Harrier", author: "njswede, Giant Scale News forum", url: "https://giantscalenews.com/threads/the-harrier.5768", accessed: D, language: en, independenceGroup: "njswede" },
  { id: "gsn-3dnater", title: "The Harrier (post by 3dNater)", author: "3dNater, Giant Scale News forum", url: "https://giantscalenews.com/threads/the-harrier.5768", accessed: D, language: en, independenceGroup: "3dnater" },
  // hover
  { id: "rcwithjim", title: "Learning 3D for Beginners", author: "RC with Jim", url: "https://www.rcwithjim.com/learning-3d-for-beginners", accessed: D, language: en, independenceGroup: "rcwithjim" },
  { id: "rcsky-torquen", title: "Torquen (Flugfiguren)", author: "RCSKY.de Glossar", url: "https://rcsky.de/glossar/torquen-flugfiguren-rc-modellbau-275", accessed: D, language: de, independenceGroup: "rcsky" },
  { id: "rcn-hovern-2004", title: "Richtig Hovern! (Thread, 2004)", author: "Mehrere Forumsnutzer, RC-Network", url: "https://www.rc-network.de/threads/richtig-hovern.25781/", accessed: D, language: de, independenceGroup: "rcn-hovern-2004" },
  { id: "rcn-hoovern-2008", title: "Fragen zum Hoovern (Thread, 2008)", author: "Mehrere Forumsnutzer, RC-Network", url: "https://www.rc-network.de/threads/fragen-zum-hoovern.103187/", accessed: D, language: de, independenceGroup: "rcn-hoovern-2008" },
  { id: "gsn-torque-roll", title: "The Torque Roll", author: "gyro, Giant Scale News forum", url: "http://www.giantscalenews.com/threads/the-torque-roll.5875/", accessed: D, language: en, independenceGroup: "gsn-gyro" },
  { id: "man-hover", title: "How to hover an RC plane", author: "Model Airplane News", url: "https://www.modelairplanenews.com/hovering-master-this-3d-move/", accessed: D, language: en, independenceGroup: "man-publisher" },
  // torque roll
  { id: "parkpilot", title: "Park Pilot Aerobatics", author: "Dave Lockhart, Park Pilot", url: "https://www.theparkpilot.org/park-pilot-aerobatics", accessed: D, language: en, independenceGroup: "lockhart" },
  { id: "man-cooper-torque", title: "Tech Tip: How to use a round cowl to master the torque roll", author: "Larry Cooper, Model Airplane News", url: "https://www.modelairplanenews.com/?p=203048", accessed: D, language: en, independenceGroup: "man-publisher" },
  { id: "gsn-kris-3d", title: "The 3D Compilation: Facts, How-to, Reference", author: "Kris, Giant Scale News forum", url: "https://www.giantscalenews.com/threads/the-3d-compiliation-facts-how-to-reference-more.6332/", accessed: D, language: en, independenceGroup: "gsn-kris" },
  { id: "rcn-torquen-6090", title: "Torquen, wie und womit? (Thread)", author: "Mehrere Forumsnutzer, rc-network.de", url: "https://rc-network.de/forum/showthread.php/6090-Torquen-wie-und-womit", accessed: D, language: de, independenceGroup: "rcn-6090" },
  { id: "rcn-torquen-25657", title: "Wie torque und hovere ich richtig (Thread)", author: "Mehrere Forumsnutzer, rc-network.de", url: "https://www.rc-network.de/threads/wie-torque-und-hovere-ich-richtig.25657/", accessed: D, language: de, independenceGroup: "rcn-25657" },
  { id: "rcline-torquen", title: "Torquen--aber wie?? (Thread)", author: "Mehrere Forumsnutzer, RCLine", url: "https://www.rclineforum.de/forum/board19-fl%C3%A4chenflugmodelle/board20-modellflug-allgemein/5331-torquen-aber-wie/", accessed: D, language: de, independenceGroup: "rcline-torquen" },
  { id: "wikipedia-3d", title: "3D Aerobatics", author: "Wikipedia", url: "https://en.wikipedia.org/wiki/3D_Aerobatics", accessed: D, language: en, independenceGroup: "wikipedia" },
  // rolling harrier
  { id: "man-somenzini-rh", title: "Freestyle Move: The Harrier Roll", author: "Quique Somenzini, Model Airplane News", url: "https://www.modelairplanenews.com/the-harrier-roll-freestyle-aerobatic-technique/", accessed: D, language: en, independenceGroup: "somenzini" },
  { id: "gsn-gyro-rh", title: "The Rolling Harrier", author: "gyro, Giant Scale News forum", url: "https://www.giantscalenews.com/threads/the-rolling-harrier.5874/", accessed: D, language: en, independenceGroup: "gsn-gyro" },
  { id: "rcn-powerrolle", title: "Powerrolle (Thread)", author: "Mehrere Forumsnutzer, rc-network.de", url: "https://rc-network.de/forum/archive/index.php/t-293648.html", accessed: D, language: de, independenceGroup: "rcn-powerrolle" },
  // flat spin
  { id: "flyrc-ronge-fs", title: "Conquering the Flat Spin", author: "Klaus Ronge, Fly RC", url: "https://www.flyrc.com/conquering-the-flat-spin/", accessed: D, language: en, independenceGroup: "flyrc-ronge" },
  { id: "rdrc-fs", title: "Flat Spin (Aerobatic Tips)", author: "RDRC club site (scootworks.com)", url: "https://www.scootworks.com/rdrc/aerobatics/fspin.html", accessed: D, language: en, independenceGroup: "scootworks" },
  { id: "rcn-flachtrudeln", title: "Flachtrudeln (Thread, 2005)", author: "Mehrere Forumsnutzer, rc-network.de", url: "https://www.rc-network.de/threads/flachtrudeln.32539/", accessed: D, language: de, independenceGroup: "rcn-flachtrudeln" },
  { id: "rcline-flachtrudeln", title: "Flachtrudeln, wie? (Thread)", author: "Mehrere Forumsnutzer, RCLine", url: "https://www.rclineforum.de/forum/board19-fl%C3%A4chenflugmodelle/board28-kunstflug-forum/64036-flachtrudeln-aber-wie/", accessed: D, language: de, independenceGroup: "rcline-flachtrudeln" },
  { id: "rcn-wiki-trudeln", title: "Trudeln", author: "RC-Network Wiki", url: "https://wiki.rc-network.de/wiki/Trudeln", accessed: D, language: de, independenceGroup: "rcn-wiki" },  // motor glider figures (loop, split S, roll, stall turn)
  { id: "iac-figures", title: "Aerobatic Figures", author: "International Aerobatic Club (IAC)", url: "https://www.iac.org/aerobatic-figures", accessed: D2, language: en, independenceGroup: "iac" },
  { id: "rcaw-basic", title: "Basic RC Airplane Aerobatics - Beginner Stunts", author: "RC Airplane World", url: "https://www.rc-airplane-world.com/basic-rc-airplane-aerobatics", accessed: D2, language: en, independenceGroup: "rcairplaneworld" },
  { id: "rcaw-more", title: "Learn Some More RC Airplane Aerobatics", author: "RC Airplane World", url: "https://www.rc-airplane-world.com/more-rc-airplane-aerobatics.html", accessed: D2, language: en, independenceGroup: "rcairplaneworld" },
  { id: "stevens-pattern", title: "An Introduction to Pattern Aerobatics: Eight Maneuvers Worth Learning", author: "Stevens Aeromodel", url: "https://www.stevensaero.com/an-introduction-to-pattern-aerobatics/", accessed: D2, language: en, independenceGroup: "stevens" },
  { id: "wikipedia-split-s", title: "Split S", author: "Wikipedia", url: "https://en.wikipedia.org/wiki/Split_S", accessed: D2, language: en, independenceGroup: "wikipedia" },
  { id: "wikipedia-stall-turn", title: "Stall turn", author: "Wikipedia", url: "https://en.wikipedia.org/wiki/Stall_turn", accessed: D2, language: en, independenceGroup: "wikipedia" },
];

export const sourceById = (id: string): Source | undefined => SOURCES.find((s) => s.id === id);
