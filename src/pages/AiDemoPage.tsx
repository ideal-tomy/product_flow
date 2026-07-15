import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { DemoDocument, SourceReference } from "../data/ConformSystem-demo";
import type { QueryCatalogItem } from "../data/query-catalog";
import type { KnowledgeChunk } from "../ai/knowledge";
import { intentToScenarioId } from "../ai/recommended";
import { aiEngine, type AskMeta } from "../engines";
import { usePack } from "../packs";
import { LiveShell } from "../components/live/LiveShell";
import {
  WorkspaceSidebar,
  type SidebarMode,
} from "../components/live/WorkspaceSidebar";
import {
  QueryThread,
  type ThreadItem,
} from "../components/live/QueryThread";
import { QueryComposer } from "../components/live/QueryComposer";
import { SourceDrawer } from "../components/live/SourceDrawer";
import { KnowledgeBrowser } from "../components/live/KnowledgeBrowser";
import { scrollToLatestThreadAnchor } from "../components/live/scrollToLatestAnswer";
import { AccessModePanel } from "../components/access/AccessModePanel";
import { ExperienceModeBar } from "../components/access/ExperienceModeBar";
import {
  getApiKey,
  getIsoAccessMode,
  getIsoProvider,
  getTrialCode,
} from "../access/iso-settings";
import type { IsoAccessMode } from "../access/access-mode";
import {
  buildTrialPortalUrl,
  DEFAULT_TRIAL_PORTAL_BASE,
  ISO_DEMO_CATALOG_ID,
} from "../access/trial-portal";

type CenterTab = "knowledge" | "answers";

