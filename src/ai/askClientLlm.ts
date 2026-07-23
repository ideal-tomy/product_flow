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
} from "@axeon/ai-demo-core/demo-core";
import type { KnowledgeChunk } from "./knowledge";
import {
  buildIsoAiRequest,
  type KnowledgeAnswerMode,
} from "./adapters/iso-input";
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

/** 自社資料モード: アップロードのみ（デモ規程と混ぜない） */
function userDocOnlyHits(userText: string): ScoredChunk[] {
  const trimmed = userText.trim();
  if (!trimmed) return [];
  return [{ ...userDocChunk(trimmed), score: 999 }];
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

  const userText = getUserDocumentText();
  const hasUserDoc = userText.trim().length > 0;
  const knowledgeMode: KnowledgeAnswerMode = hasUserDoc ? "user-doc" : "pack";

  let hits: ScoredChunk[];
  if (hasUserDoc) {
    hits = userDocOnlyHits(userText);
  } else {
    const { hits: rawHits } = retrieveChunks(trimmed, {
      intent,
      topK: 10,
      packId,
    });
    hits = rawHits;
  }
  if (hits.length === 0) return null;

  const provider = getIsoProvider();
  const model = getIsoModel();
  const request = buildIsoAiRequest({
    question: trimmed,
    intent,
    hits,
    packId: pack.id,
    model,
    knowledgeMode,
  });

  request.provider = provider;
  request.accessMode = options.accessMode;
  if (options.accessMode === "byok-direct") {
    const apiKey = getApiKey(provider);
    if (!apiKey) return null;
    request.apiKey = apiKey;
  }

  const knowledgeText = hits.map((h) => h.text).join("\n");
  const searchedDocuments = hasUserDoc
    ? 1
    : pack.ai.stats.documents || knowledgeStats.documents;

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
 * 自社資料モードではデモ合成に落とさず、不足時は拒否を返す。
 */
export async function askWithAccessMode(
  question: string,
  options: AskClientLlmOptions,
): Promise<AskResult> {
  const hasUserDoc = getUserDocumentText().trim().length > 0;
  const llm = await askClientLlm(question, options);
  if (llm) {
    return {
      ...llm,
      meta: { ...llm.meta, packId: options.packId },
    };
  }
  if (hasUserDoc) {
    return {
      answer: {
        summary:
          "アップロード資料からは根拠を特定できませんでした。資料の該当箇所を確認するか、別の聞き方を試してください。",
        sources: [],
      },
      meta: {
        searchedDocuments: 1,
        sourcesFound: 0,
        confidence: "low",
        refused: true,
        engine: "llm",
        scenarioId: null,
        packId: options.packId,
      },
      scenarioId: null,
    };
  }
  return synthesizeAnswer(question, options.packId);
}
