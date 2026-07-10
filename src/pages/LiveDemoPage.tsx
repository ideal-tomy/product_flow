import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  DemoDocument,
  DemoQuestion,
  SourceReference,
} from "../data/gembashift-demo";
import {
  nextPresetAfter,
  unmatchedSuggestions,
  type ScenarioId,
} from "../data/question-aliases";
import { sampleEngine } from "../engines";
import type { QueryCatalogItem } from "../data/query-catalog";
import { presentationSearchSteps } from "../data/presentation-script";
import { usePresentationMode } from "../hooks/usePresentationMode";
import { getPack, usePack } from "../packs";
import { LiveShell } from "../components/live/LiveShell";
import {
  WorkspaceSidebar,
  type SidebarMode,
} from "../components/live/WorkspaceSidebar";
import { QueryThread, type ThreadItem } from "../components/live/QueryThread";
import { QueryComposer } from "../components/live/QueryComposer";
import { SourceDrawer } from "../components/live/SourceDrawer";
import { PresentationOverlay } from "../components/presentation/PresentationOverlay";
import { SourceCue } from "../components/presentation/SourceCue";
import { ScaleIntro } from "../components/presentation/ScaleIntro";
import {
  AutoplayController,
  presentationTagline,
} from "../components/presentation/AutoplayController";

function pickSource(
  sources: SourceReference[],
  activeDoc: DemoDocument,
  focus?: SourceReference,
): SourceReference {
  if (focus) {
    const sameClausePreferred = sources.find(
      (s) =>
        s.clauseId === focus.clauseId &&
        s.documentName === activeDoc.name &&
        s.version === activeDoc.version,
    );
    if (sameClausePreferred) return sameClausePreferred;

    if (activeDoc.controlVersion) {
      const byVersion = sources.find(
        (s) =>
          s.clauseId === focus.clauseId &&
          s.version === activeDoc.controlVersion,
      );
      if (byVersion) return byVersion;
    }

    const exact = sources.find(
      (s) =>
        s.clauseId === focus.clauseId &&
        s.version === focus.version &&
        s.page === focus.page &&
        s.documentName === focus.documentName,
    );
    if (exact) return exact;
  }

  const byDoc = sources.find(
    (s) => s.documentName === activeDoc.name && s.version === activeDoc.version,
  );
  if (byDoc) return byDoc;

  if (activeDoc.controlVersion) {
    const byVersion = sources.find((s) => s.version === activeDoc.controlVersion);
    if (byVersion) return byVersion;
  }

  return sources[0];
}

function createThreadFromQuestion(q: DemoQuestion): ThreadItem[] {
  return [
    { kind: "user", id: "init-user", text: q.question },
    {
      kind: "assistant",
      id: "init-assistant",
      answer: q.answer,
      scenarioId: q.id as ScenarioId,
    },
  ];
}

/** Presentation（autoplay なし）は入口で SearchSteps から始めるため空で開始 */
function isPresentationEntry(): boolean {
  if (typeof window === "undefined") return false;
  const p = new URLSearchParams(window.location.search);
  return p.get("presentation") === "1" && p.get("autoplay") !== "1";
}

