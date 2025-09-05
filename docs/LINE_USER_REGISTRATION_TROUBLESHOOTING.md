# LINE友だち追加時のユーザー登録問題 - トラブルシューティングガイド

## 問題の概要

LINE Bot友だち追加時に、usersテーブルにユーザーデータが自動生成されない問題が発生しています。

## 期待される動作

1. ユーザーがLINE Botを友だち追加
2. LINEからWebhookに`follow`イベントが送信される
3. `handleFollowEvent`関数が実行される
4. `UserService.findOrCreateByLineId`でユーザーが作成される
5. usersテーブルにレコードが追加される
6. ウェルカムメッセージが送信される

## 問題の原因候補

### 1. Webhook URL設定の問題
- **確認方法**: LINE Developers Consoleでの設定確認
- **正しい設定**: `https://your-domain.com/api/line/webhook`
- **テスト方法**: `GET /api/line/webhook-test`でWebhook設定を確認

### 2. 署名検証の失敗
- **症状**: Webhookが401エラーで失敗
- **確認方法**: サーバーログで署名検証エラーをチェック
- **一時的な対処**: `SKIP_LINE_SIGNATURE_VERIFICATION=true`で署名検証をスキップ

### 3. 環境変数の設定不備
- **必要な環境変数**:
  - `LINE_CHANNEL_ACCESS_TOKEN`
  - `LINE_CHANNEL_SECRET`
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 4. データベース接続の問題
- **症状**: Supabaseへの接続失敗
- **確認方法**: `GET /api/debug/users`でデータベース接続をテスト

### 5. Webhookイベントが届いていない
- **症状**: サーバーログにfollowイベントのログが残らない
- **確認方法**: Webhookエンドポイントのアクセスログ確認

## 診断手順

### ステップ1: 環境設定の確認

```bash
# Webhook設定情報の確認
curl https://your-domain.com/api/line/webhook-test
```

期待される応答:
```json
{
  "status": "LINE Webhook Test Endpoint Active",
  "environment": {
    "hasAccessToken": true,
    "hasSecret": true,
    "hasSupabaseKey": true
  },
  "webhookUrl": "https://your-domain.com/api/line/webhook"
}
```

### ステップ2: データベース接続の確認

```bash
# usersテーブルの状態確認
curl https://your-domain.com/api/debug/users
```

期待される応答:
```json
{
  "users": {
    "count": 0,
    "data": [],
    "error": null
  },
  "tableStructure": {
    "columns": [...],
    "error": null
  }
}
```

### ステップ3: 手動フォローイベントのテスト

```bash
# 手動でフォローイベントをシミュレート
curl -X POST https://your-domain.com/api/line/webhook-test \
  -H "Content-Type: application/json" \
  -d '{"lineUserId": "U1234567890abcdef"}'
```

期待される応答:
```json
{
  "message": "Follow event simulation completed",
  "result": {
    "success": true,
    "user": {
      "id": "uuid",
      "line_user_id": "U1234567890abcdef",
      "display_name": "TestUser_abcdef"
    }
  }
}
```

### ステップ4: 実際のWebhookテスト

LINE Developers Consoleの「Webhook URL検証」機能を使用してWebhookエンドポイントをテストします。

## 修正手順

### 修正1: 署名検証の一時的無効化

問題の切り分けのため、まず署名検証を無効にしてテストします。

```bash
# 環境変数を設定
export SKIP_LINE_SIGNATURE_VERIFICATION=true
```

### 修正2: 詳細ログの有効化

現在のコードには詳細なログが追加されているため、サーバーログを確認してください。

### 修正3: データベーススキーマの確認

usersテーブルが正しく作成されているか確認:

```sql
-- Supabaseダッシュボードで実行
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public';
```

### 修正4: 手動ユーザー作成テスト

```bash
# 手動でユーザーを作成してテスト
curl -X POST https://your-domain.com/api/debug/users \
  -H "Content-Type: application/json" \
  -d '{"lineUserId": "U1234567890abcdef", "testMode": true}'
```

## 検証方法

### 1. ログの確認

サーバーログで以下のメッセージを確認:

```
=== FOLLOW EVENT START ===
Processing follow event for user: U1234567890abcdef
Environment check: { hasSupabaseUrl: true, hasSupabaseKey: true, hasLineToken: true }
Existing user check result: Not found
SUCCESS: User created/found: { id: "uuid", line_user_id: "U1234567890abcdef" }
Database verification: User exists in DB
=== FOLLOW EVENT COMPLETED ===
```

### 2. データベースの確認

```bash
# ユーザーが作成されたか確認
curl https://your-domain.com/api/debug/users
```

### 3. 実際の友だち追加テスト

1. LINE Botのブロックを解除（既に友だち追加済みの場合）
2. 再度友だち追加を実行
3. サーバーログとデータベースを確認

## よくある問題と解決策

### 問題: 「User not found」エラー

**原因**: データベース接続の問題
**解決策**: 
1. Supabase接続設定の確認
2. RLSポリシーの確認
3. テーブル権限の確認

### 問題: 署名検証エラー

**原因**: LINE_CHANNEL_SECRETの設定ミス
**解決策**:
1. LINE Developers Consoleから正しいChannel Secretを取得
2. 環境変数の再設定
3. デプロイの実行

### 問題: Webhookが呼ばれない

**原因**: Webhook URLの設定ミス
**解決策**:
1. LINE Developers ConsoleでWebhook URLを確認
2. HTTPSエンドポイントの確認
3. DNS設定の確認

## 追加のテストエンドポイント

以下のエンドポイントが診断用に追加されています:

- `GET /api/line/webhook-test`: Webhook設定の確認
- `POST /api/line/webhook-test`: 手動フォローイベントシミュレーション  
- `GET /api/debug/users`: usersテーブルの状態確認
- `POST /api/debug/users`: 手動ユーザー作成テスト

## 次のステップ

1. 上記の診断手順を順番に実行
2. 各ステップの結果をログに記録
3. 問題が特定されたら該当する修正を適用
4. 実際の友だち追加で動作確認

問題が解決しない場合は、サーバーログとテスト結果を共有してください。