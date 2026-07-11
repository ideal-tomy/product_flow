import type { DemoAnswer, SourceReference } from "../../data/gembashift-demo";
import type { KnowledgeChunk } from "../knowledge";
import type { AskIntent } from "../intent";
import type { ScoredChunk } from "../retrieve";
import { chunkToSource } from "../../packs/chunkUtils";

export const COMPANY_BRIDGE =
  "※ 御社のSOP・検査規格・品質マニュアルも、同様にナレッジ登録すれば同じ手順で参照できます。";

function sourcesFrom(chunks: KnowledgeChunk[]): SourceReference[] {
  const map = new Map<string, SourceReference>();
  for (const c of chunks) {
    const s = chunkToSource(c);
    const key = `${s.documentName}|${s.version}|${s.clauseId}|${s.page}`;
    if (!map.has(key)) map.set(key, s);
  }
  return [...map.values()].slice(0, 10);
}

function withBridge(summary: string, question: string, intent: AskIntent): string {
  const needsBridge =
    intent === "company" ||
    question.includes("社内") ||
    question.includes("SOP") ||
    question.includes("作業手順");
  if (!needsBridge) return summary;
  if (summary.includes(COMPANY_BRIDGE)) return summary;
  return `${summary}\n\n${COMPANY_BRIDGE}`;
}

function synthesizeUnsupportedScenario(kind: string): DemoAnswer {
  return {
    summary: `このパックには${kind}の改訂シナリオはありません。定義・分類・適合性評価・国際制度などについて質問してください。`,
    sources: [],
    exceptionNote: "標準化実務入門パック向け案内",
  };
}

function synthesizeDefinitional(
  question: string,
  intent: AskIntent,
  hits: ScoredChunk[],
): DemoAnswer {
  let ranked = [...hits];
  const q = question;

  if (q.includes("社内規格") || q.includes("社内標準") || intent === "company") {
    ranked.sort((a, b) => {
      const score = (c: ScoredChunk) =>
        (c.text.includes("社内規格は、会社") ? 20 : 0) +
        (c.text.includes("社内規格") ? 5 : 0) +
        c.score;
      return score(b) - score(a);
    });
  } else if (
    q.includes("標準化とは") ||
    q.includes("ガイド2") ||
    q.includes("ガイド２")
  ) {
    ranked.sort((a, b) => {
      const score = (c: ScoredChunk) =>
        (c.text.includes("最適な秩序を得る") ? 20 : 0) +
        (c.clauseId.includes("標準化とは") ? 10 : 0) +
        c.score;
      return score(b) - score(a);
    });
  } else if (q.includes("分類") || q.includes("作成組織")) {
    ranked.sort((a, b) => {
      const score = (c: ScoredChunk) =>
        (c.text.includes("５つのタイプ") || c.text.includes("5つのタイプ")
          ? 20
          : 0) +
        (c.text.includes("国際規格") && c.text.includes("社内規格") ? 10 : 0) +
        c.score;
      return score(b) - score(a);
    });
  }

  const top = ranked.slice(0, 5);
  if (top.length === 0) {
    return { summary: "", sources: [] };
  }

  const lead = top[0]!;
  const bullets = top
    .slice(0, 4)
    .map((h) => `・${h.documentName} / ${h.clauseId}: ${h.excerpt.slice(0, 100)}`)
    .join("\n");

  const summary = withBridge(
    `登録ナレッジ（『標準化実務入門』）から関連箇所を ${top.length} 件抽出しました。\n\n代表根拠（${lead.documentName} ${lead.clauseId}）:\n${lead.excerpt}\n\n関連箇所:\n${bullets}`,
    question,
    intent,
  );

  return {
    summary,
    sources: sourcesFrom(top),
    exceptionNote: "自由入力のため、詳細は各根拠条項を確認してください。",
  };
}

/**
 * 標準化実務入門パック専用シンセサイザ。
 * - 根拠チャンクの事実のみ
 * - 社内規格系はブリッジ文を付与
 * - 改訂/矛盾/再試験 intent は案内のみ（generic 改訂ロジックに入らない）
 */
export function synthesizeStandardizationAnswer(
  question: string,
  intent: AskIntent,
  _chunks: KnowledgeChunk[],
  hits: ScoredChunk[],
): DemoAnswer {
  if (
    intent === "version_diff" ||
    intent === "contradiction" ||
    intent === "retest"
  ) {
    const label =
      intent === "version_diff"
        ? "版差分"
        : intent === "contradiction"
          ? "文書間矛盾"
          : "再試験";
    return synthesizeUnsupportedScenario(label);
  }

  return synthesizeDefinitional(question, intent, hits);
}
