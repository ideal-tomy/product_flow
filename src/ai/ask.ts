import type { AskResult } from "../engines/types";
import type { KnowledgePackId } from "../packs/types";
import { detectIntent } from "./intent";
import { askWithOpenAI } from "./openai";
import { retrieveChunks } from "./retrieve";
import { synthesizeAnswer } from "./synthesize";

export type AskGembaOptions = {
  /** true のときだけ OpenAI を試す（サーバ側） */
  allowLlm?: boolean;
  packId?: KnowledgePackId;
};

/**
 * GembaShift AI 問い合わせのエントリ。
 * ブラウザ・API の両方から同じ RAG 合成を使い、
 * サーバで allowLlm + OPENAI_API_KEY のときだけ LLM を試す。
 */
export async function askGemba(
  question: string,
  options: AskGembaOptions = {},
): Promise<AskResult> {
  const trimmed = question.trim();
  const packId = options.packId;

  if (!trimmed) {
    return {
      answer: {
        summary: "質問を入力してください。",
        sources: [],
      },
      meta: {
        searchedDocuments: 0,
        sourcesFound: 0,
        confidence: "low",
        refused: true,
        engine: "rag",
        intent: "refuse",
        packId,
      },
      scenarioId: null,
    };
  }

  const intent = detectIntent(trimmed);
  if (intent === "refuse") {
    return synthesizeAnswer(trimmed, packId);
  }

  if (options.allowLlm) {
    const { hits } = retrieveChunks(trimmed, { intent, topK: 10, packId });
    if (hits.length > 0) {
      const llm = await askWithOpenAI(trimmed, intent, hits, packId);
      if (llm) {
        return {
          ...llm,
          meta: { ...llm.meta, packId },
        };
      }
    }
  }

  return synthesizeAnswer(trimmed, packId);
}
