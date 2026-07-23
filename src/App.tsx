import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AiDemoPage } from "./pages/AiDemoPage";
import { LandingPage } from "./pages/LandingPage";
import { ManufacturingHubPage } from "./pages/ManufacturingHubPage";
import { ExperiencePlayerPage } from "./pages/ExperiencePlayerPage";
import { PackPublicRedirect } from "./pages/PackPublicRedirect";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PackPublicRedirect />} />
        <Route path="/play/:packId" element={<ExperiencePlayerPage />} />
        <Route path="/ai" element={<AiDemoPage />} />
        <Route path="/lp" element={<LandingPage />} />
        <Route path="/manufacturing" element={<ManufacturingHubPage />} />
        <Route path="*" element={<Navigate to="/manufacturing" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
