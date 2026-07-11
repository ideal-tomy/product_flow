# Starter pack（差し替え用）

このフォルダは **業界デモの雛形** です。中身はすべてプレースホルダです。

## すぐ始める

```bash
# 新しい業界パックを作成（starter をコピーして登録）
npm run new-pack -- my-industry "組立ラインB"

# 空テンプレート状態にする（業界パックを削除し starter のみ残す）
npm run prepare:template
```

## 編集するファイル

| ファイル | 内容 |
|---|---|
| `pack.ts` | Sample 質問・回答、メタ情報、Presentation |
| `../ai/data/<id>_chunks.json` | AI Mode 用ナレッジチャンク |
| `../index.ts` | パック登録（`new-pack` が自動更新） |

詳細は [docs/PACK_RECIPE.md](../../../docs/PACK_RECIPE.md) を参照。
