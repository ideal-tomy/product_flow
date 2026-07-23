import { Navigate, useSearchParams } from "react-router-dom";
import { getPack } from "../packs";
import { LiveDemoPage } from "./LiveDemoPage";

/**
 * `/` の入口。
 * - 公開: /manufacturing へ
 * - ?pack=（ガイド付き）: /play/:packId へ
 * - ?packs=1: 旧シェル（開発用）
 */
export function PackPublicRedirect() {
  const [params] = useSearchParams();
  const packsDev = params.get("packs") === "1";
  const packId = params.get("pack");

  if (packsDev) {
    return <LiveDemoPage />;
  }

  if (packId) {
    const pack = getPack(packId);
    if (pack.guidedTour) {
      return (
        <Navigate to={`/play/${encodeURIComponent(pack.id)}`} replace />
      );
    }
  }

  return <Navigate to="/manufacturing" replace />;
}
