import { askGemba } from "../ai/ask";
import type { AskRequest, AskResult, QueryEngine } from "./types";

async function askViaApi(question: string): Promise<AskResult | null> {
  try {
    const res = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });
    if (!res.ok) return null;
    return (await res.json()) as AskResult;
  } catch {
    return null;
  }
}

/**
 * AI Mode 用 Engine。
 * 1) `/api/ask` があればサーバ側（将来 LLM 接続）
 * 2) なければ同一のローカル RAG 合成を実行
 */
export const aiEngine: QueryEngine = {
  async ask(req: AskRequest): Promise<AskResult> {
    const fromApi = await askViaApi(req.question);
    if (fromApi) return fromApi;
    return askGemba(req.question);
  },
};