function getTrialPortalHref(): string {
  const returnUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/ai`
      : undefined;
  return buildTrialPortalUrl({
    baseUrl: DEFAULT_TRIAL_PORTAL_BASE,
    demoId: ISO_DEMO_CATALOG_ID,
    returnUrl,
  });
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

  const byDoc = sources.find((s) => s.documentName === activeDoc.name);
  if (byDoc) return byDoc;

  return sources[0];
}

export function AiDemoPage() {
  const { pack, packId, setPackId } = usePack();
  const ai = pack.ai;

  const searchSteps = useMemo(
    () =>
      [
        `Searching ${ai.stats.documents} documents`,
        `Scanning ${ai.stats.chunks} knowledge chunks`,
        "Ranking relevant clauses",
        "Building grounded answer",
      ] as const,
    [ai.stats.chunks, ai.stats.documents],
  );

  const [activeDoc, setActiveDoc] = useState<DemoDocument>(
    () =>
      ai.documents.find((d) => d.id === ai.initialDocId) ?? ai.documents[0]!,
  );
  const [centerTab, setCenterTab] = useState<CenterTab>("answers");
  const [focusClauseId, setFocusClauseId] = useState<string | null>(null);
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>("queries");
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
  const [isMobile, setIsMobile] = useState(false);
  const [lastMeta, setLastMeta] = useState<AskMeta | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(0);
  const packBootKey = useRef<string | null>(null);
  const [accessOpen, setAccessOpen] = useState(false);
  const [accessMode, setAccessMode] = useState<IsoAccessMode>(() =>
    getIsoAccessMode(),
  );
  const [trialPortalHref, setTrialPortalHref] = useState(
    () =>
      buildTrialPortalUrl({
        baseUrl: DEFAULT_TRIAL_PORTAL_BASE,
        demoId: ISO_DEMO_CATALOG_ID,
      }),
  );

  useEffect(() => {
    setTrialPortalHref(getTrialPortalHref());
  }, []);

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
    if (centerTab !== "answers") return;
    scrollToLatestThreadAnchor(scrollRef.current);
  }, [thread, loading, lastMeta, centerTab]);

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

  const handleSelectDoc = useCallback((doc: DemoDocument) => {
    setActiveDoc(doc);
    setFocusClauseId(null);
    setCenterTab("knowledge");
    setSidebarMode("docs");
  }, []);

  const browseDocument = useCallback(
    (documentId: string, clauseId?: string) => {
      const doc = ai.documents.find((d) => d.id === documentId);
      if (doc) setActiveDoc(doc);
      setFocusClauseId(clauseId ?? null);
      setCenterTab("knowledge");
      setSourceOpen(false);
      setSidebarMode("docs");
    },
    [ai.documents],
  );

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
      setCenterTab("answers");
      if (queryId) setActiveQueryId(queryId);
      setThread((prev) => [
        ...prev,
        { kind: "user", id: nextId(), text: trimmed },
        {
          kind: "searching",
          id: loadingId,
          stepMs: 380,
          steps: searchSteps,
        },
      ]);

      const started = Date.now();
      const minSearchMs = searchSteps.length * 380 + 80;
      const queries = ai.recommendedQueries;

      try {
        const result = await aiEngine.ask({
          question: trimmed,
          mode: "ai",
          packId,
        });
        const wait = Math.max(0, minSearchMs - (Date.now() - started));
        if (wait > 0) {
          await new Promise((r) => window.setTimeout(r, wait));
        }

        setLastMeta(result.meta);
        const scenarioId = intentToScenarioId(result.meta.intent, packId);

        setThread((prev) => {
          const withoutSearching = prev.filter((i) => i.id !== loadingId);
          return [
            ...withoutSearching,
            {
              kind: "assistant",
              id: nextId(),
              answer: result.answer,
              scenarioId: scenarioId ?? undefined,
              unmatched: Boolean(result.meta.refused),
              suggestions: result.meta.refused
                ? queries.slice(0, 4).map((q) => q.question)
                : undefined,
            },
          ];
        });

        setInput("");
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
              suggestions: queries.slice(0, 4).map((q) => q.question),
            },
          ];
        });
      } finally {
        setLoading(false);
      }
    },
    [loading, packId, ai.recommendedQueries, searchSteps],
  );

  // パック切替時は回答タブから開始（ナレッジは必要なときだけ）
  useEffect(() => {
    if (packBootKey.current === packId) return;
    packBootKey.current = packId;
    const doc =
      ai.documents.find((d) => d.id === ai.initialDocId) ?? ai.documents[0]!;
    setActiveDoc(doc);
    setFocusClauseId(null);
    setCenterTab("answers");
    setSidebarMode("queries");
    setThread([]);
    setLastMeta(null);
    setSourceOpen(false);
    setActiveQueryId(null);
    setInput("");
  }, [packId, ai]);

  const handlePickQuery = (item: QueryCatalogItem) => {
    setActiveQueryId(item.id);
    void runQuery(item.question, item.id);
  };

  const openSidebar = (mode: SidebarMode) => {
    setSidebarMode(mode);
    setSidebarOpen(true);
  };

  const askAboutClause = useCallback(
    (chunk: KnowledgeChunk) => {
      const q = `「${chunk.documentName}」の §${chunk.clauseId} について、要点と関連する影響を教えてください。`;
      void runQuery(q);
    },
    [runQuery],
  );

  const quickItems = ai.recommendedQueries.slice(0, 4).map((s) => ({
    label: s.label,
    onSelect: () => {
      setActiveQueryId(s.id);
      void runQuery(s.question, s.id);
    },
  }));

  const handleModeChange = useCallback((mode: IsoAccessMode) => {
    setAccessMode(mode);
  }, []);

  const handleNeedSetup = useCallback((_mode: IsoAccessMode) => {
    setAccessOpen(true);
  }, []);

  const setupHint =
    accessMode === "byok-direct" && !getApiKey(getIsoProvider()).trim()
      ? "APIキー未設定です。「詳細設定」からキーを入力してください。"
      : accessMode === "managed-trial" && !getTrialCode().trim()
        ? "体験コード未設定です。「詳細設定」から入力するか、発行画面へ進んでください。"
        : null;

  return (
    <LiveShell
      onOpenDocs={() => openSidebar("docs")}
      onOpenQueries={() => openSidebar("queries")}
      mode="ai"
      packTitle={pack.title}
      packLabel={pack.label}
      packId={packId}
      onPackChange={setPackId}
      versionLabel={pack.sample.versionLabel}
    >
      <div className="relative flex min-h-0 flex-1">
        <WorkspaceSidebar
          mode={sidebarMode}
          onModeChange={setSidebarMode}
          activeDocId={activeDoc.id}
          onSelectDoc={handleSelectDoc}
          onPickQuery={handlePickQuery}
          queryDisabled={loading}
          activeQueryId={activeQueryId}
          mobileOpen={sidebarOpen}
          onCloseMobile={() => setSidebarOpen(false)}
          documents={ai.documents}
          docsStatLabel={`${ai.stats.documents}文書 · ${ai.stats.chunks}チャンク`}
          queries={ai.recommendedQueries}
        />

        <div className="relative flex min-w-0 flex-1 flex-col">
          <div className="border-b border-line bg-white px-4 py-3 sm:px-6">
            <div className="mx-auto max-w-3xl space-y-4 lg:max-w-4xl">
              <ExperienceModeBar
                mode={accessMode}
                onModeChange={handleModeChange}
                onNeedSetup={handleNeedSetup}
                trialPortalUrl={trialPortalHref}
              />

              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-bold tracking-wide text-navy">
                    {ai.stats.company}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted">
                    {ai.stats.product} · 根拠がある場合のみ回答
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAccessOpen(true)}
                    className="rounded-md border border-line px-3 py-1.5 text-xs font-semibold text-navy transition-colors hover:border-navy/40"
                  >
                    詳細設定
                  </button>
                  <Link
                    to={`/?pack=${packId}`}
                    className="rounded-md border border-line px-3 py-1.5 text-xs font-semibold text-navy transition-colors hover:border-navy/40"
                  >
                    文書に戻る
                  </Link>
                </div>
              </div>

              {setupHint ? (
                <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950">
                  {setupHint}
                </p>
              ) : null}

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCenterTab("answers")}
                  className={`rounded-lg px-4 py-2 text-sm font-bold transition-colors ${
                    centerTab === "answers"
                      ? "bg-navy text-white"
                      : "bg-surface/60 text-navy-muted hover:text-navy"
                  }`}
                >
                  回答
                  {thread.length > 0
                    ? ` (${thread.filter((t) => t.kind === "assistant").length})`
                    : ""}
                </button>
                <button
                  type="button"
                  onClick={() => setCenterTab("knowledge")}
                  className={`text-xs font-semibold underline-offset-2 transition-colors ${
                    centerTab === "knowledge"
                      ? "text-navy underline"
                      : "text-muted hover:text-navy hover:underline"
                  }`}
                >
                  登録ナレッジを確認
                </button>
              </div>
            </div>
          </div>

          <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
            {centerTab === "knowledge" ? (
              <KnowledgeBrowser
                document={activeDoc}
                chunks={ai.chunks}
                focusClauseId={focusClauseId}
                onAskAboutClause={askAboutClause}
              />
            ) : (
              <QueryThread
                items={thread}
                onOpenSources={openSources}
                onSuggest={(text) => {
                  if (loading) return;
                  void runQuery(text);
                }}
                staggerMs={160}
                countUpMs={600}
                wide
                emptyHint="おすすめの質問を選ぶか、下の欄から聞いてください。根拠がある内容だけ答えます。"
              />
            )}
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
          onBrowseDocument={browseDocument}
        />
      </div>
      <AccessModePanel
        open={accessOpen}
        onClose={() => {
          setAccessOpen(false);
          setAccessMode(getIsoAccessMode());
        }}
        trialPortalUrl={trialPortalHref}
      />
    </LiveShell>
  );
}
