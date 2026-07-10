# AI Mode 設計メモ

## 入口

| URL | モード | Engine |
|---|---|---|
| `/` | Sample（固定シナリオ） | `sampleEngine` |
| `/ai` | AI Mode（ナレッジ検索） | `aiEngine` → `/api/ask` or ローカル RAG |
| `/?presentation=1` | Sample + 演出 | `sampleEngine` |

## 主要ファイル

- `src/engines/` — QueryEngine 抽象（sample / ai）
- `src/ai/knowledge.ts` — 架空ナレッジチャンク
- `src/ai/retrieve.ts` — キーワード検索
- `src/ai/synthesize.ts` — 構造化回答 / 拒否
- `src/ai/ask.ts` — 共通エントリ
- `vite.gemba-api.ts` — `POST /api/ask`（dev/preview）
- `src/pages/AiDemoPage.tsx` — AI Mode UI

## LLM 接続（次ステップ）

`vite.gemba-api.ts` の `handleAsk` 内で `OPENAI_API_KEY` があれば、
retrieve 結果をコンテキストに JSON schema で LLM 呼び出しし、
なければ現状の `askGemba`（RAG 合成）にフォールバックする。
