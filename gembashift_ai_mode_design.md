# AI Mode 設計メモ

## 入口

| URL | モード | Engine |
|---|---|---|
| `/` | Sample（固定シナリオ） | `sampleEngine` |
| `/ai` | AI Mode（ナレッジ検索） | `aiEngine` → `/api/ask` or ローカル RAG |
| `/?presentation=1` | Sample + 演出 | `sampleEngine` |

## ナレッジ

- 正: [`src/ai/data/knowledge_chunks.json`](src/ai/data/knowledge_chunks.json)（東浜モビリティ / TCU-480・66チャンク）
- アダプタ: [`src/ai/knowledge.ts`](src/ai/knowledge.ts)
- 文書一覧: [`src/ai/documents.ts`](src/ai/documents.ts)

## パイプライン

1. intent 判定（拒否含む）
2. retrieve（同義語・カテゴリブースト）
3. `OPENAI_API_KEY` あり（サーバ）→ LLM 構造化 JSON
4. なければ意図別シンセサイザ（Sample 固定回答は使わない）

## API

| 環境 | `/api/ask` |
|---|---|
| ローカル `npm run dev` | Vite プラグイン [`vite.gemba-api.ts`](vite.gemba-api.ts) |
| Vercel 本番 | Serverless [`api/ask.ts`](api/ask.ts) |

## 環境変数

`.env.example` 参照。

- ローカル: `.env.local`
- Vercel: Project Settings → Environment Variables  
  - `OPENAI_API_KEY`
  - `OPENAI_MODEL`（推奨: `gpt-5-nano`）

Production / Preview の両方に設定し、再デプロイすること。
