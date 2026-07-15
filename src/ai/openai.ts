/**
 * OpenAI 構造化回答。キーが無い／失敗時は null。
 * Node (Vite middleware / Vercel api) からのみ呼ぶ想定。
 *
 * Phase 3 minimal: 直 fetch をやめ、vendor openaiAdapter + ISO adapters 経由。
 */
import type { AskResult } from "../engines/types";
import { DEFAULT_PACK_ID, getPack, type KnowledgePackId } from "../packs";
import { openaiAdapter } from "@axeon/ai-demo-core/providers/openai-adapter";
import { buildIsoAiRequest } from "./adapters/iso-input";
import { parseIsoAiResult } from "./adapters/iso-output";
import type { AskIntent } from "./intent";
import { knowledgeStats } from "./knowledge";
import type { ScoredChunk } from "./retrieve";

export async function askWithOpenAI(
  question: string,
  intent: AskIntent,
  hits: ScoredChunk[],
  packId?: KnowledgePackId,
): Promise<AskResult | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || hits.length === 0) return null;

  const pack = getPack(packId ?? DEFAULT_PACK_ID);
  const searchedDocuments = pack.ai.stats.documents || knowledgeStats.documents;

  try {
    const request = buildIsoAiRequest({
      question,
      intent,
      hits,
      packId: pack.id,
    });
    const result = await openaiAdapter({ ...request, apiKey });
    if (!result.text) return null;

    return parseIsoAiResult({
      text: result.text,
      hits,
      intent,
      searchedDocuments,
    });
  } catch {
    return null;
  }
}
