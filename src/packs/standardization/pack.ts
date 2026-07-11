import type {
  DemoDocument,
  DemoQuestion,
  SourceReference,
} from "../../data/ConformSystem-demo";
import type { QueryCatalogItem } from "../../data/query-catalog";
import type { RawKnowledgeChunk } from "../../ai/knowledge";
import { adaptRawChunks, chunksToDocuments } from "../chunkUtils";
import type { KnowledgePack } from "../types";
import raw from "../../ai/data/standardization_chunks.json";
import {
  standardizationPresentationBeats,
  standardizationPresentationSearchSteps,
  standardizationPresentationTagline,
  standardizationScaleIntro,
} from "../../data/presentation-std-script";

const chunks = adaptRawChunks(raw as RawKnowledgeChunk[]);

const categoryNote: Record<string, string> = {
  std_background: "背景",
  std_core: "実務コア",
};

const aiDocuments = chunksToDocuments(chunks, categoryNote);

function findChunk(predicate: (c: (typeof chunks)[number]) => boolean) {
  return chunks.find(predicate);
}

function srcFromChunk(
  chunk: (typeof chunks)[number] | undefined,
  highlight?: string,
): SourceReference {
  if (!chunk) {
    return {
      documentName: "第1章 標準化概要",
      version: "H28改訂",
      page: "—",
      clauseId: "—",
      excerpt: "根拠チャンク未検出",
    };
  }
  return {
    documentName: chunk.documentName,
    version: chunk.version,
    page: chunk.page,
    clauseId: chunk.clauseId,
    excerpt: chunk.excerpt,
    highlight: highlight ?? chunk.highlight,
    chunkId: chunk.id,
    fullText: chunk.text,
    documentId: chunk.documentId,
  };
}

const ch01Classification = findChunk(
  (c) =>
    c.documentId === "STD-CH01" &&
    (c.text.includes("社内規格") || c.clauseId.includes("規格、標準")),
);
const ch01Definition = findChunk(
  (c) =>
    c.documentId === "STD-CH01" &&
    (c.text.includes("最適な秩序を得る") || c.clauseId.includes("標準化とは")),
);
const ch01Company = findChunk(
  (c) => c.documentId === "STD-CH01" && c.text.includes("社内規格は、会社、工場"),
);
const ch04Conformity = findChunk(
  (c) =>
    c.documentId === "STD-CH04" &&
    (c.clauseId.includes("適合性評価") || c.text.includes("適合性評価")),
);
const ch05Iso = findChunk(
  (c) =>
    c.documentId === "STD-CH05" &&
    (c.clauseId.includes("ISO とは") || c.text.includes("ISO（国際標準化機構）")),
);
const ch05Iec = findChunk(
  (c) =>
    c.documentId === "STD-CH05" &&
    (c.clauseId.includes("IEC とは") || c.text.includes("IEC（国際電気標準会議）")),
);
const ch06Jisc = findChunk(
  (c) =>
    c.documentId === "STD-CH06" &&
    (c.text.includes("日本工業標準調査会") || c.clauseId.includes("JISC")),
);
const ch02Tbt = findChunk(
  (c) =>
    c.documentId === "STD-CH02" &&
    (c.text.includes("WTO/TBT") || c.text.includes("TBT 協定")),
);
const ch09Tbt = findChunk(
  (c) =>
    c.documentId === "STD-CH09" &&
    (c.text.includes("TBT 協定") || c.clauseId.includes("TBT")),
);
const ch07Ip = findChunk(
  (c) =>
    c.documentId === "STD-CH07" &&
    (c.text.includes("知的財産") || c.clauseId.includes("知的")),
);

const COMPANY_BRIDGE =
  "※ 御社のSOP・検査規格・品質マニュアルも、同様にナレッジ登録すれば同じ手順で参照できます。";

