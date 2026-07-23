import {
  demoDocuments,
  demoQuestions,
  scaleStats,
  sidebarDocuments,
  type DemoQuestion,
} from "../../data/ConformSystem-demo";
import { queryCatalog } from "../../data/query-catalog";
import { adaptRawChunks, chunksToDocuments } from "../chunkUtils";
import { knowledgeChunks as tcuChunks, knowledgeStats as tcuStats } from "../../ai/knowledge";
import { aiDocuments } from "../../ai/documents";
import { aiRecommendedQueries } from "../../ai/recommended";
import type { KnowledgePack } from "../types";
import type { RawKnowledgeChunk } from "../../ai/knowledge";
import rawTcu from "../../ai/data/knowledge_chunks.json";
import {
  presentationBeats,
  presentationSearchSteps,
  presentationTagline,
} from "../../data/presentation-script";

const categoryNote: Record<string, string> = {
  company_profile: "会社・製品",
  control_specification: "制御仕様",
  component_specification: "部品仕様",
  test_specification: "試験",
  fmea: "FMEA",
  change_history: "変更履歴",
  defect_cases: "不具合",
  design_review: "設計レビュー",
  supplier_qna: "サプライヤー",
  quality_audit: "品質監査",
  compliance_matrix: "品質要求",
  work_instruction: "承認WF",
};

// Ensure chunks are adapted (tcuChunks already adapted from knowledge.ts)
const chunks = tcuChunks.length
  ? tcuChunks
  : adaptRawChunks(rawTcu as RawKnowledgeChunk[]);

const catalog = queryCatalog.filter((q) =>
  demoQuestions.some((dq) => dq.id === q.id),
);

export const tcuPack: KnowledgePack = {
  id: "tcu-480",
  label: "TCU-480",
  title: "制御仕様 v3.2→v3.4",
  audience: "specialist",
  audienceLabel: "",
  synthesizer: "tcu",
  llmSystemPrompt:
    "You are ConformSystem, an industrial document reasoning assistant for Tohama Mobility TCU-480. " +
    "Answer in Japanese. Use ONLY the provided chunks.",
  context: {
    topic:
      "ミナトテック・車載温度制御ユニット（TCU-480）の制御仕様書改訂（v3.2→v3.4）",
    sources:
      "制御仕様・センサー・試験・FMEA・不具合・DR・サプライヤー・監査・承認WFなど13文書",
    actions:
      "「何が変わった？」「影響は？」「再試験は？」「矛盾は？」「承認して大丈夫？」と聞く",
    outcomes: "差分・影響範囲・再試験・不整合・根拠条項が数秒で出る",
  },
  sample: {
    documents: demoDocuments,
    sidebarDocuments,
    questions: demoQuestions as DemoQuestion[],
    intro: {
      title: "変更影響デモ — 版上げの波及を漏らさない。",
      subtitle: "製造③ · 制御仕様 v3.2 → v3.4",
    },
    stats: { ...scaleStats },
    catalog,
    initialDocId: "DOC-CTRL-034",
    initialQuestionId: "version-diff",
    versionLabel: "v3.2 → v3.4",
  },
  ai: {
    chunks,
    documents: aiDocuments.length
      ? aiDocuments
      : chunksToDocuments(chunks, categoryNote),
    recommendedQueries: aiRecommendedQueries,
    stats: {
      documents: tcuStats.documents,
      chunks: tcuStats.chunks,
      company: tcuStats.company,
      product: tcuStats.product,
    },
    initialDocId: "CTRL-SPEC-34",
  },
  presentation: {
    tagline: presentationTagline,
    searchSteps: [...presentationSearchSteps],
    beats: presentationBeats,
    scaleIntro: {
      eyebrow: "Tohama Mobility · TCU-480",
      documents: scaleStats.documents,
      pages: scaleStats.pages,
      clauses: 436,
      pagesLabel: "pages",
      clausesLabel: "clauses",
    },
  },
  guidedTour: {
    roleLabel: "設計・品質向け（経営は要約）",
    headline: "4手で、仕様変更の影響を体験する",
    lead: "製品仕様の版変更が、どこまで波及するかを確認します。本命は「影響範囲」です。サンプルは車載制御ユニットですが、「版を上げたときの漏れ」は他製品でも同じ型です。",
    climaxStepId: "step-impact",
    afterTourNote:
      "変更の影響を試験・FMEAまで含めて見られました。現場の即答は①、手順改定の落とし込みは②で体験できます。",
    steps: [
      {
        id: "step-diff",
        shortLabel: "何が変わった？",
        questionId: "version-diff",
      },
      {
        id: "step-impact",
        shortLabel: "影響範囲は？",
        questionId: "impact-scope",
      },
      {
        id: "step-retest",
        shortLabel: "再試験は？",
        questionId: "retest",
      },
      {
        id: "step-exec",
        shortLabel: "経営向けに3行",
        questionId: "exec-summary",
      },
    ],
    siblingDemos: [
      { label: "製造ハブへ", href: "/manufacturing" },
      { label: "① 現場判断", href: "/?pack=minato-factory" },
      { label: "② 手順改定・教育", href: "/?pack=work-procedure" },
    ],
  },
};
