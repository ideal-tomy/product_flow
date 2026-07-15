/**
 * ミナトテック 総務パック（共通×総務デモ）
 * ソース: docs/knowledge1/00〜03
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
import raw from "../../ai/data/minato-hr_chunks.json";

const src = {
  paidLeave: {
    documentName: "就業規則(抜粋) ミナトテック 2026-04-01",
    version: "2026-04-01",
    page: "2",
    clauseId: "第15条",
    excerpt:
      "取得は原則3営業日前までにMTポータルで申請する。前日・当日の申請は所属長が業務に支障がないと認めた場合に限り認める。",
    highlight: "3営業日前",
    documentId: "MT-WR",
    chunkId: "MT-WR:15",
  } satisfies SourceReference,
  approval: {
    documentName: "経費精算規程 ミナトテック 2026-04-01",
    version: "2026-04-01",
    page: "1",
    clauseId: "第3条",
    excerpt: "1件 5,000円超〜50,000円以下: 所属長+部長の承認。",
    highlight: "所属長+部長",
    documentId: "MT-EX",
    chunkId: "MT-EX:3",
  } satisfies SourceReference,
  entertainment: {
    documentName: "経費精算規程 ミナトテック 2026-04-01",
    version: "2026-04-01",
    page: "3",
    clauseId: "第11条",
    excerpt:
      "社外との会食は1人あたり10,000円を上限とし、事前に部長承認を得る。参加者全員の氏名・会社名の記載を必須とする。",
    highlight: "10,000円",
    documentId: "MT-EX",
    chunkId: "MT-EX:11",
  } satisfies SourceReference,
  remoteWork: {
    documentName: "就業規則(抜粋) ミナトテック 2026-04-01",
    version: "2026-04-01",
    page: "2",
    clauseId: "第12条",
    excerpt:
      "正社員は週2日を上限として在宅勤務を行うことができる。前週金曜17:00までにMTポータルで申請し、所属長の承認を得る。入社後6か月未満の社員、および製造部は対象外。",
    highlight: "週2日",
    documentId: "MT-WR",
    chunkId: "MT-WR:12",
  } satisfies SourceReference,
  remoteAllowance: {
    documentName: "経費精算規程 ミナトテック 2026-04-01",
    version: "2026-04-01",
    page: "3",
    clauseId: "第14条",
    excerpt:
      "在宅勤務1日あたり250円を支給する。MTタイムの在宅勤務打刻記録に基づき自動計算されるため、個別申請は不要。",
    highlight: "250円",
    documentId: "MT-EX",
    chunkId: "MT-EX:14",
  } satisfies SourceReference,
  birthGift: {
    documentName: "福利厚生ガイド ミナトテック 2026",
    version: "2026",
    page: "1",
    clauseId: "1",
    excerpt:
      "出産祝金 第1子 30,000円 / 第2子以降 50,000円(MTポータル)。申請期限は事由発生から6か月以内。",
    highlight: "出産祝金",
    documentId: "MT-WF",
    chunkId: "MT-WF:1",
  } satisfies SourceReference,
  toeic: {
    documentName: "福利厚生ガイド ミナトテック 2026",
    version: "2026",
    page: "2",
    clauseId: "3",
    excerpt:
      "TOEIC 800点以上 30,000円。受験前にMTポータルから「資格取得支援申請」を行うこと。事前申請がない場合は支給対象外。",
    highlight: "事前申請",
    documentId: "MT-WF",
    chunkId: "MT-WF:3",
  } satisfies SourceReference,
  marriageLeave: {
    documentName: "就業規則(抜粋) ミナトテック 2026-04-01",
    version: "2026-04-01",
    page: "2",
    clauseId: "第16条",
    excerpt: "本人の結婚: 5日 / 子の結婚: 2日。",
    highlight: "5日",
    documentId: "MT-WR",
    chunkId: "MT-WR:16",
  } satisfies SourceReference,
};

const documents: DemoDocument[] = [
  {
    id: "MT-CO",
    name: "会社設定 ミナトテック",
    version: "v1.0",
    pages: 1,
    category: "設定",
    note: "架空企業",
  },
  {
    id: "MT-WR",
    name: "就業規則(抜粋)",
    version: "2026-04-01",
    pages: 3,
    category: "規程",
    note: "総務部",
  },
  {
    id: "MT-EX",
    name: "経費精算規程",
    version: "2026-04-01",
    pages: 3,
    category: "規程",
    note: "経理部",
  },
  {
    id: "MT-WF",
    name: "福利厚生ガイド",
    version: "2026",
    pages: 3,
    category: "ガイド",
    note: "総務部",
  },
];

const questions: DemoQuestion[] = [
  {
    id: "paid-leave",
    chipLabel: "有給の申請期限",
    question: "有給休暇っていつまでに申請すればいいですか?",
    answer: {
      summary:
        "原則3営業日前までにMTポータルから申請してください。前日・当日は所属長が業務に支障ないと認めた場合のみ可です。",
      sources: [src.paidLeave],
    },
  },
  {
    id: "entertainment-approval",
    chipLabel: "交際費の承認",
    question: "8,000円の接待交際費、誰の承認が必要?",
    answer: {
      summary:
        "5,000円超〜50,000円以下なので所属長+部長の承認が必要です。さらに交際費は1人あたり10,000円上限・事前の部長承認・参加者全員の氏名・会社名の記載が必須です。",
      sources: [src.approval, src.entertainment],
    },
  },
  {
    id: "remote-work",
    chipLabel: "在宅勤務と手当",
    question: "在宅勤務って週何日までできる?手当は出る?",
    answer: {
      summary:
        "週2日までです。前週金曜17時までにMTポータルで申請し所属長承認が必要。入社6か月未満と製造部は対象外です。手当は1日250円で、MTタイムの打刻から自動計算のため個別申請は不要です。",
      sources: [src.remoteWork, src.remoteAllowance],
    },
  },
  {
    id: "birth-benefit",
    chipLabel: "出産のお祝い",
    question: "子どもが生まれました。何か手続きやお祝いはありますか?",
    answer: {
      summary:
        "出産祝金があります。第1子は30,000円、第2子以降は50,000円です。MTポータルから申請し、事由発生から6か月以内が期限です。",
      sources: [src.birthGift],
    },
  },
  {
    id: "toeic-bonus",
    chipLabel: "TOEIC報奨金",
    question: "TOEICで820点取りました。報奨金もらえますか?",
    answer: {
      summary:
        "TOEIC 800点以上は報奨金30,000円+受験料全額が対象です。ただし受験前の「資格取得支援申請」が必須で、事前申請がなければ支給対象外です。",
      sources: [src.toeic],
    },
  },
  {
    id: "refuse-payroll",
    chipLabel: "給与明細は?",
    question: "来月の給与明細を見せて。",
    answer: {
      summary:
        "給与明細などの個人別支給情報はこのナレッジに含まれていないため回答できません。経理部(内線301)へ確認してください。",
      sources: [],
      exceptionNote: "範囲外・推測禁止",
    },
  },
  {
    id: "marriage-leave-correct",
    chipLabel: "結婚休暇は何日?",
    question: "確か慶弔休暇って結婚したら10日もらえるんですよね?",
    answer: {
      summary:
        "それは誤りです。就業規則第16条では本人の結婚は5日です（子の結婚は2日）。",
      before: "10日（誤った前提）",
      after: "5日（就業規則 第16条）",
      comparisonLabel: "本人結婚の慶弔休暇",
      sources: [src.marriageLeave],
    },
  },
];

const catalog: QueryCatalogItem[] = questions.map((q, i) => ({
  id: q.id,
  label: q.chipLabel,
  question: q.question,
  category: (
    i === 2 ? "diff" : i === 5 ? "risk" : i === 4 ? "risk" : "impact"
  ) as QueryCatalogItem["category"],
  hint: q.answer.summary.slice(0, 28),
}));

const chunks = adaptRawChunks(raw as RawKnowledgeChunk[]);
const categoryNote: Record<string, string> = {
  policy: "規程",
  approval: "承認",
};

export const minatoHrPack: KnowledgePack = {
  id: "minato-hr",
  label: "ミナト総務",
  title: "ミナトテック 総務・共通規程",
  audience: "everyone",
  audienceLabel: "総務・共通",
  synthesizer: "generic",
  llmSystemPrompt:
    "You are ConformSystem assisting 株式会社ミナトテック employees with HR and expense policies. " +
    "Answer in Japanese using ONLY the provided chunks. " +
    "When a question spans multiple documents (e.g. remote work days + allowance), combine facts from all relevant chunks. " +
    "Always surface conditions (e.g. pre-application required for qualification bonuses). " +
    "Refuse questions about individual performance, salaries, or personal evaluations. " +
    "If the user asserts an incorrect fact, correct it using the chunks. " +
    "If evidence is insufficient, refuse rather than inventing answers. Suggest 経理部(内線301) or 総務部 when appropriate.",
  context: {
    topic: "ミナトテックの就業規則・経費・福利厚生を横断して質問できる",
    sources: "就業規則 / 経費精算規程 / 福利厚生ガイド",
    actions: "有給・在宅・交際費・報奨金など現場の言い方で聞く",
    outcomes: "条項根拠付きで横断回答。条件漏れや誤前提も訂正する",
  },
  sample: {
    documents,
    sidebarDocuments: documents,
    questions,
    intro: {
      title: "自社の規程に、そのまま質問できます。",
      subtitle: "株式会社ミナトテック · 総務・共通セット",
    },
    stats: {
      documents: documents.length,
      pages: 10,
      majorChanges: 0,
      retestCandidates: 0,
      contradictions: 0,
    },
    catalog,
    initialDocId: "MT-WR",
    initialQuestionId: "paid-leave",
    versionLabel: "2026-04",
  },
  ai: {
    chunks,
    documents: chunksToDocuments(chunks, categoryNote),
    recommendedQueries: catalog,
    stats: {
      documents: new Set(chunks.map((c) => c.documentId)).size,
      chunks: chunks.length,
      company: "株式会社ミナトテック",
      product: "総務・共通規程",
    },
    initialDocId: "MT-WR",
  },
  presentation: {
    tagline: "御社の規程を入れれば、明日から御社版になります。",
    searchSteps: [
      "Searching 4 policy documents",
      "Cross-checking employment & expense rules",
      "Resolving conditions and exclusions",
      "Building grounded answer",
    ],
    beats: [
      { at: 0, type: "intro" },
      { at: 3, type: "clear" },
      { at: 3.2, type: "ask", scenarioId: "paid-leave" },
      { at: 11, type: "ask", scenarioId: "remote-work" },
      { at: 20, type: "ask", scenarioId: "toeic-bonus" },
      { at: 26, type: "tagline" },
      { at: 29, type: "done" },
    ],
    scaleIntro: {
      eyebrow: "Minato Tech · HR pack",
      documents: 4,
      pages: 10,
      clauses: chunks.length,
      pagesLabel: "pages",
      clausesLabel: "clauses",
    },
  },
};
