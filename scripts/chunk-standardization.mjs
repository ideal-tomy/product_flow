/**
 * docs/files/ch0[1-9]_*.md → src/ai/data/standardization_chunks.json
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const docsDir = path.join(root, "docs", "files");
const outPath = path.join(root, "src", "ai", "data", "standardization_chunks.json");

const MAX_CHARS = 800;

/** @type {Record<string, { category: string; title: string }>} */
const CHAPTERS = {
  "01": { category: "std_background", title: "第1章 標準化概要" },
  "02": { category: "std_background", title: "第2章 経済活動としての標準化" },
  "03": { category: "std_background", title: "第3章 公共財としての標準化" },
  "04": { category: "std_core", title: "第4章 適合性評価の基礎" },
  "05": { category: "std_core", title: "第5章 国際標準化機関及び国際標準の制定" },
  "06": { category: "std_core", title: "第6章 日本の標準制度全般" },
  "07": { category: "std_core", title: "第7章 知的財産と標準化" },
  "08": { category: "std_core", title: "第8章 日本の適合性評価制度" },
  "09": { category: "std_core", title: "第9章 国際的標準化動向" },
};

/**
 * @param {string} text
 * @param {number} max
 * @returns {string[]}
 */
function splitLong(text, max) {
  if (text.length <= max) return [text];
  const parts = [];
  let rest = text;
  while (rest.length > max) {
    let cut = rest.lastIndexOf("。", max);
    if (cut < max * 0.4) cut = rest.lastIndexOf("\n", max);
    if (cut < max * 0.4) cut = max;
    parts.push(rest.slice(0, cut + 1).trim());
    rest = rest.slice(cut + 1).trim();
  }
  if (rest) parts.push(rest);
  return parts.filter(Boolean);
}

/**
 * @param {string} md
 * @param {string} chapterNum
 */
function chunkChapter(md, chapterNum) {
  const meta = CHAPTERS[chapterNum];
  const documentId = `STD-CH${chapterNum}`;
  const documentName = meta.title;
  const version = "H28改訂";
  const category = meta.category;

  // Strip blockquote source line
  const body = md.replace(/^>\s*[^\n]*\n+/m, "").trim();

  /** @type {{ clauseId: string; text: string }[]} */
  const sections = [];
  const lines = body.split(/\r?\n/);
  let currentTitle = documentName;
  let buf = [];

  const flush = () => {
    const text = buf.join("\n").trim();
    if (!text) return;
    const clauseId = currentTitle.replace(/^#+\s*/, "").trim() || documentName;
    for (const part of splitLong(text, MAX_CHARS)) {
      const heading = part.startsWith(clauseId) ? "" : `${clauseId}\n`;
      sections.push({
        clauseId,
        text: `${heading}${part}`.trim(),
      });
    }
    buf = [];
  };

  for (const line of lines) {
    const h3 = line.match(/^###\s+(.+)/);
    const h2 = line.match(/^##\s+(.+)/);
    const h1 = line.match(/^#\s+(.+)/);
    if (h3 || h2) {
      flush();
      currentTitle = (h3?.[1] ?? h2?.[1] ?? "").trim();
      buf.push(line);
      continue;
    }
    if (h1) {
      flush();
      currentTitle = h1[1].trim();
      buf.push(line);
      continue;
    }
    buf.push(line);
  }
  flush();

  return sections.map((s, i) => ({
    chunkId: `${documentId}:${i + 1}`,
    documentId,
    documentName,
    version,
    category,
    clauseId: s.clauseId.slice(0, 80),
    page: null,
    text: s.text,
  }));
}

function main() {
  const files = fs
    .readdirSync(docsDir)
    .filter((f) => /^ch0[1-9]_.*\.md$/i.test(f))
    .sort();

  if (files.length === 0) {
    console.error("No chapter markdown files found in", docsDir);
    process.exit(1);
  }

  /** @type {object[]} */
  const chunks = [];
  for (const file of files) {
    const m = file.match(/^ch0([1-9])_/i);
    if (!m) continue;
    const chapterNum = m[1].padStart(2, "0");
    const md = fs.readFileSync(path.join(docsDir, file), "utf8");
    const chapterChunks = chunkChapter(md, chapterNum);
    chunks.push(...chapterChunks);
    console.log(`${file}: ${chapterChunks.length} chunks`);
  }

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(chunks, null, 2) + "\n", "utf8");
  console.log(`Wrote ${chunks.length} chunks → ${outPath}`);
}

main();
