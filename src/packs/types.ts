import type { DemoDocument, DemoQuestion } from "../data/demo-types";
import type { QueryCatalogItem } from "../data/query-catalog";
import type { KnowledgeChunk } from "../ai/knowledge";
import type { PresentationBeat } from "../data/presentation-script";

/** 登録されたパックの id（registry で検証） */
export type KnowledgePackId = string;

/** AI 回答の合成器。新規パックは generic を推奨 */
export type PackSynthesizer = "generic" | "tcu" | "standardization";

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

export type PackScaleIntro = {
  eyebrow: string;
  documents: number;
  pages: number;
  clauses: number;
  pagesLabel?: string;
  clausesLabel?: string;
};

/** Presentation / 自動再生用（任意） */
export type PackPresentation = {
  tagline: string;
  searchSteps: string[];
  beats: PresentationBeat[];
  scaleIntro?: PackScaleIntro;
};

/** 公開体験用ガイド（1デモ1テーマ）。表にパック切替を出さない入口向け */
export type PackGuidedTourStep = {
  id: string;
  /** ボタン短ラベル */
  shortLabel: string;
  /** sample.questions / catalog の id */
  questionId: string;
};

export type PackGuidedTour = {
  /** 例: 現場スタッフ向け */
  roleLabel: string;
  headline: string;
  lead: string;
  steps: PackGuidedTourStep[];
  /** クライマックス step id（視覚強調） */
  climaxStepId?: string;
  afterTourNote?: string;
  /** ツアー完了後の兄弟デモ（②③など） */
  siblingDemos?: { label: string; href: string }[];
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
  /** 省略時は generic */
  synthesizer?: PackSynthesizer;
  /** OpenAI 用システムプロンプト（省略時は汎用） */
  llmSystemPrompt?: string;
  /** Presentation Mode 用。無い場合は Sample 統計からフォールバック */
  presentation?: PackPresentation;
  /** 公開ガイドツアー。あるパックは Live でガイドUIを優先 */
  guidedTour?: PackGuidedTour;
};

/** ショーケース既定。テンプレ化後は starter に差し替わる */
export const DEFAULT_PACK_ID: KnowledgePackId = "work-procedure";
