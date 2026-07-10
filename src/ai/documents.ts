import type { DemoDocument } from "../data/gembashift-demo";
import { knowledgeChunks, knowledgeStats } from "./knowledge";

const categoryNote: Record<string, string> = {
  company_profile: "会社・製品",
  control_specification: "制御仕様",
  component_specification: "部品仕様",
  test_specification: "試験",
  fmea: "FMEA",
  change_history: "変更履歴",
  defect_cases: "不具合",
  design_review: "設計レビュー",
  supplier_qna: "サプライヤー",
  quality_audit: "品質監査",
  compliance_matrix: "品質要求",
  work_instruction: "承認WF",
};

/** AI Mode サイドバー用。knowledge pack の documentId 単位 */
export const aiDocuments: DemoDocument[] = (() => {
  const map = new Map<
    string,
    { name: string; version: string; category: string; pages: number }
  >();

  for (const c of knowledgeChunks) {
    const prev = map.get(c.documentId);
    if (!prev) {
      map.set(c.documentId, {
        name: c.documentName,
        version: c.version.startsWith("v") ? c.version : `v${c.version}`,
        category: c.category,
        pages: 1,
      });
    } else {
      prev.pages += 1;
    }
  }

  return [...map.entries()].map(([id, meta]) => {
    const controlVersion =
      id === "CTRL-SPEC-34"
        ? ("v3.4" as const)
        : id === "CTRL-SPEC-32"
          ? ("v3.2" as const)
          : undefined;

    return {
      id,
      name: meta.name,
      version: meta.version,
      pages: Math.max(meta.pages * 8, 12),
      category: categoryNote[meta.category] ?? meta.category,
      note: categoryNote[meta.category] ?? "ナレッジ",
      controlVersion,
    } satisfies DemoDocument;
  });
})();

export const aiWorkspaceStats = {
  documents: knowledgeStats.documents,
  chunks: knowledgeStats.chunks,
  company: knowledgeStats.company,
  product: knowledgeStats.product,
};
