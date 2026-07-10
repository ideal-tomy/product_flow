import { DemoHero } from "../components/gembashift/DemoHero";
import { ProblemSection } from "../components/gembashift/ProblemSection";
import { DemoVideoSection } from "../components/gembashift/DemoVideoSection";
import { InteractiveDemo } from "../components/gembashift/InteractiveDemo";
import { BeforeAfterSection } from "../components/gembashift/BeforeAfterSection";
import { ImpactSection } from "../components/gembashift/ImpactSection";
import { UseCasesSection } from "../components/gembashift/UseCasesSection";
import { DemoCTA } from "../components/gembashift/DemoCTA";

export function LandingPage() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-line/70 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
          <a href="#top" className="text-[15px] font-semibold tracking-wide text-navy">
            GembaShift
          </a>
          <a
            href="#demo"
            className="text-sm text-navy-muted transition-colors hover:text-navy"
          >
            デモを試す
          </a>
        </div>
      </header>

      <main id="top">
        <DemoHero />
        <ProblemSection />
        <DemoVideoSection />
        <InteractiveDemo />
        <BeforeAfterSection />
        <ImpactSection />
        <UseCasesSection />
        <DemoCTA />
      </main>

      <footer className="border-t border-line py-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>GembaShift — 探す時間を、判断する時間へ。</p>
          <p>サンプル文書によるデモです。実案件の文書は含まれません。</p>
        </div>
      </footer>
    </div>
  );
}
