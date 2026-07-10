import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  demoDocuments,
  demoQuestions,
  type DemoDocument,
  type SourceReference,
} from "../data/gembashift-demo";
import {
  nextPresetAfter,
  scenarioSuggestions,
  unmatchedSuggestions,
  type ScenarioId,
} from "../data/question-aliases";
import type { QueryCatalogItem } from "../data/query-catalog";
import { knowledgeStats } from "../ai/knowledge";
import { aiEngine, type AskMeta } from "../engines";
import { LiveShell } from "../components/live/LiveShell";
import {
  WorkspaceSidebar,
  type SidebarMode,
} from "../components/live/WorkspaceSidebar";
import { QueryThread, type ThreadItem } from "../components/live/QueryThread";
import { QueryComposer } from "../components/live/QueryComposer";
import { SourceDrawer } from "../components/live/SourceDrawer";

const AI_SEARCH_STEPS = [
  `Searching ${knowledgeStats.documents} documents`,
  `Scanning ${knowledgeStats.chunks} knowledge chunks`,
  "Ranking relevant clauses",
  "Building grounded answer",
] as const;

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

export function AiDemoPage() {
  const [activeDoc, setActiveDoc] = useState<DemoDocument>(
    () => demoDocuments.find((d) => d.id === "DOC-CTRL-034")!,
  );
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>("queries");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [input, setInput] = useState("この変更の影響範囲は？");
  const [thread, setThread] = useState<ThreadItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [sourceOpen, setSourceOpen] = useState(false);
  const [drawerSources, setDrawerSources] = useState<SourceReference[]>([]);
  const [selectedSource, setSelectedSource] = useState<SourceReference | null>(
    null,
  );
  const [activeQueryId, setActiveQueryId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [lastMeta, setLastMeta] = useState<AskMeta | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(0);
  const bootstrapped = useRef(false);

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
  }, [thread, loading, lastMeta]);

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
    },
    [activeDoc],
  );

  const runQuery = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      const loadingId = nextId();
      setLoading(true);
      setInput("");
      setThread((prev) => [
        ...prev,
        { kind: "user", id: nextId(), text: trimmed },
        { kind: "searching", id: loadingId, stepMs: 380, steps: AI_SEARCH_STEPS },
      ]);

      const started = Date.now();
      const minSearchMs = AI_SEARCH_STEPS.length * 380 + 80;

      try {
        const result = await aiEngine.ask({ question: trimmed, mode: "ai" });
        const wait = Math.max(0, minSearchMs - (Date.now() - started));
        if (wait > 0) {
          await new Promise((r) => window.setTimeout(r, wait));
        }

        setLastMeta(result.meta);
        setActiveQueryId(result.scenarioId ?? null);

        setThread((prev) => {
          const withoutSearching = prev.filter((i) => i.id !== loadingId);
          return [
            ...withoutSearching,
            {
              kind: "assistant",
              id: nextId(),
              answer: result.answer,
              scenarioId: result.scenarioId ?? undefined,
              presentation: true,
              unmatched: result.meta.refused && !result.scenarioId,
              suggestions:
                result.meta.refused && result.answer.sources.length === 0
                  ? unmatchedSuggestions
                  : undefined,
            },
          ];
        });

        if (result.scenarioId) {
          setInput(nextPresetAfter[result.scenarioId as ScenarioId] ?? "");
        }
      } catch {
        setThread((prev) => {
          const withoutSearching = prev.filter((i) => i.id !== loadingId);
          return [
            ...withoutSearching,
            {
              kind: "assistant",
              id: nextId(),
              unmatched: true,
              answer: {
                summary:
                  "回答の取得に失敗しました。ネットワークまたは API を確認してください。",
                sources: [],
              },
              suggestions: unmatchedSuggestions,
            },
          ];
        });
      } finally {
        setLoading(false);
      }
    },
    [loading],
  );

  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;
    const first = demoQuestions.find((q) => q.id === "version-diff")!;
    void runQuery(first.question);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 初回のみ
  }, []);

  const handlePickQuery = (item: QueryCatalogItem) => {
    setActiveQueryId(item.id);
    void runQuery(item.question);
  };

  const openSidebar = (mode: SidebarMode) => {
    setSidebarMode(mode);
    setSidebarOpen(true);
  };

  const quickItems = scenarioSuggestions.slice(0, 4).map((s) => ({
    label: s.label,
    onSelect: () => {
      const q = demoQuestions.find((d) => d.id === s.id);
      if (!q) return;
      setActiveQueryId(s.id);
      void runQuery(q.question);
    },
  }));

  return (
    <LiveShell
      onOpenDocs={() => openSidebar("docs")}
      onOpenQueries={() => openSidebar("queries")}
      mode="ai"
    >
      <div className="relative flex min-h-0 flex-1">
        <WorkspaceSidebar
          mode={sidebarMode}
          onModeChange={setSidebarMode}
          activeDocId={activeDoc.id}
          onSelectDoc={setActiveDoc}
          onPickQuery={handlePickQuery}
          queryDisabled={loading}
          activeQueryId={activeQueryId}
          mobileOpen={sidebarOpen}
          onCloseMobile={() => setSidebarOpen(false)}
        />

        <div className="relative flex min-w-0 flex-1 flex-col">
          <div className="border-b border-line bg-white px-4 py-2.5 sm:px-6">
            <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs font-bold tracking-[0.12em] text-navy">
                  AI Mode · 登録ナレッジ参照
                </p>
                <p className="mt-0.5 text-[11px] text-muted">
                  {knowledgeStats.documents}文書 · {knowledgeStats.chunks}
                  チャンク · 根拠がある場合のみ回答
                </p>
              </div>
              <Link
                to="/"
                className="rounded-md border border-line px-3 py-1.5 text-xs font-semibold text-navy transition-colors hover:border-navy/40"
              >
                Sample に戻る
              </Link>
            </div>
            {lastMeta && (
              <p className="mx-auto mt-2 max-w-2xl font-mono text-[11px] text-navy-muted">
                {lastMeta.searchedDocuments} documents searched ·{" "}
                {lastMeta.sourcesFound} sources found · confidence{" "}
                {lastMeta.confidence}
                {lastMeta.refused ? " · refused" : ""} · engine{" "}
                {lastMeta.engine}
              </p>
            )}
          </div>

          <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
            <QueryThread
              items={thread}
              onOpenSources={openSources}
              onSuggest={(text) => {
                if (loading) return;
                void runQuery(text);
              }}
              presentation
              staggerMs={160}
              countUpMs={600}
              hideGuide
              wide
            />
          </div>

          <QueryComposer
            value={input}
            onChange={setInput}
            onSubmit={() => void runQuery(input)}
            onOpenQueries={() => openSidebar("queries")}
            disabled={loading}
            loading={loading}
            quickItems={quickItems}
            prominent
          />
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
