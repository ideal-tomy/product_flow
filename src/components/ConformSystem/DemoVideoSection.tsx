import { useEffect, useRef, useState } from "react";

const frames = [
  {
    label: "0:03",
    title: "1,500ページの仕様書。",
    body: "必要な情報を探すだけで45分。",
  },
  {
    label: "0:10",
    title: "現場の問い",
    body: "v3.2とv3.4で、温度センサーの許容範囲は変わりましたか？",
  },
  {
    label: "0:20",
    title: "確定回答",
    body: "v3.2: ±5℃ → v3.4: ±3℃\n影響範囲: 制御ロジック3箇所",
  },
  {
    label: "0:26",
    title: "出典",
    body: "制御仕様書 v3.4\np.214〜218\n根拠条項 4.1.3 / 4.1.4 / 4.2.1 / 5.3.2",
  },
];

export function DemoVideoSection() {
  const [frameIndex, setFrameIndex] = useState(0);
  const [preferPoster, setPreferPoster] = useState(false);
  const [hasVideo, setHasVideo] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const narrow = window.matchMedia("(max-width: 640px)").matches;
    const saveData =
      "connection" in navigator &&
      Boolean(
        (navigator as Navigator & { connection?: { saveData?: boolean } })
          .connection?.saveData,
      );
    setPreferPoster(narrow || saveData);
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.35 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (preferPoster || hasVideo || !inView) return;
    const id = window.setInterval(() => {
      setFrameIndex((i) => (i + 1) % frames.length);
    }, 2800);
    return () => window.clearInterval(id);
  }, [preferPoster, hasVideo, inView]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || preferPoster || !hasVideo) return;
    if (inView) {
      void video.play().catch(() => undefined);
    } else {
      video.pause();
    }
  }, [inView, preferPoster, hasVideo]);

  const frame = frames[frameIndex];
  const showMock = preferPoster || !hasVideo;

  return (
    <section ref={sectionRef} className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
      <div className="max-w-2xl">
        <h2 className="text-2xl font-bold text-navy sm:text-[1.75rem]">
          質問するだけで、必要な事実に辿り着く。
        </h2>
        <p className="mt-3 text-muted">
          30秒で、現場の問いから根拠付き回答までの流れを確認できます。
        </p>
      </div>

      <div className="mt-8 overflow-hidden rounded-lg border border-line bg-navy shadow-[0_24px_60px_-36px_rgba(11,31,58,0.55)]">
        <video
          ref={videoRef}
          className={`aspect-video w-full object-cover ${showMock ? "hidden" : "block"}`}
          muted
          loop
          playsInline
          preload={preferPoster ? "none" : "metadata"}
          poster="/video/poster.svg"
          aria-label="ConformSystem デモ動画"
          onLoadedData={() => setHasVideo(true)}
          onError={() => setHasVideo(false)}
        >
          <source src="/video/demo.webm" type="video/webm" />
          <source src="/video/demo.mp4" type="video/mp4" />
        </video>

        {showMock && (
          <div className="flex min-h-[280px] flex-col bg-[linear-gradient(160deg,#0b1f3a_0%,#16325a_55%,#1e3f66_100%)] p-5 sm:aspect-video sm:min-h-0 sm:p-10">
            <div className="flex min-h-0 flex-1 flex-col justify-between gap-6">
              <div className="flex items-center justify-between text-xs text-white/55">
                <span>ConformSystem · 30秒デモ</span>
                <span className="font-mono">{frame.label}</span>
              </div>
              <div key={frameIndex} className="fade-in min-w-0 max-w-xl">
                <p className="text-sm font-medium text-white/70">{frame.title}</p>
                <p className="mt-3 whitespace-pre-line break-words text-base font-semibold leading-snug text-white sm:text-xl lg:text-2xl">
                  {frame.body}
                </p>
              </div>
              <div>
                <div className="flex gap-1.5">
                  {frames.map((_, i) => (
                    <span
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        i === frameIndex ? "bg-white" : "bg-white/25"
                      }`}
                    />
                  ))}
                </div>
                <p className="mt-4 text-sm text-white/60">
                  探す時間を、判断する時間へ。
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
