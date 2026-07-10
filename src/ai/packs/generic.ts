import type {
  ContradictionItem,
  DemoAnswer,
  RetestItem,
  SimilarCaseItem,
  SpecChangeItem,
  SourceReference,
} from "../../data/gembashift-demo";
import type { KnowledgeChunk } from "../knowledge";
import type { AskIntent } from "../intent";
import type { ScoredChunk } from "../retrieve";
import { chunkToSource } from "../../packs/chunkUtils";

function sourcesFrom(chunks: KnowledgeChunk[]): SourceReference[] {
  const map = new Map<string, SourceReference>();
  for (const c of chunks) {
    const s = chunkToSource(c);
    const key = `${s.documentName}|${s.version}|${s.clauseId}|${s.page}`;
    if (!map.has(key)) map.set(key, s);
  }
  return [...map.values()].slice(0, 10);
}

function parseChange(text: string): { before?: string; after?: string; title: string } {
  const title = text.split("\n")[0]?.replace(/^CHG-\S+\s*/, "").trim() || "変更";
  const before = text.match(/変更前[:：]\s*([^。\n]+)/)?.[1]?.trim();
  const after = text.match(/変更後[:：]\s*([^。\n]+)/)?.[1]?.trim();
  return { title, before, after };
}

function synthesizeVersionDiff(
  chunks: KnowledgeChunk[],
  hits: ScoredChunk[],
): DemoAnswer {
  const notices = chunks.filter((c) => c.category === "change_notice");
  const changes: SpecChangeItem[] = notices.map((n, i) => {
    const parsed = parseChange(n.text);
    return {
      id: n.clauseId || `CHG-${i + 1}`,
      title: parsed.title,
      clauseId: n.clauseId,
      before: parsed.before ?? "—",
      after: parsed.after ?? "—",
      severity: i === 0 ? "high" : i < 2 ? "high" : "medium",
    };
  });

  const first = changes[0];
  return {
    summary: `改訂通知から主要な変更を ${changes.length} 件検出しました。${
      first
        ? `代表例: ${first.title}（${first.before} → ${first.after}）。`
        : ""
    }`,
    comparisonLabel: first?.title,
    before: first?.before,
    after: first?.after,
    changes,
    sources: sourcesFrom([...notices, ...hits]),
  };
}

function synthesizeContradiction(
  chunks: KnowledgeChunk[],
  hits: ScoredChunk[],
): DemoAnswer {
  const oldish = chunks.filter(
    (c) =>
      c.clauseId.includes("OLD") ||
      c.version.includes("2.1") ||
      c.version.includes("Rev.B") ||
      c.text.includes("使用禁止") ||
      c.text.includes("失効"),
  );
  const newish = chunks.filter(
    (c) =>
      !c.clauseId.includes("OLD") &&
      (c.version.includes("3.0") ||
        c.version.includes("Rev.C") ||
        c.category === "sop" ||
        c.category === "inspection" ||
        c.category === "criteria" ||
        c.category === "checklist"),
  );

  const left = newish.find((c) => /10 N·m|2mm/.test(c.text)) ?? newish[0];
  const right = oldish.find((c) => /8 N·m|3mm/.test(c.text)) ?? oldish[0];

  const contradictions: ContradictionItem[] = [];
  if (left && right) {
    const leftVal =
      left.text.match(/10 N·m|2mm未満|2mm/)?.[0] ?? left.highlight ?? "新基準";
    const rightVal =
      right.text.match(/8 N·m|3mm未満|3mm/)?.[0] ?? right.highlight ?? "旧基準";
    contradictions.push({
      id: "CX-01",
      title: "新旧基準の文書間不整合",
      severity: "high",
      left: {
        documentName: left.documentName,
        version: left.version,
        value: leftVal,
      },
      right: {
        documentName: right.documentName,
        version: right.version,
        value: rightVal,
      },
    });
  }

  return {
    summary:
      contradictions.length > 0
        ? `新旧文書で矛盾候補を ${contradictions.length} 件検出しました。旧様式の使用は禁止です。`
        : "矛盾候補を特定できませんでした。改訂通知と旧帳票を確認してください。",
    contradictions,
    sources: sourcesFrom(
      [...(left ? [left] : []), ...(right ? [right] : []), ...hits].filter(
        Boolean,
      ) as KnowledgeChunk[],
    ),
  };
}

function synthesizeRetest(
  chunks: KnowledgeChunk[],
  hits: ScoredChunk[],
): DemoAnswer {
  const train = chunks.filter(
    (c) =>
      c.category === "training" ||
      c.category === "retest" ||
      c.text.includes("再教育") ||
      c.text.includes("再検査"),
  );
  const retests: RetestItem[] = train.map((t) => ({
    id: t.clauseId,
    name: t.clauseId,
    reason: t.excerpt.slice(0, 40),
    priority: t.text.includes("priority:必須") || t.text.includes("必須")
      ? "必須"
      : "推奨",
  }));

  return {
    summary: `再教育・再検査の候補を ${retests.length || train.length} 件抽出しました。未完了者は単独作業／単独検査不可です。`,
    retests: retests.length > 0 ? retests : undefined,
    impactAreas:
      retests.length === 0
        ? train.map((t) => `${t.clauseId}: ${t.excerpt.slice(0, 48)}`)
        : undefined,
    sources: sourcesFrom([...train, ...hits]),
  };
}

