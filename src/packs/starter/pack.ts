/**
 * 空テンプレート用スターターパック
 *
 * 業界デモを作る手順:
 * 1. `npm run new-pack -- <id> "<表示名>"` でこのパックをコピー
 * 2. `src/ai/data/<id>_chunks.json` を実ナレッジに差し替え
 * 3. 下記の documents / questions / context を業界内容に書き換え
 * 4. `src/packs/index.ts` の登録を確認（new-pack が自動追加）
 *
 * 詳細: docs/PACK_RECIPE.md
 */
import type {
  DemoDocument,
  DemoQuestion,
  SourceReference,
} from "../../data/demo-types";
import type { QueryCatalogItem } from "../../data/query-catalog";
import type { RawKnowledgeChunk } from "../../ai/knowledge";
import { adaptRawChunks, chunksToDocuments } from "../chunkUtils";
import type { KnowledgePack } from "../types";
import raw from "../../ai/data/starter_chunks.json";

const src = {
  docA21: {
    documentName: "サンプル文書 A v1.0",
    version: "1.0",
    page: "2",
    clauseId: "2.1",
    excerpt: "現行版では手順の実施を必須とします。数値例: 旧 5 → 新 8。",
    highlight: "必須",
    documentId: "DOC-A",
    chunkId: "DOC-A:2",
  } satisfies SourceReference,
  docB: {
    documentName: "サンプル改訂通知 v1.0",
    version: "1.0",
    page: "1",
    clauseId: "1",
    excerpt: "主な変更は「任意→必須」と数値 5→8 です。",
    highlight: "5→8",
    documentId: "DOC-B",
    chunkId: "DOC-B:1",
  } satisfies SourceReference,
  docC: {
    documentName: "サンプル確認リスト v0.9",
    version: "0.9",
    page: "1",
    clauseId: "CL-01",
    excerpt: "数値は 5 のままです（旧版）。文書 A v1.0（数値 8）と矛盾するプレースホルダ例です。",
    highlight: "5",
    documentId: "DOC-C",
    chunkId: "DOC-C:1",
  } satisfies SourceReference,
};

const documents: DemoDocument[] = [
  {
    id: "DOC-A",
    name: "サンプル文書 A",
    version: "v1.0",
    pages: 4,
    category: "手順",
    note: "現行（差し替え可）",
  },
  {
    id: "DOC-B",
    name: "サンプル改訂通知",
    version: "v1.0",
    pages: 1,
    category: "改訂",
    note: "通知",
  },
  {
    id: "DOC-C",
    name: "サンプル確認リスト",
    version: "v0.9",
    pages: 1,
    category: "帳票",
    note: "旧（矛盾例）",
  },
];

const questions: DemoQuestion[] = [
  {
    id: "version-diff",
    chipLabel: "何が変わった？",
    question: "文書の改定で何が変わりましたか？",
    answer: {
      summary:
        "プレースホルダ回答です。主な変更は「任意→必須」と数値 5→8 の2点です。実デモではここを業界シナリオに書き換えてください。",
      comparisonLabel: "数値例",
      before: "5",
      after: "8",
      changes: [
        {
          id: "CHG-01",
          title: "実施義務",
          clauseId: "2.1",
          before: "任意",
          after: "必須",
          severity: "high",
        },
        {
          id: "CHG-02",
          title: "数値",
          clauseId: "2.1",
          before: "5",
          after: "8",
          severity: "medium",
        },
      ],
      sources: [src.docA21, src.docB],
    },
  },
  {
    id: "contradiction",
    chipLabel: "矛盾はある？",
    question: "文書や帳票で矛盾している箇所はありますか？",
    answer: {
      summary:
        "プレースホルダ回答です。確認リスト（数値 5）と文書 A（数値 8）が矛盾しています。",
      contradictions: [
        {
          id: "CX-01",
          title: "数値の帳票不整合",
          severity: "high",
          left: {
            documentName: "サンプル文書 A",
            version: "1.0",
            value: "8",
          },
          right: {
            documentName: "サンプル確認リスト",
            version: "0.9",
            value: "5",
          },
        },
      ],
      sources: [src.docA21, src.docC],
    },
  },
  {
    id: "impact-scope",
    chipLabel: "誰に影響？",
    question: "この改定の影響を受ける人・ものは？",
    answer: {
      summary:
        "プレースホルダ回答です。影響範囲の例として、現場担当・確認リスト運用・教育担当を挙げています。",
      impactGroups: [
        {
          label: "人",
          count: 2,
          items: ["現場担当（手順必須化）", "教育担当"],
        },
        {
          label: "帳票",
          count: 1,
          items: ["確認リストの数値更新"],
        },
      ],
      sources: [src.docB, src.docA21],
    },
  },
];

