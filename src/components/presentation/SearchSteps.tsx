import { useEffect, useState } from "react";
import { presentationSearchSteps } from "../../data/presentation-script";

interface SearchStepsProps {
  stepMs?: number;
  onComplete?: () => void;
}

export function SearchSteps({ stepMs = 450, onComplete }: SearchStepsProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
    const timers: number[] = [];
    presentationSearchSteps.forEach((_, i) => {
      if (i === 0) return;
      timers.push(window.setTimeout(() => setIndex(i), stepMs * i));
    });
    timers.push(
      window.setTimeout(
        () => onComplete?.(),
        stepMs * presentationSearchSteps.length,
      ),
    );
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [stepMs, onComplete]);

  return (
    <div className="space-y-2 py-2 font-mono text-sm text-navy-muted">
      {presentationSearchSteps.map((step, i) => {
        const done = i < index;
        const active = i === index;
        return (
          <p
            key={step}
            className={`flex items-center gap-2 transition-opacity ${
              active || done ? "opacity-100" : "opacity-25"
            }`}
          >
            <span className="w-3 text-center text-xs">
              {done ? "✓" : active ? "·" : ""}
            </span>
            <span className={active ? "text-navy" : undefined}>{step}</span>
          </p>
        );
      })}
    </div>
  );
}