const questions: DemoQuestion[] = [
  {
    id: "std-definition",
    chipLabel: "標準化の定義",
    question:
      "標準化とは何ですか？ISO/IECガイド2の定義で説明してください",
    answer: {
      summary:
        "JIS Z 8002（ISO/IEC ガイド2の国際一致規格）では、標準化を「実在の問題又は起こる可能性がある問題に関して、与えられた状況において最適な秩序を得ることを目的として、共通に、かつ、繰り返して使用するための記述事項を確立する活動。」と定義しています。",
      sources: [srcFromChunk(ch01Definition, "最適な秩序")],
    },
  },
  {
    id: "std-classification",
    chipLabel: "規格の分類",
    question:
      "規格は作成組織によってどう分類されますか？社内規格も含めて",
    answer: {
      summary:
        "規格は作成組織の水準から、国際規格・地域規格・国家規格・団体規格・社内規格の5タイプに分類できます。社内規格は会社・工場などで材料・製品・作業などに適用する規格です。",
      comparisonLabel: "作成組織による5分類",
      impactGroups: [
        {
          label: "国際規格",
          count: 1,
          items: ["ISO / IEC / ITU"],
        },
        {
          label: "地域規格",
          count: 1,
          items: ["CEN / CENELEC / ETSI（EN）"],
        },
        {
          label: "国家規格",
          count: 1,
          items: ["JIS（日本）など"],
        },
        {
          label: "団体規格",
          count: 1,
          items: ["業界団体等が作成"],
        },
        {
          label: "社内規格",
          count: 1,
          items: ["会社・工場の作業・製品に適用"],
        },
      ],
      sources: [
        srcFromChunk(ch01Classification, "社内規格"),
        srcFromChunk(ch01Company, "社内規格"),
      ],
    },
  },
  {
    id: "std-company",
    chipLabel: "社内規格",
    question: "社内規格とは何ですか？どのような効果がありますか？",
    answer: {
      summary: `社内規格は、会社・工場などで材料・部品・製品・組織、あるいは購買・製造・検査・管理などの仕事に適用することを目的として定めた規格です。技術の蓄積と作業方法の統一により、ばらつき低減と業務の合理化・効率化が期待できます。\n\n${COMPANY_BRIDGE}`,
      comparisonLabel: "社内規格",
      before: "探す・解釈する",
      after: "根拠付きで参照する",
      impactAreas: [
        "固有技術の蓄積と効果的活用",
        "業務運営・作業方法の統一",
        "結果のばらつき低減",
        "業務の合理化・効率化",
      ],
      sources: [srcFromChunk(ch01Company ?? ch01Classification, "社内規格")],
    },
  },
  {
    id: "std-conformity",
    chipLabel: "適合性評価",
    question: "適合性評価とは何ですか？概要を説明してください",
    answer: {
      summary:
        "適合性評価は、製品・プロセス・サービス・マネジメントシステムなどが、規格や技術基準などの要求事項に適合しているかを評価する活動です。第4章ではマネジメントシステム適合性評価、規制における適合性評価、製品認証・試験所認定など制度の基礎が整理されています。",
      sources: [srcFromChunk(ch04Conformity, "適合性評価")],
    },
  },
  {
    id: "std-iso-iec",
    chipLabel: "ISOとIEC",
    question: "ISOとIECの違いは何ですか？",
    answer: {
      summary:
        "ISO（国際標準化機構）は電気・電子・通信分野を除く幅広い分野の国際規格を制定し、IEC（国際電気標準会議）は電気・電子分野の国際規格を制定します。情報技術分野では両者の合同技術委員会（JTC1）もあります。",
      sources: [
        srcFromChunk(ch05Iso, "ISO"),
        srcFromChunk(ch05Iec, "IEC"),
      ],
    },
  },
  {
    id: "std-jis",
    chipLabel: "JISとJISC",
    question: "JISはどのように制定されますか？JISCの役割は？",
    answer: {
      summary:
        "日本では日本工業標準調査会（JISC）が審議し、経済産業大臣等が日本工業規格（JIS）を制定します。JISCはJISの制定・改正等における審議と、国際標準化活動における日本の窓口的役割を担います。",
      sources: [srcFromChunk(ch06Jisc, "JISC")],
    },
  },
  {
    id: "std-tbt",
    chipLabel: "WTO/TBT",
    question: "WTO/TBT協定とは何ですか？企業にどう影響しますか？",
    answer: {
      summary:
        "WTO/TBT協定は、各国の基準認証制度が貿易の技術的障害にならないよう定める協定です。原則として国際標準の使用が求められ、企業が国際市場で製品を展開する際、国際標準の策定・適合が事業戦略上重要になります。",
      sources: [
        srcFromChunk(ch02Tbt, "TBT"),
        srcFromChunk(ch09Tbt, "TBT"),
      ],
    },
  },
  {
    id: "std-ip",
    chipLabel: "知財と標準",
    question: "知的財産と標準化はどう関係しますか？",
    answer: {
      summary:
        "知的創造活動（特許等）と標準化活動は交錯します。標準に必須の特許（SEP）やパテントポリシー、パテントプールなど、権利保護と標準の普及を両立する仕組みが第7章で整理されています。",
      sources: [srcFromChunk(ch07Ip, "知的財産")],
    },
  },
];

