import type { Plugin } from "vite";
import type { IncomingMessage, ServerResponse } from "node:http";
import { askGemba } from "./src/ai/ask";

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

  const result = await askGemba(question);
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(result));
}

/**
 * Dev / preview 用の /api/ask。
 * 同一の askGemba を使い、将来ここで OPENAI_API_KEY 分岐を追加できる。
 */
export function gembaAskApiPlugin(): Plugin {
  return {
    name: "gemba-ask-api",
    configureServer(server) {
      server.middlewares.use("/api/ask", (req, res) => {
        void handleAsk(req, res);
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use("/api/ask", (req, res) => {
        void handleAsk(req, res);
      });
    },
  };
}
