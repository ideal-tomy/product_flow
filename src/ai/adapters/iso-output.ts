/**
 * ISO Output Adapter — Core AiResult.text (JSON) → existing AskResult | null.
 * Parse failure / empty sources → null（synthesizeAnswer フォールバック維持）。
 */
import type { DemoAnswer } from "../../data/ConformSystem-demo";
import type { AskResult } from "../../engines/types";
import type { AskIntent } from "../intent";
import type { ScoredChunk } from "../retrieve";

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

export type ParseIsoAiResultInput = {
  text: string;
  hits: ScoredChunk[];
  intent: AskIntent;
  searchedDocuments: number;
};

export function parseIsoAiResult(
  input: ParseIsoAiResultInput,
): AskResult | null {
  try {
    const parsed = JSON.parse(input.text) as LlmPayload;
    const { hits, intent, searchedDocuments } = input;

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
