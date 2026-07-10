import { useCallback, useEffect, useRef, useState } from "react";
import {
  demoDocuments,
  demoQuestions,
  type DemoDocument,
  type DemoQuestion,
  type SourceReference,
} from "../data/gembashift-demo";
import {
  matchScenario,
  nextPresetAfter,
  scenarioSuggestions,
  unmatchedSuggestions,
  type ScenarioId,
} from "../data/question-aliases";
import type { QueryCatalogItem } from "../data/query-catalog";
import { presentationSearchSteps } from "../data/presentation-script";
import { usePresentationMode } from "../hooks/usePresentationMode";
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

function byId(id: ScenarioId): DemoQuestion {
  return demoQuestions.find((q) => q.id === id)!;
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

function createInitialThread(): ThreadItem[] {
  const first = byId("version-diff");
  return [
    {
      kind: "user",
      id: "init-user",
      text: first.question,
    },
    {
      kind: "assistant",
      id: "init-assistant",
      answer: first.answer,
      scenarioId: "version-diff",
    },
  ];
}

export function LiveDemoPage() {
  const {
    presentation,
    autoplay,
    setPresentation,
    timings,
  } = usePresentationMode();

  const [activeDoc, setActiveDoc] = useState<DemoDocument>(
    () => demoDocuments.find((d) => d.id === "DOC-CTRL-034")!,
  );
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>("queries");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [input, setInput] = useState("この変更の影響範囲は？");
  const [thread, setThread] = useState<ThreadItem[]>(createInitialThread);
  const [loading, setLoading] = useState(false);
  const [sourceOpen, setSourceOpen] = useState(false);
  const [drawerSources, setDrawerSources] = useState<SourceReference[]>([]);
  const [selectedSource, setSelectedSource] = useState<SourceReference | null>(
    null,
  );
  const [activeQueryId, setActiveQueryId] = useState<string | null>("version-diff");
  const [isMobile, setIsMobile] = useState(false);
  const [focusActive, setFocusActive] = useState(false);
  const [sourceCueActive, setSourceCueActive] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [showTagline, setShowTagline] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(0);
  const lastAnswerSources = useRef<SourceReference[]>([]);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

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
      setSourceOpen(true);
      if (presentation) {
        setSourceCueActive(true);
      }
    },
    [activeDoc, presentation],
  );

  const runQuery = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      const matchedId = matchScenario(trimmed);
      const loadingId = nextId();

      setLoading(true);
      setActiveQueryId(matchedId);
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

        const delay =
          timings.stepMs * presentationSearchSteps.length + 80;

        window.setTimeout(() => {
          setThread((prev) => {
            const withoutSearching = prev.filter((i) => i.id !== loadingId);
            if (!matchedId) {
              return [
                ...withoutSearching,
                {
                  kind: "assistant",
                  id: nextId(),
                  unmatched: true,
                  answer: {
                    summary:
                      "このサンプルでは、変更点・影響範囲・再試験・文書矛盾・類似不具合などに回答できます。近い質問を選んでください。",
                    sources: [],
                  },
                  suggestions: unmatchedSuggestions,
                },
              ];
            }

            const scenario = byId(matchedId);
            lastAnswerSources.current = scenario.answer.sources;
            return [
              ...withoutSearching,
              {
                kind: "assistant",
                id: nextId(),
                answer: scenario.answer,
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
        setThread((prev) => {
          const withoutLoading = prev.filter((i) => i.id !== loadingId);
          if (!matchedId) {
            return [
              ...withoutLoading,
              {
                kind: "assistant",
                id: nextId(),
                unmatched: true,
                answer: {
                  summary:
                    "このサンプルでは、変更点・影響範囲・再試験・文書矛盾・類似不具合などに回答できます。近い質問を選んでください。",
                  sources: [],
                },
                suggestions: unmatchedSuggestions,
              },
            ];
          }

          const scenario = byId(matchedId);
          lastAnswerSources.current = scenario.answer.sources;
          return [
            ...withoutLoading,
            {
              kind: "assistant",
              id: nextId(),
              answer: scenario.answer,
              scenarioId: matchedId,
            },
          ];
        });

        if (matchedId) {
          setInput(nextPresetAfter[matchedId] ?? "");
        }
        setLoading(false);
      }, 850);
    },
    [loading, presentation, timings.stepMs],
  );

  const handleSubmit = () => runQuery(input);

  const handlePickQuery = (item: QueryCatalogItem) => {
    setActiveQueryId(item.id);
    runQuery(item.question);
  };

  const openSidebar = (mode: SidebarMode) => {
    setSidebarMode(mode);
    setSidebarOpen(true);
  };

  const quickItems = scenarioSuggestions.slice(0, 4).map((s) => ({
    label: s.label,
    onSelect: () => {
      const q = byId(s.id);
      setActiveQueryId(s.id);
      runQuery(q.question);
    },
  }));

  const hideSidebarOnDesktop = presentation;

  return (
    <LiveShell
      onOpenDocs={() => openSidebar("docs")}
      onOpenQueries={() => openSidebar("queries")}
      presentation={presentation}
      onTogglePresentation={() => setPresentation(!presentation)}
      hideChrome={presentation && autoplay}
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
                  runQuery(text);
                }}
                presentation={presentation}
                staggerMs={timings.staggerMs}
                countUpMs={timings.countUpMs}
                sourceCueActive={sourceCueActive}
                hideGuide={presentation}
                wide={presentation}
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
          isMobile={isMobile}
        />
      </div>
    </LiveShell>
  );
}
