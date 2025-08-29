# 📚 質問ベースの書籍レコメンドシステム

3つの質問に答えるだけで、あなたの嗜好に合った最適な書籍をレコメンドするWebアプリケーションです。

## ✨ 特徴

- **簡単3質問**: わずか3つの質問に答えるだけで最適な本を見つけられます
- **精密レコメンド**: 目的・ジャンル・難易度を総合的に判断してスコア化
- **iOS風デザイン**: モダンでエレガントなユーザーインターフェース
- **管理機能**: 管理者が簡単に書籍を追加・編集・削除できます
- **レスポンシブ**: モバイル・タブレット・デスクトップに完全対応

## 🚀 技術スタック

- **フロントエンド**: Next.js 14 + React + TypeScript
- **スタイリング**: Tailwind CSS（iOS風カスタムデザインシステム）
- **バックエンド**: Supabase (PostgreSQL)
- **デプロイ**: Vercel
- **認証**: Supabase Auth

## 📋 機能一覧

### ユーザー向け機能
- 🏠 **ホームページ**: システムの概要と利用開始
- 🏆 **今週のランキング**: 主要書店・オンライン書店のランキング1位書籍を横スクロール表示
- ❓ **質問回答**: 3つの質問（目的・ジャンル・難易度）
- 📊 **レコメンド結果**: スコア付きで最大10冊の書籍を表示
- 🔗 **外部リンク**: Amazon購入リンク・要約リンク

### 管理者向け機能
- 📚 **書籍管理**: 書籍の追加・編集・削除
- 🏆 **ランキング管理**: 週次ランキング書籍の登録・重複チェック
- 🏷️ **タグ管理**: ジャンルタグの設定
- 📈 **難易度設定**: 初級・中級・上級の3段階

## 🛠️ セットアップ

### 1. リポジトリのクローン
\`\`\`bash
git clone <repository-url>
cd ichidan-dokusho-rec
\`\`\`

### 2. 依存関係のインストール
\`\`\`bash
npm install
\`\`\`

### 3. Supabaseプロジェクトの設定

1. [Supabase](https://supabase.com/)でプロジェクトを作成
2. SQLエディタで以下のファイルを順番に実行
   - `supabase/schema.sql` （基本スキーマ）
   - `supabase/migration_add_ranking_books.sql` （ランキング機能）
3. 環境変数を設定

### 4. 環境変数の設定
\`.env.local\` ファイルを作成し、以下を設定：

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
\`\`\`

### 5. 開発サーバーの起動
\`\`\`bash
npm run dev
\`\`\`

アプリケーションが [http://localhost:3000](http://localhost:3000) で起動します。

## 📚 ドキュメント

- **[レコメンドロジック設計書](docs/recommendation-logic.md)**: 質問回答のマッピングロジック詳細
- **[システムアーキテクチャ](docs/architecture.md)**: 技術構成・データ設計・システム仕様

## 📁 プロジェクト構造

```
src/
├── app/                    # Next.js App Router
│   ├── admin/             # 管理者ページ
│   ├── questions/         # 質問回答ページ
│   ├── results/          # 結果表示ページ
│   └── page.tsx          # ホームページ
├── components/
│   └── ui/               # UIコンポーネント
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Input.tsx
│       └── ProgressIndicator.tsx
├── data/
│   └── questions.ts      # 質問データ定義
├── lib/
│   ├── supabase.ts      # Supabase設定
│   ├── recommendation.ts # レコメンドロジック
│   └── utils.ts         # ユーティリティ関数
└── types/
    └── index.ts         # TypeScript型定義
```

## 🎨 デザインシステム

iOS風のモダンなデザインシステムを採用：

### カラーパレット
- **プライマリ**: iOS Blue (#007AFF)
- **セカンダリ**: iOS Green (#34C759)
- **アクセント**: iOS Purple (#AF52DE)
- **グレースケール**: iOS Gray 50〜800

### コンポーネント
- **ボタン**: iOS風の丸角、アクティブ時のスケール変化
- **カード**: ガラスモーフィズム効果、ホバーアニメーション
- **アニメーション**: フェードイン、スライドアップ、スケールイン

## 🔍 レコメンドロジック

### スコア計算方式
1. **目的マッチング** (40%): 読書目的と書籍の特性
2. **ジャンルマッチング** (40%): 選択ジャンルと書籍タグ
3. **難易度マッチング** (20%): 希望難易度と書籍レベル

### 質問項目
1. **読書の目的**: 知識習得・スキルアップ・自己成長・リラックス
2. **興味のあるジャンル**: 8カテゴリから複数選択可能
3. **読みやすさの希望**: 初級・中級・上級

## 🚀 デプロイ

### Vercelでのデプロイ
1. GitHubリポジトリと連携
2. 環境変数を設定
3. 自動デプロイが実行されます

### 必要な環境変数
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## 📊 データベース設計

### books テーブル
\`\`\`sql
- id: UUID (Primary Key)
- title: VARCHAR(255) # 書籍タイトル
- author: VARCHAR(255) # 著者名
- genre_tags: TEXT[] # ジャンルタグ配列
- amazon_link: TEXT # Amazon購入リンク
- summary_link: TEXT # 要約リンク（任意）
- cover_image_url: TEXT # 表紙画像URL（任意）
- description: TEXT # 書籍説明（任意）
- difficulty_level: VARCHAR(20) # beginner/intermediate/advanced
- reading_time_hours: INTEGER # 読書時間（時間）
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
\`\`\`

## 🎯 使用方法

### ユーザー向け
1. ホームページで「質問に答えて本を探す」をクリック
2. 3つの質問に順次回答
3. レコメンド結果から気になる本を選択
4. Amazon等で購入・要約を確認

### 管理者向け
1. `/admin` ページにアクセス
2. 「新しい書籍を追加」で書籍情報を入力
3. ジャンルタグ・難易度・説明を設定
4. 保存して即座にレコメンド対象に反映

## 🔧 カスタマイズ

### 質問内容の変更
`src/data/questions.ts` を編集して質問項目をカスタマイズできます。

### レコメンドロジックの調整
`src/lib/recommendation.ts` の重み付けやスコア計算方法を調整できます。

### デザインの変更
`tailwind.config.ts` でカラーパレットやスタイルを変更できます。

## 📝 ライセンス

MIT License

## 🤝 コントリビューション

プルリクエストやイシューの報告を歓迎します。

---

**読書の新しい体験を、始めましょう。** 📚✨
