import { useCallback, useMemo, useState, type FormEvent } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import type { DemoAnswer } from "../data/demo-types";
import { aiEngine, sampleEngine } from "../engines";
import {
  getPack,
  isKnowledgePackId,
} from "../packs";
import { AccessModePanel } from "../components/access/AccessModePanel";
import { UserDocUploadStrip } from "../components/access/UserDocUploadStrip";
import { getContactUrl } from "../lib/contactLink";
import { getRoiSimulatorUrl } from "../lib/roiLink";
import {
  getIsoAccessMode,
  getUserDocumentText,
} from "../access/iso-settings";
import type { IsoAccessMode } from "../access/access-mode";

/** サンプルで「こう聞ける」型を見せるチップ（自由記述の代わりの促し） */
const SAMPLE_TEASER_CHIPS: Record<string, string[]> = {
  "minato-factory": [
    "合格品の中に塗装剥がれあったがどうする？",
    "自分でヤスリかけて直していい？",
    "品質に電話したいんだけど、どっちの番号？",
    "温度ちょっと上げたいんだけど、いいよね？",
    "手順書と検査標準で数字違う。どっち？",
  ],
  "work-procedure": [
    "この改定、現場に適用して大丈夫？",
    "教育は誰が受ける必要がある？",
    "旧版の手順書は残していい？",
  ],
  "tcu-480": [
    "この変更の影響範囲は？",
    "再試験は何が必要？",
    "FMEAは更新する？",
  ],
};

