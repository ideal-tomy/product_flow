import type { DemoAnswer } from "../data/gembashift-demo";
import type { ScenarioId } from "../data/question-aliases";

export type DemoMode = "sample" | "ai";

export type AskRequest = {
  question: string;
  mode: DemoMode;
};

export type AskMeta = {
  searchedDocuments: number;
  sourcesFound: number;
  confidence: "high" | "medium" | "low";
  refused?: boolean;
  engine: "sample" | "rag" | "llm";
  scenarioId?: ScenarioId | null;
};

export type AskResult = {
  answer: DemoAnswer;
  meta: AskMeta;
  scenarioId?: ScenarioId | null;
};

export interface QueryEngine {
  ask(req: AskRequest): Promise<AskResult>;
}
