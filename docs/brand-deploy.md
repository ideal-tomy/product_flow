# ブランド分け（AXEON / ideal）— 超ざっくり手順

やることの本質はこれだけです。

> **同じ GitHub のコードを、Vercel に「サイトを2つ」作る。**  
> 見た目の会社名だけ、各サイトの「環境変数」で変える。

コードは1つ。コピーはしない。相手のURLは入れない。

---

## たとえ話

同じレシピ（GitHub）で、

- A店の看板 = AXEON（ConformSystem）
- B店の看板 = ideal

キッチンは同じ、看板だけ違う、というイメージです。

---

## 事前に分かっていること

いまある例:

- 既存デモ: `https://product-flow-jet.vercel.app`（これがだいたい AXEON 用の1店目）

作りたいもの:

- **店A（AXEON）** … 既存をそのまま使うか、名前を分かりやすくする
- **店B（ideal）** … **新しくもう1つ** Vercel プロジェクトを作る

---

## 手順1: コード側（もう入ってる）

`VITE_BRAND` というスイッチがあります。

| 値 | ヘッダー主表記 | 補助 |
|----|----------------|------|
| `axeon`（書かないときもこれ） | **AXEON** | ConformSystem |
| `ideal` | **ideal** | 製造判断デモ |

ローカルで試すなら `product_flow/.env.local` に例えば:

```env
VITE_BRAND=ideal
```

を書いて、`npm run dev` を**一度止めて再起動**（Vite は起動時に読む）。

---

## 手順2: Vercel で「2つ目の店」を作る

### 2-1. Vercel にログイン

[https://vercel.com](https://vercel.com) → 自分のアカウント / チーム

### 2-2. いまのプロジェクトを確認

Dashboard に `product-flow-jet`（名前は環境による）があるはず。  
これが **店A（AXEON）** として使えます。

### 2-3. 店Bを新規作成

1. **Add New… → Project**
2. **同じ GitHub リポジトリ**を選ぶ（初めてのときと同じ repo）
3. 設定で大事なのは次だけ:
   - **Root Directory** … いまの店Aと同じ（例: `product_flow`）。モノレポ全体なら「Edit」で `product_flow` を指定
   - Framework / Build … 店Aと同じでOK
4. **Deploy** する（いったんデプロイしてから変数を足しても可）

→ 新しい URL が付く（例: `https://product-flow-xxxx.vercel.app`）  
これが **ideal 用の店B** です。

※ 「同じ repo を2回 Import していいの？」→ **それで合っています。**

---

## 手順3: 各店に「看板の設定」を入れる

各プロジェクトで:

**Settings → Environment Variables**

### 店A（AXEON）

| Name | Value | Environment |
|------|-------|-------------|
| `VITE_BRAND` | `axeon` | Production（と Preview も推奨） |
| `VITE_CONTACT_URL` | AXEON の相談ページだけ | 同上 |
| （他） | ROI・Trial など **AXEON 用だけ** | 同上 |

### 店B（ideal）

| Name | Value | Environment |
|------|-------|-------------|
| `VITE_BRAND` | `ideal` | Production（と Preview） |
| `VITE_PRODUCT_INFO_URL` | ideal の公式サイトなど（任意） | 同上 |
| `VITE_CONTACT_URL` | ideal の相談ページだけ | 同上 |

**入れないもの**

- 店Aの env に ideal のデモ URL
- 店Bの env に AXEON のデモ URL / ConformSystem 専用リンク

「行き来できない」は、**お互いのリンクをどこにも書かない**ことで実現します。

---

## 手順4: 変数を入れたあと必ず Redeploy

`VITE_` で始まる値は **ビルド時に焼き付く**ので、

1. 変数を保存
2. **Deployments** → 最新の … → **Redeploy**

をしないと画面に反映されません。

---

## 手順5: サイトからのリンクを分ける

- **AXEON のサイト / 営業資料** → 店Aの URL（例: `product-flow-jet.vercel.app/manufacturing`）
- **ideal 公式サイト**（`portfolio.ts` など）→ 店Bの URL（`…/manufacturing`）

ここを間違えると、ideal から AXEON 表記のデモに飛んでしまいます。

---

## よくある疑問

**Q. GitHub にブランチを2つ要る？**  
A. 不要。同じ `main` でOK。push 1回で両店とも再デプロイされます。

**Q. URL を知られたら相手の店に行ける？**  
A. 行けます。秘密の壁ではなく「載せない・案内しない」運用です。

**Q. ロゴ画像は？**  
A. いまは文字（ConformSystem / ideal）。画像はあとから `public` に足して `brand.config` で差し替え可能です。

**Q. 旧シェルは？**  
A. `/` は製造ハブへ飛びます。どうしても旧UIが必要なら `/?packs=1` だけ残っています。

---

## チェックリスト

- [ ] 店B（ideal）を Vercel に追加した
- [ ] Root Directory が店Aと同じ
- [ ] 店A: `VITE_BRAND=axeon`
- [ ] 店B: `VITE_BRAND=ideal`
- [ ] 相談URLなどをブランド別に分けた
- [ ] 両方 Redeploy した
- [ ] 店Aで **AXEON**、店Bで **ideal** とヘッダーに出る
- [ ] ideal サイトの CTA が店Bを指している