export function LiveDemoPage() {
  const {
    presentation,
    autoplay,
    setPresentation,
    setAutoplay,
    timings,
    isNarrow,
  } = usePresentationMode();

  const { pack: selectedPack, packId, setPackId } = usePack();
  // Presentation / 動画は当面 TCU 固定
  const pack = presentation || autoplay ? getPack("tcu-480") : selectedPack;
  const sample = pack.sample;

  const initialQ = useMemo(() => {
    return (
      sample.questions.find((q) => q.id === sample.initialQuestionId) ??
      sample.questions[0]!
    );
  }, [sample]);

  const [activeDoc, setActiveDoc] = useState<DemoDocument>(
    () =>
      sample.documents.find((d) => d.id === sample.initialDocId) ??
      sample.documents[0]!,
  );
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>("queries");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [input, setInput] = useState("この変更の影響範囲は？");
  const [thread, setThread] = useState<ThreadItem[]>(() =>
    isPresentationEntry() ? [] : createThreadFromQuestion(initialQ),
  );
  const [loading, setLoading] = useState(false);
  const [sourceOpen, setSourceOpen] = useState(false);
  const [drawerSources, setDrawerSources] = useState<SourceReference[]>([]);
  const [selectedSource, setSelectedSource] = useState<SourceReference | null>(
    null,
  );
  const [activeQueryId, setActiveQueryId] = useState<string | null>(
    sample.initialQuestionId,
  );
  const [focusActive, setFocusActive] = useState(false);
  const [sourceCueActive, setSourceCueActive] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [showTagline, setShowTagline] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(0);
  const lastAnswerSources = useRef<SourceReference[]>([]);
  const runQueryRef = useRef<(text: string) => void>(() => {});
  const sourceOpenTimerRef = useRef<number | null>(null);
  const packIdForAsk = pack.id;

  // パック切替時（Presentation 以外）に文書・スレッドを初期化
  useEffect(() => {
    if (presentation || autoplay) return;
    const doc =
      selectedPack.sample.documents.find(
        (d) => d.id === selectedPack.sample.initialDocId,
      ) ?? selectedPack.sample.documents[0]!;
    const q =
      selectedPack.sample.questions.find(
        (x) => x.id === selectedPack.sample.initialQuestionId,
      ) ?? selectedPack.sample.questions[0]!;
    setActiveDoc(doc);
    setThread(createThreadFromQuestion(q));
    setActiveQueryId(q.id);
    setInput(
      selectedPack.sample.questions.find((x) => x.id === "impact-scope")
        ?.question ?? "この変更の影響範囲は？",
    );
    setSourceOpen(false);
    setLoading(false);
  }, [selectedPack, presentation, autoplay]);

  useEffect(() => {
    if (!sourceOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSourceOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sourceOpen]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [thread, loading, showIntro, showTagline]);

  useEffect(() => {
    if (!sourceOpen || drawerSources.length === 0) return;
    setSelectedSource((prev) =>
      pickSource(drawerSources, activeDoc, prev ?? undefined),
    );
  }, [activeDoc, sourceOpen, drawerSources]);

  const nextId = () => {
    idRef.current += 1;
    return `msg-${idRef.current}`;
  };

  const openSources = useCallback(
    (sources: SourceReference[], focus?: SourceReference) => {
      setDrawerSources(sources);
      setSelectedSource(pickSource(sources, activeDoc, focus));

      if (sourceOpenTimerRef.current != null) {
        window.clearTimeout(sourceOpenTimerRef.current);
        sourceOpenTimerRef.current = null;
      }

      if (presentation) {
        setSourceCueActive(true);
        sourceOpenTimerRef.current = window.setTimeout(() => {
          setSourceOpen(true);
          sourceOpenTimerRef.current = null;
        }, timings.sourceCueMs);
      } else {
        setSourceOpen(true);
      }
    },
    [activeDoc, presentation, timings.sourceCueMs],
  );

  useEffect(() => {
    return () => {
      if (sourceOpenTimerRef.current != null) {
        window.clearTimeout(sourceOpenTimerRef.current);
      }
    };
  }, []);

  const packUnmatched = useMemo(
    () => sample.catalog.slice(0, 4).map((q) => q.question),
    [sample.catalog],
  );

  const runQuery = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      const loadingId = nextId();

      setLoading(true);
      setFocusActive(presentation);
      setShowTagline(false);
      setShowIntro(false);

      if (presentation) {
        setThread((prev) => [
          ...prev,
          { kind: "user", id: nextId(), text: trimmed },
          {
            kind: "searching",
            id: loadingId,
            stepMs: timings.stepMs,
          },
        ]);
        setInput("");

        const delay = timings.stepMs * presentationSearchSteps.length + 80;

        window.setTimeout(() => {
          void sampleEngine
            .ask({ question: trimmed, mode: "sample", packId: packIdForAsk })
            .then((result) => {
              const matchedId = result.scenarioId ?? null;
              setActiveQueryId(matchedId);
              setThread((prev) => {
                const withoutSearching = prev.filter((i) => i.id !== loadingId);
                if (!matchedId) {
                  return [
                    ...withoutSearching,
                    {
                      kind: "assistant",
                      id: nextId(),
                      unmatched: true,
                      answer: result.answer,
                      suggestions: packUnmatched.length
                        ? packUnmatched
                        : unmatchedSuggestions,
                    },
                  ];
                }

                lastAnswerSources.current = result.answer.sources;
                return [
                  ...withoutSearching,
                  {
                    kind: "assistant",
                    id: nextId(),
                    answer: result.answer,
                    scenarioId: matchedId,
                    presentation: true,
                  },
                ];
              });

              if (matchedId) {
                setInput(nextPresetAfter[matchedId] ?? "");
              }
              setLoading(false);
              window.setTimeout(() => setFocusActive(false), 400);
            });
        }, delay);
        return;
      }

      setThread((prev) => [
        ...prev,
        { kind: "user", id: nextId(), text: trimmed },
        { kind: "loading", id: loadingId },
      ]);
      setInput("");

      window.setTimeout(() => {
        void sampleEngine
          .ask({ question: trimmed, mode: "sample", packId: packIdForAsk })
          .then((result) => {
            const matchedId = result.scenarioId ?? null;
            setActiveQueryId(matchedId);
            setThread((prev) => {
              const withoutLoading = prev.filter((i) => i.id !== loadingId);
              if (!matchedId) {
                return [
                  ...withoutLoading,
                  {
                    kind: "assistant",
                    id: nextId(),
                    unmatched: true,
                    answer: result.answer,
                    suggestions: packUnmatched.length
                      ? packUnmatched
                      : unmatchedSuggestions,
                  },
                ];
              }

              lastAnswerSources.current = result.answer.sources;
              return [
                ...withoutLoading,
                {
                  kind: "assistant",
                  id: nextId(),
                  answer: result.answer,
                  scenarioId: matchedId,
                },
              ];
            });

            if (matchedId) {
              setInput(nextPresetAfter[matchedId] ?? "");
            }
            setLoading(false);
          });
      }, 850);
    },
    [loading, presentation, timings.stepMs, packIdForAsk, packUnmatched],
  );

  runQueryRef.current = runQuery;

  useEffect(() => {
    if (autoplay) {
      setThread([]);
      setSourceOpen(false);
      setSourceCueActive(false);
      return;
    }

    if (presentation) {
      setLoading(false);
      setThread([]);
      setSourceOpen(false);
      setSourceCueActive(false);
      setShowTagline(false);
      setShowIntro(false);
      setActiveQueryId("version-diff");
      const tcu = getPack("tcu-480");
      const question =
        tcu.sample.questions.find((q) => q.id === "version-diff")?.question ??
        "";
      const t = window.setTimeout(() => {
        runQueryRef.current(question);
      }, 0);
      return () => window.clearTimeout(t);
    }
  }, [presentation, autoplay]);

  const handleSubmit = () => runQuery(input);

  const handlePickQuery = (item: QueryCatalogItem) => {
    setActiveQueryId(item.id);
    runQuery(item.question);
  };

  const openSidebar = (mode: SidebarMode) => {
    setSidebarMode(mode);
    setSidebarOpen(true);
  };

  const quickItems = sample.catalog.slice(0, 4).map((s) => ({
    label: s.label,
    onSelect: () => {
      setActiveQueryId(s.id);
      runQuery(s.question);
    },
  }));

  const hideSidebarOnDesktop = presentation;

  const watchVideo = () => setAutoplay(true);
  const exitVideo = () => setPresentation(false);

  const guide = {
    title: sample.intro.title,
    subtitle: sample.intro.subtitle,
    context: pack.context,
    stats: sample.stats,
    suggestions: sample.catalog.map((c) => ({ id: c.id, label: c.label })),
    aiLink: `/ai?pack=${packId}`,
  };

  return (
    <LiveShell
      onOpenDocs={() => openSidebar("docs")}
      onOpenQueries={() => openSidebar("queries")}
      presentation={presentation}
      autoplay={autoplay}
      mode="sample"
      onTogglePresentation={() => setPresentation(!presentation)}
      onWatchVideo={watchVideo}
      onExitVideo={exitVideo}
      hideChrome={presentation && autoplay}
      packTitle={pack.title}
      packId={packId}
      onPackChange={setPackId}
      versionLabel={sample.versionLabel}
      aiSubtitle={
        presentation
          ? `${sample.stats.documents} docs · ${sample.stats.pages.toLocaleString()} pages`
          : undefined
      }
    >
      <PresentationOverlay active={presentation && focusActive} />
      <SourceCue
        active={sourceCueActive}
        durationMs={timings.sourceCueMs}
        onDone={() => setSourceCueActive(false)}
      />

      <AutoplayController
        enabled={autoplay}
        onIntro={setShowIntro}
        onTagline={setShowTagline}
        onClear={() => {
          setThread([]);
          setSourceOpen(false);
          setInput("");
        }}
        onAsk={(scenarioId, question) => {
          setActiveQueryId(scenarioId);
          runQuery(question);
        }}
        onOpenSource={() => {
          const sources = lastAnswerSources.current;
          if (sources.length > 0) openSources(sources, sources[0]);
        }}
      />

      <div className="relative flex min-h-0 flex-1">
        <div
          className={
            hideSidebarOnDesktop
              ? "lg:hidden"
              : presentation
                ? "opacity-40 transition-opacity"
                : undefined
          }
        >
          <WorkspaceSidebar
            mode={sidebarMode}
            onModeChange={setSidebarMode}
            activeDocId={activeDoc.id}
            onSelectDoc={setActiveDoc}
            onPickQuery={handlePickQuery}
            queryDisabled={loading || autoplay}
            activeQueryId={activeQueryId}
            mobileOpen={sidebarOpen}
            onCloseMobile={() => setSidebarOpen(false)}
            documents={sample.sidebarDocuments}
            docsStatLabel={`${sample.stats.documents}文書 · ${sample.stats.pages.toLocaleString()}ページ`}
            queries={sample.catalog}
          />
        </div>

        <div className="relative flex min-w-0 flex-1 flex-col">
          <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
            {showIntro && (
              <ScaleIntro visible countUpMs={timings.countUpMs} />
            )}

            {!showIntro && (
              <QueryThread
                items={thread}
                onOpenSources={openSources}
                onSuggest={(text) => {
                  if (autoplay) return;
                  const hit = sample.catalog.find(
                    (c) => c.label === text || c.question === text,
                  );
                  runQuery(hit?.question ?? text);
                }}
                onWatchVideo={watchVideo}
                presentation={presentation}
                staggerMs={timings.staggerMs}
                countUpMs={timings.countUpMs}
                sourceCueActive={sourceCueActive}
                hideGuide={presentation}
                wide={presentation}
                guide={guide}
              />
            )}

            {showTagline && (
              <div className="fade-in px-6 pb-16 pt-8 text-center">
                <p className="text-xl font-semibold tracking-tight text-navy sm:text-2xl">
                  {presentationTagline}
                </p>
                <p className="mt-3 text-sm text-navy-muted">GembaShift</p>
              </div>
            )}
          </div>

          {!autoplay && (
            <div
              className={
                presentation && focusActive
                  ? "opacity-35 transition-opacity"
                  : undefined
              }
            >
              <QueryComposer
                value={input}
                onChange={setInput}
                onSubmit={handleSubmit}
                onOpenQueries={() => openSidebar("queries")}
                disabled={loading}
                loading={loading}
                quickItems={presentation ? undefined : quickItems}
                prominent={presentation}
              />
            </div>
          )}
        </div>

        <SourceDrawer
          open={sourceOpen}
          source={selectedSource}
          sources={drawerSources}
          activeDoc={activeDoc}
          onSelectSource={setSelectedSource}
          onClose={() => setSourceOpen(false)}
          isMobile={isNarrow}
        />
      </div>
    </LiveShell>
  );
}