function AnswerBlock({ answer }: { answer: DemoAnswer }) {
  return (
    <div className="rounded-lg border border-line bg-white p-4 sm:p-5">
      <p className="text-[11px] font-medium tracking-wide text-success">
        根拠付き回答
      </p>
      <p className="mt-2 text-base font-semibold leading-relaxed text-navy">
        {answer.summary}
      </p>

      {(answer.before || answer.after) && (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {answer.before && (
            <div className="rounded-md border border-line bg-surface/50 px-3 py-2">
              <p className="text-[11px] text-muted">
                {answer.comparisonLabel ?? "比較"} · 一方
              </p>
              <p className="mt-1 text-sm text-muted line-through decoration-muted/40">
                {answer.before}
              </p>
            </div>
          )}
          {answer.after && (
            <div className="rounded-md border border-navy/25 bg-navy/5 px-3 py-2">
              <p className="text-[11px] text-navy-muted">優先側</p>
              <p className="mt-1 text-sm font-semibold text-navy">{answer.after}</p>
            </div>
          )}
        </div>
      )}

      {answer.sources.length > 0 && (
        <ul className="mt-4 space-y-2 border-t border-line pt-3">
          {answer.sources.map((s) => (
            <li
              key={`${s.documentId ?? s.documentName}-${s.clauseId}-${s.page}`}
              className="text-sm"
            >
              <p className="font-medium text-navy">
                {s.documentName}
                {s.clauseId ? ` · ${s.clauseId}` : ""}
                {s.version ? ` · ${s.version}` : ""}
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted">
                {s.excerpt}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function ExperiencePlayerPage() {
  const { packId: packIdParam } = useParams<{ packId: string }>();
  if (!isKnowledgePackId(packIdParam)) {
    return <Navigate to="/manufacturing" replace />;
  }

  const pack = getPack(packIdParam);
  const tour = pack.guidedTour;
  if (!tour) {
    return (
      <Navigate
        to={`/?pack=${encodeURIComponent(packIdParam)}&packs=1`}
        replace
      />
    );
  }

  return <ExperiencePlayerInner packId={packIdParam} />;
}

function ExperiencePlayerInner({ packId }: { packId: string }) {
  const pack = getPack(packId);
  const tour = pack.guidedTour!;
  const teaserChips = SAMPLE_TEASER_CHIPS[packId] ?? [];

  const [answeredIds, setAnsweredIds] = useState<Set<string>>(() => new Set());
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [lastQuestion, setLastQuestion] = useState<string | null>(null);
  const [answer, setAnswer] = useState<DemoAnswer | null>(null);
  const [refused, setRefused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldText, setFieldText] = useState("");
  const [nextOpen, setNextOpen] = useState(false);
  const [accessOpen, setAccessOpen] = useState(false);
  const [accessMode, setAccessMode] = useState<IsoAccessMode>(() =>
    getIsoAccessMode(),
  );
  const [userDocLen, setUserDocLen] = useState(
    () => getUserDocumentText().trim().length,
  );
  const [trialPortalHref] = useState(
    () => import.meta.env.VITE_TRIAL_PORTAL_URL?.trim() ?? "",
  );

  const doneCount = tour.steps.filter((s) =>
    answeredIds.has(s.questionId),
  ).length;
  const started = doneCount > 0;
  const complete = doneCount >= tour.steps.length && tour.steps.length > 0;
  const showField = started || complete;
  const liveEnabled =
    accessMode === "byok-direct" || accessMode === "managed-trial";
  /** 自由記述の本回答はライブ＋自社ナレッジ投入後のみ */
  const freeAskReady = liveEnabled && userDocLen > 0;

  const refreshAccessState = useCallback(() => {
    setAccessMode(getIsoAccessMode());
    setUserDocLen(getUserDocumentText().trim().length);
  }, []);

  const themeLine = useMemo(() => {
    if (packId === "minato-factory") {
      return "製造① 現場判断 — 文書に聞いて、その場で動く";
    }
    if (packId === "work-procedure") {
      return "製造② 手順改定・教育 — 差分から現場適用まで";
    }
    if (packId === "tcu-480") {
      return "製造③ 変更影響 — 版上げの波及を漏らさない";
    }
    return pack.sample.intro.title;
  }, [packId, pack.sample.intro.title]);

  const runSampleAsk = useCallback(
    async (text: string, questionId?: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;
      setLoading(true);
      setLastQuestion(trimmed);
      if (questionId) setActiveQuestionId(questionId);
      try {
        const result = await sampleEngine.ask({
          question: trimmed,
          mode: "sample",
          packId,
        });
        setAnswer(result.answer);
        setRefused(Boolean(result.meta.refused));
        const id = questionId ?? result.scenarioId ?? null;
        if (id) {
          setActiveQuestionId(id);
          setAnsweredIds((prev) => {
            if (prev.has(id)) return prev;
            const next = new Set(prev);
            next.add(id);
            return next;
          });
        }
      } catch {
        setAnswer({
          summary: "回答の取得に失敗しました。",
          sources: [],
        });
        setRefused(true);
      } finally {
        setLoading(false);
      }
    },
    [loading, packId],
  );

  const runLiveAsk = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;
      setLoading(true);
      setLastQuestion(trimmed);
      try {
        const result = await aiEngine.ask({
          question: trimmed,
          mode: "ai",
          packId,
        });
        setAnswer(result.answer);
        setRefused(Boolean(result.meta.refused));
      } catch {
        setAnswer({
          summary:
            "回答の取得に失敗しました。ネットワークまたは接続設定を確認してください。",
          sources: [],
        });
        setRefused(true);
      } finally {
        setLoading(false);
      }
    },
    [loading, packId],
  );

  const onAskStep = (questionId: string) => {
    const q = pack.sample.questions.find((item) => item.id === questionId);
    if (!q) return;
    void runSampleAsk(q.question, questionId);
  };

  const onFieldSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!freeAskReady) {
      setNextOpen(true);
      setAccessOpen(true);
      return;
    }
    void runLiveAsk(fieldText);
    setFieldText("");
  };

  const openLiveSetup = () => {
    setNextOpen(true);
    setAccessOpen(true);
  };

  const roiHref = getRoiSimulatorUrl();
  const contactHref = getContactUrl();
  const siblings =
    tour.siblingDemos?.filter((s) => !s.href.includes("/manufacturing")) ?? [];

  return (
    <div className="min-h-dvh bg-surface/40 text-ink">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-navy">ConformSystem</p>
            <p className="truncate text-[11px] text-muted">{themeLine}</p>
          </div>
          <Link
            to="/manufacturing"
            className="shrink-0 text-xs font-medium text-navy-muted hover:text-navy"
          >
            ハブへ戻る
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        {/* 1. ガイド */}
        <section>
          <p className="text-[11px] font-medium tracking-wide text-navy-muted">
            サンプル体験 · {tour.roleLabel}
          </p>
          <h1 className="mt-1 text-lg font-semibold tracking-tight text-navy sm:text-xl">
            {tour.headline}
          </h1>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">{tour.lead}</p>

          <ol className="mt-4 flex flex-col gap-1.5 sm:flex-row sm:flex-wrap">
            {tour.steps.map((step, index) => {
              const answered = answeredIds.has(step.questionId);
              const active = activeQuestionId === step.questionId;
              const climax = step.id === tour.climaxStepId;
              return (
                <li key={step.id} className="sm:min-w-[9rem] sm:flex-1">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => onAskStep(step.questionId)}
                    className={`flex w-full items-start gap-2 rounded-md border px-2.5 py-2 text-left transition-colors disabled:opacity-50 ${
                      active
                        ? "border-navy bg-navy text-white"
                        : answered
                          ? "border-success/40 bg-success/5 text-navy"
                          : climax
                            ? "border-danger/35 bg-danger/5 text-navy hover:border-danger/50"
                            : "border-line bg-white text-navy hover:border-navy/30"
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                        active
                          ? "bg-white/20 text-white"
                          : answered
                            ? "bg-success/20 text-success"
                            : "bg-surface text-navy-muted"
                      }`}
                    >
                      {answered ? "✓" : index + 1}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[11px] opacity-80">
                        {climax && packId === "minato-factory"
                          ? "ガイド本命"
                          : `ステップ ${index + 1}`}
                      </span>
                      <span className="block text-sm font-medium leading-snug">
                        {step.shortLabel}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
          <p className="mt-2 text-[11px] text-muted">
            進捗 {doneCount}/{tour.steps.length}
            {!started && " — 番号を押すとサンプル回答が出ます"}
          </p>
        </section>

        {/* 2. 回答 */}
        <section aria-live="polite">
          {loading && (
            <p className="rounded-lg border border-line bg-white px-4 py-6 text-sm text-muted">
              文書を照合しています…
            </p>
          )}
          {!loading && answer && (
            <>
              {lastQuestion && (
                <p className="mb-2 text-sm text-muted">
                  Q. {lastQuestion}
                  {refused && (
                    <span className="ml-2 text-xs text-danger">
                      （回答を控えました）
                    </span>
                  )}
                </p>
              )}
              <AnswerBlock answer={answer} />
            </>
          )}
          {!loading && !answer && (
            <p className="rounded-lg border border-dashed border-line bg-white/80 px-4 py-8 text-center text-sm text-muted">
              上の番号を押すと、ここに回答と根拠が表示されます。
            </p>
          )}
        </section>

        {/* 3. 現場の言葉 — サンプル促し / ライブ＋自社で自由記述 */}
        {showField && (
          <section className="rounded-lg border border-navy/20 bg-white p-4 sm:p-5">
            <p className="text-[11px] font-semibold tracking-wide text-navy">
              {freeAskReady
                ? "本命 · 現場の言葉で聞く"
                : "次へ · 自社ルールで自由に聞く"}
            </p>
            <h2 className="mt-1 text-base font-semibold text-navy">
              {freeAskReady
                ? "現場の言い方のまま聞ける。根拠がある範囲だけ答えます"
                : "自由記述は、ライブ接続＋自社ナレッジ投入のあとで使えます"}
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              {freeAskReady
                ? "いまの設定では、投入した自社資料を優先して答えます。"
                : "いまはサンプル文書の固定回答です。下の例で「こう聞ける」感を掴み、本番は自社の規程で試してください。"}
            </p>

            {!freeAskReady && teaserChips.length > 0 && (
              <>
                <p className="mt-3 text-[11px] font-medium text-navy-muted">
                  サンプルで型を見る（固定回答）
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {teaserChips.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      disabled={loading}
                      onClick={() => void runSampleAsk(chip)}
                      className="rounded-md border border-line bg-surface/60 px-2.5 py-1.5 text-left text-xs font-medium text-navy hover:border-navy/35 disabled:opacity-50"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </>
            )}

            {freeAskReady ? (
              <form onSubmit={onFieldSubmit} className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={fieldText}
                  onChange={(e) => setFieldText(e.target.value)}
                  placeholder="現場の言い方のまま入力…"
                  className="min-w-0 flex-1 rounded-md border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-muted/70 focus:border-navy/40 focus:outline-none"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !fieldText.trim()}
                  className="shrink-0 rounded-md bg-navy px-3 py-2 text-sm font-semibold text-white hover:bg-navy-soft disabled:opacity-50"
                >
                  聞く
                </button>
              </form>
            ) : (
              <div className="mt-4 rounded-md border border-dashed border-navy/25 bg-navy/5 px-3 py-3">
                <p className="text-sm font-semibold text-navy">
                  自由記述を使うには
                </p>
                <ol className="mt-1.5 list-decimal space-y-0.5 pl-4 text-xs leading-relaxed text-muted">
                  <li>ライブ接続（APIキーまたは体験コード）</li>
                  <li>自社ナレッジ（規程・SOPなど）を1ファイル投入</li>
                </ol>
                <button
                  type="button"
                  onClick={openLiveSetup}
                  className="mt-3 inline-flex rounded-md bg-navy px-3 py-2 text-xs font-semibold text-white hover:bg-navy-soft"
                >
                  ライブ接続と自社資料を設定する
                </button>
              </div>
            )}
          </section>
        )}

        {/* 4. 次の一歩 */}
        <section>
          <button
            type="button"
            onClick={() => setNextOpen((v) => !v)}
            className="flex w-full items-center justify-between rounded-md border border-line bg-white px-3 py-2.5 text-left text-sm font-semibold text-navy hover:border-navy/30"
          >
            <span>
              次の一歩
              {complete ? " · ガイド完了" : ""}
              （ライブ・自社文書・ROI）
            </span>
            <span className="text-xs font-medium text-muted">
              {nextOpen || complete ? "閉じる" : "開く"}
            </span>
          </button>

          {(nextOpen || complete) && (
            <div className="mt-2 space-y-3 rounded-md border border-navy/15 bg-white px-3 py-3">
              {tour.afterTourNote && (
                <p className="text-sm leading-relaxed text-ink">
                  {tour.afterTourNote}
                </p>
              )}

              <div>
                <p className="text-xs font-semibold text-navy">ライブ接続</p>
                <p className="mt-1 text-[11px] text-muted">
                  いま:{" "}
                  {accessMode === "sample"
                    ? "サンプル（固定回答）"
                    : accessMode}
                  {liveEnabled && userDocLen > 0
                    ? " · 自社ナレッジ投入済 → 自由記述OK"
                    : liveEnabled
                      ? " · 自社ナレッジ未投入"
                      : ""}
                </p>
                <button
                  type="button"
                  onClick={() => setAccessOpen(true)}
                  className="mt-2 inline-flex rounded-md border border-line bg-surface/60 px-3 py-2 text-xs font-semibold text-navy hover:border-navy/40"
                >
                  サンプル / APIキー / 体験コードを設定
                </button>
              </div>

              <div>
                <p className="text-xs font-semibold text-navy">
                  自社のルールで試す
                </p>
                <p className="mt-1 text-[11px] text-muted">
                  1ファイルを足すと、自由記述の本回答が使えるようになります。
                </p>
                <div className="mt-2">
                  <UserDocUploadStrip
                    enabled={liveEnabled}
                    showSetupLink={false}
                    onOpenLiveSetup={() => setAccessOpen(true)}
                    onUserDocChange={(n) => setUserDocLen(n)}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2 border-t border-line pt-3">
                {siblings.map((sib) => (
                  <Link
                    key={sib.href + sib.label}
                    to={sib.href}
                    className="inline-flex rounded-md border border-line bg-white px-3 py-2 text-xs font-semibold text-navy hover:border-navy/40"
                  >
                    {sib.label}
                  </Link>
                ))}
                <Link
                  to="/manufacturing"
                  className="inline-flex rounded-md border border-line bg-white px-3 py-2 text-xs font-semibold text-navy hover:border-navy/40"
                >
                  製造ハブへ
                </Link>
                {roiHref && (
                  <a
                    href={roiHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex rounded-md bg-navy px-3 py-2 text-xs font-semibold text-white hover:bg-navy-soft"
                  >
                    投資回収の目安
                  </a>
                )}
                {contactHref && (
                  <a
                    href={contactHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex rounded-md border border-navy/30 bg-white px-3 py-2 text-xs font-semibold text-navy hover:border-navy/50"
                  >
                    導入を相談する
                  </a>
                )}
                <Link
                  to={`/?pack=${encodeURIComponent(packId)}&packs=1`}
                  className="inline-flex rounded-md border border-dashed border-line px-3 py-2 text-xs text-muted hover:text-navy"
                >
                  開発用シェル
                </Link>
              </div>
            </div>
          )}
        </section>
      </main>

      <AccessModePanel
        open={accessOpen}
        onClose={() => {
          setAccessOpen(false);
          refreshAccessState();
        }}
        trialPortalUrl={trialPortalHref || undefined}
      />
    </div>
  );
}
