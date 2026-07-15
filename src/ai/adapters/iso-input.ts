/**
 * ISO Input Adapter — pack + RAG hits → Core AiRequest.
 * UI / retrieve / synthesize は触らない。サーバー経路（env API key）向け。
 */
import type { AiRequest } from "@axeon/ai-demo-core/types/provider";
import { DEFAULT_PACK_ID, getPack, type KnowledgePackId } from "../../packs";
import type { AskIntent } from "../intent";
import type { ScoredChunk } from "../retrieve";
import { COMPANY_BRIDGE } from "../packs/standardization";

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

export function systemPromptFor(packId: KnowledgePackId): string {
  const pack = getPack(packId);
  if (pack.llmSystemPrompt) {
    let prompt = pack.llmSystemPrompt;
    if (pack.synthesizer === "standardization") {
      prompt += ` When the question is about 社内規格 / 社内標準, append this exact sentence to summary: ${COMPANY_BRIDGE} `;
    }
    return prompt + " " + buildSchemaHint();
  }

  return (
    "You are ConformSystem, an industrial document reasoning assistant. " +
    "Answer in Japanese using ONLY the provided chunks. " +
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
};

/**
 * Builds Core AiRequest for ISO structured JSON.
 * accessMode is byok-direct contract; caller supplies apiKey from env on server.
 */
export function buildIsoAiRequest(input: BuildIsoAiRequestInput): AiRequest {
  const pack = getPack(input.packId ?? DEFAULT_PACK_ID);
  const model =
    input.model ?? process.env.OPENAI_MODEL ?? "gpt-5-nano";

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
    systemPrompt: systemPromptFor(pack.id),
    messages: [
      {
        role: "user",
        content: JSON.stringify(
          {
            intent: input.intent,
            question: input.question,
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
