/**
 * Client-side LLM path for BYOK / Managed Trial.
 * retrieve → iso-input → sendAiRequest → iso-output
 * Failures return null (caller falls back to synthesizeAnswer).
 */
import {
  getApiKey,
  getIsoModel,
  getIsoProvider,
  getTrialCode,
  getUserDocumentText,
} from "../access/iso-settings";
import type { IsoAccessMode } from "../access/access-mode";
import type { AskResult } from "../engines/types";
import { DEFAULT_PACK_ID, getPack, type KnowledgePackId } from "../packs";
import {
  estimateTokens,
  sendAiRequest,
} from "../vendor/ai-demo/demo-core";
import type { KnowledgeChunk } from "./knowledge";
import { buildIsoAiRequest } from "./adapters/iso-input";
import { parseIsoAiResult } from "./adapters/iso-output";
import { detectIntent } from "./intent";
import { knowledgeStats } from "./knowledge";
import { retrieveChunks, type ScoredChunk } from "./retrieve";
import { synthesizeAnswer } from "./synthesize";

function userDocChunk(text: string): KnowledgeChunk {
  return {
    id: "USER-DOC:1",
    documentId: "USER-DOC",
    documentName: "自社アップロード資料",
    version: "session",
    page: "—",
    clauseId: "user",
    clauseDisplay: "user",
    excerpt: text.slice(0, 220),
    text,
    category: "policy",
    tags: ["user", "upload", "USER-DOC"],
  };
}

function mergeUserDocHits(
  hits: ScoredChunk[],
  userText: string,
): ScoredChunk[] {
  const trimmed = userText.trim();
  if (!trimmed) return hits;
  const extra: ScoredChunk = { ...userDocChunk(trimmed), score: 999 };
  return [extra, ...hits].slice(0, 12);
}

export type AskClientLlmOptions = {
  packId?: KnowledgePackId;
  accessMode: Extract<IsoAccessMode, "byok-direct" | "managed-trial">;
};

export async function askClientLlm(
  question: string,
  options: AskClientLlmOptions,
): Promise<AskResult | null> {
  const trimmed = question.trim();
  if (!trimmed) return null;

  const packId = options.packId ?? DEFAULT_PACK_ID;
  const pack = getPack(packId);
  const intent = detectIntent(trimmed);
  if (intent === "refuse") return null;

  const { hits: rawHits } = retrieveChunks(trimmed, {
    intent,
    topK: 10,
    packId,
  });
  const hits = mergeUserDocHits(rawHits, getUserDocumentText());
  if (hits.length === 0) return null;

  const provider = getIsoProvider();
  const model = getIsoModel();
  const request = buildIsoAiRequest({
    question: trimmed,
    intent,
    hits,
    packId: pack.id,
    model,
  });

  // Override provider for BYOK multi-provider; Trial stays OpenAI via gateway allowlist
  request.provider = provider;
  request.accessMode = options.accessMode;
  if (options.accessMode === "byok-direct") {
    const apiKey = getApiKey(provider);
    if (!apiKey) return null;
    request.apiKey = apiKey;
  }

  const knowledgeText = getUserDocumentText() + hits.map((h) => h.text).join("\n");
  const searchedDocuments =
    pack.ai.stats.documents || knowledgeStats.documents;

  try {
    const result = await sendAiRequest(request, {
      trialCode:
        options.accessMode === "managed-trial" ? getTrialCode() : undefined,
      knowledgeCharCount: [...knowledgeText].length,
      estimatedInputTokens: estimateTokens(knowledgeText),
    });
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

/**
 * Full client ask with synthesize fallback.
 */
export async function askWithAccessMode(
  question: string,
  options: AskClientLlmOptions,
): Promise<AskResult> {
  const llm = await askClientLlm(question, options);
  if (llm) {
    return {
      ...llm,
      meta: { ...llm.meta, packId: options.packId },
    };
  }
  return synthesizeAnswer(question, options.packId);
}
