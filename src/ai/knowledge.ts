import type { SourceReference } from "../data/ConformSystem-demo";
import rawChunks from "./data/knowledge_chunks.json";

export type RawKnowledgeChunk = {
  chunkId: string;
  documentId: string;
  documentName: string;
  version: string;
  category: string;
  clauseId: string;
  page: string | null;
  text: string;
};

export type KnowledgeChunk = SourceReference & {
  id: string;
  documentId: string;
  text: string;
  category: string;
  tags: string[];
  clauseDisplay: string;
};

const HIGHLIGHT_RE =
  /±\d+(?:\.\d+)?℃|\d+℃|\d+ms|\d+秒|TC-\d+|CASE-\d+-\d+|FMEA-R\d+|QMS-[A-Z]+-\d+|DTC-P\d+|SUP-ASK-\d+-\d+|CHG-\d+-\d+/;

function normalizeClauseId(clauseId: string): string {
  return clauseId.replace(/^§/, "").trim();
}

function buildExcerpt(text: string): string {
  const flat = text.replace(/\s+/g, " ").trim();
  if (flat.length <= 220) return flat;
  return `${flat.slice(0, 217)}…`;
}

function buildHighlight(text: string): string | undefined {
  const m = text.match(HIGHLIGHT_RE);
  return m?.[0];
}

function buildTags(
  chunk: RawKnowledgeChunk,
  clauseDisplay: string,
): string[] {
  const nameBits = chunk.documentName
    .split(/[\s—\-_/・]+/)
    .filter((t) => t.length >= 2);
  return [
    chunk.category,
    chunk.documentId,
    clauseDisplay,
    chunk.clauseId,
    ...nameBits.slice(0, 6),
  ];
}

function adaptChunk(raw: RawKnowledgeChunk): KnowledgeChunk {
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
  };
}

const typedRaw = rawChunks as RawKnowledgeChunk[];

export const knowledgeChunks: KnowledgeChunk[] = typedRaw.map(adaptChunk);

export const knowledgeStats = {
  documents: new Set(knowledgeChunks.map((c) => c.documentId)).size,
  chunks: knowledgeChunks.length,
  categories: new Set(knowledgeChunks.map((c) => c.category)).size,
  company: "東浜モビリティシステムズ株式会社",
  product: "TCU-480",
};

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

export function findChunksByDocumentId(documentId: string): KnowledgeChunk[] {
  return knowledgeChunks.filter((c) => c.documentId === documentId);
}
