import { askGemba } from "../ai/ask";
import type { KnowledgePackId } from "../packs/types";
import type { AskRequest, AskResult, QueryEngine } from "./types";

async function askViaApi(
  question: string,
  packId?: KnowledgePackId,
): Promise<AskResult | null> {
  try {
    const res = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, packId }),
    });
    if (!res.ok) return null;
    return (await res.json()) as AskResult;
  } catch {
    return null;
  }
}

export const aiEngine: QueryEngine = {
  async ask(req: AskRequest): Promise<AskResult> {
    const fromApi = await askViaApi(req.question, req.packId);
    if (fromApi) return fromApi;
    return askGemba(req.question, { packId: req.packId });
  },
};
