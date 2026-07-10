import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { gembaAskApiPlugin } from "./vite.gemba-api";

export default defineConfig({
  plugins: [react(), tailwindcss(), gembaAskApiPlugin()],
});
