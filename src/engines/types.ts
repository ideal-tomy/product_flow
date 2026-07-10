import type { DemoAnswer } from "../data/gembashift-demo";
import type { ScenarioId } from "../data/question-aliases";
import type { KnowledgePackId } from "../packs/types";

export type DemoMode = "sample" | "ai";

export type AskRequest = {
  question: string;
  mode: DemoMode;
  packId?: KnowledgePackId;
};

export type AskMeta = {
  searchedDocuments: number;
  sourcesFound: number;
  confidence: "high" | "medium" | "low";
  refused?: boolean;
  engine: "sample" | "rag" | "llm";
  scenarioId?: ScenarioId | null;
  intent?: string;
  packId?: KnowledgePackId;
};

export type AskResult = {
  answer: DemoAnswer;
  meta: AskMeta;
  scenarioId?: ScenarioId | null;
};

export interface QueryEngine {
  ask(req: AskRequest): Promise<AskResult>;
}
