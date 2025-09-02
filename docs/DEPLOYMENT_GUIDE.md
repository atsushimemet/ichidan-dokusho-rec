# 読書メモ&クイズシステム デプロイメントガイド

このドキュメントでは、読書メモから自動でクイズを生成し、LINE通知で復習を促すシステムのデプロイ方法について説明します。

## システム概要

- **フロントエンド**: Next.js 14 (App Router)
- **データベース**: Supabase (PostgreSQL)
- **通知**: LINE Messaging API
- **ホスティング**: Vercel推奨
- **スケジューラ**: Vercel Cron Jobs

## 必要なサービス

1. **Supabase** - データベース
2. **LINE Developers** - BOT API
3. **Vercel** - ホスティング（推奨）
4. **GitHub** - コード管理

## セットアップ手順

### 1. Supabaseの設定

1. [Supabase](https://supabase.com/)でプロジェクトを作成
2. SQLエディタで以下のファイルを実行：
   ```sql
   -- 基本スキーマ
   supabase/schema.sql
   
   -- クイズ機能スキーマ
   supabase/quiz_schema.sql
   ```
3. 環境変数を取得：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2. LINE Botの設定

1. [LINE Developers Console](https://developers.line.biz/)でチャンネルを作成
2. Messaging APIを有効化
3. 必要な情報を取得：
   - `LINE_CHANNEL_ACCESS_TOKEN`
   - `LINE_CHANNEL_SECRET`
4. Webhookを設定（後でVercel URLを設定）

### 3. Vercelでのデプロイ

1. GitHubリポジトリを作成してコードをプッシュ
2. [Vercel](https://vercel.com/)でプロジェクトをインポート
3. 環境変数を設定：

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# LINE Bot
LINE_CHANNEL_ACCESS_TOKEN=your-line-channel-access-token
LINE_CHANNEL_SECRET=your-line-channel-secret

# API認証（ランダム文字列を生成）
SCHEDULER_API_KEY=your-random-scheduler-key
NOTIFICATION_API_KEY=your-random-notification-key
QUIZ_TOKEN_SECRET=your-random-token-secret

# ベースURL
NEXT_PUBLIC_BASE_URL=https://your-vercel-app.vercel.app
```

### 4. LINE Webhook URLの設定

デプロイ後、LINE Developers Consoleで以下を設定：

```
Webhook URL: https://your-vercel-app.vercel.app/api/line/webhook
```

### 5. Vercel Cron Jobsの設定

`vercel.json`を作成：

```json
{
  "crons": [
    {
      "path": "/api/scheduler/update-quiz-status",
      "schedule": "0 0 * * *"
    },
    {
      "path": "/api/scheduler/send-notifications",
      "schedule": "0 9 * * *"
    }
  ]
}
```

## 機能テスト

### 1. 基本機能のテスト

```bash
# メモ作成テスト
curl -X POST "https://your-domain.com/api/memos" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "テストメモ",
    "text": "これはテスト用のメモです。重要な概念について説明しています。",
    "userId": "test-user-id"
  }'

# クイズ取得テスト
curl "https://your-domain.com/api/quizzes?userId=test-user-id&today=true"
```

### 2. LINE Bot テスト

1. QRコードでBotを友だち追加
2. 「ヘルプ」メッセージを送信
3. ウェルカムメッセージが返ってくることを確認

### 3. スケジューラテスト

開発環境でのテスト：

```bash
# クイズステータス更新
curl "https://your-domain.com/api/scheduler/update-quiz-status"

# 通知送信テスト
curl "https://your-domain.com/api/scheduler/send-notifications?status=day1"
```

## 監視とメンテナンス

### 1. ログ監視

- Vercelのファンクションログを確認
- Supabaseのログを確認
- LINE Developersのログを確認

### 2. エラー対応

よくあるエラーと対処法：

```bash
# 1. Supabase接続エラー
# → 環境変数とRLS設定を確認

# 2. LINE通知失敗
# → アクセストークンと友だち状態を確認

# 3. CRON実行失敗
# → Vercel Cron設定とAPI認証を確認
```

### 3. パフォーマンス監視

- レスポンス時間
- データベースクエリ性能
- 通知送信成功率
- ユーザー継続率

## セキュリティ

### 1. 環境変数の管理

- 本番環境では必ずランダムなキーを使用
- 定期的にトークンをローテーション
- `.env.local`はGitにコミットしない

### 2. API認証

- スケジューラAPIは認証キー必須
- LINE Webhookは署名検証実装済み
- ユーザーデータはRLSで保護

### 3. データ保護

- 個人情報の適切な取り扱い
- 不要なデータの定期削除
- バックアップの実装

## スケーリング

### 1. パフォーマンス最適化

- データベースインデックスの最適化
- 画像最適化
- CDN活用

### 2. 機能拡張

- 新しいクイズタイプの追加
- 統計機能の強化
- 多言語対応

### 3. インフラ拡張

- Redis導入（キャッシュ）
- Queue system導入（大量処理）
- 複数リージョン対応

## トラブルシューティング

### よくある問題

1. **メモからクイズが生成されない**
   - kuromoji辞書の読み込み確認
   - メモの内容が日本語か確認
   - エラーログの確認

2. **LINE通知が届かない**
   - ユーザーがBotをブロックしていないか
   - 通知設定がONになっているか
   - アクセストークンの有効期限

3. **スケジューラが動作しない**
   - Vercel Cron設定の確認
   - API認証キーの確認
   - タイムゾーン設定の確認

### デバッグ方法

```bash
# ローカル開発
npm run dev

# ログ確認
vercel logs

# データベース確認
# Supabaseダッシュボードでクエリ実行
```

## アップデート

### 1. コードの更新

```bash
git pull origin main
npm install
npm run build
```

### 2. データベースマイグレーション

新しいスキーマ変更がある場合：

```sql
-- マイグレーションSQLを実行
-- 必要に応じてデータ移行
```

### 3. 環境変数の更新

新しい機能で環境変数が追加された場合は、Vercelダッシュボードで設定を更新。

## サポート

問題が発生した場合：

1. このドキュメントの確認
2. ログの確認
3. 各サービスのステータスページ確認
4. 必要に応じて技術サポートに連絡

---

このシステムにより、効果的な読書記録と復習システムを提供できます。継続的な改善とメンテナンスを行い、ユーザーの学習体験を向上させていきましょう。