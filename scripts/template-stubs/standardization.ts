import type { DemoAnswer } from "../../data/demo-types";
import type { KnowledgeChunk } from "../knowledge";
import type { AskIntent } from "../intent";
import type { ScoredChunk } from "../retrieve";
import { synthesizeGenericPackAnswer } from "./generic";

/** テンプレートでは generic にフォールバック */
export function synthesizeStandardizationAnswer(
  question: string,
  intent: AskIntent,
  chunks: KnowledgeChunk[],
  hits: ScoredChunk[],
): DemoAnswer {
  return synthesizeGenericPackAnswer(question, intent, chunks, hits);
}
export const COMPANY_BRIDGE = "";
