import { Navigate, useSearchParams } from "react-router-dom";
import { getPack } from "../packs";
import { LiveDemoPage } from "./LiveDemoPage";

/**
 * 公開: guidedTour 付きパックは /play へ。
 * 開発・営業: ?packs=1 で旧シェルを維持。
 */
export function PackPublicRedirect() {
  const [params] = useSearchParams();
  const packsDev = params.get("packs") === "1";
  const packId = params.get("pack");
  const pack = getPack(packId);

  if (!packsDev && pack.guidedTour && packId) {
    return (
      <Navigate to={`/play/${encodeURIComponent(pack.id)}`} replace />
    );
  }

  return <LiveDemoPage />;
}
