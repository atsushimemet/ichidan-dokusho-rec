# クイズ完了通知テストガイド

## 概要

このガイドでは、クイズ完了後のLINE通知機能をテストする方法を説明します。

## 実装内容

### 1. 自動通知機能
- クイズ回答時に自動的にテスト通知が送信されます
- 通知内容: "🧪 これはテストです\n\nクイズが完了しました！\n通知機能が正常に動作しています。"

### 2. 手動テスト機能
- テスト専用のAPIエンドポイントを追加しました
- エンドポイント: `POST /api/line/test-completion`

## テスト方法

### 方法1: クイズ回答による自動テスト

1. LINE Botを友達追加
2. 読書メモを作成してクイズを生成
3. 生成されたクイズに回答
4. 回答完了後にテスト通知が自動送信される

### 方法2: 手動APIテスト

```bash
curl -X POST https://your-domain.com/api/line/test-completion \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_NOTIFICATION_API_KEY" \
  -d '{"userId": "LINE_USER_ID"}'
```

## 環境変数の確認

以下の環境変数が正しく設定されていることを確認してください：

```env
LINE_CHANNEL_ACCESS_TOKEN=your_line_channel_access_token
LINE_CHANNEL_SECRET=your_line_channel_secret
NOTIFICATION_API_KEY=your_notification_api_key
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

## トラブルシューティング

### 通知が送信されない場合

1. LINE_CHANNEL_ACCESS_TOKENが正しく設定されているか確認
2. ユーザーがLINE Botを友達追加しているか確認
3. サーバーログで詳細なエラーメッセージを確認

### ログの確認方法

```bash
# Vercelの場合
vercel logs

# 本番環境のログ確認
curl -H "Authorization: Bearer YOUR_VERCEL_TOKEN" \
  https://api.vercel.com/v2/deployments/YOUR_DEPLOYMENT_ID/events
```

## 実装ファイル

- `src/app/api/quizzes/[id]/answer/route.ts`: クイズ回答処理にテスト通知機能を追加
- `src/lib/line-utils.ts`: テスト通知メッセージ作成関数を追加
- `src/app/api/line/test-completion/route.ts`: 手動テスト用APIエンドポイント

## 注意事項

- テスト通知は実際のLINEユーザーに送信されるため、適切なメッセージ内容にしてください
- 本番環境では必要に応じてテスト機能を無効化することを検討してください
- APIキーは適切に管理し、外部に漏洩しないよう注意してください