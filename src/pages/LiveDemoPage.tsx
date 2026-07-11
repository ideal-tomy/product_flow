import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  DemoDocument,
  SourceReference,
} from "../data/ConformSystem-demo";
import {
  unmatchedSuggestions,
} from "../data/question-aliases";
import { sampleEngine } from "../engines";
import type { QueryCatalogItem } from "../data/query-catalog";
import { usePresentationMode } from "../hooks/usePresentationMode";
import { usePack } from "../packs";
import { enrichSourcesFromChunks } from "../packs/chunkUtils";
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
import { AutoplayController } from "../components/presentation/AutoplayController";
import { scrollToLatestThreadAnchor } from "../components/live/scrollToLatestAnswer";

function defaultSearchSteps(docCount: number): string[] {
  return [
    `Scanning ${docCount} documents`,
    "Comparing revisions",
    "Checking contradictions",
    "Sources found",
  ];
}

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

export function LiveDemoPage() {
  const {
    presentation,
    autoplay,
    setPresentation,
    timings,
    isNarrow,
  } = usePresentationMode();

  const { pack, packId, setPackId } = usePack();
  const sample = pack.sample;
  const presentationConfig = pack.presentation;
  const activeSearchSteps =
    presentationConfig?.searchSteps ?? defaultSearchSteps(sample.stats.documents);
  const activeTagline =
    presentationConfig?.tagline ?? "探す時間を、判断する時間へ。";
  const activeBeats = presentationConfig?.beats ?? [
    { at: 0, type: "intro" as const },
    { at: 3, type: "clear" as const },
    { at: 3.2, type: "ask" as const, scenarioId: sample.initialQuestionId },
    { at: 14, type: "open-source" as const },
    { at: 20, type: "tagline" as const },
    { at: 24, type: "done" as const },
  ];
  const activeAutoplayQuestions = sample.questions;
  const scaleIntroStats = presentationConfig?.scaleIntro;

  const [activeDoc, setActiveDoc] = useState<DemoDocument>(
    () =>
      sample.documents.find((d) => d.id === sample.initialDocId) ??
      sample.documents[0]!,
  );
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>("docs");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [input, setInput] = useState("");
  const [thread, setThread] = useState<ThreadItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [sourceOpen, setSourceOpen] = useState(false);
  const [drawerSources, setDrawerSources] = useState<SourceReference[]>([]);
  const [selectedSource, setSelectedSource] = useState<SourceReference | null>(
    null,
  );
  const [activeQueryId, setActiveQueryId] = useState<string | null>(null);
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
      pack.sample.documents.find(
        (d) => d.id === pack.sample.initialDocId,
      ) ?? pack.sample.documents[0]!;
    setActiveDoc(doc);
    setThread([]);
    setActiveQueryId(null);
    setInput("");
    setSourceOpen(false);
    setLoading(false);
  }, [pack, presentation, autoplay]);

  useEffect(() => {
    if (!sourceOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSourceOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sourceOpen]);

  useEffect(() => {
    scrollToLatestThreadAnchor(scrollRef.current);
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
      const enriched = enrichSourcesFromChunks(sources, pack.ai.chunks);
      setDrawerSources(enriched);
      setSelectedSource(pickSource(enriched, activeDoc, focus));

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
    [activeDoc, presentation, timings.sourceCueMs, pack.ai.chunks],
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
            steps: activeSearchSteps,
          },
        ]);
        setInput("");

        const delay = timings.stepMs * activeSearchSteps.length + 80;

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

            setLoading(false);
          });
      }, 850);
    },
    [loading, presentation, timings.stepMs, packIdForAsk, packUnmatched, activeSearchSteps],
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
      const bootId = sample.initialQuestionId;
      setActiveQueryId(bootId);
      const question =
        sample.questions.find((q) => q.id === bootId)?.question ??
        sample.questions[0]?.question ??
        "";
      const t = window.setTimeout(() => {
        runQueryRef.current(question);
      }, 0);
      return () => window.clearTimeout(t);
    }
  }, [presentation, autoplay, sample]);

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

  const exitVideo = () => setPresentation(false);

  return (
    <LiveShell
      onOpenDocs={() => openSidebar("docs")}
      onOpenQueries={() => openSidebar("queries")}
      presentation={presentation}
      autoplay={autoplay}
      mode="sample"
      onTogglePresentation={() => setPresentation(!presentation)}
      onExitVideo={exitVideo}
      hideChrome={presentation && autoplay}
      packTitle={pack.title}
      packLabel={pack.label}
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
        beats={activeBeats}
        questions={activeAutoplayQuestions}
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
              <ScaleIntro
                visible
                countUpMs={timings.countUpMs}
                stats={
                  scaleIntroStats
                    ? {
                        eyebrow: scaleIntroStats.eyebrow,
                        documents: scaleIntroStats.documents,
                        pages: scaleIntroStats.pages,
                        clauses: scaleIntroStats.clauses,
                        pagesLabel: scaleIntroStats.pagesLabel,
                        clausesLabel: scaleIntroStats.clausesLabel,
                      }
                    : undefined
                }
              />
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
                presentation={presentation}
                staggerMs={timings.staggerMs}
                countUpMs={timings.countUpMs}
                sourceCueActive={sourceCueActive}
                wide={presentation}
              />
            )}

            {showTagline && (
              <div className="fade-in px-6 pb-16 pt-8 text-center">
                <p className="text-xl font-semibold tracking-tight text-navy sm:text-2xl">
                  {activeTagline}
                </p>
                <p className="mt-3 text-sm text-navy-muted">ConformSystem</p>
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
