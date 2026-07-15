import type { QueryCatalogItem } from "../data/query-catalog";
import type { ScenarioId } from "../data/question-aliases";
import type { AskIntent } from "./intent";

/** AI Mode 推奨質問（回答は常に RAG） */
export const aiRecommendedQueries: QueryCatalogItem[] = [
  {
    id: "version-diff",
    label: "v3.2からv3.4で何が変わった？",
    question: "v3.2からv3.4で何が変わりましたか？",
    category: "diff",
    hint: "許容範囲・保留・アラーム等の差分",
  },
  {
    id: "contradiction",
    label: "文書間で矛盾している箇所は？",
    question: "文書間で矛盾している箇所はありますか？",
    category: "risk",
    hint: "±3℃ vs ±4℃ など",
  },
  {
    id: "retest",
    label: "再試験が必要な項目は？",
    question: "再試験が必要な項目は？",
    category: "impact",
    hint: "必須 TC-12 / 18 / 24 / 31 / 07",
  },
  {
    id: "similar-cases",
    label: "過去に似た不具合は？",
    question: "過去に似た不具合はありますか？",
    category: "risk",
    hint: "CASE-2024-071 冬季始動",
  },
  {
    id: "approval",
    label: "この変更を承認して大丈夫？",
    question: "この変更を承認して大丈夫ですか？",
    category: "decide",
    hint: "未完了ゲートを根拠付きで",
  },
  {
    id: "impact-scope",
    label: "この変更の影響範囲は？",
    question: "この変更の影響範囲は？",
    category: "impact",
    hint: "制御・試験・FMEA",
  },
  {
    id: "regulatory",
    label: "品質要求上の注意は？",
    question: "この変更は品質要求上問題ありますか？",
    category: "decide",
    hint: "QMS マトリクスを参照",
  },
  {
    id: "supplier",
    label: "サプライヤー確認事項は？",
    question: "サプライヤーに確認すべきことはありますか？",
    category: "next",
    hint: "精度保証 ±3℃ 可否",
  },
  {
    id: "newbie",
    label: "TCU-480 とは？",
    question: "ミナトテックの TCU-480 について教えて",
    category: "share",
    hint: "会社・製品概要",
  },
  {
    id: "hold-detail",
    label: "起動後の判定保留は？",
    question: "起動後の判定保留は追加されましたか？",
    category: "diff",
    hint: "5秒保留と過去不具合の関係",
  },
];

export function intentToScenarioId(
  intent: string | undefined,
  packId?: string,
): ScenarioId | null {
  if (packId === "standardization") {
    switch (intent as AskIntent) {
      case "company":
        return "std-company";
      case "qms":
        return "std-definition";
      case "general":
        return "std-classification";
      default:
        return null;
    }
  }

  switch (intent as AskIntent) {
    case "version_diff":
      return "version-diff";
    case "contradiction":
      return "contradiction";
    case "retest":
      return "retest";
    case "similar_case":
      return "similar-cases";
    case "impact":
      return "impact-scope";
    case "approval":
      return "approval";
    case "qms":
      return "regulatory";
    case "company":
      return "newbie";
    default:
      return null;
  }
}
