import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  DEFAULT_PACK_ID,
  getPack,
  isKnowledgePackId,
  type KnowledgePack,
  type KnowledgePackId,
} from "./index";

export function usePack(): {
  pack: KnowledgePack;
  packId: KnowledgePackId;
  setPackId: (id: KnowledgePackId) => void;
} {
  const [params, setParams] = useSearchParams();
  const raw = params.get("pack");
  const packId: KnowledgePackId = isKnowledgePackId(raw)
    ? raw
    : DEFAULT_PACK_ID;
  const pack = useMemo(() => getPack(packId), [packId]);

  const setPackId = useCallback(
    (id: KnowledgePackId) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set("pack", id);
          return next;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  return { pack, packId, setPackId };
}
