import type { ScenarioId } from "./question-aliases";

export type PresentationBeat =
  | { at: number; type: "intro" }
  | { at: number; type: "clear" }
  | { at: number; type: "ask"; scenarioId: ScenarioId }
  | { at: number; type: "open-source" }
  | { at: number; type: "tagline" }
  | { at: number; type: "done" };

/**
 * 約30秒の自動再生タイムライン（秒）。
 * ask のあとに SearchSteps + Hero が続くため、間隔に余裕を持たせる。
 */
export const presentationBeats: PresentationBeat[] = [
  { at: 0, type: "intro" },
  { at: 3, type: "clear" },
  { at: 3.2, type: "ask", scenarioId: "version-diff" },
  { at: 10, type: "ask", scenarioId: "impact-scope" },
  { at: 18, type: "ask", scenarioId: "contradiction" },
  { at: 22.5, type: "open-source" },
  { at: 26, type: "tagline" },
  { at: 30, type: "done" },
];

export const presentationTagline = "探す時間を、判断する時間へ。";

export const presentationSearchSteps = [
  "Searching 18 documents",
  "Comparing v3.2 ↔ v3.4",
  "Comparing 436 clauses",
  "5 sources found",
] as const;
