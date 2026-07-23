import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { aiEngine, sampleEngine } from "../engines";
import { getPack, isKnowledgePackId } from "../packs";
import { AccessModePanel } from "../components/access/AccessModePanel";
import { UploadPrivacyModal } from "../components/access/UploadPrivacyModal";
import { UserDocUploadStrip } from "../components/access/UserDocUploadStrip";
import { PlayAnswerCard } from "../components/play/PlayAnswerCard";
import { PlayHeaderLink, PlayShell } from "../components/play/PlayShell";
import { StatusChip } from "../components/play/StatusChip";
import { StepRail } from "../components/play/StepRail";
import { getContactUrl } from "../lib/contactLink";
import { getRoiSimulatorUrl } from "../lib/roiLink";
import {
  getIsoAccessMode,
  getUserDocumentText,
} from "../access/iso-settings";
import type { IsoAccessMode } from "../access/access-mode";
import type { DemoAnswer } from "../data/demo-types";

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

export function ExperiencePlayerPage() {
  const { packId: packIdParam } = useParams<{ packId: string }>();
  if (!isKnowledgePackId(packIdParam)) {
    return <Navigate to="/manufacturing" replace />;
  }

  const pack = getPack(packIdParam);
  if (!pack.guidedTour) {
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
  const answerRef = useRef<HTMLElement | null>(null);

  const [answeredIds, setAnsweredIds] = useState<Set<string>>(() => new Set());
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [lastQuestion, setLastQuestion] = useState<string | null>(null);
  const [answer, setAnswer] = useState<DemoAnswer | null>(null);
  const [refused, setRefused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldText, setFieldText] = useState("");
  const [nextOpen, setNextOpen] = useState(false);
  const [accessOpen, setAccessOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [justUnlocked, setJustUnlocked] = useState(false);
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
  const complete = doneCount >= tour.steps.length && tour.steps.length > 0;
  const liveEnabled =
    accessMode === "byok-direct" || accessMode === "managed-trial";
  const freeAskReady = liveEnabled && userDocLen > 0;
  const wasReady = useRef(freeAskReady);

  useEffect(() => {
    if (freeAskReady && !wasReady.current) {
      setJustUnlocked(true);
      const t = window.setTimeout(() => setJustUnlocked(false), 600);
      return () => window.clearTimeout(t);
    }
    wasReady.current = freeAskReady;
  }, [freeAskReady]);

  const refreshAccessState = useCallback(() => {
    setAccessMode(getIsoAccessMode());
    setUserDocLen(getUserDocumentText().trim().length);
  }, []);

  const themeLine = useMemo(() => {
    if (packId === "minato-factory") return "製造① 現場判断";
    if (packId === "work-procedure") return "製造② 手順改定・教育";
    if (packId === "tcu-480") return "製造③ 変更影響";
    return pack.sample.intro.title;
  }, [packId, pack.sample.intro.title]);

  const scrollToAnswer = useCallback(() => {
    window.requestAnimationFrame(() => {
      answerRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }, []);

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
        scrollToAnswer();
      } catch {
        setAnswer({ summary: "回答の取得に失敗しました。", sources: [] });
        setRefused(true);
      } finally {
        setLoading(false);
      }
    },
    [loading, packId, scrollToAnswer],
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
        scrollToAnswer();
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
    [loading, packId, scrollToAnswer],
  );

  const onAskStep = (questionId: string) => {
    const q = pack.sample.questions.find((item) => item.id === questionId);
    if (!q) return;
    void runSampleAsk(q.question, questionId);
  };

  const openSetup = () => {
    setNextOpen(true);
    setAccessOpen(true);
  };

  const onFieldSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!freeAskReady) {
      openSetup();
      return;
    }
    void runLiveAsk(fieldText);
    setFieldText("");
  };

  const onLockedFieldActivate = () => {
    if (!freeAskReady) openSetup();
  };

  const roiHref = getRoiSimulatorUrl();
  const contactHref = getContactUrl();
  const siblings =
    tour.siblingDemos?.filter((s) => !s.href.includes("/manufacturing")) ?? [];

  const stickyFooter = (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm">
      <form
        onSubmit={onFieldSubmit}
        className="mx-auto flex max-w-2xl gap-2 px-3 py-2.5 sm:px-6"
      >
        <input
          type="text"
          value={fieldText}
          onChange={(e) => setFieldText(e.target.value)}
          onFocus={onLockedFieldActivate}
          onClick={onLockedFieldActivate}
          readOnly={!freeAskReady}
          placeholder={
            freeAskReady
              ? "現場の言い方のまま…"
              : "自社の規程で聞くには接続が必要"
          }
          className={`min-h-11 min-w-0 flex-1 rounded-lg border px-3 text-sm text-ink placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-navy/20 ${
            justUnlocked ? "fade-in border-success/40" : "border-line"
          } ${!freeAskReady ? "cursor-pointer bg-surface/60" : "bg-white"}`}
          disabled={loading}
          aria-label={freeAskReady ? "自由記述" : "接続が必要です"}
        />
        <button
          type="submit"
          disabled={loading || (freeAskReady && !fieldText.trim())}
          className="min-h-11 shrink-0 rounded-lg bg-navy px-4 text-sm font-semibold text-white hover:bg-navy-soft disabled:opacity-50"
        >
          {freeAskReady ? "聞く" : "接続"}
        </button>
      </form>
    </div>
  );

  return (
    <PlayShell
      brandSub={themeLine}
      stickyFooter={stickyFooter}
      headerEnd={
        <>
          <StatusChip live={liveEnabled} hasUserDoc={userDocLen > 0} />
          <PlayHeaderLink to="/manufacturing">ハブ</PlayHeaderLink>
        </>
      }
    >
      <section>
        <h1 className="text-lg font-semibold tracking-tight text-navy sm:text-xl">
          {themeLine}
        </h1>
        <div className="mt-4">
          <StepRail
            steps={tour.steps}
            answeredIds={answeredIds}
            activeQuestionId={activeQuestionId}
            loading={loading}
            climaxStepId={tour.climaxStepId}
            onAskStep={onAskStep}
          />
        </div>
      </section>

      <section ref={answerRef} aria-live="polite">
        <PlayAnswerCard
          answer={answer}
          loading={loading}
          lastQuestion={lastQuestion}
          refused={refused}
        />
      </section>

      {teaserChips.length > 0 && (
        <section>
          <p className="text-[11px] font-medium text-navy-muted">
            よくある聞き方
          </p>
          <div className="-mx-1 mt-2 flex gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {teaserChips.map((chip) => (
              <button
                key={chip}
                type="button"
                disabled={loading}
                onClick={() => void runSampleAsk(chip)}
                className="shrink-0 rounded-lg border border-line bg-surface/50 px-3 py-2 text-left text-xs font-medium text-navy hover:border-navy/35 disabled:opacity-50"
              >
                {chip}
              </button>
            ))}
          </div>
        </section>
      )}

      <section>
        <button
          type="button"
          onClick={() => setNextOpen((v) => !v)}
          className="flex min-h-11 w-full items-center justify-between rounded-lg border border-line bg-surface/30 px-3 text-left text-sm font-semibold text-navy hover:border-navy/25"
        >
          <span>接続・資料・次へ{complete ? " · ガイド完了" : ""}</span>
          <span className="text-xs font-medium text-muted">
            {nextOpen ? "閉じる" : "開く"}
          </span>
        </button>

        {nextOpen && (
          <div className="mt-2 space-y-4 rounded-lg border border-line bg-white px-3 py-3">
            <ol className="space-y-3">
              <li className="flex items-start gap-3">
                <span
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                    liveEnabled
                      ? "bg-success/20 text-success"
                      : "bg-surface text-navy-muted"
                  }`}
                >
                  {liveEnabled ? "✓" : "1"}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-navy">Connect</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setAccessOpen(true)}
                      className="inline-flex min-h-10 rounded-md border border-line bg-surface/60 px-3 py-2 text-xs font-semibold text-navy hover:border-navy/40"
                    >
                      APIキー / 体験コード
                    </button>
                    <button
                      type="button"
                      onClick={() => setPrivacyOpen(true)}
                      className="inline-flex min-h-10 rounded-md px-2 py-2 text-xs font-medium text-muted underline-offset-2 hover:text-navy hover:underline"
                    >
                      投稿情報について
                    </button>
                  </div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                    userDocLen > 0
                      ? "bg-success/20 text-success"
                      : "bg-surface text-navy-muted"
                  }`}
                >
                  {userDocLen > 0 ? "✓" : "2"}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-navy">Upload</p>
                  <div className="mt-1.5">
                    <UserDocUploadStrip
                      enabled={liveEnabled}
                      showSetupLink={false}
                      onOpenLiveSetup={() => setAccessOpen(true)}
                      onUserDocChange={(n) => setUserDocLen(n)}
                    />
                  </div>
                </div>
              </li>
            </ol>

            <div className="flex flex-wrap items-center gap-2 border-t border-line pt-3">
              <div className="flex flex-wrap gap-2">
                {siblings.map((sib) => (
                  <Link
                    key={sib.href + sib.label}
                    to={sib.href}
                    className="inline-flex min-h-10 items-center rounded-md border border-line px-3 text-xs font-semibold text-navy hover:border-navy/40"
                  >
                    {sib.label}
                  </Link>
                ))}
              </div>
              <div className="ml-auto flex flex-wrap justify-end gap-2">
                {roiHref && (
                  <a
                    href={roiHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-10 items-center rounded-md bg-navy px-3 text-xs font-semibold text-white hover:bg-navy-soft"
                  >
                    投資回収の目安
                  </a>
                )}
                {contactHref && (
                  <a
                    href={contactHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-10 items-center rounded-md border border-navy/30 px-3 text-xs font-semibold text-navy"
                  >
                    相談
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </section>

      <AccessModePanel
        open={accessOpen}
        onClose={() => {
          setAccessOpen(false);
          refreshAccessState();
        }}
        trialPortalUrl={trialPortalHref || undefined}
      />
      <UploadPrivacyModal
        open={privacyOpen}
        onClose={() => setPrivacyOpen(false)}
      />
    </PlayShell>
  );
}
