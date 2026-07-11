import type { SourceReference } from "../data/gembashift-demo";
import type { KnowledgeChunk, RawKnowledgeChunk } from "../ai/knowledge";

const HIGHLIGHT_RE =
  /±\d+(?:\.\d+)?℃|\d+℃|\d+ms|\d+秒|\d+分|TC-\d+|CASE-\d+-\d+|SOP-\S+|INS-\S+|Rev\.[A-Z]|\d+\.\d+/;

function normalizeClauseId(clauseId: string): string {
  return clauseId.replace(/^§/, "").trim();
}

function buildExcerpt(text: string): string {
  const flat = text.replace(/\s+/g, " ").trim();
  if (flat.length <= 220) return flat;
  return `${flat.slice(0, 217)}…`;
}

function buildHighlight(text: string): string | undefined {
  return text.match(HIGHLIGHT_RE)?.[0];
}

function buildTags(raw: RawKnowledgeChunk, clauseDisplay: string): string[] {
  const nameBits = raw.documentName
    .split(/[\s—\-_/・]+/)
    .filter((t) => t.length >= 2);
  return [
    raw.category,
    raw.documentId,
    clauseDisplay,
    raw.clauseId,
    ...nameBits.slice(0, 6),
  ];
}

/** 任意パックの raw JSON を KnowledgeChunk に変換 */
export function adaptRawChunks(rawChunks: RawKnowledgeChunk[]): KnowledgeChunk[] {
  return rawChunks.map((raw) => {
    const clauseDisplay = normalizeClauseId(raw.clauseId);
    return {
      id: raw.chunkId,
      documentId: raw.documentId,
      documentName: raw.documentName,
      version: raw.version,
      page: raw.page ?? "—",
      clauseId: clauseDisplay,
      clauseDisplay,
      excerpt: buildExcerpt(raw.text),
      highlight: buildHighlight(raw.text),
      text: raw.text,
      category: raw.category,
      tags: buildTags(raw, clauseDisplay),
    } satisfies KnowledgeChunk;
  });
}

export function chunksToDocuments(
  chunks: KnowledgeChunk[],
  categoryNote: Record<string, string>,
): import("../data/gembashift-demo").DemoDocument[] {
  const map = new Map<
    string,
    { name: string; version: string; category: string; pages: number }
  >();

  for (const c of chunks) {
    const prev = map.get(c.documentId);
    if (!prev) {
      map.set(c.documentId, {
        name: c.documentName,
        version:
          c.version.startsWith("v") ||
          c.version.startsWith("Rev") ||
          /^H\d/.test(c.version)
            ? c.version
            : `v${c.version}`,
        category: c.category,
        pages: 1,
      });
    } else {
      prev.pages += 1;
    }
  }

  return [...map.entries()].map(([id, meta]) => ({
    id,
    name: meta.name,
    version: meta.version,
    pages: Math.max(meta.pages * 6, 8),
    category: categoryNote[meta.category] ?? meta.category,
    note: categoryNote[meta.category] ?? "ナレッジ",
  }));
}

export function chunkToSource(chunk: KnowledgeChunk): SourceReference {
  return {
    documentName: chunk.documentName,
    version: chunk.version,
    page: chunk.page,
    clauseId: chunk.clauseId,
    excerpt: chunk.excerpt,
    highlight: chunk.highlight,
    chunkId: chunk.id,
    fullText: chunk.text,
    documentId: chunk.documentId,
  };
}

/** Sample 固定根拠に、パックチャンクから全文を補完する */
export function enrichSourcesFromChunks(
  sources: SourceReference[],
  chunks: KnowledgeChunk[],
): SourceReference[] {
  return sources.map((s) => {
    if (s.fullText) return s;
    const hit =
      chunks.find(
        (c) =>
          c.clauseId === s.clauseId &&
          c.version === s.version &&
          (c.documentName === s.documentName ||
            c.documentName.includes(s.documentName) ||
            s.documentName.includes(c.documentName.split(" ")[0] ?? "")),
      ) ??
      chunks.find(
        (c) =>
          c.clauseId === s.clauseId &&
          (c.version === s.version ||
            c.version === s.version.replace(/^v/, "") ||
            `v${c.version}` === s.version),
      );
    if (!hit) return s;
    return {
      ...s,
      chunkId: hit.id,
      fullText: hit.text,
      documentId: hit.documentId,
      highlight: s.highlight ?? hit.highlight,
    };
  });
}
