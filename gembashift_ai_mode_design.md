# AI Mode 設計メモ

## 入口

| URL | モード | Engine |
|---|---|---|
| `/` | Sample（固定シナリオ） | `sampleEngine` |
| `/ai` | AI Mode（ナレッジ検索） | `aiEngine` → `/api/ask` or ローカル RAG |
| `/?presentation=1` | Sample + 演出 | `sampleEngine` |

## ナレッジ（パック別）

| pack | JSON | 想定現場 |
|---|---|---|
| `work-procedure` | [`src/ai/data/work_procedure_chunks.json`](src/ai/data/work_procedure_chunks.json) | 東浜モビリティ 組立ラインA / SOP-組立-07 |
| `inspection` | [`src/ai/data/inspection_chunks.json`](src/ai/data/inspection_chunks.json) | 東浜モビリティ 出荷検査場 / INS-出荷-03 |
| `tcu-480` | [`src/ai/data/knowledge_chunks.json`](src/ai/data/knowledge_chunks.json) | 東浜モビリティ TCU-480 制御仕様 v3.2→v3.4 |

- アダプタ: [`src/ai/knowledge.ts`](src/ai/knowledge.ts) / [`src/packs/chunkUtils.ts`](src/packs/chunkUtils.ts)
- パック定義: [`src/packs/*/pack.ts`](src/packs/)

## ナレッジ閲覧（デモ体験）

AI Mode (`/ai`) では次の流れを想定する。

1. **登録ナレッジ**タブでサイドバー文書を選び、条項一覧・全文を読む（[`KnowledgeBrowser`](src/components/live/KnowledgeBrowser.tsx)）
2. 質問する → **回答**タブへ自動切替
3. 根拠チップ → SourceDrawer で **原文チャンク全文**（`fullText`）
4. 「この文書の他条項を見る」でナレッジ閲覧へ戻る

Sample (`/`) も SourceDrawer は `enrichSourcesFromChunks` で全文補完する。

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

## 確認手順（デモ前）

1. `/ai?pack=work-procedure` … 文書閲覧 → 推奨質問 → 根拠全文
2. `/ai?pack=inspection` … 同上
3. `/ai?pack=tcu-480` … 13文書横断の根拠
4. `/?pack=work-procedure` など Sample … 根拠ドロワーが壊れないこと
