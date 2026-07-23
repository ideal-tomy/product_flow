# ConformSystem Demo

- **`/`** — Live Demo（触る用）
- **`/ai`** — AI Mode（ナレッジ検索）
- **`/?presentation=1`** — Presentation Mode（見せる用・動画向け）
- **`/?presentation=1&autoplay=1`** — 約30秒の自動再生（録画用）
- **`/lp`** — LP（価値説明・資料用）

パック切替: `/?pack=starter` / `work-procedure` / `inspection` / `tcu-480` / `standardization` / `minato-factory`

公開向け製造ハブ: `/manufacturing`  
個別: `/?pack=minato-factory`（①） / `work-procedure`（②） / `tcu-480`（③）  
AI（ガイド＋ツアー後にライブ）: `/ai?pack=minato-factory` など  
パックバーを出すとき: `&packs=1`  
相談CTA: `VITE_CONTACT_URL`（未設定なら非表示）



## 開発

```bash
npm install
npm run dev
```

## 業界デモの転用（テンプレート）

ナレッジと回答ルールだけ差し替えて別業界デモを作る場合:

```bash
# 新パックを starter から生成
npm run new-pack -- my-industry "表示名"

# 空テンプレート状態にする（専用ブランチで実行）
git checkout -b template
npm run prepare:template
```

- パック追加手順: [docs/PACK_RECIPE.md](./docs/PACK_RECIPE.md)
- GitHub Template 化: [docs/TEMPLATE.md](./docs/TEMPLATE.md)

## ビルド

```bash
npm run build
npm run preview
```

静的ホストでは SPA フォールバック（`/lp` など）を有効にしてください。
