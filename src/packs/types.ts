import type { DemoDocument, DemoQuestion } from "../data/gembashift-demo";
import type { QueryCatalogItem } from "../data/query-catalog";
import type { KnowledgeChunk } from "../ai/knowledge";

export type KnowledgePackId =
  | "work-procedure"
  | "inspection"
  | "tcu-480"
  | "standardization";

export type PackContext = {
  topic: string;
  sources: string;
  actions: string;
  outcomes: string;
};

export type PackSampleData = {
  documents: DemoDocument[];
  sidebarDocuments: DemoDocument[];
  questions: DemoQuestion[];
  intro: { title: string; subtitle: string };
  stats: {
    documents: number;
    pages: number;
    majorChanges: number;
    retestCandidates: number;
    contradictions: number;
  };
  catalog: QueryCatalogItem[];
  initialDocId: string;
  initialQuestionId: string;
  versionLabel?: string;
};

export type PackAiData = {
  chunks: KnowledgeChunk[];
  documents: DemoDocument[];
  recommendedQueries: QueryCatalogItem[];
  stats: {
    documents: number;
    chunks: number;
    company: string;
    product: string;
  };
  initialDocId: string;
};

export type KnowledgePack = {
  id: KnowledgePackId;
  label: string;
  title: string;
  audience: "everyone" | "specialist";
  audienceLabel: string;
  context: PackContext;
  sample: PackSampleData;
  ai: PackAiData;
};

export const DEFAULT_PACK_ID: KnowledgePackId = "work-procedure";

export function isKnowledgePackId(value: string | null | undefined): value is KnowledgePackId {
  return (
    value === "work-procedure" ||
    value === "inspection" ||
    value === "tcu-480" ||
    value === "standardization"
  );
}
