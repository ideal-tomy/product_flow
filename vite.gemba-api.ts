import type { Plugin, ViteDevServer } from "vite";
import type { IncomingMessage, ServerResponse } from "node:http";
import { loadEnv } from "vite";
import { askGemba } from "./src/ai/ask";

function applyEnv(mode: string) {
  const env = loadEnv(mode, process.cwd(), "");
  if (env.OPENAI_API_KEY) process.env.OPENAI_API_KEY = env.OPENAI_API_KEY;
  if (env.OPENAI_MODEL) process.env.OPENAI_MODEL = env.OPENAI_MODEL;
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = "";
    req.setEncoding("utf8");
    req.on("data", (chunk: string) => {
      data += chunk;
    });
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

async function handleAsk(req: IncomingMessage, res: ServerResponse) {
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  let question = "";
  try {
    const raw = await readBody(req);
    const body = JSON.parse(raw) as { question?: string };
    question = body.question?.trim() ?? "";
  } catch {
    res.statusCode = 400;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Invalid JSON" }));
    return;
  }

  const result = await askGemba(question, { allowLlm: true });
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(result));
}

function mountAsk(server: ViteDevServer) {
  server.middlewares.use("/api/ask", (req, res) => {
    void handleAsk(req, res);
  });
}

/**
 * Dev / preview 用の /api/ask。
 * OPENAI_API_KEY があれば LLM、なければ RAG シンセサイザ。
 */
export function gembaAskApiPlugin(): Plugin {
  return {
    name: "gemba-ask-api",
    config(_, { mode }) {
      applyEnv(mode);
    },
    configureServer(server) {
      applyEnv(server.config.mode);
      mountAsk(server);
    },
    configurePreviewServer(server) {
      applyEnv(server.config.mode);
      mountAsk(server as unknown as ViteDevServer);
    },
  };
}
