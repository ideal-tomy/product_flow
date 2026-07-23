import type {
  DemoDocument,
  DemoQuestion,
  SourceReference,
} from "../../data/ConformSystem-demo";
import type { QueryCatalogItem } from "../../data/query-catalog";
import type { RawKnowledgeChunk } from "../../ai/knowledge";
import { adaptRawChunks, chunksToDocuments } from "../chunkUtils";
import type { KnowledgePack } from "../types";
import raw from "../../ai/data/work_procedure_chunks.json";

const src = {
  sopNew31: {
    documentName: "標準作業手順書 SOP-組立-07 v3.0",
    version: "3.0",
    page: "4-5",
    clauseId: "3.1",
    excerpt:
      "安全メガネおよび耐切創手袋（型式: CG-07 相当以上）を必ず着用する。未着用の場合は作業を開始してはならない。",
    highlight: "耐切創手袋",
  } satisfies SourceReference,
  sopOld31: {
    documentName: "標準作業手順書 SOP-組立-07 v2.1",
    version: "2.1",
    page: "4-5",
    clauseId: "3.1",
    excerpt: "手袋の着用は任意とする。耐切創手袋の常備は推奨するが、着用義務は設けない。",
    highlight: "任意",
  } satisfies SourceReference,
  sopNew42: {
    documentName: "標準作業手順書 SOP-組立-07 v3.0",
    version: "3.0",
    page: "8-9",
    clauseId: "4.2",
    excerpt:
      "ボルトAの締付トルクは 10 N·m とする。専用トルクレンチ TL-07 を使用する。",
    highlight: "10 N·m",
  } satisfies SourceReference,
  sopOld42: {
    documentName: "標準作業手順書 SOP-組立-07 v2.1",
    version: "2.1",
    page: "8",
    clauseId: "4.2",
    excerpt: "ボルトA（ブラケット固定用）の締付トルクは 8 N·m とする。",
    highlight: "8 N·m",
  } satisfies SourceReference,
  train: {
    documentName: "教育実施記録 組立ラインA",
    version: "2026-03",
    page: "1",
    clauseId: "TR-01",
    excerpt:
      "保護具・トルク・二重確認の再教育を実施すること。未受講者は単独作業不可。",
    highlight: "単独作業不可",
  } satisfies SourceReference,
  hh: {
    documentName: "ヒヤリハット事例集 組立",
    version: "2025",
    page: "3",
    clauseId: "HH-2025-12",
    excerpt:
      "手袋任意ルールにより未着用で作業し切創寸前。対策: 耐切創手袋必須化。",
    highlight: "手袋任意",
  } satisfies SourceReference,
  chkOld: {
    documentName: "工程内チェックリスト CL-組立-07",
    version: "2.1",
    page: "1",
    clauseId: "CL-03-OLD",
    excerpt: "ボルトAは 8 N·m。v3.0 適用後は本様式を使ってはならない。",
    highlight: "8 N·m",
  } satisfies SourceReference,
  gate: {
    documentName: "手順改訂承認チェック",
    version: "1.0",
    page: "1",
    clauseId: "GATE-A",
    excerpt:
      "再教育未完了、旧チェックリスト残存、保護具未配備がある場合は量産適用を承認しない。",
    highlight: "承認しない",
  } satisfies SourceReference,
};

const documents: DemoDocument[] = [
  {
    id: "SOP-NEW",
    name: "標準作業手順書 SOP-組立-07",
    version: "v3.0",
    pages: 18,
    category: "手順",
    note: "現行",
  },
  {
    id: "SOP-OLD",
    name: "標準作業手順書 SOP-組立-07",
    version: "v2.1",
    pages: 16,
    category: "手順",
    note: "旧版",
  },
  {
    id: "CHG-SOP",
    name: "作業手順改訂通知",
    version: "2026-03",
    pages: 4,
    category: "改訂",
    note: "通知",
  },
  {
    id: "TRAIN",
    name: "教育実施記録",
    version: "2026-03",
    pages: 6,
    category: "教育",
    note: "ラインA",
  },
  {
    id: "HH",
    name: "ヒヤリハット事例集",
    version: "2025",
    pages: 12,
    category: "安全",
    note: "組立",
  },
  {
    id: "CHK",
    name: "工程内チェックリスト",
    version: "v3.0",
    pages: 2,
    category: "帳票",
    note: "現行",
  },
  {
    id: "GATE",
    name: "手順改訂承認チェック",
    version: "v1.0",
    pages: 2,
    category: "承認",
    note: "ゲート",
  },
  {
    id: "QMS-W",
    name: "現場品質要求メモ",
    version: "v1.0",
    pages: 3,
    category: "品質",
    note: "要求",
  },
];

