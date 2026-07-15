import type {
  DemoDocument,
  DemoQuestion,
  SourceReference,
} from "../../data/ConformSystem-demo";
import type { QueryCatalogItem } from "../../data/query-catalog";
import type { RawKnowledgeChunk } from "../../ai/knowledge";
import { adaptRawChunks, chunksToDocuments } from "../chunkUtils";
import type { KnowledgePack } from "../types";
import raw from "../../ai/data/inspection_chunks.json";

const src = {
  new21: {
    documentName: "出荷検査手順 INS-出荷-03 Rev.C",
    version: "Rev.C",
    page: "3-4",
    clauseId: "2.1",
    excerpt:
      "キズの長さが 2mm 未満であれば合格とする。2mm以上は不適合。旧基準（3mm）は失効。",
    highlight: "2mm",
  } satisfies SourceReference,
  old21: {
    documentName: "出荷検査手順 INS-出荷-03 Rev.B",
    version: "Rev.B",
    page: "3",
    clauseId: "2.1",
    excerpt: "キズの長さが 3mm 未満であれば合格とする。",
    highlight: "3mm",
  } satisfies SourceReference,
  new32: {
    documentName: "出荷検査手順 INS-出荷-03 Rev.C",
    version: "Rev.C",
    page: "6-7",
    clauseId: "3.2",
    excerpt:
      "結果は検査システム（製品番号紐づけ）へ電子記録する。紙帳票のみの記録は不可。",
    highlight: "電子記録",
  } satisfies SourceReference,
  critOld: {
    documentName: "判定基準表 CR-出荷-03",
    version: "Rev.B",
    page: "1",
    clauseId: "CR-01-OLD",
    excerpt: "合格: 3mm未満。Rev.C 適用後は使用禁止。",
    highlight: "3mm",
  } satisfies SourceReference,
  retest: {
    documentName: "再検査・教育チェックリスト",
    version: "1.0",
    page: "1",
    clauseId: "RI-01",
    excerpt:
      "キズ判定訓練・電子記録操作・抜取変更の実技。未完了者は単独検査不可。",
    highlight: "単独検査不可",
  } satisfies SourceReference,
  nc: {
    documentName: "不適合・再発防止記録",
    version: "2025",
    page: "2",
    clauseId: "NC-2025-44",
    excerpt:
      "顧客で約2.8mmのキズが指摘。対策: Rev.C で 2mm へ厳格化。",
    highlight: "2mm",
  } satisfies SourceReference,
  gate: {
    documentName: "検査改訂承認ゲート",
    version: "1.0",
    page: "1",
    clauseId: "GATE-I",
    excerpt:
      "再教育未完了、旧判定基準表の残存、校正切れ測定器がある場合は承認しない。",
    highlight: "承認しない",
  } satisfies SourceReference,
};

const documents: DemoDocument[] = [
  {
    id: "INS-NEW",
    name: "出荷検査手順 INS-出荷-03",
    version: "Rev.C",
    pages: 14,
    category: "検査",
    note: "現行",
  },
  {
    id: "INS-OLD",
    name: "出荷検査手順 INS-出荷-03",
    version: "Rev.B",
    pages: 12,
    category: "検査",
    note: "旧版",
  },
  {
    id: "CRIT",
    name: "判定基準表",
    version: "Rev.C",
    pages: 2,
    category: "基準",
    note: "現行",
  },
  {
    id: "CHG-INS",
    name: "検査手順改訂通知",
    version: "2026-04",
    pages: 3,
    category: "改訂",
    note: "通知",
  },
  {
    id: "NC",
    name: "不適合・再発防止記録",
    version: "2025",
    pages: 10,
    category: "品質",
    note: "事例",
  },
  {
    id: "CAL",
    name: "測定器校正記録",
    version: "2026-Q1",
    pages: 4,
    category: "校正",
    note: "器具",
  },
  {
    id: "RETEST",
    name: "再検査・教育チェックリスト",
    version: "v1.0",
    pages: 2,
    category: "教育",
    note: "必須",
  },
  {
    id: "GATE-I",
    name: "検査改訂承認ゲート",
    version: "v1.0",
    pages: 2,
    category: "承認",
    note: "ゲート",
  },
];

