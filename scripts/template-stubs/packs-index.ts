import { DEFAULT_PACK_ID, type KnowledgePack, type KnowledgePackId } from "./types";
import { starterPack } from "./starter/pack";

export type { KnowledgePack, KnowledgePackId, PackContext, PackSynthesizer } from "./types";
export { DEFAULT_PACK_ID } from "./types";
export { usePack } from "./usePack";

export const knowledgePacks: KnowledgePack[] = [starterPack];

export function isKnowledgePackId(
  value: string | null | undefined,
): value is KnowledgePackId {
  return typeof value === "string" && knowledgePacks.some((p) => p.id === value);
}

export function getPack(id: KnowledgePackId | string | null | undefined): KnowledgePack {
  if (isKnowledgePackId(id)) {
    return knowledgePacks.find((p) => p.id === id) ?? starterPack;
  }
  return starterPack;
}

export function getPackOrDefault(searchParams: URLSearchParams): KnowledgePack {
  return getPack(searchParams.get("pack") ?? DEFAULT_PACK_ID);
}
