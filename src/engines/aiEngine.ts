import { getIsoAccessMode } from "../access/iso-settings";
import { askWithAccessMode } from "../ai/askClientLlm";
import { askGemba } from "../ai/ask";
import type { KnowledgePackId } from "../packs/types";
import type { AskRequest, AskResult, QueryEngine } from "./types";
import { sampleEngine } from "./sampleEngine";

async function askViaApi(
  question: string,
  packId?: KnowledgePackId,
): Promise<AskResult | null> {
  try {
    const res = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, packId }),
    });
    if (!res.ok) return null;
    return (await res.json()) as AskResult;
  } catch {
    return null;
  }
}

/**
 * Access-mode aware engine for /ai.
 * sample | byok-direct | managed-trial | server-proxy (default)
 */
export const accessAwareEngine: QueryEngine = {
  async ask(req: AskRequest): Promise<AskResult> {
    const mode = getIsoAccessMode();

    if (mode === "sample") {
      return sampleEngine.ask({ ...req, mode: "sample" });
    }

    if (mode === "byok-direct" || mode === "managed-trial") {
      return askWithAccessMode(req.question, {
        packId: req.packId,
        accessMode: mode,
      });
    }

    // server-proxy (default): existing /api/ask path
    const fromApi = await askViaApi(req.question, req.packId);
    if (fromApi) return fromApi;
    return askGemba(req.question, { packId: req.packId });
  },
};

/** Alias — Access Mode 対応エンジン */
export const aiEngine: QueryEngine = accessAwareEngine;
