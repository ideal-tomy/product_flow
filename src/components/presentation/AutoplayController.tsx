import { useEffect, useRef } from "react";
import {
  presentationBeats,
  presentationTagline,
} from "../../data/presentation-script";
import type { ScenarioId } from "../../data/question-aliases";
import { demoQuestions } from "../../data/gembashift-demo";

interface AutoplayControllerProps {
  enabled: boolean;
  onAsk: (scenarioId: ScenarioId, question: string) => void;
  onOpenSource: () => void;
  onIntro: (show: boolean) => void;
  onTagline: (show: boolean) => void;
  onClear: () => void;
}

export function AutoplayController({
  enabled,
  onAsk,
  onOpenSource,
  onIntro,
  onTagline,
  onClear,
}: AutoplayControllerProps) {
  const started = useRef(false);
  const callbacks = useRef({
    onAsk,
    onOpenSource,
    onIntro,
    onTagline,
    onClear,
  });
  callbacks.current = { onAsk, onOpenSource, onIntro, onTagline, onClear };

  useEffect(() => {
    if (!enabled) {
      started.current = false;
      return;
    }
    if (started.current) return;
    started.current = true;

    const timers: number[] = [];
    for (const beat of presentationBeats) {
      timers.push(
        window.setTimeout(() => {
          const c = callbacks.current;
          switch (beat.type) {
            case "intro":
              c.onIntro(true);
              c.onTagline(false);
              break;
            case "clear":
              c.onIntro(false);
              c.onClear();
              break;
            case "ask": {
              const q = demoQuestions.find((d) => d.id === beat.scenarioId);
              if (q) c.onAsk(beat.scenarioId, q.question);
              break;
            }
            case "open-source":
              c.onOpenSource();
              break;
            case "tagline":
              c.onTagline(true);
              break;
            case "done":
              break;
          }
        }, beat.at * 1000),
      );
    }

    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      started.current = false;
    };
  }, [enabled]);

  return null;
}

export { presentationTagline };
