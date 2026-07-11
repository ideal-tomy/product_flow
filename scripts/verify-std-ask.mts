import { askGemba } from "../src/ai/ask.ts";
import { getPack } from "../src/packs/index.ts";
import { sampleEngine } from "../src/engines/sampleEngine.ts";

const pack = getPack("standardization");
console.log(
  "pack",
  pack.id,
  "docs",
  pack.ai.stats.documents,
  "chunks",
  pack.ai.stats.chunks,
);
console.log(
  "recommended:",
  pack.ai.recommendedQueries.map((q) => q.id).join(", "),
);

const cases = [
  "社内規格とは何ですか？どのような効果がありますか？",
  "規格は作成組織によってどう分類されますか？社内規格も含めて",
  "標準化とは何ですか？ISO/IECガイド2の定義で説明してください",
  "来期の売上は？",
];

for (const q of cases) {
  const r = await askGemba(q, { packId: "standardization" });
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
  console.log("summary:", r.answer.summary.slice(0, 180).replace(/\n/g, " / "));
  console.log("bridge:", r.answer.summary.includes("SOP"));
}

const sample = await sampleEngine.ask({
  question: "規格は作成組織によってどう分類されますか？社内規格も含めて",
  mode: "sample",
  packId: "standardization",
});
console.log("--- sample classification ---");
console.log(
  "scenario:",
  sample.scenarioId,
  "groups:",
  sample.answer.impactGroups?.length,
  "sources:",
  sample.meta.sourcesFound,
);

const sampleCompany = await sampleEngine.ask({
  question: "社内規格とは何ですか？どのような効果がありますか？",
  mode: "sample",
  packId: "standardization",
});
console.log("--- sample company ---");
console.log(
  "scenario:",
  sampleCompany.scenarioId,
  "bridge:",
  sampleCompany.answer.summary.includes("SOP"),
);
