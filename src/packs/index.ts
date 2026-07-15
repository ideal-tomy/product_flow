import { DEFAULT_PACK_ID, type KnowledgePack, type KnowledgePackId } from "./types";
import { workProcedurePack } from "./work-procedure/pack";
import { inspectionPack } from "./inspection/pack";
import { tcuPack } from "./tcu/pack";
import { standardizationPack } from "./standardization/pack";
import { starterPack } from "./starter/pack";
import { minatoHrPack } from "./minato-hr/pack";
import { minatoFactoryPack } from "./minato-factory/pack";

export type { KnowledgePack, KnowledgePackId, PackContext, PackSynthesizer } from "./types";
export { DEFAULT_PACK_ID } from "./types";
export { usePack } from "./usePack";

/**
 * 登録パック一覧。
 * テンプレート化後は starter のみ。業界デモは `npm run new-pack` で追加する。
 */
export const knowledgePacks: KnowledgePack[] = [
  starterPack,
  workProcedurePack,
  inspectionPack,
  tcuPack,
  standardizationPack,
  minatoHrPack,
  minatoFactoryPack,
];

export function isKnowledgePackId(
  value: string | null | undefined,
): value is KnowledgePackId {
  return typeof value === "string" && knowledgePacks.some((p) => p.id === value);
}

export function getPack(id: KnowledgePackId | string | null | undefined): KnowledgePack {
  if (isKnowledgePackId(id)) {
    return knowledgePacks.find((p) => p.id === id) ?? knowledgePacks[0]!;
  }
  return knowledgePacks.find((p) => p.id === DEFAULT_PACK_ID) ?? knowledgePacks[0]!;
}

export function getPackOrDefault(searchParams: URLSearchParams): KnowledgePack {
  return getPack(searchParams.get("pack") ?? DEFAULT_PACK_ID);
}
