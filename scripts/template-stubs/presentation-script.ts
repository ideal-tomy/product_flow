export type PresentationBeat =
  | { at: number; type: "intro" }
  | { at: number; type: "clear" }
  | { at: number; type: "ask"; scenarioId: string }
  | { at: number; type: "open-source" }
  | { at: number; type: "tagline" }
  | { at: number; type: "done" };
export const presentationBeats: PresentationBeat[] = [];
export const presentationTagline = "探す時間を、判断する時間へ。";
export const presentationSearchSteps = [
  "Scanning documents",
  "Comparing revisions",
  "Sources found",
] as const;
