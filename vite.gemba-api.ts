import type { Plugin, ViteDevServer } from "vite";
import type { IncomingMessage, ServerResponse } from "node:http";
import { loadEnv } from "vite";
import { askGemba } from "./src/ai/ask";
import { executeTrialAsk, getTrialStatusForCode } from "@axeon/ai-demo-core/trial/gateway";
import {
  codeHashFromBearer,
  trialErrorPayload,
} from "@axeon/ai-demo-core/trial/http";
import type { TrialAskRequestBody } from "@axeon/ai-demo-core/types/trial";

function applyEnv(mode: string) {
  const env = loadEnv(mode, process.cwd(), "");
  if (env.OPENAI_API_KEY) process.env.OPENAI_API_KEY = env.OPENAI_API_KEY;
  if (env.OPENAI_MODEL) process.env.OPENAI_MODEL = env.OPENAI_MODEL;
  if (env.UPSTASH_REDIS_REST_URL)
    process.env.UPSTASH_REDIS_REST_URL = env.UPSTASH_REDIS_REST_URL;
  if (env.UPSTASH_REDIS_REST_TOKEN)
    process.env.UPSTASH_REDIS_REST_TOKEN = env.UPSTASH_REDIS_REST_TOKEN;
  if (env.TRIAL_DEFAULT_MODEL)
    process.env.TRIAL_DEFAULT_MODEL = env.TRIAL_DEFAULT_MODEL;
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

function headerGet(req: IncomingMessage, name: string): string | null {
  const v = req.headers[name.toLowerCase()];
  if (Array.isArray(v)) return v[0] ?? null;
  return typeof v === "string" ? v : null;
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
  let packId: string | undefined;
  try {
    const raw = await readBody(req);
    const body = JSON.parse(raw) as { question?: string; packId?: string };
    question = body.question?.trim() ?? "";
    if (typeof body.packId === "string" && body.packId.trim()) {
      packId = body.packId.trim();
    }
  } catch {
    res.statusCode = 400;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Invalid JSON" }));
    return;
  }

  const result = await askGemba(question, { allowLlm: true, packId });
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(result));
}

async function handleTrialAsk(req: IncomingMessage, res: ServerResponse) {
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({ error: { code: "METHOD", message: "Method not allowed" } }),
    );
    return;
  }

  try {
    const codeHash = codeHashFromBearer({
      headers: { get: (n) => headerGet(req, n) },
    });
    const raw = await readBody(req);
    const body = JSON.parse(raw) as TrialAskRequestBody;
    if (!body?.systemPrompt || !Array.isArray(body.messages)) {
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          error: {
            code: "INVALID_BODY",
            message: "リクエスト形式が正しくありません。",
          },
        }),
      );
      return;
    }
    const result = await executeTrialAsk(codeHash, {
      provider: body.provider,
      model: body.model,
      systemPrompt: body.systemPrompt,
      messages: body.messages.map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: String(m.content ?? ""),
      })),
      knowledgeCharCount: Number(body.knowledgeCharCount) || 0,
      estimatedInputTokens: Number(body.estimatedInputTokens) || 0,
      responseFormat: body.responseFormat,
      temperature: body.temperature,
    });
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(result));
  } catch (err) {
    const payload = trialErrorPayload(err);
    res.statusCode = payload.status;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(payload.body));
  }
}

async function handleTrialStatus(req: IncomingMessage, res: ServerResponse) {
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }
  if (req.method !== "GET") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({ error: { code: "METHOD", message: "Method not allowed" } }),
    );
    return;
  }

  try {
    const codeHash = codeHashFromBearer({
      headers: { get: (n) => headerGet(req, n) },
    });
    const status = await getTrialStatusForCode(codeHash);
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(status));
  } catch (err) {
    const payload = trialErrorPayload(err);
    res.statusCode = payload.status;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(payload.body));
  }
}

function mountApis(server: ViteDevServer) {
  server.middlewares.use("/api/ask", (req, res) => {
    void handleAsk(req, res);
  });
  server.middlewares.use("/api/trial/ask", (req, res) => {
    void handleTrialAsk(req, res);
  });
  server.middlewares.use("/api/trial/status", (req, res) => {
    void handleTrialStatus(req, res);
  });
}

/**
 * Dev / preview: /api/ask + /api/trial/*
 */
export function gembaAskApiPlugin(): Plugin {
  return {
    name: "gemba-ask-api",
    config(_, { mode }) {
      applyEnv(mode);
    },
    configureServer(server) {
      applyEnv(server.config.mode);
      mountApis(server);
    },
    configurePreviewServer(server) {
      applyEnv(server.config.mode);
      mountApis(server as unknown as ViteDevServer);
    },
  };
}
