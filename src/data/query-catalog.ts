import { demoQuestions } from "./gembashift-demo";
import type { ScenarioId } from "./question-aliases";

export type QueryCategoryId =
  | "all"
  | "diff"
  | "impact"
  | "risk"
  | "decide"
  | "share"
  | "next";

export interface QueryCatalogItem {
  id: string;
  label: string;
  question: string;
  category: Exclude<QueryCategoryId, "all">;
  /** 一覧で一目で意図が分かる短い補足 */
  hint: string;
}

export interface QueryCategory {
  id: QueryCategoryId;
  label: string;
  short: string;
}

/** 現場の仕事の流れに沿った分類（管理画面のタグではなく、問いの目的） */
export const queryCategories: QueryCategory[] = [
  { id: "all", label: "すべて", short: "すべて" },
  { id: "diff", label: "変更を知る", short: "変更" },
  { id: "impact", label: "影響を見る", short: "影響" },
  { id: "risk", label: "リスクを潰す", short: "リスク" },
  { id: "decide", label: "判断する", short: "判断" },
  { id: "share", label: "伝える", short: "共有" },
  { id: "next", label: "次に動く", short: "次" },
];

const meta: Record<
  ScenarioId,
  { category: Exclude<QueryCategoryId, "all">; hint: string }
> = {
  "version-diff": { category: "diff", hint: "版間の差分一覧" },
  "critical-changes": { category: "diff", hint: "高重要度だけ抽出" },
  "hold-detail": { category: "diff", hint: "始動後の判定保留" },
  "alarm-detail": { category: "diff", hint: "警告／重大の閾値" },
  "sampling-detail": { category: "diff", hint: "周期の変更有無" },
  "log-detail": { category: "diff", hint: "保存期間の変更" },
  exception: { category: "diff", hint: "例外・適用除外" },
  "impact-scope": { category: "impact", hint: "制御ロジックへの波及" },
  "sw-changes": { category: "impact", hint: "ソフト実装の修正点" },
  "ecu-impact": { category: "impact", hint: "IF定義への影響" },
  "hw-check": { category: "impact", hint: "ハード側の確認" },
  "fmea-impact": { category: "impact", hint: "FMEA更新要否" },
  "srs-align": { category: "impact", hint: "上位要求との整合" },
  retest: { category: "impact", hint: "必須／推奨の再試験" },
  "cold-start": { category: "impact", hint: "低温始動の確認点" },
  contradiction: { category: "risk", hint: "文書間の不整合" },
  "similar-cases": { category: "risk", hint: "過去の類似不具合" },
  knowledge: { category: "risk", hint: "ベテランの暗黙知" },
  "dr-minutes": { category: "risk", hint: "過去DRの指摘" },
  "audit-findings": { category: "risk", hint: "監査で指摘されそうな点" },
  "open-risks": { category: "risk", hint: "残っているリスク" },
  approval: { category: "decide", hint: "承認してよいか" },
  "ecr-gate": { category: "decide", hint: "Gate条件の充足" },
  regulatory: { category: "decide", hint: "規制・安全の論点" },
  "design-review": { category: "decide", hint: "DRで見るべきこと" },
  "priority-top3": { category: "decide", hint: "いまの最優先" },
  rollback: { category: "decide", hint: "切り戻し条件" },
  "exec-summary": { category: "share", hint: "経営向け3行" },
  "customer-brief": { category: "share", hint: "顧客説明の要点" },
  newbie: { category: "share", hint: "かみくだいた説明" },
  training: { category: "share", hint: "現場教育の要否" },
  supplier: { category: "share", hint: "調達先への確認" },
  owners: { category: "share", hint: "部門別の担当" },
  "action-plan": { category: "next", hint: "やるべきこと一覧" },
  "man-hours": { category: "next", hint: "手作業の工数目安" },
  "source-trace": { category: "next", hint: "条項とページ" },
  "std-definition": { category: "diff", hint: "ISO/IECガイド2の定義" },
  "std-classification": { category: "diff", hint: "規格の5分類" },
  "std-company": { category: "impact", hint: "社内規格の意味と効果" },
  "std-conformity": { category: "impact", hint: "適合性評価の概要" },
  "std-iso-iec": { category: "risk", hint: "ISOとIECの違い" },
  "std-jis": { category: "risk", hint: "JIS制定とJISC" },
  "std-tbt": { category: "decide", hint: "WTO/TBTと企業影響" },
  "std-ip": { category: "decide", hint: "知財と標準化" },
};

export const queryCatalog: QueryCatalogItem[] = demoQuestions.map((q) => {
  const id = q.id as ScenarioId;
  const m = meta[id];
  return {
    id,
    label: q.chipLabel,
    question: q.question,
    category: m?.category ?? "diff",
    hint: m?.hint ?? "",
  };
});

export function filterQueryCatalog(
  items: QueryCatalogItem[],
  category: QueryCategoryId,
  query: string,
): QueryCatalogItem[] {
  const q = query.trim().toLowerCase();
  return items.filter((item) => {
    if (category !== "all" && item.category !== category) return false;
    if (!q) return true;
    return (
      item.label.toLowerCase().includes(q) ||
      item.question.toLowerCase().includes(q) ||
      item.hint.toLowerCase().includes(q)
    );
  });
}

export function countByCategory(
  items: QueryCatalogItem[],
): Record<QueryCategoryId, number> {
  const counts = Object.fromEntries(
    queryCategories.map((c) => [c.id, 0]),
  ) as Record<QueryCategoryId, number>;
  counts.all = items.length;
  for (const item of items) {
    counts[item.category] += 1;
  }
  return counts;
}
