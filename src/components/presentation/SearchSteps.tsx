import { useEffect, useState } from "react";
import { presentationSearchSteps } from "../../data/presentation-script";

interface SearchStepsProps {
  stepMs?: number;
  onComplete?: () => void;
  /** Presentation / 動画用の大きめ表示 */
  large?: boolean;
  steps?: readonly string[];
}

export function SearchSteps({
  stepMs = 450,
  onComplete,
  large = false,
  steps = presentationSearchSteps,
}: SearchStepsProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
    const timers: number[] = [];
    steps.forEach((_, i) => {
      if (i === 0) return;
      timers.push(window.setTimeout(() => setIndex(i), stepMs * i));
    });
    timers.push(
      window.setTimeout(() => onComplete?.(), stepMs * steps.length),
    );
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [stepMs, onComplete, steps]);

  return (
    <div
      className={`space-y-2.5 py-2 font-mono text-navy-muted ${
        large ? "text-base sm:text-lg" : "text-sm"
      }`}
    >
      {steps.map((step, i) => {
        const done = i < index;
        const active = i === index;
        return (
          <p
            key={step}
            className={`flex items-center gap-2.5 transition-opacity ${
              active || done ? "opacity-100" : "opacity-25"
            }`}
          >
            <span
              className={`w-4 text-center ${large ? "text-sm font-bold" : "text-xs"}`}
            >
              {done ? "✓" : active ? "·" : ""}
            </span>
            <span
              className={
                active
                  ? large
                    ? "font-semibold text-navy"
                    : "text-navy"
                  : done && large
                    ? "font-medium text-navy"
                    : undefined
              }
            >
              {step}
            </span>
          </p>
        );
      })}
    </div>
  );
}
