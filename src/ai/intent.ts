export type AskIntent =
  | "version_diff"
  | "contradiction"
  | "retest"
  | "similar_case"
  | "approval"
  | "impact"
  | "qms"
  | "company"
  | "general"
  | "refuse";

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[？?！!。、．，,]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function detectIntent(question: string): AskIntent {
  const n = normalize(question);

  if (
    n.includes("売上") ||
    n.includes("利益") ||
    n.includes("価格") ||
    n.includes("単価") ||
    n.includes("給与") ||
    n.includes("人事") ||
    n.includes("株価") ||
    n.includes("決算")
  ) {
    return "refuse";
  }

  if (
    n.includes("矛盾") ||
    n.includes("不整合") ||
    n.includes("食い違") ||
    n.includes("不一致")
  ) {
    return "contradiction";
  }

  if (
    n.includes("再試験") ||
    n.includes("再検証") ||
    n.includes("再教育") ||
    n.includes("再検査") ||
    n.includes("試験が必要") ||
    n.includes("どの試験")
  ) {
    return "retest";
  }

  if (
    n.includes("不具合") ||
    n.includes("過去事例") ||
    n.includes("類似") ||
    n.includes("ヒヤリハット") ||
    n.includes("事例") ||
    n.includes("case-")
  ) {
    return "similar_case";
  }

  if (
    n.includes("承認") ||
    n.includes("大丈夫") ||
    n.includes("量産") ||
    n.includes("gate") ||
    n.includes("適用して") ||
    n.includes("承認して")
  ) {
    return "approval";
  }

  if (
    n.includes("影響") ||
    n.includes("波及") ||
    n.includes("どこが変わる") ||
    n.includes("影響範囲") ||
    n.includes("誰が影響") ||
    n.includes("誰に影響")
  ) {
    return "impact";
  }

  if (
    n.includes("品質要求") ||
    n.includes("規格") ||
    n.includes("qms") ||
    n.includes("コンプライアンス") ||
    n.includes("マトリクス")
  ) {
    return "qms";
  }

  if (
    n.includes("会社") ||
    n.includes("東浜") ||
    n.includes("tcu-480") ||
    n.includes("tcu480") ||
    n.includes("製品概要") ||
    n.includes("累計出荷")
  ) {
    return "company";
  }

  if (
    n.includes("変わ") ||
    n.includes("差分") ||
    n.includes("変更点") ||
    n.includes("v3.2") ||
    n.includes("v3.4") ||
    n.includes("3.2") ||
    n.includes("3.4") ||
    n.includes("v2.1") ||
    n.includes("v3.0") ||
    n.includes("rev.b") ||
    n.includes("rev.c") ||
    n.includes("何が変")
  ) {
    return "version_diff";
  }

  return "general";
}

/** 意図に応じて加点する category */
export const intentCategoryBoost: Record<AskIntent, string[]> = {
  version_diff: [
    "control_specification",
    "change_history",
    "change_notice",
    "sop",
    "inspection",
  ],
  contradiction: [
    "control_specification",
    "component_specification",
    "test_specification",
    "quality_audit",
    "checklist",
    "criteria",
  ],
  retest: [
    "test_specification",
    "compliance_matrix",
    "change_history",
    "training",
    "retest",
  ],
  similar_case: [
    "defect_cases",
    "fmea",
    "control_specification",
    "incident",
    "nonconformance",
  ],
  approval: [
    "work_instruction",
    "design_review",
    "supplier_qna",
    "fmea",
    "test_specification",
    "compliance_matrix",
    "approval",
  ],
  impact: [
    "fmea",
    "control_specification",
    "test_specification",
    "change_history",
    "sop",
    "inspection",
    "training",
  ],
  qms: ["compliance_matrix", "work_instruction", "quality_audit", "qms"],
  company: ["company_profile"],
  general: [],
  refuse: [],
};
