# ConformSystem デモテンプレート運用

## 目的

ナレッジと回答ルールだけ入れ替えて、業界別の体験デモをすぐ立ち上げる。

## リポジトリの分け方（推奨）

| リポジトリ / ブランチ | 役割 |
|---|---|
| `main`（本リポ） | 完成ショーケース（組立・検査・TCU・標準化など） |
| `template` ブランチ → GitHub Template | starter のみの空殻 |

同じコードベースから Template を切り出す:

```bash
# 既に template ブランチがある場合（本リポ）
git push -u origin template

# まだ無い場合
git checkout main
git pull
git checkout -b template
npm run prepare:template          # 業界パック・ダミーデータを削除
npm run build                     # 通ることを確認
git add -A
git commit -m "chore: strip industry content for blank template"
git push -u origin template
```

GitHub → Settings → General → **Template repository** にチェック。
（空殻だけを別リポにしたい場合は `template` ブランチを新リポの main にするか、Template 用リポを別途作成。）

別リポにしたい場合:

```bash
# template ブランチを新リポの main にする例
gh repo create ideal-tomy/ConformSystem-demo-template --public --source=. --push
# または template ブランチだけを別リモートへ
```

## 新規業界デモの流れ

1. GitHub で **Use this template** → 新リポ作成
2. `npm install && npm run new-pack -- <id> "<ラベル>"`
3. chunks JSON と `pack.ts` を業界内容に書き換え
4. （任意）`.env.local` に `OPENAI_API_KEY`
5. Vercel 等へデプロイ

## 残すもの / 消えるもの

`prepare:template` 実行後:

**残る（プラットフォーム）**
- UI（Live / AI / Presentation / LP シェル）
- engines / ai パイプライン（generic 合成）
- `src/packs/starter/`
- `docs/PACK_RECIPE.md` / `docs/TEMPLATE.md`

**消える（ドメイン）**
- `work-procedure` / `inspection` / `tcu` / `standardization` パック
- 各 `*_chunks.json`（starter 以外）
- `docs/files/` 教材、TCU 巨大デモデータ、要件メモ類

## 注意

- `prepare:template` は **破壊的** です。必ず専用ブランチで実行してください。
- 事前確認: `npm run prepare:template -- --dry-run`
