import { demoQuestions } from "../data/gembashift-demo";
import { matchScenario, unmatchedSuggestions } from "../data/question-aliases";
import type { AskRequest, AskResult, QueryEngine } from "./types";

export const sampleEngine: QueryEngine = {
  async ask(req: AskRequest): Promise<AskResult> {
    const matchedId = matchScenario(req.question);

    if (!matchedId) {
      return {
        answer: {
          summary:
            "このサンプルでは、変更点・影響範囲・再試験・文書矛盾・類似不具合などに回答できます。近い質問を選んでください。",
          sources: [],
        },
        meta: {
          searchedDocuments: 0,
          sourcesFound: 0,
          confidence: "low",
          refused: true,
          engine: "sample",
          scenarioId: null,
        },
        scenarioId: null,
      };
    }

    const scenario = demoQuestions.find((q) => q.id === matchedId)!;
    return {
      answer: scenario.answer,
      meta: {
        searchedDocuments: 18,
        sourcesFound: scenario.answer.sources.length,
        confidence: "high",
        engine: "sample",
        scenarioId: matchedId,
      },
      scenarioId: matchedId,
    };
  },
};

/** unmatched 時のサジェスト（UI用） */
export { unmatchedSuggestions };
