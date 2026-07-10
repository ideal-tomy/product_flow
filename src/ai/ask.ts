import type { AskResult } from "../engines/types";
import { synthesizeAnswer } from "./synthesize";

/**
 * GembaShift AI 問い合わせのエントリ。
 * ブラウザ・API の両方から同じ実装を呼ぶ。
 * OPENAI_API_KEY があるサーバでは将来 LLM パスに差し替え可能。
 */
export async function askGemba(question: string): Promise<AskResult> {
  const trimmed = question.trim();
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
      },
      scenarioId: null,
    };
  }

  // 検索演出のためのわずかな遅延は呼び出し側で行う
  return synthesizeAnswer(trimmed);
}