const catalog: QueryCatalogItem[] = questions.map((q, i) => ({
  id: q.id,
  label: q.chipLabel,
  question: q.question,
  category: i < 2 ? "diff" : i < 4 ? "impact" : i < 6 ? "risk" : "decide",
  hint: q.answer.summary.slice(0, 24),
}));

const sampleDocuments: DemoDocument[] = aiDocuments.map((d) => ({
  ...d,
  version: "H28改訂",
  note: categoryNote[d.category] ?? d.note,
}));

const totalPages = sampleDocuments.reduce((sum, d) => sum + d.pages, 0);

export const standardizationPack: KnowledgePack = {
  id: "standardization",
  label: "標準・規格",
  title: "標準化実務入門",
  audience: "everyone",
  audienceLabel: "",
  synthesizer: "standardization",
  llmSystemPrompt:
    "You are ConformSystem, an industrial document reasoning assistant for the METI textbook " +
    "『標準化実務入門』（経済産業省 基準認証ユニット）。 " +
    "Answer in Japanese. Cite documentName and clauseId from the provided chunks. " +
    "Do not use knowledge outside the provided chunks.",
  context: {
    topic: "標準・規格の定義と制度",
    sources: "経済産業省『標準化実務入門』全9章",
    actions: "定義・分類・適合性評価・国際制度を質問",
    outcomes: "根拠条項付きで説明できる",
  },
  sample: {
    documents: sampleDocuments,
    sidebarDocuments: sampleDocuments,
    questions,
    intro: {
      title: "標準文書に、そのまま質問できます。",
      subtitle: "経済産業省『標準化実務入門』· 平成28年改訂",
    },
    stats: {
      documents: sampleDocuments.length,
      pages: totalPages,
      majorChanges: 5,
      retestCandidates: 0,
      contradictions: 0,
    },
    catalog,
    initialDocId: "STD-CH01",
    initialQuestionId: "std-classification",
    versionLabel: "H28改訂",
  },
  ai: {
    chunks,
    documents: sampleDocuments,
    recommendedQueries: catalog,
    stats: {
      documents: sampleDocuments.length,
      chunks: chunks.length,
      company: "経済産業省 基準認証ユニット",
      product: "標準化実務入門",
    },
    initialDocId: "STD-CH01",
  },
  presentation: {
    tagline: standardizationPresentationTagline,
    searchSteps: [...standardizationPresentationSearchSteps],
    beats: standardizationPresentationBeats,
    scaleIntro: { ...standardizationScaleIntro },
  },
};
