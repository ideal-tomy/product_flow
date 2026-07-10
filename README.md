# GembaShift Demo

- **`/`** — Live Demo（触る用）
- **`/?presentation=1`** — Presentation Mode（見せる用・動画向け）
- **`/?presentation=1&autoplay=1`** — 約30秒の自動再生（録画用）
- **`/lp`** — LP（価値説明・資料用）

## 開発

```bash
npm install
npm run dev
```

## ビルド

```bash
npm run build
npm run preview
```

静的ホストでは SPA フォールバック（`/lp` など）を有効にしてください。

## 要件・プラン

- [gembashift_live_demo_requirements.md](./gembashift_live_demo_requirements.md) — Live Demo
- [gembashift_presentation_mode_plan.md](./gembashift_presentation_mode_plan.md) — Presentation Mode
- [gembashift_demo_web_requirements.md](./gembashift_demo_web_requirements.md) — LP