const questions: DemoQuestion[] = [
  {
    id: "version-diff",
    chipLabel: "何が変わった？",
    question: "作業手順 v2.1 から v3.0 で何が変わりましたか？",
    answer: {
      summary:
        "主な変更は 3件です。保護具の必須化、トルク 8→10 N·m、リーダー確認印の追加です。",
      comparisonLabel: "ボルトA 締付トルク",
      before: "8 N·m",
      after: "10 N·m",
      changes: [
        {
          id: "CHG-01",
          title: "保護具",
          clauseId: "3.1",
          before: "手袋は任意",
          after: "耐切創手袋必須",
          severity: "high",
        },
        {
          id: "CHG-02",
          title: "締付トルク",
          clauseId: "4.2",
          before: "8 N·m",
          after: "10 N·m",
          severity: "high",
        },
        {
          id: "CHG-03",
          title: "完了確認",
          clauseId: "5.1",
          before: "本人サインのみ",
          after: "リーダー確認印必須",
          severity: "medium",
        },
      ],
      sources: [src.sopNew31, src.sopOld31, src.sopNew42, src.sopOld42],
    },
  },
  {
    id: "impact-scope",
    chipLabel: "誰に影響？",
    question: "この改定の影響を受ける人・ものは？",
    answer: {
      summary:
        "影響は組立作業者・リーダー・教育担当・チェックリスト運用です。未受講者は単独作業できません。",
      impactGroups: [
        {
          label: "人",
          count: 3,
          items: ["組立作業者（保護具・トルク）", "リーダー（確認印）", "教育担当"],
        },
        {
          label: "帳票・道具",
          count: 3,
          items: ["チェックリスト v3.0", "専用トルクレンチ TL-07", "耐切創手袋"],
        },
        {
          label: "教育",
          count: 2,
          items: ["再教育 TR-01", "夜勤未受講者のフォロー"],
        },
      ],
      sources: [src.train, src.sopNew42, src.gate],
    },
  },
  {
    id: "retest",
    chipLabel: "再教育は必要？",
    question: "再教育が必要な項目は？",
    answer: {
      summary: "再教育は必須です。保護具・トルク・二重確認の3テーマが対象です。",
      retests: [
        {
          id: "TR-保護具",
          name: "保護具着用確認",
          reason: "手袋必須化",
          priority: "必須",
        },
        {
          id: "TR-トルク",
          name: "10 N·m 実技",
          reason: "トルク変更",
          priority: "必須",
        },
        {
          id: "TR-確認",
          name: "リーダー確認フロー",
          reason: "確認印追加",
          priority: "必須",
        },
        {
          id: "TR-異常停止",
          name: "異常時停止の説明",
          reason: "§6.2 追加",
          priority: "推奨",
        },
      ],
      sources: [src.train, src.gate],
    },
  },
  {
    id: "contradiction",
    chipLabel: "古い帳票との矛盾は？",
    question: "文書や帳票で矛盾している箇所はありますか？",
    answer: {
      summary:
        "旧チェックリスト（8 N·m）と新手順（10 N·m）が矛盾します。旧様式の使用は禁止です。",
      contradictions: [
        {
          id: "CX-01",
          title: "トルク値の帳票不整合",
          severity: "high",
          left: {
            documentName: "SOP v3.0",
            version: "3.0",
            value: "10 N·m",
          },
          right: {
            documentName: "チェックリスト旧",
            version: "2.1",
            value: "8 N·m",
          },
        },
      ],
      sources: [src.sopNew42, src.chkOld],
    },
  },
  {
    id: "similar-cases",
    chipLabel: "似たヒヤリハットは？",
    question: "過去に似たヒヤリハットはありますか？",
    answer: {
      summary:
        "HH-2025-12（手袋未着用）と HH-2024-08（トルク不足）が今回改定の直接根拠です。",
      similarCases: [
        {
          id: "HH-2025-12",
          title: "手袋未着用による切創寸前",
          similarity: 0.93,
          cause: "手袋任意ルール",
          countermeasure: "耐切創手袋必須化",
          relationToCurrent: "v3.0 §3.1 の根拠",
        },
        {
          id: "HH-2024-08",
          title: "トルク不足による再組立",
          similarity: 0.88,
          cause: "8 N·m では不足",
          countermeasure: "10 N·m へ変更",
          relationToCurrent: "v3.0 §4.2 の根拠",
        },
      ],
      sources: [src.hh, src.sopNew31],
    },
  },
  {
    id: "approval",
    chipLabel: "適用して大丈夫？",
    question: "この改定を現場適用して大丈夫ですか？",
    answer: {
      summary:
        "現時点では条件付き不可です。夜勤3名の再教育未完了と旧チェックリスト残存リスクがあります。完了後に適用してください。",
      impactAreas: ["再教育未完了（夜勤3名）", "旧帳票の撤去確認", "保護具配備"],
      exceptionNote: "GATE-A 未充足のため量産適用は保留。",
      sources: [src.gate, src.train],
    },
  },
  {
    id: "newbie",
    chipLabel: "新人向けに説明して",
    question: "新人向けに、今回の改定を短く説明して",
    answer: {
      summary:
        "かんたんに言うと、(1)手袋は必ず着る (2)ボルトは 10 N·m で締める (3)終わったらリーダーにも見てもらう、の3点です。",
      sources: [src.sopNew31, src.sopNew42, src.train],
    },
  },
  {
    id: "regulatory",
    chipLabel: "品質上の注意は？",
    question: "品質要求上、注意すべきことは？",
    answer: {
      summary:
        "変更時教育の完了（QMS-TR-01）と、旧版手順・旧チェックリストが現場に残っていないこと（QMS-DOC-01）が要点です。",
      impactAreas: ["QMS-TR-01 教育完了", "QMS-DOC-01 最新版識別"],
      sources: [src.gate, src.train],
    },
  },
];

