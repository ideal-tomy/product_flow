import { askGemba } from "../src/ai/ask.ts";

const qs = [
  "v3.2からv3.4で何が変わりましたか？",
  "文書間で矛盾している箇所はありますか？",
  "再試験が必要な項目は？",
  "過去に似た不具合はありますか？",
  "この変更を承認して大丈夫ですか？",
  "売上はいくらですか？",
];

for (const q of qs) {
  const r = await askGemba(q);
  console.log("---");
  console.log("Q:", q);
  console.log(
    "intent:",
    r.meta.intent,
    "conf:",
    r.meta.confidence,
    "refused:",
    !!r.meta.refused,
    "sources:",
    r.meta.sourcesFound,
  );
  console.log("summary:", r.answer.summary.slice(0, 160).replace(/\n/g, " / "));
  if (r.answer.changes) console.log("changes:", r.answer.changes.length);
  if (r.answer.contradictions?.length) {
    console.log(
      "contradictions:",
      r.answer.contradictions
        .map((c) => `${c.left.value} vs ${c.right.value}`)
        .join(", "),
    );
  }
  if (r.answer.retests) {
    console.log(
      "retests required:",
      r.answer.retests
        .filter((t) => t.priority === "必須")
        .map((t) => t.id)
        .join(", "),
    );
  }
  if (r.answer.similarCases) {
    console.log(
      "cases:",
      r.answer.similarCases.map((c) => c.id).join(", "),
    );
  }
}
