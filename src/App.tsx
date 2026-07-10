import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { LiveDemoPage } from "./pages/LiveDemoPage";
import { LandingPage } from "./pages/LandingPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LiveDemoPage />} />
        <Route path="/lp" element={<LandingPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
