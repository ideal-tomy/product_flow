/** テンプレート: Sample は pack.sample.questions の完全一致／チップでマッチ */
export type ScenarioId = string;
export const unmatchedSuggestions: string[] = [
  "何が変わった？",
  "矛盾はある？",
  "誰に影響？",
];
export function matchScenario(_input: string): ScenarioId | null {
  return null;
}
