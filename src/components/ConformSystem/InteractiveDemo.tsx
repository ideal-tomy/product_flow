import { useEffect, useMemo, useState } from "react";
import {
  demoQuestions,
  genericBeforeAnswer,
  lpDemoQuestions,
  type DemoQuestion,
  type SourceReference,
} from "../../data/ConformSystem-demo";
import { QuestionChips } from "./QuestionChips";
import { DemoInput } from "./DemoInput";
import { AnswerCard } from "./AnswerCard";
import { SourcePanel } from "./SourcePanel";

type DemoState = "idle" | "loading" | "answered";

function matchQuestion(input: string): DemoQuestion | undefined {
  const normalized = input.trim();
  return (
    demoQuestions.find((q) => q.question === normalized) ??
    demoQuestions.find((q) => normalized.includes(q.chipLabel.replace("？", ""))) ??
    demoQuestions.find((q) =>
      q.question.replace(/[？?]/g, "").includes(normalized.replace(/[？?]/g, "").slice(0, 12)),
    )
  );
}

export function InteractiveDemo() {
  const preset = lpDemoQuestions[0];
  const [input, setInput] = useState(preset.question);
  const [activeChipId, setActiveChipId] = useState<string | null>(preset.id);
  const [state, setState] = useState<DemoState>("idle");
  const [current, setCurrent] = useState<DemoQuestion | null>(null);
  const [selectedSource, setSelectedSource] = useState<SourceReference | null>(null);
  const [showGenericBefore, setShowGenericBefore] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModalOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modalOpen]);

  const loadingDots = useMemo(
    () => (
      <div className="flex items-center gap-2 rounded-md border border-line bg-white px-4 py-3 text-sm text-navy-muted">
        <span className="flex gap-1" aria-hidden="true">
          <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-navy" />
          <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-navy [animation-delay:0.2s]" />
          <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-navy [animation-delay:0.4s]" />
        </span>
        構造化DBから条項を参照しています…
      </div>
    ),
    [],
  );

  const handleSelectChip = (question: DemoQuestion) => {
    setActiveChipId(question.id);
    setInput(question.question);
  };

  const handleSubmit = () => {
    const matched = matchQuestion(input) ?? (activeChipId
      ? demoQuestions.find((q) => q.id === activeChipId)
      : undefined) ?? preset;

    setState("loading");
    setCurrent(null);
    setSelectedSource(null);
    setModalOpen(false);

    window.setTimeout(() => {
      setCurrent(matched);
      setActiveChipId(matched.id);
      setShowGenericBefore(Boolean(matched.showGenericBefore));
      setSelectedSource(matched.answer.sources[0] ?? null);
      setState("answered");
    }, 900);
  };

  const handleSelectSource = (source: SourceReference) => {
    setSelectedSource(source);
    if (isMobile) setModalOpen(true);
  };

  return (
    <section id="demo" className="border-y border-line bg-surface/40">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold text-navy sm:text-[1.75rem]">
            実際に、試してみてください。
          </h2>
          <p className="mt-3 text-muted">
            公開用のサンプル仕様書をもとに、実際の質問と回答の流れを体験できます。
          </p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <QuestionChips
              questions={lpDemoQuestions}
              activeId={activeChipId}
              onSelect={handleSelectChip}
            />
            <DemoInput
              value={input}
              onChange={setInput}
              onSubmit={handleSubmit}
              disabled={state === "loading"}
              loading={state === "loading"}
            />

            {state === "idle" && (
              <p className="text-sm text-muted">
                質問はプリセット済みです。送信を押すと、根拠付きの回答が表示されます。
              </p>
            )}

            {state === "loading" && loadingDots}

            {state === "answered" && current && (
              <AnswerCard
                answer={current.answer}
                showGenericBefore={showGenericBefore}
                genericBeforeText={genericBeforeAnswer}
                onSelectSource={handleSelectSource}
                selectedSourceKey={
                  selectedSource
                    ? `${selectedSource.documentName}-${selectedSource.version}-${selectedSource.clauseId}-${selectedSource.page}`
                    : undefined
                }
              />
            )}
          </div>

          <div className="hidden lg:block">
            <SourcePanel source={state === "answered" ? selectedSource : null} />
          </div>
        </div>

        {isMobile && modalOpen && selectedSource && (
          <SourcePanel
            source={selectedSource}
            asModal
            onClose={() => setModalOpen(false)}
          />
        )}

        <p className="mt-6 text-xs text-muted">
          ※ 18文書・2,842ページのサンプルデータによるデモです。
        </p>
      </div>
    </section>
  );
}
