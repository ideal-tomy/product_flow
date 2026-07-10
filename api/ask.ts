import type { VercelRequest, VercelResponse } from "@vercel/node";
import { askGemba } from "../src/ai/ask";

/**
 * Vercel Serverless: POST /api/ask
 * 環境変数 OPENAI_API_KEY / OPENAI_MODEL を参照して LLM 付き回答を返す。
 * キーが無い場合は RAG シンセサイザにフォールバック。
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const body =
      typeof req.body === "string"
        ? (JSON.parse(req.body) as { question?: string })
        : ((req.body ?? {}) as { question?: string });

    const question = body.question?.trim() ?? "";
    const result = await askGemba(question, { allowLlm: true });
    res.status(200).json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    res.status(500).json({ error: message });
  }
}
