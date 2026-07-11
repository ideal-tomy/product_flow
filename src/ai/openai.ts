import type { DemoAnswer } from "../data/gembashift-demo";
import type { AskResult } from "../engines/types";
import { DEFAULT_PACK_ID, getPack, type KnowledgePackId } from "../packs";
import type { AskIntent } from "./intent";
import type { ScoredChunk } from "./retrieve";
import { knowledgeStats } from "./knowledge";
import { COMPANY_BRIDGE } from "./packs/standardization";

type LlmPayload = {
  summary: string;
  before?: string;
  after?: string;
  comparisonLabel?: string;
  impactAreas?: string[];
  impactGroups?: DemoAnswer["impactGroups"];
  changes?: DemoAnswer["changes"];
  contradictions?: DemoAnswer["contradictions"];
  similarCases?: DemoAnswer["similarCases"];
  retests?: DemoAnswer["retests"];
  exceptionNote?: string;
  refuse?: boolean;
  refuseReason?: string;
  confidence?: "high" | "medium" | "low";
  sourceChunkIds: string[];
};

function buildSchemaHint(): string {
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

function systemPromptFor(packId: KnowledgePackId): string {
  if (packId === "standardization") {
    return (
      "You are GembaShift, an industrial document reasoning assistant for the METI textbook " +
      "『標準化実務入門』（経済産業省 基準認証ユニット）。 " +
      "Answer in Japanese. Cite documentName and clauseId from the provided chunks. " +
      "Do not use knowledge outside the provided chunks. " +
      `When the question is about 社内規格 / 社内標準, append this exact sentence to summary: ${COMPANY_BRIDGE} ` +
      buildSchemaHint()
    );
  }

  return (
    "You are GembaShift, an industrial document reasoning assistant for Tohama Mobility TCU-480. " +
    "Answer in Japanese. " +
    buildSchemaHint()
  );
}

/**
 * OpenAI 構造化回答。キーが無い／失敗時は null。
 * Node (Vite middleware) からのみ呼ぶ想定。
 */
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

  const chunkPayload = hits.map((h) => ({
    id: h.id,
    documentName: h.documentName,
    version: h.version,
    clauseId: h.clauseId,
    page: h.page,
    text: h.text,
  }));

  const body = {
    model: process.env.OPENAI_MODEL ?? "gpt-5-nano",
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: systemPromptFor(pack.id),
      },
      {
        role: "user",
        content: JSON.stringify(
          {
            intent,
            question,
            chunks: chunkPayload,
          },
          null,
          2,
        ),
      },
    ],
  };

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;
    const parsed = JSON.parse(content) as LlmPayload;

    if (parsed.refuse) {
      return {
        answer: {
          summary:
            parsed.refuseReason ??
            "根拠が不足しているため回答を保留しました。",
          sources: [],
          exceptionNote: "LLM が根拠不足と判断しました。",
        },
        meta: {
          searchedDocuments,
          sourcesFound: 0,
          confidence: "low",
          refused: true,
          engine: "llm",
          intent,
        },
        scenarioId: null,
      };
    }

    const idSet = new Set(parsed.sourceChunkIds ?? []);
    const sources = hits
      .filter((h) => idSet.size === 0 || idSet.has(h.id))
      .slice(0, 10)
      .map((h) => ({
        documentName: h.documentName,
        version: h.version,
        page: h.page,
        clauseId: h.clauseId,
        excerpt: h.excerpt,
        highlight: h.highlight,
        chunkId: h.id,
        fullText: h.text,
        documentId: h.documentId,
      }));

    if (sources.length === 0) return null;

    const answer: DemoAnswer = {
      summary: parsed.summary,
      before: parsed.before,
      after: parsed.after,
      comparisonLabel: parsed.comparisonLabel,
      impactAreas: parsed.impactAreas,
      impactGroups: parsed.impactGroups,
      changes: parsed.changes,
      contradictions: parsed.contradictions,
      similarCases: parsed.similarCases,
      retests: parsed.retests,
      exceptionNote: parsed.exceptionNote,
      sources,
    };

    return {
      answer,
      meta: {
        searchedDocuments,
        sourcesFound: sources.length,
        confidence: parsed.confidence ?? "medium",
        engine: "llm",
        intent,
      },
      scenarioId: null,
    };
  } catch {
    return null;
  }
}
