# LINEユーザー作成デバッグガイド

## 問題の概要
LINEで友達追加した後にユーザーテーブルにデータが生成されない

## デバッグ手順

### 1. 環境変数の設定確認
```bash
# .env.localファイルの作成
cp .env.example .env.local
```

必須環境変数：
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` 
- `LINE_CHANNEL_ACCESS_TOKEN`
- `LINE_CHANNEL_SECRET`

### 2. デバッグAPIを使用した確認

#### ユーザーテーブルの状態確認
```bash
curl -X GET http://localhost:3000/api/debug/users
```

#### テストユーザー作成
```bash
curl -X POST http://localhost:3000/api/debug/users \
  -H "Content-Type: application/json" \
  -d '{"lineUserId": "test-user-123", "testMode": true}'
```

#### フォローイベントのテスト
```bash
curl -X POST http://localhost:3000/api/line/test-follow \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-notification-api-key" \
  -d '{"lineUserId": "test-user-456"}'
```

### 3. Webhookログの確認

Webhookが呼ばれているかを確認：
```bash
# 開発環境のログを監視
npm run dev
```

### 4. データベース直接確認

Supabaseダッシュボードで：
1. `users`テーブルを確認
2. `line_user_id`カラムにデータが入っているか
3. RLS（Row Level Security）が無効になっているか

### 5. LINE Webhook設定確認

LINE Developers Consoleで：
1. Webhook URLが正しく設定されているか
2. Webhookが有効になっているか
3. 「接続確認」が成功するか

## よくある問題と解決方法

### 問題1: 環境変数未設定
**症状**: アプリが起動しない、データベースエラー
**解決**: `.env.local`ファイルを作成し、必要な環境変数を設定

### 問題2: Webhook署名検証失敗
**症状**: Webhook処理でUnauthorizedエラー
**解決**: `SKIP_LINE_SIGNATURE_VERIFICATION=true`を設定（開発時のみ）

### 問題3: データベース権限エラー
**症状**: ユーザー作成時にpermission deniedエラー
**解決**: SupabaseでRLSを無効化またはポリシーを設定

### 問題4: LINE Channel設定ミス
**症状**: Webhookが呼ばれない
**解決**: LINE Developers ConsoleでWebhook URLとトークンを再確認

## デバッグ用コマンド集

```bash
# 1. 開発サーバー起動
npm run dev

# 2. ユーザーテーブル確認
curl http://localhost:3000/api/debug/users

# 3. テストユーザー作成
curl -X POST http://localhost:3000/api/debug/users \
  -H "Content-Type: application/json" \
  -d '{"lineUserId": "debug-user-789"}'

# 4. フォローイベントテスト
curl -X POST http://localhost:3000/api/line/test-follow \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-api-key" \
  -d '{"lineUserId": "debug-user-789"}'

# 5. Webhook動作確認
curl -X GET http://localhost:3000/api/line/webhook
```

## 実装確認ポイント

### UserService.findOrCreateByLineId の動作
```typescript
// src/lib/quiz-db.ts の62-73行目
static async findOrCreateByLineId(lineUserId: string, userData: Partial<User>): Promise<User | null> {
  let user = await this.findByLineUserId(lineUserId);
  
  if (!user) {
    user = await this.create({
      ...userData,
      line_user_id: lineUserId
    });
  }

  return user;
}
```

### Webhook処理の流れ
1. POST /api/line/webhook で署名検証
2. processWebhookAsync でバックグラウンド処理
3. handleFollowEvent でユーザー作成
4. UserService.findOrCreateByLineId でDB操作

## トラブルシューティング手順

1. **環境変数確認** → `.env.local`ファイルの存在と内容
2. **アプリ起動** → `npm run dev`でエラーがないか
3. **API動作確認** → デバッグエンドポイントでレスポンス確認
4. **データベース確認** → Supabaseダッシュボードでテーブル状態確認
5. **LINE設定確認** → Developers Consoleで設定値確認
6. **ログ監視** → コンソールでエラーメッセージ確認