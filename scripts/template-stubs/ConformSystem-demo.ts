/** テンプレート互換スタブ（業界デモデータなし） */
import type { DemoDocument, DemoQuestion, SourceReference } from "./demo-types";

export type * from "./demo-types";
export type {
  SourceReference,
  DemoAnswer,
  DemoQuestion,
  DemoDocument,
  SpecChangeItem,
  ContradictionItem,
  SimilarCaseItem,
  RetestItem,
  ImpactGroup,
} from "./demo-types";

export const scaleStats = {
  documents: 3,
  pages: 6,
  majorChanges: 2,
  retestCandidates: 0,
  contradictions: 1,
} as const;

export const demoIntro = {
  title: "社内文書に、そのまま質問できます。",
  subtitle: "Starter · placeholder",
} as const;

export const demoDocuments: DemoDocument[] = [
  {
    id: "DOC-A",
    name: "サンプル文書 A",
    version: "v1.0",
    pages: 4,
    category: "手順",
    note: "現行",
  },
];

export const sidebarDocuments: DemoDocument[] = demoDocuments;

const placeholderSource: SourceReference = {
  documentName: "サンプル文書 A v1.0",
  version: "1.0",
  page: "2",
  clauseId: "2.1",
  excerpt: "プレースホルダ根拠です。業界デモでは実文書に差し替えてください。",
  highlight: "プレースホルダ",
  documentId: "DOC-A",
};

export const demoQuestions: DemoQuestion[] = [
  {
    id: "version-diff",
    chipLabel: "何が変わった？",
    question: "文書の改定で何が変わりましたか？",
    answer: {
      summary:
        "プレースホルダ回答です。業界デモでは Sample 質問を pack.ts に定義してください。",
      before: "5",
      after: "8",
      comparisonLabel: "数値例",
      sources: [placeholderSource],
    },
  },
];

export const lpDemoQuestions = demoQuestions;

export const genericBeforeAnswer =
  "一般的な回答例（プレースホルダ）です。根拠文書を特定できていません。業界デモでは pack.ts の固定回答に差し替えてください。";

export const checklistItems = [
  {
    title: "改訂のたびに差分確認が属人化している",
    detail: "誰が・どこを・どう変わったかを口頭と経験で補っている",
  },
  {
    title: "古い帳票と新手順の矛盾に気づきにくい",
    detail: "現場に旧版が残り、監査や手戻りにつながる",
  },
  {
    title: "影響範囲の洗い出しに時間がかかる",
    detail: "教育・部品・関連文書の特定が会議ベースになっている",
  },
];

export const impactRows = [
  {
    task: "差分確認",
    before: "45分",
    after: "数秒",
    reduction: "大幅短縮",
  },
  {
    task: "矛盾チェック",
    before: "半日",
    after: "数秒",
    reduction: "大幅短縮",
  },
  {
    task: "影響範囲の洗い出し",
    before: "半日〜",
    after: "数秒",
    reduction: "大幅短縮",
  },
];
