import type { PresentationBeat } from "./presentation-script";

/**
 * 標準化実務入門パック用・約30秒の自動再生タイムライン。
 */
export const standardizationPresentationBeats: PresentationBeat[] = [
  { at: 0, type: "intro" },
  { at: 3, type: "clear" },
  { at: 4, type: "ask", scenarioId: "std-classification" },
  { at: 12, type: "ask", scenarioId: "std-company" },
  { at: 18, type: "open-source" },
  { at: 24, type: "tagline" },
  { at: 28, type: "done" },
];

export const standardizationPresentationTagline =
  "この教材が、御社の社内標準・作業手順に置き換わります";

export const standardizationPresentationSearchSteps = [
  "Searching 9 documents",
  "Locating 規格の分類",
  "Matching 社内規格",
  "3 sources found",
] as const;

export const standardizationScaleIntro = {
  eyebrow: "経済産業省『標準化実務入門』",
  documents: 9,
  pagesLabel: "chunks",
  pages: 417,
  clausesLabel: "chapters",
  clauses: 9,
} as const;
