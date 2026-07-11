# ConformSystem Demo Template

業界ナレッジを差し替えて Live Demo / AI Mode / Presentation をすぐ立ち上げるためのテンプレートです。

## クイックスタート

```bash
npm install
cp .env.example .env.local   # 任意: OPENAI_API_KEY
npm run dev
```

- `/` — Sample（固定シナリオ）
- `/ai` — AI Mode（チャンク検索）
- `/?presentation=1&autoplay=1` — 録画用自動再生

## 業界パックを作る

```bash
npm run new-pack -- my-industry "組立ラインB"
```

詳細は [docs/PACK_RECIPE.md](./docs/PACK_RECIPE.md) と [docs/TEMPLATE.md](./docs/TEMPLATE.md)。

初期パックは `starter`（プレースホルダ）のみです。
