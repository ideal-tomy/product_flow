import type { QueryCatalogItem } from "../data/query-catalog";
import type { AskIntent } from "./intent";
export const aiRecommendedQueries: QueryCatalogItem[] = [];
export function intentToScenarioId(
  intent: string | undefined,
  _packId?: string,
): string | null {
  switch (intent as AskIntent) {
    case "version_diff": return "version-diff";
    case "contradiction": return "contradiction";
    case "retest": return "retest";
    case "similar_case": return "similar-cases";
    case "approval": return "approval";
    case "impact": return "impact-scope";
    default: return null;
  }
}