const catalog: QueryCatalogItem[] = questions.map((q, i) => ({
  id: q.id,
  label: q.chipLabel,
  question: q.question,
  category:
    i < 2 ? "diff" : i < 4 ? "impact" : i < 6 ? "risk" : ("decide" as const),
  hint: q.answer.summary.slice(0, 24),
}));

const chunks = adaptRawChunks(raw as RawKnowledgeChunk[]);
const categoryNote: Record<string, string> = {
  sop: "手順",
  change_notice: "改訂",
  training: "教育",
  incident: "安全",
  checklist: "帳票",
  approval: "承認",
  qms: "品質",
  site: "現場",
};

export const workProcedurePack: KnowledgePack = {
  id: "work-procedure",
  label: "組立ラインA",
  title: "SOP-組立-07",
  audience: "everyone",
  audienceLabel: "",
  synthesizer: "generic",
  llmSystemPrompt:
    "You are ConformSystem, an industrial document reasoning assistant for assembly SOP revisions. " +
    "Answer in Japanese. Use ONLY the provided chunks. Cite documentName and clauseId.",
  context: {
    topic:
      "ミナトテック・組立ラインAの標準作業手順書改定（SOP-組立-07 v2.1→v3.0）",
    sources:
      "旧/新SOP・改訂通知・教育記録・ヒヤリハット・チェックリスト・承認ゲート・品質要求など",
    actions:
      "「何が変わった？」「誰に影響？」「再教育は？」「古い帳票と矛盾は？」と聞く",
    outcomes: "差分・影響・再教育・矛盾・適用可否が根拠付きで出る",
  },
  sample: {
    documents,
    sidebarDocuments: documents,
    questions,
    intro: {
      title: "手順改定デモ — 現場に落ちるまで見通す。",
      subtitle: "製造② · SOP-組立-07 · v2.1 → v3.0",
    },
    stats: {
      documents: documents.length,
      pages: 63,
      majorChanges: 3,
      retestCandidates: 4,
      contradictions: 1,
    },
    catalog,
    initialDocId: "SOP-NEW",
    initialQuestionId: "version-diff",
    versionLabel: "v2.1 → v3.0",
  },
  ai: {
    chunks,
    documents: chunksToDocuments(chunks, categoryNote),
    recommendedQueries: catalog,
    stats: {
      documents: new Set(chunks.map((c) => c.documentId)).size,
      chunks: chunks.length,
      company: "株式会社ミナトテック",
      product: "組立ラインA · SOP-組立-07",
    },
    initialDocId: "SOP-NEW",
  },
  guidedTour: {
    roleLabel: "管理職向け（製造・品質・教育）",
    headline: "4手で、手順改定の落とし込みを体験する",
    lead: "改定を出したあと、誰に効き、教育は足りるか、現場適用してよいかまで確認します。本命は「適用して大丈夫？」です。",
    climaxStepId: "step-approval",
    afterTourNote:
      "改定の次に見るべきは教育完了と旧版の撤去です。現場のその場判断は①、設計変更の波及は③で体験できます。",
    steps: [
      {
        id: "step-diff",
        shortLabel: "何が変わった？",
        questionId: "version-diff",
      },
      {
        id: "step-impact",
        shortLabel: "誰に影響？",
        questionId: "impact-scope",
      },
      {
        id: "step-retrain",
        shortLabel: "再教育は必要？",
        questionId: "retest",
      },
      {
        id: "step-approval",
        shortLabel: "適用して大丈夫？",
        questionId: "approval",
      },
    ],
    siblingDemos: [
      { label: "製造ハブへ", href: "/manufacturing" },
      { label: "① 現場判断", href: "/?pack=minato-factory" },
      { label: "③ 変更影響", href: "/?pack=tcu-480" },
    ],
  },
};
