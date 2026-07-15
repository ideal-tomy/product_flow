import { aiEngine } from "./aiEngine";
import { sampleEngine } from "./sampleEngine";
import type { DemoMode, QueryEngine } from "./types";

export type { AskMeta, AskRequest, AskResult, DemoMode, QueryEngine } from "./types";
export { aiEngine, accessAwareEngine } from "./aiEngine";
export { sampleEngine, unmatchedSuggestions } from "./sampleEngine";

export function getEngine(mode: DemoMode): QueryEngine {
  return mode === "ai" ? aiEngine : sampleEngine;
}
