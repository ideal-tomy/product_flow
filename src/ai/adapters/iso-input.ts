/**
 * ISO Input Adapter — pack + RAG hits → Core AiRequest.
 * UI / retrieve / synthesize は触らない。サーバー経路（env API key）向け。
 */
import type { AiRequest } from "@axeon/ai-demo-core/types/provider";
import { DEFAULT_PACK_ID, getPack, type KnowledgePackId } from "../../packs";
import type { AskIntent } from "../intent";
import type { ScoredChunk } from "../retrieve";
import { COMPANY_BRIDGE } from "../packs/standardization";

/** Live のみ（デモ規程） vs Live＋自社アップロード */
export type KnowledgeAnswerMode = "pack" | "user-doc";

export function buildSchemaHint(): string {
  return `Return ONLY JSON with this shape:
{
  "summary": string,
  "before"?: string,
  "after"?: string,
  "comparisonLabel"?: string,
  "impactAreas"?: string[],
  "impactGroups"?: { "label": string, "count": number, "items": string[] }[],
  "changes"?: { "id": string, "title": string, "clauseId": string, "before": string, "after": string, "severity": "high"|"medium"|"low" }[],
  "contradictions"?: { "id": string, "title": string, "severity": "high"|"medium"|"low", "left": { "documentName": string, "version": string, "value": string }, "right": { "documentName": string, "version": string, "value": string } }[],
  "similarCases"?: { "id": string, "title": string, "similarity": number, "cause": string, "countermeasure": string, "relationToCurrent": string }[],
  "retests"?: { "id": string, "name": string, "reason": string, "priority": "必須"|"推奨"|"任意" }[],
  "exceptionNote"?: string,
  "refuse"?: boolean,
  "refuseReason"?: string,
  "confidence": "high"|"medium"|"low",
  "sourceChunkIds": string[]
}
Rules:
- Use ONLY facts present in the provided chunks.
- Never invent clause numbers, temperatures, or test IDs.
- sourceChunkIds must be subset of provided chunk ids.
- If evidence is insufficient, set refuse=true and explain in refuseReason.`;
}

const PACK_MODE_SUFFIX =
  " You are answering from the DEMO factory sample documents only. " +
  "Treat this as a sample plant QMS world. Map shop-floor slang to procedures in the chunks. " +
  "Structure answers as: やること → 連絡先 → 根拠. " +
  "Do not claim these are the visitor's company rules.";

const USER_DOC_MODE_PROMPT =
  "You are ConformSystem answering ONLY from the visitor's uploaded company document (chunk id USER-DOC:1 / documentName 自社アップロード資料). " +
  "Answer in Japanese. " +
  "Priority: the uploaded document is the sole source of truth. " +
  "Do NOT use demo pack factory rules, sample SOP numbers, or invented QC/QA extension numbers unless they appear in the uploaded text. " +
  "If the upload does not contain enough evidence, set refuse=true and refuseReason explaining that it is not in the uploaded materials; suggest checking their internal owner. " +
  "When answering, structure as: やること → 根拠（アップロード資料上の箇所）. " +
  "Map informal shop-floor wording to intent, but only answer if the upload supports it.";

export function systemPromptFor(
  packId: KnowledgePackId,
  knowledgeMode: KnowledgeAnswerMode = "pack",
): string {
  if (knowledgeMode === "user-doc") {
    return USER_DOC_MODE_PROMPT + " " + buildSchemaHint();
  }

  const pack = getPack(packId);
  if (pack.llmSystemPrompt) {
    let prompt = pack.llmSystemPrompt;
    if (pack.synthesizer === "standardization") {
      prompt += ` When the question is about 社内規格 / 社内標準, append this exact sentence to summary: ${COMPANY_BRIDGE} `;
    }
    return prompt + PACK_MODE_SUFFIX + " " + buildSchemaHint();
  }

  return (
    "You are ConformSystem, an industrial document reasoning assistant. " +
    "Answer in Japanese using ONLY the provided chunks. " +
    PACK_MODE_SUFFIX +
    " " +
    buildSchemaHint()
  );
}

export type BuildIsoAiRequestInput = {
  question: string;
  intent: AskIntent;
  hits: ScoredChunk[];
  packId?: KnowledgePackId;
  /** Defaults to process.env.OPENAI_MODEL ?? "gpt-5-nano" */
  model?: string;
  /** pack = デモ規程 / user-doc = 自社アップロードのみ */
  knowledgeMode?: KnowledgeAnswerMode;
};

/**
 * Builds Core AiRequest for ISO structured JSON.
 * accessMode is byok-direct contract; caller supplies apiKey from env on server.
 */
export function buildIsoAiRequest(input: BuildIsoAiRequestInput): AiRequest {
  const pack = getPack(input.packId ?? DEFAULT_PACK_ID);
  const model =
    input.model ?? process.env.OPENAI_MODEL ?? "gpt-5-nano";
  const knowledgeMode = input.knowledgeMode ?? "pack";

  const chunkPayload = input.hits.map((h) => ({
    id: h.id,
    documentName: h.documentName,
    version: h.version,
    clauseId: h.clauseId,
    page: h.page,
    text: h.text,
  }));

  return {
    accessMode: "byok-direct",
    provider: "openai",
    model,
    systemPrompt: systemPromptFor(pack.id, knowledgeMode),
    messages: [
      {
        role: "user",
        content: JSON.stringify(
          {
            intent: input.intent,
            question: input.question,
            knowledgeMode,
            chunks: chunkPayload,
          },
          null,
          2,
        ),
      },
    ],
    responseFormat: { type: "json_object" },
    temperature: 0,
  };
}
