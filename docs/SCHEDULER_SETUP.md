# スケジューラ設定ガイド

このドキュメントでは、読書メモ&クイズシステムのスケジューラ機能の設定方法について説明します。

## 概要

スケジューラは以下の処理を自動実行します：

1. **クイズステータス更新**: 今日→翌日→7日後→完了の流れでステータスを更新
2. **LINE通知送信**: 復習タイミングでユーザーにPush通知を送信
3. **リトライ処理**: 送信失敗した通知の再送

## 必要な環境変数

```bash
# LINE Bot設定
LINE_CHANNEL_ACCESS_TOKEN=your_line_channel_access_token
LINE_CHANNEL_SECRET=your_line_channel_secret

# API認証用キー
SCHEDULER_API_KEY=your_scheduler_api_key
NOTIFICATION_API_KEY=your_notification_api_key

# クイズトークン暗号化用
QUIZ_TOKEN_SECRET=your_quiz_token_secret

# ベースURL
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

## CRON設定例

### 1. Vercel Cron Jobs

`vercel.json`に以下を追加：

```json
{
  "crons": [
    {
      "path": "/api/scheduler/update-quiz-status",
      "schedule": "0 0 * * *"
    },
    {
      "path": "/api/scheduler/send-notifications?status=day1",
      "schedule": "0 9 * * *"
    },
    {
      "path": "/api/scheduler/send-notifications?status=day7",
      "schedule": "0 9 * * *"
    }
  ]
}
```

### 2. GitHub Actions

`.github/workflows/scheduler.yml`:

```yaml
name: Quiz Scheduler

on:
  schedule:
    # 毎日0時にクイズステータス更新
    - cron: '0 0 * * *'
    # 毎日9時に通知送信
    - cron: '0 9 * * *'

jobs:
  update-quiz-status:
    runs-on: ubuntu-latest
    steps:
      - name: Update Quiz Status
        run: |
          curl -X POST ${{ secrets.BASE_URL }}/api/scheduler/update-quiz-status \
            -H "x-api-key: ${{ secrets.SCHEDULER_API_KEY }}"

  send-notifications:
    runs-on: ubuntu-latest
    needs: update-quiz-status
    steps:
      - name: Send Day1 Notifications
        run: |
          curl -X POST ${{ secrets.BASE_URL }}/api/scheduler/send-notifications \
            -H "x-api-key: ${{ secrets.SCHEDULER_API_KEY }}" \
            -H "Content-Type: application/json" \
            -d '{"status": "day1"}'
      
      - name: Send Day7 Notifications
        run: |
          curl -X POST ${{ secrets.BASE_URL }}/api/scheduler/send-notifications \
            -H "x-api-key: ${{ secrets.SCHEDULER_API_KEY }}" \
            -H "Content-Type: application/json" \
            -d '{"status": "day7"}'
```

### 3. 外部CRON服務（cron-job.org等）

以下のURLを定期実行するよう設定：

```bash
# 毎日0時
POST https://your-domain.com/api/scheduler/update-quiz-status
Header: x-api-key: your_scheduler_api_key

# 毎日9時
POST https://your-domain.com/api/scheduler/send-notifications
Header: x-api-key: your_scheduler_api_key
Header: Content-Type: application/json
Body: {"status": "day1"}

POST https://your-domain.com/api/scheduler/send-notifications
Header: x-api-key: your_scheduler_api_key
Header: Content-Type: application/json
Body: {"status": "day7"}
```

## 処理フロー

### 1. クイズステータス更新フロー

```
today (当日) → day1 (翌日) → day7 (7日後) → done (完了)
```

- 毎日0時に実行
- 各ステータスの更新タイミングを管理
- スケジュール時刻を自動計算

### 2. 通知送信フロー

```
1. 対象クイズを取得（ステータス・時間窓で絞り込み）
2. ユーザー設定をチェック（通知有効・時間帯）
3. 重複通知をチェック
4. LINE Push通知を送信
5. 通知ログを記録
```

## 手動実行（開発・テスト用）

開発環境では以下のエンドポイントで手動実行可能：

```bash
# クイズステータス更新
GET /api/scheduler/update-quiz-status

# 通知送信
GET /api/scheduler/send-notifications?status=day1
GET /api/scheduler/send-notifications?status=day7
```

## 監視とログ

### レスポンス例

```json
{
  "message": "Quiz status update completed",
  "timestamp": "2024-01-15T00:00:00.000Z",
  "results": {
    "todayToDay1": 15,
    "day1ToDay7": 8,
    "day7ToDone": 3,
    "errors": []
  }
}
```

### エラー対応

1. **認証エラー**: API_KEYの設定を確認
2. **通知送信失敗**: LINE設定・ユーザー情報を確認
3. **データベースエラー**: Supabase接続・RLS設定を確認

## 最適化のポイント

1. **バッチサイズ**: 大量のクイズを処理する際は分割実行
2. **レート制限**: LINE API制限を考慮した送信頻度調整
3. **エラーハンドリング**: 部分的な失敗でも処理を継続
4. **重複防止**: 通知ログでの重複チェック

## トラブルシューティング

### よくある問題

1. **通知が送信されない**
   - ユーザーのnotification_enabledがtrue
   - 通知時間が設定範囲内
   - LINE_CHANNEL_ACCESS_TOKENが有効

2. **ステータスが更新されない**
   - SCHEDULER_API_KEYが正しい
   - データベース接続が正常
   - スケジュール時刻の計算が正確

3. **重複通知**
   - 通知ログの重複チェックが機能している
   - CRON設定が重複していない

### デバッグ方法

```bash
# ログ確認
curl -X GET "https://your-domain.com/api/scheduler/update-quiz-status" \
  -H "x-api-key: your_key"

# 通知テスト
curl -X POST "https://your-domain.com/api/line/notify" \
  -H "x-api-key: your_key" \
  -H "Content-Type: application/json" \
  -d '{"quizId": "test-id", "userId": "test-user", "force": true}'
```