function synthesizeSimilarCase(
  chunks: KnowledgeChunk[],
  hits: ScoredChunk[],
): DemoAnswer {
  const cases = chunks.filter(
    (c) =>
      c.category === "incident" ||
      c.category === "nonconformance" ||
      c.clauseId.startsWith("HH-") ||
      c.clauseId.startsWith("NC-"),
  );
  const similarCases: SimilarCaseItem[] = cases.map((c, i) => ({
    id: c.clauseId,
    title: c.text.split("\n")[0]?.replace(/^[A-Z0-9-]+\s*/, "") ?? c.clauseId,
    similarity: Math.max(0.75, 0.95 - i * 0.05),
    cause: c.text.match(/原因[:：]\s*([^。\n]+)/)?.[1] ?? "—",
    countermeasure: c.text.match(/対策[:：]\s*([^。\n]+)/)?.[1] ?? "—",
    relationToCurrent: "今回改定の根拠事例",
  }));

  return {
    summary: `過去の類似事例を ${similarCases.length} 件抽出しました。改定の直接根拠になっています。`,
    similarCases,
    sources: sourcesFrom([...cases, ...hits]),
  };
}

function synthesizeApproval(
  chunks: KnowledgeChunk[],
  hits: ScoredChunk[],
): DemoAnswer {
  const gates = chunks.filter(
    (c) => c.category === "approval" || c.clauseId.includes("GATE"),
  );
  const open = chunks.filter(
    (c) =>
      c.text.includes("未完了") ||
      c.text.includes("未受講") ||
      c.text.includes("承認しない"),
  );
  return {
    summary:
      open.length > 0
        ? "現時点では条件付き不可です。未完了事項があるため適用承認は保留です。"
        : "承認ゲート上の重大な未完了は見つかりませんでした。最終確認はゲート文書を参照してください。",
    impactAreas: open.slice(0, 4).map((c) => c.excerpt.slice(0, 60)),
    exceptionNote: gates[0]?.excerpt,
    sources: sourcesFrom([...gates, ...open, ...hits]),
  };
}

function synthesizeImpact(
  chunks: KnowledgeChunk[],
  hits: ScoredChunk[],
): DemoAnswer {
  const groups = [
    {
      label: "手順・基準",
      items: chunks
        .filter((c) =>
          ["sop", "inspection", "criteria", "checklist"].includes(c.category),
        )
        .map((c) => `${c.documentName} §${c.clauseId}`),
    },
    {
      label: "教育・再確認",
      items: chunks
        .filter((c) => ["training", "retest"].includes(c.category))
        .map((c) => c.excerpt.slice(0, 40)),
    },
    {
      label: "承認・品質",
      items: chunks
        .filter((c) => ["approval", "qms"].includes(c.category))
        .map((c) => c.clauseId),
    },
  ]
    .filter((g) => g.items.length > 0)
    .map((g) => ({
      label: g.label,
      count: g.items.length,
      items: [...new Set(g.items)].slice(0, 5),
    }));

  return {
    summary: `影響は ${groups.map((g) => g.label).join("・")} に及びます。`,
    impactGroups: groups,
    sources: sourcesFrom([...hits, ...chunks.filter((c) => c.category === "change_notice")]),
  };
}

function synthesizeQms(chunks: KnowledgeChunk[], hits: ScoredChunk[]): DemoAnswer {
  const qms = chunks.filter((c) => c.category === "qms");
  return {
    summary: "品質要求メモから、改定時に効く要求を抽出しました。",
    impactAreas: qms.map((c) => `${c.clauseId}: ${c.excerpt.slice(0, 48)}`),
    sources: sourcesFrom([...qms, ...hits]),
  };
}

function synthesizeGeneral(question: string, hits: ScoredChunk[]): DemoAnswer {
  const top = hits.slice(0, 5);
  const bullets = top
    .map((h) => `・${h.documentName} §${h.clauseId}: ${h.excerpt}`)
    .join("\n");
  return {
    summary: `登録ナレッジから関連条項を ${top.length} 件抽出しました。\n\n「${question}」への根拠:\n${bullets}`,
    sources: sourcesFrom(top),
    exceptionNote: "自由入力のため、詳細は各根拠条項を確認してください。",
  };
}

export function synthesizeGenericPackAnswer(
  question: string,
  intent: AskIntent,
  chunks: KnowledgeChunk[],
  hits: ScoredChunk[],
): DemoAnswer {
  switch (intent) {
    case "version_diff":
      return synthesizeVersionDiff(chunks, hits);
    case "contradiction":
      return synthesizeContradiction(chunks, hits);
    case "retest":
      return synthesizeRetest(chunks, hits);
    case "similar_case":
      return synthesizeSimilarCase(chunks, hits);
    case "approval":
      return synthesizeApproval(chunks, hits);
    case "impact":
      return synthesizeImpact(chunks, hits);
    case "qms":
      return synthesizeQms(chunks, hits);
    default:
      return synthesizeGeneral(question, hits);
  }
}
