import { demoQuestions, type DemoAnswer, type SourceReference } from "../data/gembashift-demo";
import { matchScenario } from "../data/question-aliases";
import type { AskResult } from "../engines/types";
import { knowledgeStats } from "./knowledge";
import {
  isOutOfScopeQuestion,
  retrieveChunks,
  type ScoredChunk,
} from "./retrieve";

function toSource(chunk: ScoredChunk): SourceReference {
  return {
    documentName: chunk.documentName,
    version: chunk.version,
    page: chunk.page,
    clauseId: chunk.clauseId,
    excerpt: chunk.excerpt,
    highlight: chunk.highlight,
  };
}

function mergeSources(
  primary: SourceReference[],
  retrieved: ScoredChunk[],
): SourceReference[] {
  const map = new Map<string, SourceReference>();
  for (const s of [...primary, ...retrieved.map(toSource)]) {
    const key = `${s.documentName}|${s.version}|${s.clauseId}|${s.page}`;
    if (!map.has(key)) map.set(key, s);
  }
  return [...map.values()].slice(0, 8);
}

function refuseAnswer(
  reason: string,
  relatedHints: string[],
  searchedDocuments: number,
): AskResult {
  const hintLine =
    relatedHints.length > 0
      ? `\n\n関連して確認できる情報:\n${relatedHints.map((h) => `・${h}`).join("\n")}`
      : "";
  return {
    answer: {
      summary: `${reason}${hintLine}`,
      sources: [],
      exceptionNote: "根拠資料がないため回答を保留しました。",
    },
    meta: {
      searchedDocuments,
      sourcesFound: 0,
      confidence: "low",
      refused: true,
      engine: "rag",
      scenarioId: null,
    },
    scenarioId: null,
  };
}

function freeFormFromChunks(question: string, hits: ScoredChunk[]): DemoAnswer {
  const top = hits.slice(0, 4);
  const bullets = top
    .map(
      (h) =>
        `・${h.documentName} ${h.version} §${h.clauseId}: ${h.excerpt}`,
    )
    .join("\n");

  return {
    summary: `登録ナレッジから関連条項を ${top.length} 件抽出しました。\n\n質問「${question}」に対する根拠は以下です。\n${bullets}`,
    sources: top.map(toSource),
    exceptionNote:
      "自由入力のため要約は根拠抜粋ベースです。詳細は各条項を確認してください。",
  };
}

/**
 * 検索結果から構造化回答を合成する。
 * - 既知シナリオにマッチすれば Sample 品質の回答 + 実検索メタ
 * - それ以外はチャンク根拠の自由回答
 * - 根拠不足・範囲外は拒否
 */
export function synthesizeAnswer(question: string): AskResult {
  const searchedDocuments = knowledgeStats.documents;

  if (isOutOfScopeQuestion(question)) {
    return refuseAnswer(
      "この質問に回答できる根拠資料がありません。\n現在のナレッジには、売上・販売実績・価格に関する文書は含まれていません。",
      ["累計出荷・対象車種に相当する技術文書", "試験・品質・変更管理文書"],
      searchedDocuments,
    );
  }

  const { hits } = retrieveChunks(question, 8);
  const scenarioId = matchScenario(question);

  if (hits.length === 0 && !scenarioId) {
    return refuseAnswer(
      "この質問に回答できる根拠資料が見つかりませんでした。\n温度制御ユニットの仕様変更・試験・FMEA・不具合・規格対応について質問してください。",
      [
        "v3.2 と v3.4 の差分",
        "影響範囲・再試験",
        "文書矛盾・過去不具合",
      ],
      searchedDocuments,
    );
  }

  if (scenarioId) {
    const scenario = demoQuestions.find((q) => q.id === scenarioId)!;
    const sources = mergeSources(scenario.answer.sources, hits);
    return {
      answer: {
        ...scenario.answer,
        sources,
      },
      meta: {
        searchedDocuments,
        sourcesFound: sources.length,
        confidence: hits.length >= 2 ? "high" : "medium",
        engine: "rag",
        scenarioId,
      },
      scenarioId,
    };
  }

  // 自由入力: スコアが弱い場合は拒否
  const best = hits[0]?.score ?? 0;
  if (best < 4) {
    return refuseAnswer(
      "関連度の高い根拠が見つかりませんでした。質問を具体化するか、サンプル質問から選んでください。",
      hits.slice(0, 3).map((h) => `${h.documentName} §${h.clauseId}`),
      searchedDocuments,
    );
  }

  const answer = freeFormFromChunks(question, hits);
  return {
    answer,
    meta: {
      searchedDocuments,
      sourcesFound: answer.sources.length,
      confidence: best >= 8 ? "high" : "medium",
      engine: "rag",
      scenarioId: null,
    },
    scenarioId: null,
  };
}
