import { knowledgeChunks, type KnowledgeChunk } from "./knowledge";

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[？?！!。、．，,]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(text: string): string[] {
  const n = normalize(text);
  const parts = n.split(/[\s/・：:（）()【】\[\]±℃]+/).filter(Boolean);
  const extra: string[] = [];
  if (n.includes("許容") || n.includes("誤差")) extra.push("許容範囲");
  if (n.includes("再試験") || n.includes("試験")) extra.push("再試験", "試験");
  if (n.includes("矛盾") || n.includes("不整合")) extra.push("矛盾", "不整合");
  if (n.includes("影響")) extra.push("影響");
  if (n.includes("売上") || n.includes("利益") || n.includes("価格"))
    extra.push("__out_of_scope_finance__");
  return [...parts, ...extra];
}

export type ScoredChunk = KnowledgeChunk & { score: number };

export function retrieveChunks(
  question: string,
  topK = 7,
): { hits: ScoredChunk[]; searchedDocuments: number } {
  const qTokens = tokens(question);
  const docSet = new Set(knowledgeChunks.map((c) => c.documentName));

  const scored = knowledgeChunks.map((chunk) => {
    const hay = normalize(
      [
        chunk.documentName,
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
    // 短い完全一致っぽい語
    if (question.includes(chunk.clauseId)) score += 5;
    if (question.includes(chunk.highlight ?? "")) score += 4;
    return { ...chunk, score };
  });

  const hits = scored
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  return { hits, searchedDocuments: docSet.size };
}

export function isOutOfScopeQuestion(question: string): boolean {
  const n = normalize(question);
  return (
    n.includes("売上") ||
    n.includes("利益") ||
    n.includes("価格") ||
    n.includes("単価") ||
    n.includes("給与") ||
    n.includes("人事") ||
    n.includes("株価")
  );
}
