import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { gembaAskApiPlugin } from "./vite.gemba-api";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss(), gembaAskApiPlugin()],
  resolve: {
    alias: {
      "@ai-demo": path.resolve(rootDir, "src/vendor/ai-demo"),
    },
  },
});
