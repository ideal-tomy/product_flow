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
  const [isNarrow, setIsNarrow] = useState(false);

  const presentation = params.get("presentation") === "1";
  const autoplay = presentation && params.get("autoplay") === "1";

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const update = () => setIsNarrow(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

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

  /** reduced-motion、または Presentation 中の狭幅画面は演出を短縮 */
  const compactMotion = reducedMotion || (presentation && isNarrow);

  const timings = useMemo(() => {
    if (compactMotion) {
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
  }, [compactMotion]);

  return {
    presentation,
    autoplay,
    setPresentation,
    setAutoplay,
    reducedMotion,
    isNarrow,
    timings,
  };
}
