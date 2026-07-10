import { getPack, DEFAULT_PACK_ID, type KnowledgePackId } from "../packs";
import type { KnowledgeChunk } from "./knowledge";
import { detectIntent, intentCategoryBoost, type AskIntent } from "./intent";

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[？?！!。、．，,§]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const SYNONYM_GROUPS: string[][] = [
  ["差分", "変更", "変わ", "改訂", "v3.2", "v3.4", "3.2", "3.4", "v2.1", "v3.0", "rev.b", "rev.c"],
  ["矛盾", "不整合", "不一致", "食い違"],
  ["再試験", "再検証", "試験", "再教育", "再検査"],
  ["承認", "gate", "量産", "大丈夫", "適用"],
  ["不具合", "事例", "過去", "類似", "ヒヤリハット", "誤アラーム"],
  ["影響", "波及", "fmea", "誰が"],
  ["品質", "規格", "qms", "要求"],
  ["許容", "精度", "±3", "±4", "±5", "トルク", "キズ"],
  ["保留", "始動", "起動", "5秒"],
  ["アラーム", "82", "85", "78"],
  ["サプライヤー", "保証", "供給"],
];

function expandTokens(question: string): string[] {
  const n = normalize(question);
  const base = n
    .split(/[\s/・：:（）()【】\[\]±℃\-]+/)
    .filter((t) => t.length >= 2);

  const extra: string[] = [];
  for (const group of SYNONYM_GROUPS) {
    if (group.some((g) => n.includes(normalize(g)))) {
      extra.push(...group.map(normalize));
    }
  }

  if (n.includes("売上") || n.includes("利益") || n.includes("価格")) {
    extra.push("__out_of_scope_finance__");
  }

  return [...new Set([...base, ...extra])];
}

export type ScoredChunk = KnowledgeChunk & { score: number };

export function retrieveChunks(
  question: string,
  options?: {
    topK?: number;
    intent?: AskIntent;
    packId?: KnowledgePackId;
    chunks?: KnowledgeChunk[];
  },
): { hits: ScoredChunk[]; searchedDocuments: number; intent: AskIntent } {
  const pack = getPack(options?.packId ?? DEFAULT_PACK_ID);
  const knowledgeChunks = options?.chunks ?? pack.ai.chunks;
  const intent = options?.intent ?? detectIntent(question);
  const topK = options?.topK ?? 10;
  const qTokens = expandTokens(question);
  const boostCats = new Set(intentCategoryBoost[intent]);
  const searchedDocuments = pack.ai.stats.documents;

  const scored = knowledgeChunks.map((chunk) => {
    const hay = normalize(
      [
        chunk.documentName,
        chunk.documentId,
        chunk.clauseId,
        chunk.excerpt,
        chunk.text,
        chunk.tags.join(" "),
        chunk.category,
      ].join(" "),
    );

    let score = 0;
    for (const t of qTokens) {
      if (t === "__out_of_scope_finance__") {
        score -= 100;
        continue;
      }
      if (t.length < 2) continue;
      if (hay.includes(t)) score += t.length >= 4 ? 3 : 2;
      if (chunk.tags.some((tag) => normalize(tag).includes(t))) score += 2;
    }

    if (question.includes(chunk.clauseId) || question.includes(`§${chunk.clauseId}`)) {
      score += 6;
    }
    if (chunk.highlight && question.includes(chunk.highlight)) score += 4;
    if (boostCats.has(chunk.category)) score += 4;

    if (intent === "version_diff" && chunk.category === "change_notice") score += 3;
    if (intent === "version_diff" && chunk.documentId.startsWith("CTRL-SPEC")) {
      score += 2;
    }
    if (intent === "contradiction" && chunk.documentId === "SENSOR-TS14-51") {
      score += 3;
    }
    if (
      intent === "contradiction" &&
      (chunk.clauseId.includes("OLD") || chunk.text.includes("使用禁止"))
    ) {
      score += 3;
    }
    if (intent === "retest" && chunk.text.includes("priority:")) score += 3;
    if (
      intent === "retest" &&
      (chunk.category === "training" || chunk.category === "retest")
    ) {
      score += 3;
    }
    if (intent === "similar_case" && chunk.clauseId.startsWith("CASE-")) score += 4;
    if (
      intent === "similar_case" &&
      (chunk.category === "incident" || chunk.category === "nonconformance")
    ) {
      score += 4;
    }
    if (intent === "approval" && chunk.documentId === "WI-DC-04") score += 3;
    if (intent === "approval" && chunk.category === "approval") score += 3;

    return { ...chunk, score };
  });

  const hits = scored
    .filter((c) => c.score >= 4)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  return { hits, searchedDocuments, intent };
}

export function isOutOfScopeQuestion(question: string): boolean {
  return detectIntent(question) === "refuse";
}
