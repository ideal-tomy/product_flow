import { DEFAULT_PACK_ID, isKnowledgePackId, type KnowledgePack, type KnowledgePackId } from "./types";
import { workProcedurePack } from "./work-procedure/pack";
import { inspectionPack } from "./inspection/pack";
import { tcuPack } from "./tcu/pack";

export type { KnowledgePack, KnowledgePackId, PackContext } from "./types";
export { DEFAULT_PACK_ID, isKnowledgePackId } from "./types";
export { usePack } from "./usePack";

export const knowledgePacks: KnowledgePack[] = [
  workProcedurePack,
  inspectionPack,
  tcuPack,
];

export function getPack(id: KnowledgePackId | string | null | undefined): KnowledgePack {
  if (isKnowledgePackId(id)) {
    return knowledgePacks.find((p) => p.id === id) ?? workProcedurePack;
  }
  return workProcedurePack;
}

export function getPackOrDefault(searchParams: URLSearchParams): KnowledgePack {
  return getPack(searchParams.get("pack") ?? DEFAULT_PACK_ID);
}
