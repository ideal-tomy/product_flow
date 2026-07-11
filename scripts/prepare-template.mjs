/**
 * 業界コンテンツを剥がし、starter のみのテンプレート状態にする。
 *
 * 重要: 破壊的。実行前に template ブランチを切ること。
 *
 * Usage:
 *   npm run prepare:template
 *   npm run prepare:template -- --dry-run
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const stubs = path.join(__dirname, "template-stubs");
const dryRun = process.argv.includes("--dry-run");

const industryPackDirs = [
  "work-procedure",
  "inspection",
  "tcu",
  "standardization",
];

const industryChunkFiles = [
  "knowledge_chunks.json",
  "work_procedure_chunks.json",
  "inspection_chunks.json",
  "standardization_chunks.json",
];

const industryDataFiles = [
  "src/data/ConformSystem-demo.ts",
  "src/data/presentation-script.ts",
  "src/data/presentation-std-script.ts",
  "src/data/question-aliases.ts",
  "src/data/query-catalog.ts",
  "src/ai/knowledge.ts",
  "src/ai/documents.ts",
  "src/ai/recommended.ts",
  "src/ai/packs/standardization.ts",
];

const industryDocs = [
  "docs/files",
  "gembashift_demo_dummy_data.md",
  "gembashift_ai_mode_design.md",
  "gembashift_presentation_mode_plan.md",
  "gembashift_live_demo_requirements.md",
  "gembashift_demo_web_requirements.md",
  "gembashift_tool_demo_requirements.md",
];

/** stub ファイル名 → リポジトリ相対パス */
const stubCopies = [
  ["ConformSystem-demo.ts", "src/data/ConformSystem-demo.ts"],
  ["query-catalog.ts", "src/data/query-catalog.ts"],
  ["question-aliases.ts", "src/data/question-aliases.ts"],
  ["presentation-script.ts", "src/data/presentation-script.ts"],
  ["knowledge.ts", "src/ai/knowledge.ts"],
  ["documents.ts", "src/ai/documents.ts"],
  ["recommended.ts", "src/ai/recommended.ts"],
  ["standardization.ts", "src/ai/packs/standardization.ts"],
  ["packs-index.ts", "src/packs/index.ts"],
  ["README.md", "README.md"],
];

const actions = [];

function rm(rel) {
  const abs = path.join(root, rel);
  if (!fs.existsSync(abs)) return;
  actions.push(`DELETE ${rel}`);
  if (!dryRun) {
    fs.rmSync(abs, { recursive: true, force: true });
  }
}

function write(rel, content) {
  actions.push(`WRITE ${rel}`);
  if (!dryRun) {
    fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
    fs.writeFileSync(path.join(root, rel), content);
  }
}

function copyStub(fromName, toRel) {
  const from = path.join(stubs, fromName);
  if (!fs.existsSync(from)) {
    throw new Error(`Missing stub: ${from}`);
  }
  actions.push(`COPY stubs/${fromName} → ${toRel}`);
  if (!dryRun) {
    fs.mkdirSync(path.dirname(path.join(root, toRel)), { recursive: true });
    fs.copyFileSync(from, path.join(root, toRel));
  }
}

for (const dir of industryPackDirs) {
  rm(`src/packs/${dir}`);
}

for (const file of industryChunkFiles) {
  rm(`src/ai/data/${file}`);
}

for (const file of industryDataFiles) {
  rm(file);
}

for (const rel of industryDocs) {
  rm(rel);
}

for (const [from, to] of stubCopies) {
  copyStub(from, to);
}

// DEFAULT_PACK_ID を starter に
const typesPath = path.join(root, "src", "packs", "types.ts");
if (fs.existsSync(typesPath) || dryRun) {
  const current = dryRun
    ? 'export const DEFAULT_PACK_ID: KnowledgePackId = "work-procedure";'
    : fs.readFileSync(typesPath, "utf8");
  const next = current.replace(
    /export const DEFAULT_PACK_ID: KnowledgePackId = "[^"]+";/,
    'export const DEFAULT_PACK_ID: KnowledgePackId = "starter";',
  );
  if (next !== current) {
    write("src/packs/types.ts", next);
  } else {
    actions.push("SKIP src/packs/types.ts (already starter or pattern miss)");
  }
}

console.log(dryRun ? "--- dry-run ---" : "--- applied ---");
for (const a of actions) console.log(a);
console.log(
  dryRun
    ? `\n${actions.length} actions (not applied). Re-run without --dry-run on a template branch.`
    : `\nTemplate ready. DEFAULT_PACK_ID=starter. Run: npm run build`,
);
