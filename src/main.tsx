import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { brandConfig } from "./config/brand.config";
import "./index.css";

document.title = brandConfig.documentTitle;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
