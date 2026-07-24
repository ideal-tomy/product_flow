/**
 * ミナトテック 厚木工場パック（製造×現場デモ）
 * ソース: docs/knowledge2/10〜13（13は⚠仕込み行を除いた本文）
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
import raw from "../../ai/data/minato-factory_chunks.json";

const src = {
  peakTemp: {
    documentName: "作業手順書 SOP-SMT-03 リフロー実装 第6版",
    version: "6.0",
    page: "2",
    clauseId: "5.1",
    excerpt: "ピーク温度 240〜250℃(炉内モニタで確認)。",
    highlight: "240〜250℃",
    documentId: "MT-SOP",
    chunkId: "MT-SOP:5.1",
  } satisfies SourceReference,
  ncRule: {
    documentName: "品質管理規定 QM-R-01 2026-03-01",
    version: "2026-03-01",
    page: "1",
    clauseId: "第7条",
    excerpt:
      "赤色の識別票を貼付し赤棚へ隔離。品質管理課(内線610)へ連絡し、MT-QAポータルへ不適合報告を当日中に登録する。",
    highlight: "赤棚",
    documentId: "MT-QM",
    chunkId: "MT-QM:7",
  } satisfies SourceReference,
  orgQcQa: {
    documentName: "工場設定 厚木工場 v1.0",
    version: "1.0",
    page: "1",
    clauseId: "組織",
    excerpt:
      "品質管理課【QC】(内線 610): 日常判定の窓口。品質保証部【QA】(内線 620): 4M変更承認・特採・文書・顧客対応。",
    highlight: "内線 610",
    documentId: "MT-AT",
    chunkId: "MT-AT:2",
  } satisfies SourceReference,
  change4m: {
    documentName: "品質管理規定 QM-R-01 2026-03-01",
    version: "2026-03-01",
    page: "2",
    clauseId: "第9条",
    excerpt:
      "装置条件(温度・速度等)の変更は事前にMT-QAポータルから申請し、品質保証部の承認を得るまで実施してはならない。",
    highlight: "4M変更",
    documentId: "MT-QM",
    chunkId: "MT-QM:9",
  } satisfies SourceReference,
  priority: {
    documentName: "品質管理規定 QM-R-01 2026-03-01",
    version: "2026-03-01",
    page: "1",
    clauseId: "第4条",
    excerpt:
      "品質関連文書は「規定 > 標準 > 作業手順書」の順に優先する。不整合を発見した者は上位文書に従い、品質保証部(内線620)へ報告する。",
    highlight: "規定 > 標準 > 作業手順書",
    documentId: "MT-QM",
    chunkId: "MT-QM:4",
  } satisfies SourceReference,
  stdHold: {
    documentName: "検査標準 QC-STD-02 2026-05-10",
    version: "2026-05-10",
    page: "2",
    clauseId: "3.2",
    excerpt: "220℃以上の保持時間 30〜60秒。",
    highlight: "30〜60秒",
    documentId: "MT-QC",
    chunkId: "MT-QC:3.2",
  } satisfies SourceReference,
  sopHold: {
    documentName: "作業手順書 SOP-SMT-03 リフロー実装 第6版",
    version: "6.0",
    page: "2",
    clauseId: "5.2",
    excerpt: "220℃以上の保持時間: 40〜60秒。",
    highlight: "40〜60秒",
    documentId: "MT-SOP",
    chunkId: "MT-SOP:5.2",
  } satisfies SourceReference,
  calibration: {
    documentName: "品質管理規定 QM-R-01 2026-03-01",
    version: "2026-03-01",
    page: "2",
    clauseId: "第11条",
    excerpt:
      "校正期限切れ機器での測定が判明した場合、該当期間のロットを疑義品として扱い、直ちに品質管理課(内線610)へ報告する。",
    highlight: "疑義品",
    documentId: "MT-QM",
    chunkId: "MT-QM:11",
  } satisfies SourceReference,
};

const documents: DemoDocument[] = [
  {
    id: "MT-AT",
    name: "工場設定 厚木工場",
    version: "v1.0",
    pages: 1,
    category: "設定",
    note: "QC/QA",
  },
  {
    id: "MT-QM",
    name: "品質管理規定 QM-R-01",
    version: "2026-03-01",
    pages: 3,
    category: "規定",
    note: "第1層",
  },
  {
    id: "MT-QC",
    name: "検査標準 QC-STD-02",
    version: "2026-05-10",
    pages: 3,
    category: "標準",
    note: "第2層",
  },
  {
    id: "MT-SOP",
    name: "作業手順書 SOP-SMT-03",
    version: "第6版",
    pages: 3,
    category: "手順",
    note: "第3層",
  },
];

const questions: DemoQuestion[] = [
  {
    id: "reflow-peak",
    chipLabel: "ピーク温度",
    question: "リフローのピーク温度っていくつだっけ?",
    answer: {
      summary: "ピーク温度は240〜250℃です（炉内モニタで確認）。",
      imageSrc: "/images/answer1_1.jpg",
      imageAlt: "炉内モニタでピーク温度を確認している様子",
      sources: [src.peakTemp],
    },
  },
  {
    id: "nc-handling",
    chipLabel: "不良を見つけたら",
    question: "不良っぽい基板を見つけた。どうすればいい?",
    answer: {
      summary:
        "自己判断で手直し・廃棄せず作業を中断し、赤色識別票を貼って赤棚へ隔離、品質管理課(内線610)へ連絡し、当日中にMT-QAポータルへ不適合報告してください。処置判定は品質管理課長です。",
      imageSrc: "/images/answer1_2.jpg",
      imageAlt: "不適合品に識別票を付け赤棚へ隔離する様子",
      sources: [src.ncRule],
    },
  },
  {
    id: "qc-vs-qa",
    chipLabel: "QCとQAの違い",
    question: "これって品質管理課と品質保証部、どっちに連絡するの?",
    answer: {
      summary:
        "日常の不適合判定・検査は品質管理課(工場・内線610)、4M変更承認・特採承認・文書改訂・顧客対応は品質保証部(本社・内線620)です。",
      sources: [src.orgQcQa],
    },
  },
  {
    id: "conveyor-change",
    chipLabel: "搬送速度の変更",
    question: "炉の搬送速度をちょっと変えたいんだけど、勝手にやっていい?",
    answer: {
      summary:
        "不可です。装置条件の変更は4M変更に該当し、事前にMT-QAポータルで申請し品質保証部の承認が必要です。設備故障等の緊急時のみ製造部長判断で暫定変更でき、24時間以内に事後申請します。",
      sources: [src.change4m],
    },
  },
  {
    id: "hold-time-conflict",
    chipLabel: "保持時間のどっち?",
    question:
      "220℃以上の保持時間、手順書には40〜60秒ってあるけど検査標準だと30〜60秒。どっちが正しい?",
    answer: {
      summary:
        "文書の優先順位は規定>標準>手順（品質管理規定 第4条）なので、検査標準の30〜60秒に従ってください。あわせて文書の不整合として品質保証部(内線620)へ報告が必要です。",
      imageSrc: "/images/answer1_4.jpg",
      imageAlt: "検査標準と作業手順書の保持時間を照合し文書不整合を報告する様子",
      comparisonLabel: "220℃以上の保持時間",
      before: "手順書 SOP-SMT-03: 40〜60秒",
      after: "検査標準 QC-STD-02: 30〜60秒（優先）",
      contradictions: [
        {
          id: "CX-HOLD",
          title: "保持時間の文書間不整合",
          severity: "high",
          left: {
            documentName: "作業手順書 SOP-SMT-03",
            version: "6.0",
            value: "40〜60秒",
          },
          right: {
            documentName: "検査標準 QC-STD-02",
            version: "2026-05-10",
            value: "30〜60秒",
          },
        },
      ],
      sources: [src.priority, src.stdHold, src.sopHold],
    },
  },
  {
    id: "calibration-expire",
    chipLabel: "校正切れ",
    question: "ノギスの校正シール、先月で切れてた。昨日測定に使っちゃったかも。",
    answer: {
      summary:
        "校正期限切れ機器は使用禁止です。使用が判明した場合、当該期間のロットが疑義品扱いとなり品質管理課が再検証するため、直ちに品質管理課(内線610)へ報告してください。",
      imageSrc: "/images/answer1_5.jpg",
      imageAlt: "校正期限切れのノギスと校正済シール",
      sources: [src.calibration],
    },
  },
  {
    id: "certified-operator",
    chipLabel: "新人にリフロー?",
    question: "新人にリフローやらせていい?",
    answer: {
      summary:
        "不可です。はんだ付けは特別工程のため社内認定作業者のみが従事できます。未認定者の配置は4M変更(人)の申請対象で、認定の有効期間は2年です。",
      sources: [
        {
          documentName: "品質管理規定 QM-R-01 2026-03-01",
          version: "2026-03-01",
          page: "3",
          clauseId: "第13条",
          excerpt:
            "特別工程(はんだ付け・圧着)の作業は、社内認定を受けた認定作業者のみが行う。認定の有効期間は2年。",
          highlight: "認定作業者",
          documentId: "MT-QM",
          chunkId: "MT-QM:13",
        },
      ],
    },
  },
];

const catalog: QueryCatalogItem[] = questions.map((q, i) => ({
  id: q.id,
  label: q.chipLabel,
  question: q.question,
  category: (
    i === 4 ? "risk" : i === 0 ? "diff" : "impact"
  ) as QueryCatalogItem["category"],
  hint: q.answer.summary.slice(0, 28),
}));

const chunks = adaptRawChunks(raw as RawKnowledgeChunk[]);
const categoryNote: Record<string, string> = {
  qms: "規定",
  checklist: "標準",
  sop: "手順",
};

export const minatoFactoryPack: KnowledgePack = {
  id: "minato-factory",
  label: "ミナト厚木工場",
  title: "ミナトテック 厚木工場・品質文書",
  audience: "specialist",
  audienceLabel: "製造・品質",
  synthesizer: "generic",
  llmSystemPrompt:
    "You are ConformSystem assisting 株式会社ミナトテック 厚木工場 with QMS documents. " +
    "Answer in Japanese using ONLY the provided chunks. " +
    "Map shop-floor slang to procedure intent before answering: " +
    "塗装剥がれ/傷/キズ/打痕/汚れ/不良っぽい/合格後に見つけた/出荷前/捨てていい/自分で直す/ヤスリ → 不適合疑い(第7条: 中断→赤票→赤棚→内線610→MT-QAポータル当日登録。自己手直し・廃棄禁止。判定は品質管理課長). " +
    "温度ちょっと/搬送速度/勝手に変えたい → 4M変更(第9条). " +
    "手順と標準どっち/数字違う → 規定>標準>手順(第4条)＋品質保証部内線620へ報告. " +
    "品質に電話どっち → QC内線610(日常判定) vs QA内線620(承認・文書・顧客). " +
    "Document priority is 規定 > 標準 > 作業手順書 (品質管理規定 第4条). " +
    "When SOP and inspection standard conflict, follow the higher document and tell the user to report the inconsistency to 品質保証部(内線620). " +
    "Distinguish QC(品質管理課・内線610・工場の日常判定) from QA(品質保証部・内線620・承認・文書・顧客). " +
    "Never allow unsupervised process changes; 4M changes need MT-QAポータル approval. " +
    "Structure answers as: やること → 連絡先 → 根拠(文書・条). " +
    "Refuse costs, personal evaluations, or anything not in chunks; suggest 製造/設備/QC/QA as contact. " +
    "If evidence is insufficient, refuse rather than guessing.",
  fieldLanguageAliases: [
    {
      questionId: "nc-handling",
      patterns: [
        "塗装剥がれ",
        "合格品の中に塗装",
        "傷",
        "キズ",
        "打痕",
        "汚れ",
        "不良っぽい",
        "捨てていい",
        "自分で直",
        "ヤスリ",
        "手直ししたい",
        "出荷前にキズ",
        "合格後",
        "ライン止めて",
      ],
    },
    {
      questionId: "qc-vs-qa",
      patterns: [
        "品質に電話",
        "どっちの番号",
        "QCとQA",
        "品質管理課と品質保証",
      ],
    },
    {
      questionId: "conveyor-change",
      patterns: [
        "温度ちょっと",
        "温度上げたい",
        "搬送速度",
        "勝手にやって",
        "条件変えたい",
      ],
    },
    {
      questionId: "hold-time-conflict",
      patterns: [
        "手順書と検査標準",
        "数字違う",
        "どっちが正しい",
        "書いてること違う",
        "保持時間",
      ],
    },
    {
      questionId: "calibration-expire",
      patterns: ["校正切れ", "シール", "ノギス", "期限切れ"],
    },
    {
      questionId: "certified-operator",
      patterns: ["新人にリフロー", "新人にやらせ", "認定"],
    },
    {
      questionId: "reflow-peak",
      patterns: ["ピーク温度", "ピークっていくつ"],
    },
  ],
  context: {
    topic: "規定・標準・手順の3階層とQC/QAの使い分けを質問できる",
    sources: "品質管理規定 / 検査標準 / リフローSOP",
    actions: "ピーク温度・不適合・版ずれ・校正切れなどを現場の言葉で聞く",
    outcomes: "階層優先と部門連絡先まで根拠付きで答える",
  },
  sample: {
    documents,
    sidebarDocuments: documents,
    questions,
    intro: {
      title: "現場判断デモ — 文書に聞いて、その場で動く。",
      subtitle: "株式会社ミナトテック · 厚木工場 · 製造①",
    },
    stats: {
      documents: documents.length,
      pages: 10,
      majorChanges: 1,
      retestCandidates: 1,
      contradictions: 1,
    },
    catalog,
    initialDocId: "MT-SOP",
    initialQuestionId: "reflow-peak",
    versionLabel: "2026-05",
  },
  ai: {
    chunks,
    documents: chunksToDocuments(chunks, categoryNote),
    recommendedQueries: catalog,
    stats: {
      documents: new Set(chunks.map((c) => c.documentId)).size,
      chunks: chunks.length,
      company: "株式会社ミナトテック",
      product: "センサー基板 SMT / QMS",
    },
    initialDocId: "MT-SOP",
  },
  presentation: {
    tagline: "文書の版ずれも、優先順位ルールで見抜ける。",
    searchSteps: [
      "Searching QMS hierarchy",
      "Comparing standard vs SOP",
      "Applying priority rules",
      "3 sources found",
    ],
    beats: [
      { at: 0, type: "intro" },
      { at: 3, type: "clear" },
      { at: 3.2, type: "ask", scenarioId: "reflow-peak" },
      { at: 10, type: "ask", scenarioId: "qc-vs-qa" },
      { at: 17, type: "ask", scenarioId: "hold-time-conflict" },
      { at: 24, type: "open-source" },
      { at: 27, type: "tagline" },
      { at: 29, type: "done" },
    ],
    scaleIntro: {
      eyebrow: "Minato Tech · Factory pack",
      documents: 4,
      pages: 10,
      clauses: chunks.length,
      pagesLabel: "pages",
      clausesLabel: "clauses",
    },
  },
  guidedTour: {
    roleLabel: "現場スタッフ向け",
    headline: "5手で、現場の判断を体験する",
    lead: "サンプル文書への質問です。番号順に押すだけで進められます。そのあと、現場の言い方のまま聞けるのが本命です。",
    climaxStepId: "step-hold",
    afterTourNote:
      "ガイドで型を掴んだら、下の「現場の言葉で聞く」で社内ボット体験へ。同じ型で②手順改定・③変更影響も体験できます。",
    steps: [
      {
        id: "step-peak",
        shortLabel: "ピーク温度は？",
        questionId: "reflow-peak",
      },
      {
        id: "step-nc",
        shortLabel: "不良を見つけたら",
        questionId: "nc-handling",
      },
      {
        id: "step-qcqa",
        shortLabel: "QCとQAどっち？",
        questionId: "qc-vs-qa",
      },
      {
        id: "step-hold",
        shortLabel: "保持時間のどっち？",
        questionId: "hold-time-conflict",
      },
      {
        id: "step-cal",
        shortLabel: "校正切れを使った",
        questionId: "calibration-expire",
      },
    ],
    siblingDemos: [
      {
        label: "製造ハブへ",
        href: "/manufacturing",
      },
      {
        label: "② 手順改定・教育",
        href: "/play/work-procedure",
      },
      {
        label: "③ 変更影響",
        href: "/play/tcu-480",
      },
    ],
  },
};