const questions: DemoQuestion[] = [
  {
    id: "version-diff",
    chipLabel: "何が変わった？",
    question: "検査手順 Rev.B から Rev.C で何が変わりましたか？",
    answer: {
      summary:
        "主な変更は 3件です。キズ判定 3mm→2mm、記録の電子化、抜取 5→8個です。",
      comparisonLabel: "キズ合格基準",
      before: "3mm未満",
      after: "2mm未満",
      changes: [
        {
          id: "CHG-I1",
          title: "キズ判定",
          clauseId: "2.1",
          before: "3mm未満で合格",
          after: "2mm未満で合格",
          severity: "high",
        },
        {
          id: "CHG-I2",
          title: "記録方法",
          clauseId: "3.2",
          before: "紙帳票",
          after: "電子記録必須",
          severity: "high",
        },
        {
          id: "CHG-I3",
          title: "抜取数",
          clauseId: "4.1",
          before: "5個",
          after: "8個",
          severity: "medium",
        },
      ],
      sources: [src.new21, src.old21, src.new32],
    },
  },
  {
    id: "impact-scope",
    chipLabel: "影響は？",
    question: "この改定の影響範囲は？",
    answer: {
      summary:
        "検査員・記録システム・測定器（デジタルノギス）・教育に影響します。",
      impactGroups: [
        {
          label: "人",
          count: 2,
          items: ["検査員（判定・操作）", "教育担当"],
        },
        {
          label: "基準・記録",
          count: 3,
          items: ["判定基準表 Rev.C", "検査システム", "旧紙帳票の廃止"],
        },
        {
          label: "器具",
          count: 1,
          items: ["校正済みデジタルノギス"],
        },
      ],
      sources: [src.new32, src.retest, src.gate],
    },
  },
  {
    id: "retest",
    chipLabel: "再検査・再教育は？",
    question: "再検査や再教育が必要な項目は？",
    answer: {
      summary:
        "キズ判定訓練・電子記録操作・抜取数変更の実技が必須です。未完了者は単独検査不可です。",
      retests: [
        {
          id: "RI-キズ",
          name: "キズ判定訓練",
          reason: "2mm基準",
          priority: "必須",
        },
        {
          id: "RI-電子",
          name: "電子記録操作",
          reason: "紙廃止",
          priority: "必須",
        },
        {
          id: "RI-抜取",
          name: "抜取数変更の実技",
          reason: "5→8個",
          priority: "必須",
        },
        {
          id: "RI-隔離",
          name: "不適合隔離フロー",
          reason: "§5.3",
          priority: "推奨",
        },
      ],
      sources: [src.retest, src.gate],
    },
  },
  {
    id: "contradiction",
    chipLabel: "古い基準との矛盾は？",
    question: "文書間で矛盾している箇所はありますか？",
    answer: {
      summary:
        "旧判定基準表（3mm）と Rev.C（2mm）が矛盾します。旧表は使用禁止です。",
      contradictions: [
        {
          id: "CX-I1",
          title: "キズ判定基準の不整合",
          severity: "high",
          left: {
            documentName: "INS Rev.C",
            version: "Rev.C",
            value: "2mm",
          },
          right: {
            documentName: "判定基準表旧",
            version: "Rev.B",
            value: "3mm",
          },
        },
      ],
      sources: [src.new21, src.critOld],
    },
  },
  {
    id: "similar-cases",
    chipLabel: "似た不適合は？",
    question: "過去に似た不適合はありますか？",
    answer: {
      summary:
        "NC-2025-44（キズ見逃し）と NC-2024-19（記録欠落）が今回改定の根拠です。",
      similarCases: [
        {
          id: "NC-2025-44",
          title: "キズ見逃し",
          similarity: 0.91,
          cause: "判定基準が緩い",
          countermeasure: "2mmへ厳格化",
          relationToCurrent: "Rev.C §2.1 の根拠",
        },
        {
          id: "NC-2024-19",
          title: "記録欠落",
          similarity: 0.84,
          cause: "紙帳票の紛失",
          countermeasure: "電子記録必須",
          relationToCurrent: "Rev.C §3.2 の根拠",
        },
      ],
      sources: [src.nc, src.new21],
    },
  },
  {
    id: "approval",
    chipLabel: "適用して大丈夫？",
    question: "この改定を検査工程に適用して大丈夫ですか？",
    answer: {
      summary:
        "現時点では条件付き不可です。遅番2名の電子記録操作未完了があります。完了と旧基準表の撤去後に適用してください。",
      impactAreas: ["再教育未完了", "旧判定基準表の撤去", "デジタルノギス配備"],
      exceptionNote: "GATE-I 未充足のため適用保留。",
      sources: [src.gate, src.retest],
    },
  },
  {
    id: "newbie",
    chipLabel: "かんたんに説明して",
    question: "今回の検査改定を短く説明して",
    answer: {
      summary:
        "ポイントは3つ。(1)キズは2mm未満ならOK (2)結果はシステムに入れる (3)抜取は8個、です。",
      sources: [src.new21, src.new32],
    },
  },
  {
    id: "regulatory",
    chipLabel: "品質上の注意は？",
    question: "品質要求上、注意すべきことは？",
    answer: {
      summary:
        "判定値の一元管理（掲示・手順・システム）と、記録の追跡性（紙のみ不可）が要点です。",
      impactAreas: ["QMS-INS-01 判定の一致", "QMS-INS-02 追跡性"],
      sources: [src.gate, src.new32],
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
  inspection: "検査",
  criteria: "基準",
  change_notice: "改訂",
  nonconformance: "不適合",
  calibration: "校正",
  retest: "教育",
  approval: "承認",
  qms: "品質",
  site: "現場",
};

export const inspectionPack: KnowledgePack = {
  id: "inspection",
  label: "出荷検査場",
  title: "INS-出荷-03",
  audience: "everyone",
  audienceLabel: "",
  synthesizer: "generic",
  llmSystemPrompt:
    "You are ConformSystem, an industrial document reasoning assistant for shipping inspection revisions. " +
    "Answer in Japanese. Use ONLY the provided chunks. Cite documentName and clauseId.",
  context: {
    topic:
      "ミナトテック・出荷検査場の検査手順改定（INS-出荷-03 Rev.B→Rev.C）",
    sources:
      "旧/新検査手順・判定基準・不適合記録・校正記録・教育チェック・承認ゲートなど",
    actions:
      "「何が変わった？」「再検査は？」「古い基準と矛盾は？」「適用して大丈夫？」と聞く",
    outcomes: "判定差分・影響・再教育・矛盾・適用可否が根拠付きで出る",
  },
  sample: {
    documents,
    sidebarDocuments: documents,
    questions,
    intro: {
      title: "検査の合格ラインが変わったとき、すぐ確認できます。",
      subtitle: "INS-出荷-03 · Rev.B → Rev.C",
    },
    stats: {
      documents: documents.length,
      pages: 49,
      majorChanges: 3,
      retestCandidates: 4,
      contradictions: 1,
    },
    catalog,
    initialDocId: "INS-NEW",
    initialQuestionId: "version-diff",
    versionLabel: "Rev.B → Rev.C",
  },
  ai: {
    chunks,
    documents: chunksToDocuments(chunks, categoryNote),
    recommendedQueries: catalog,
    stats: {
      documents: new Set(chunks.map((c) => c.documentId)).size,
      chunks: chunks.length,
      company: "株式会社ミナトテック",
      product: "出荷検査場 · INS-出荷-03",
    },
    initialDocId: "INS-NEW",
  },
};
