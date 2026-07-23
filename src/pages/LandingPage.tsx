import { DemoHero } from "../components/ConformSystem/DemoHero";
import { ProblemSection } from "../components/ConformSystem/ProblemSection";
import { DemoVideoSection } from "../components/ConformSystem/DemoVideoSection";
import { InteractiveDemo } from "../components/ConformSystem/InteractiveDemo";
import { BeforeAfterSection } from "../components/ConformSystem/BeforeAfterSection";
import { ImpactSection } from "../components/ConformSystem/ImpactSection";
import { UseCasesSection } from "../components/ConformSystem/UseCasesSection";
import { DemoCTA } from "../components/ConformSystem/DemoCTA";
import { brandConfig, isIdealBrand } from "../config/brand.config";
import { Navigate } from "react-router-dom";

export function LandingPage() {
  // ideal デプロイでは AXEON 向け LP を出さない
  if (isIdealBrand()) {
    return <Navigate to="/manufacturing" replace />;
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-line/70 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
          <a href="#top" className="text-[15px] font-semibold tracking-wide text-navy">
            {brandConfig.headerBrand}
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
          <p>
            {brandConfig.headerBrand} — 探す時間を、判断する時間へ。
          </p>
          <p>サンプル文書によるデモです。実案件の文書は含まれません。</p>
        </div>
      </footer>
    </div>
  );
}
