/**
 * 業界デモ用の新規パックを starter から生成し、index.ts に登録する。
 *
 * Usage:
 *   npm run new-pack -- <pack-id> "<表示ラベル>"
 *   npm run new-pack -- aerospace "航空整備"
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const id = (process.argv[2] ?? "").trim();
const label = (process.argv[3] ?? id).trim();

if (!id || !/^[a-z][a-z0-9-]*$/.test(id)) {
  console.error(
    'Usage: npm run new-pack -- <pack-id> "<表示ラベル>"\n' +
      "  pack-id: 小文字・数字・ハイフン（例: work-procedure, aerospace）",
  );
  process.exit(1);
}

if (id === "starter") {
  console.error("starter は予約名です。別の id を指定してください。");
  process.exit(1);
}

const packDir = path.join(root, "src", "packs", id);
const chunksPath = path.join(root, "src", "ai", "data", `${id}_chunks.json`);
const starterPackPath = path.join(root, "src", "packs", "starter", "pack.ts");
const starterChunksPath = path.join(
  root,
  "src",
  "ai",
  "data",
  "starter_chunks.json",
);
const indexPath = path.join(root, "src", "packs", "index.ts");

if (fs.existsSync(packDir)) {
  console.error(`既に存在します: ${packDir}`);
  process.exit(1);
}

fs.mkdirSync(packDir, { recursive: true });
let packSrc = fs.readFileSync(starterPackPath, "utf8");

packSrc = packSrc
  .replaceAll("starter_chunks.json", `${id}_chunks.json`)
  .replaceAll('id: "starter"', `id: "${id}"`)
  .replaceAll('label: "Starter"', `label: ${JSON.stringify(label)}`)
  .replaceAll(
    'title: "テンプレート（差し替え用）"',
    `title: ${JSON.stringify(label)}`,
  )
  .replaceAll("export const starterPack", `export const ${camelId(id)}Pack`)
  .replace(
    /会社名を差し替え/g,
    "会社名を差し替え",
  );

fs.writeFileSync(path.join(packDir, "pack.ts"), packSrc);
fs.writeFileSync(
  path.join(packDir, "README.md"),
  `# ${label} (\`${id}\`)\n\n` +
    `starter から生成したパックです。\`pack.ts\` と \`src/ai/data/${id}_chunks.json\` を業界内容に差し替えてください。\n\n` +
    `手順: [docs/PACK_RECIPE.md](../../../docs/PACK_RECIPE.md)\n`,
);

fs.copyFileSync(starterChunksPath, chunksPath);

let indexSrc = fs.readFileSync(indexPath, "utf8");
const importLine = `import { ${camelId(id)}Pack } from "./${id}/pack";\n`;
if (!indexSrc.includes(`from "./${id}/pack"`)) {
  indexSrc = indexSrc.replace(
    /(import \{ starterPack \} from "\.\/starter\/pack";\n)/,
    `$1${importLine}`,
  );
  // starter が無いテンプレ状態にも対応
  if (!indexSrc.includes(importLine.trim())) {
    indexSrc = indexSrc.replace(
      /(from "\.\/types";\n)/,
      `$1${importLine}`,
    );
  }
}

const packVar = `${camelId(id)}Pack`;
if (!indexSrc.includes(packVar)) {
  indexSrc = indexSrc.replace(
    /export const knowledgePacks: KnowledgePack\[\] = \[([\s\S]*?)\];/,
    (_m, body) => {
      const trimmed = body.trimEnd();
      const insertion = trimmed.endsWith(",")
        ? `${trimmed}\n  ${packVar},\n`
        : `${trimmed},\n  ${packVar},\n`;
      return `export const knowledgePacks: KnowledgePack[] = [${insertion}];`;
    },
  );
}

fs.writeFileSync(indexPath, indexSrc);

console.log(`Created pack "${id}" (${label})`);
console.log(`  - src/packs/${id}/pack.ts`);
console.log(`  - src/ai/data/${id}_chunks.json`);
console.log(`  - registered in src/packs/index.ts`);
console.log(`\nNext: edit pack.ts + chunks JSON, then open /?pack=${id}`);

function camelId(packId) {
  return packId.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
}
