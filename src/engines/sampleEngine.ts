import { getPack } from "../packs";
import { matchScenario } from "../data/question-aliases";
import type { AskRequest, AskResult, QueryEngine } from "./types";

export const sampleEngine: QueryEngine = {
  async ask(req: AskRequest): Promise<AskResult> {
    const pack = getPack(req.packId);
    const questions = pack.sample.questions;
    const matchedId = matchScenario(req.question);

    const byId = matchedId
      ? questions.find((q) => q.id === matchedId)
      : undefined;

    // パック固有の質問文にも直接マッチ
    const direct =
      byId ??
      questions.find(
        (q) =>
          q.question === req.question.trim() ||
          q.chipLabel === req.question.trim(),
      );

    if (!direct) {
      return {
        answer: {
          summary:
            "このサンプルでは、変更点・影響・再確認・矛盾・過去事例などに回答できます。近い質問を選んでください。",
          sources: [],
        },
        meta: {
          searchedDocuments: 0,
          sourcesFound: 0,
          confidence: "low",
          refused: true,
          engine: "sample",
          scenarioId: null,
          packId: pack.id,
        },
        scenarioId: null,
      };
    }

    return {
      answer: direct.answer,
      meta: {
        searchedDocuments: pack.sample.stats.documents,
        sourcesFound: direct.answer.sources.length,
        confidence: "high",
        engine: "sample",
        scenarioId: direct.id as AskResult["scenarioId"],
        packId: pack.id,
      },
      scenarioId: direct.id as AskResult["scenarioId"],
    };
  },
};

export { unmatchedSuggestions } from "../data/question-aliases";
