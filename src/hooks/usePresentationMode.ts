import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

export function usePresentationMode() {
  const [params, setParams] = useSearchParams();
  const reducedMotion = usePrefersReducedMotion();

  const presentation = params.get("presentation") === "1";
  const autoplay = presentation && params.get("autoplay") === "1";

  const setPresentation = useCallback(
    (on: boolean) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (on) {
            next.set("presentation", "1");
          } else {
            next.delete("presentation");
            next.delete("autoplay");
          }
          return next;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  const setAutoplay = useCallback(
    (on: boolean) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (on) {
            next.set("presentation", "1");
            next.set("autoplay", "1");
          } else {
            next.delete("autoplay");
          }
          return next;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  const timings = useMemo(() => {
    if (reducedMotion) {
      return {
        stepMs: 120,
        searchTotalMs: 360,
        staggerMs: 40,
        countUpMs: 200,
        sourceCueMs: 200,
      };
    }
    return {
      stepMs: 450,
      searchTotalMs: 1600,
      staggerMs: 200,
      countUpMs: 700,
      sourceCueMs: 500,
    };
  }, [reducedMotion]);

  return {
    presentation,
    autoplay,
    setPresentation,
    setAutoplay,
    reducedMotion,
    timings,
  };
}
