import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { DemoDocument, SourceReference } from "../data/gembashift-demo";
import type { QueryCatalogItem } from "../data/query-catalog";
import { aiDocuments, aiWorkspaceStats } from "../ai/documents";
import { knowledgeStats } from "../ai/knowledge";
import { aiRecommendedQueries, intentToScenarioId } from "../ai/recommended";
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
      const cv = activeDoc.controlVersion;
      const byVersion = sources.find(
        (s) =>
          s.clauseId === focus.clauseId &&
          (s.version === cv || s.version === cv.replace(/^v/, "")),
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
    (s) => s.documentName === activeDoc.name,
  );
  if (byDoc) return byDoc;

  return sources[0];
}

export function AiDemoPage() {
  const [activeDoc, setActiveDoc] = useState<DemoDocument>(
    () => aiDocuments.find((d) => d.id === "CTRL-SPEC-34") ?? aiDocuments[0]!,
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
    async (text: string, queryId?: string | null) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      const loadingId = nextId();
      setLoading(true);
      setInput("");
      if (queryId) setActiveQueryId(queryId);
      setThread((prev) => [
        ...prev,
        { kind: "user", id: nextId(), text: trimmed },
        {
          kind: "searching",
          id: loadingId,
          stepMs: 380,
          steps: AI_SEARCH_STEPS,
        },
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
        const scenarioId = intentToScenarioId(result.meta.intent);

        setThread((prev) => {
          const withoutSearching = prev.filter((i) => i.id !== loadingId);
          return [
            ...withoutSearching,
            {
              kind: "assistant",
              id: nextId(),
              answer: result.answer,
              scenarioId: scenarioId ?? undefined,
              presentation: true,
              unmatched: Boolean(result.meta.refused),
              suggestions: result.meta.refused
                ? aiRecommendedQueries.slice(0, 4).map((q) => q.question)
                : undefined,
            },
          ];
        });

        const next =
          aiRecommendedQueries.find((q) => q.id === queryId) ??
          aiRecommendedQueries.find((q) => q.id === scenarioId);
        const nextIdx = next
          ? aiRecommendedQueries.findIndex((q) => q.id === next.id)
          : -1;
        if (nextIdx >= 0 && nextIdx < aiRecommendedQueries.length - 1) {
          setInput(aiRecommendedQueries[nextIdx + 1]!.question);
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
              suggestions: aiRecommendedQueries.slice(0, 4).map((q) => q.question),
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
    const first = aiRecommendedQueries[0]!;
    void runQuery(first.question, first.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 初回のみ
  }, []);

  const handlePickQuery = (item: QueryCatalogItem) => {
    setActiveQueryId(item.id);
    void runQuery(item.question, item.id);
  };

  const openSidebar = (mode: SidebarMode) => {
    setSidebarMode(mode);
    setSidebarOpen(true);
  };

  const quickItems = aiRecommendedQueries.slice(0, 4).map((s) => ({
    label: s.label,
    onSelect: () => {
      setActiveQueryId(s.id);
      void runQuery(s.question, s.id);
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
          documents={aiDocuments}
          docsStatLabel={`${aiWorkspaceStats.documents}文書 · ${aiWorkspaceStats.chunks}チャンク`}
          queries={aiRecommendedQueries}
        />

        <div className="relative flex min-w-0 flex-1 flex-col">
          <div className="border-b border-line bg-white px-4 py-2.5 sm:px-6">
            <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-2 lg:max-w-4xl">
              <div>
                <p className="text-xs font-bold tracking-[0.12em] text-navy">
                  AI Mode · {aiWorkspaceStats.company}
                </p>
                <p className="mt-0.5 text-[11px] text-muted">
                  {aiWorkspaceStats.product} · {knowledgeStats.chunks} chunks ·
                  根拠がある場合のみ回答
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
              <p className="mx-auto mt-2 max-w-3xl font-mono text-[11px] text-navy-muted lg:max-w-4xl">
                {lastMeta.searchedDocuments} documents searched ·{" "}
                {lastMeta.sourcesFound} sources found · confidence{" "}
                {lastMeta.confidence}
                {lastMeta.intent ? ` · intent ${lastMeta.intent}` : ""}
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