const catalog: QueryCatalogItem[] = questions.map((q, i) => ({
  id: q.id,
  label: q.chipLabel,
  question: q.question,
  category: (i === 0 ? "diff" : i === 1 ? "risk" : "impact") as QueryCatalogItem["category"],
  hint: q.answer.summary.slice(0, 24),
}));

const chunks = adaptRawChunks(raw as RawKnowledgeChunk[]);
const categoryNote: Record<string, string> = {
  sop: "手順",
  change_notice: "改訂",
  checklist: "帳票",
};

export const starterPack: KnowledgePack = {
  id: "starter",
  label: "Starter",
  title: "テンプレート（差し替え用）",
  audience: "everyone",
  audienceLabel: "",
  synthesizer: "generic",
  llmSystemPrompt:
    "You are ConformSystem, an industrial document reasoning assistant. " +
    "The current knowledge pack is a TEMPLATE with placeholder documents. " +
    "Answer in Japanese using ONLY the provided chunks. " +
    "Do not invent company names, clause IDs, or numbers beyond the chunks.",
  context: {
    topic: "【差し替え】業界・現場・文書改定のテーマを書く",
    sources: "【差し替え】参照する文書種（手順・改訂通知・帳票など）",
    actions: "「何が変わった？」「矛盾は？」「誰に影響？」などと聞く",
    outcomes: "差分・矛盾・影響が根拠付きで出る",
  },
  sample: {
    documents,
    sidebarDocuments: documents,
    questions,
    intro: {
      title: "社内文書に、そのまま質問できます。",
      subtitle: "Starter · プレースホルダ文書（差し替え用）",
    },
    stats: {
      documents: documents.length,
      pages: 6,
      majorChanges: 2,
      retestCandidates: 0,
      contradictions: 1,
    },
    catalog,
    initialDocId: "DOC-A",
    initialQuestionId: "version-diff",
    versionLabel: "placeholder",
  },
  ai: {
    chunks,
    documents: chunksToDocuments(chunks, categoryNote),
    recommendedQueries: catalog,
    stats: {
      documents: new Set(chunks.map((c) => c.documentId)).size,
      chunks: chunks.length,
      company: "株式会社ミナトテック",
      product: "（製品・現場名を差し替え）",
    },
    initialDocId: "DOC-A",
  },
  presentation: {
    tagline: "探す時間を、判断する時間へ。",
    searchSteps: [
      "Scanning 3 documents",
      "Comparing placeholder revisions",
      "Checking contradictions",
      "2 sources found",
    ],
    beats: [
      { at: 0, type: "intro" },
      { at: 3, type: "clear" },
      { at: 3.2, type: "ask", scenarioId: "version-diff" },
      { at: 12, type: "ask", scenarioId: "contradiction" },
      { at: 20, type: "open-source" },
      { at: 24, type: "tagline" },
      { at: 28, type: "done" },
    ],
    scaleIntro: {
      eyebrow: "Template starter pack",
      documents: 3,
      pages: 6,
      clauses: 4,
      pagesLabel: "pages",
      clausesLabel: "chunks",
    },
  },
};
