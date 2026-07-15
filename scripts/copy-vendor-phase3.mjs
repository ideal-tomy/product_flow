import fs from "node:fs";
import path from "node:path";

const studio = "c:/Users/ryoji/00myapp/ai_demo_workspace/AI-Demo-Studio";
const vendor = "c:/Users/ryoji/00myapp/ai_demo_workspace/product_flow/src/vendor/ai-demo";

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function rewriteFor(content, fromDir) {
  const map = {
    "@/types/": fromDir === "types" ? "./" : "../types/",
    "@/config/": fromDir === "config" ? "./" : "../config/",
    "@/lib/demo-core/": fromDir === "demo-core" ? "./" : "../demo-core/",
    "@/lib/providers/": fromDir === "providers" ? "./" : "../providers/",
    "@/lib/trial/": fromDir === "trial" ? "./" : "../trial/",
  };
  let c = content;
  for (const [a, b] of Object.entries(map)) c = c.split(a).join(b);
  return c;
}

const copies = [
  ["types/usage.ts", "types"],
  ["types/errors.ts", "types"],
  ["types/trial.ts", "types"],
  ["config/provider.config.ts", "config"],
  ["config/pricing.config.ts", "config"],
  ["config/trial-policy.config.ts", "config"],
  ["lib/demo-core/pricing.ts", "demo-core"],
  ["lib/demo-core/error-normalizer.ts", "demo-core"],
  ["lib/demo-core/knowledge.ts", "demo-core"],
  ["lib/demo-core/document-text-ingest.ts", "demo-core"],
  ["lib/demo-core/managed-trial-transport.ts", "demo-core"],
  ["lib/demo-core/access-mode-transport.ts", "demo-core"],
  ["lib/demo-core/ai-transport.ts", "demo-core"],
  ["lib/providers/anthropic-adapter.ts", "providers"],
  ["lib/providers/gemini-adapter.ts", "providers"],
  ["lib/trial/hash.ts", "trial"],
  ["lib/trial/redis.ts", "trial"],
  ["lib/trial/rate-limiter.ts", "trial"],
  ["lib/trial/concurrency-lock.ts", "trial"],
  ["lib/trial/spend-reservation.ts", "trial"],
  ["lib/trial/usage-ledger.ts", "trial"],
  ["lib/trial/trial-validator.ts", "trial"],
  ["lib/trial/admin.ts", "trial"],
  ["lib/trial/gateway.ts", "trial"],
];

for (const [rel, dir] of copies) {
  const src = path.join(studio, rel);
  const dest = path.join(vendor, dir, path.basename(rel));
  ensureDir(path.dirname(dest));
  let content = fs.readFileSync(src, "utf8");
  content = rewriteFor(content, dir);
  fs.writeFileSync(dest, content);
  console.log("wrote", path.relative(vendor, dest));
}
console.log("done");
