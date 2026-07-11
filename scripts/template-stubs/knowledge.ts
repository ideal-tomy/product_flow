import type { SourceReference } from "../data/demo-types";

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

export const knowledgeChunks: KnowledgeChunk[] = [];

export const knowledgeStats = {
  documents: 0,
  chunks: 0,
  categories: 0,
  company: "",
  product: "",
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
