import { getPack } from "../packs";
import { matchScenario } from "../data/question-aliases";
import type { AskRequest, AskResult, QueryEngine } from "./types";

function normalizeFieldText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[？?！!。、．，,\s　]/g, "")
    .replace(/ｖ/g, "v");
}

/** パック固有の現場言葉エイリアス → question id */
export function matchFieldLanguageAlias(
  question: string,
  aliases: { patterns: string[]; questionId: string }[] | undefined,
): string | null {
  if (!aliases?.length) return null;
  const q = normalizeFieldText(question);
  if (!q) return null;
  for (const entry of aliases) {
    for (const pattern of entry.patterns) {
      const p = normalizeFieldText(pattern);
      if (p && (q.includes(p) || p.includes(q))) {
        return entry.questionId;
      }
    }
  }
  return null;
}

export const sampleEngine: QueryEngine = {
  async ask(req: AskRequest): Promise<AskResult> {
    const pack = getPack(req.packId);
    const questions = pack.sample.questions;
    const matchedId =
      matchFieldLanguageAlias(req.question, pack.fieldLanguageAliases) ??
      matchScenario(req.question);

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
            "近い質問を選ぶか、別の聞き方で質問してください。",
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
