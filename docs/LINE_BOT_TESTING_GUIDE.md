# 📱 LINE Bot テスト完全ガイド

読書メモ&クイズシステムのLINE Bot機能のテスト方法について詳しく説明します。

## 🎯 テスト概要

### テスト対象機能
- ✅ 友だち追加時のウェルカムメッセージ
- ✅ コマンド応答（ヘルプ、設定、統計など）
- ✅ Webページへのリンク機能
- ✅ Push通知（復習タイミング）
- ✅ エラーハンドリング

## 🛠️ 事前準備

### 1. LINE Bot設定の完了確認

#### LINE Developers Console設定
```
✅ 新しいプロバイダー作成済み
✅ Messaging APIチャンネル作成済み
✅ Channel Access Token取得済み
✅ Channel Secret取得済み
✅ Webhook URL設定済み
✅ Use webhook: ON
❌ Auto-reply messages: OFF（重要）
❌ Greeting messages: OFF（重要）
```

#### Vercel環境変数設定
```bash
LINE_CHANNEL_ACCESS_TOKEN=your_new_bot_token
LINE_CHANNEL_SECRET=your_new_bot_secret
NEXT_PUBLIC_BASE_URL=https://your-vercel-app.vercel.app
SKIP_LINE_SIGNATURE_VERIFICATION=true  # テスト用
```

## 🧪 段階的テスト手順

### Phase 1: エンドポイント動作確認

#### 1-1. 基本APIテスト
```bash
curl "https://your-vercel-app.vercel.app/api/test"
```

**期待される結果**:
```json
{
  "status": "API Test Endpoint Active",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "method": "GET"
}
```

#### 1-2. Webhookエンドポイント確認
```bash
curl "https://your-vercel-app.vercel.app/api/line/webhook"
```

**期待される結果**:
```json
{
  "status": "LINE Webhook Endpoint Active",
  "environment": {
    "hasAccessToken": true,
    "hasSecret": true,
    "baseUrl": "https://your-vercel-app.vercel.app"
  }
}
```

#### 1-3. LINE設定確認
```bash
curl "https://your-vercel-app.vercel.app/api/line/test"
```

**期待される結果**:
```json
{
  "config": {
    "hasAccessToken": true,
    "hasSecret": true,
    "accessTokenLength": 168,
    "isDummy": false
  }
}
```

### Phase 2: LINE Webhook検証

#### 2-1. LINE Developers Consoleでの検証
1. **Messaging API** → **Webhook settings**
2. **Webhook URL**: `https://your-vercel-app.vercel.app/api/line/webhook`
3. **「Verify」**ボタンをクリック

**期待される結果**: ✅ 検証成功

**エラーの場合**:
- `401 Unauthorized` → 署名検証エラー
- `404 Not Found` → URL間違い
- `500 Internal Server Error` → サーバーエラー

#### 2-2. Vercelログ確認
1. **Vercel Dashboard** → **Functions** → **Logs**
2. Webhook検証時のログを確認
3. エラーがあれば詳細を記録

### Phase 3: Bot機能テスト

#### 3-1. QRコード取得
**LINE Developers Console**から取得：
1. **Messaging API** → **Bot information**
2. **QR code**をダウンロードまたは表示
3. **Bot basic ID**（@xxx形式）をメモ

#### 3-2. 友だち追加テスト

**方法1: QRコード**
1. LINEアプリでQRコードをスキャン
2. 「追加」をタップ

**方法2: ID検索**
1. LINEアプリの「友だち追加」
2. 「検索」→「ID」
3. Bot basic ID（@xxx）を入力

#### 3-3. ウェルカムメッセージ確認

友だち追加直後に以下のメッセージが表示されるはず：

```
📚 読書メモ&クイズシステムへようこそ！

このシステムでは：
✅ 読書メモを作成
✅ 自動でクイズを生成
✅ 復習通知を受信

で効果的な学習をサポートします！

[さっそく始めてみましょう！]
メモを作成すると自動でクイズが生成され、復習通知が届きます。

[メモを作成する] [今日のクイズを見る]
```

### Phase 4: コマンドテスト

#### 4-1. 基本コマンド
以下のメッセージを送信して応答を確認：

| 送信メッセージ | 期待される応答 |
|---------------|----------------|
| `ヘルプ` | 使い方説明とリンク |
| `設定` | 設定ページへのボタン |
| `統計` | 統計ページへのボタン |
| `今日のクイズ` | クイズページへのボタン |
| `メモ` | メモ作成ページへのボタン |
| `その他` | デフォルトメッセージ |

#### 4-2. リンク動作確認
1. 応答メッセージのボタンをタップ
2. 正しいWebページが開くことを確認
3. ページが正常に表示されることを確認

### Phase 5: 高度な機能テスト

#### 5-1. Push通知テスト

**手動通知送信**:
```bash
curl -X POST "https://your-vercel-app.vercel.app/api/line/test" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "YOUR_LINE_USER_ID",
    "message": {
      "type": "text",
      "text": "🧪 テスト通知です"
    }
  }'
```

#### 5-2. 復習通知フローテスト
1. メモを作成
2. クイズを回答
3. 翌日の通知設定をテスト（手動トリガー）

## 🚨 トラブルシューティング

### 問題1: 404 Not Found

**原因と解決策**:
```bash
# 原因: URLが間違っている
# 解決: 正しいVercel URLを確認
curl "https://your-actual-vercel-url.vercel.app/api/line/webhook"
```

**Vercel URLの確認方法**:
1. Vercel Dashboard → プロジェクト
2. **Domains**セクションで現在のURLを確認
3. LINE Webhook URLを更新

### 問題2: 401 Unauthorized

**原因**: 署名検証エラー

**解決策**:
```bash
# 1. 環境変数確認
SKIP_LINE_SIGNATURE_VERIFICATION=true

# 2. Channel Secretの再確認
# LINE Developers Console → Basic settings → Channel secret
```

### 問題3: デフォルトメッセージが送信される

**原因**: Auto-reply/Greeting messagesがON

**解決策**:
1. **LINE Developers Console**
2. **Messaging API** → **LINE Official Account features**
3. 両方を**OFF**に設定

### 問題4: カスタムメッセージが送信されない

**原因**: Webhookが呼ばれていない

**解決策**:
```bash
# 1. Webhook URL再設定
# 2. Use webhook: ON確認
# 3. Vercelログでリクエストを確認
```

### 問題5: ボタンリンクが動作しない

**原因**: NEXT_PUBLIC_BASE_URLが間違っている

**解決策**:
```bash
# 正しいベースURLを設定
NEXT_PUBLIC_BASE_URL=https://your-actual-vercel-url.vercel.app
```

## 📊 テスト結果の記録

### テスト項目チェックリスト

```
□ Phase 1: エンドポイント動作確認
  □ /api/test → 200 OK
  □ /api/line/webhook → 200 OK  
  □ /api/line/test → 200 OK

□ Phase 2: Webhook検証
  □ LINE検証ボタン → ✅ 成功
  □ Vercelログ → エラーなし

□ Phase 3: Bot機能
  □ 友だち追加 → ウェルカムメッセージ
  □ ヘルプコマンド → 使い方説明
  □ 設定コマンド → 設定ページリンク
  □ 統計コマンド → 統計ページリンク
  □ メモコマンド → メモページリンク
  □ クイズコマンド → クイズページリンク

□ Phase 4: リンク動作
  □ メモ作成ページ → 正常表示
  □ クイズページ → 正常表示
  □ 設定ページ → 正常表示
  □ 統計ページ → 正常表示

□ Phase 5: 統合テスト
  □ メモ作成 → クイズ生成
  □ クイズ回答 → 結果表示
  □ 通知送信 → Push通知受信
```

## 🔧 デバッグツール

### Vercelログ確認
```bash
# Vercel CLI使用
npx vercel logs

# または Vercel Dashboard → Functions → Logs
```

### Webhook詳細ログ
友だち追加時のログ例：
```
=== LINE Webhook POST Called ===
Request body received, length: 150
Headers: {
  "x-line-signature": "abc123...",
  "content-type": "application/json"
}
Environment check: {
  "hasAccessToken": true,
  "hasSecret": true
}
```

### LINE側のログ確認
LINE Developers Console → **Monitoring** でWebhook呼び出し状況を確認

## 🎯 成功時の完全フロー

### 1. 友だち追加
```
ユーザー: QRコードスキャン
↓
LINE Platform: follow eventを送信
↓  
Webhook: ウェルカムメッセージを返信
↓
ユーザー: ウェルカムメッセージ受信
```

### 2. コマンド送信
```
ユーザー: "ヘルプ"と送信
↓
LINE Platform: message eventを送信
↓
Webhook: 使い方説明を返信
↓
ユーザー: 説明メッセージとボタン受信
```

### 3. リンクアクセス
```
ユーザー: ボタンタップ
↓
ブラウザ: Webページ表示
↓
ユーザー: メモ作成・クイズ回答
```

## 📝 テスト報告テンプレート

```markdown
## LINE Botテスト結果

### 基本情報
- テスト日時: 2025-01-XX
- Vercel URL: https://your-app.vercel.app
- Bot ID: @your_bot_id

### Phase 1: エンドポイント確認
- [ ] /api/test: ✅/❌
- [ ] /api/line/webhook: ✅/❌
- [ ] /api/line/test: ✅/❌

### Phase 2: Webhook検証
- [ ] LINE検証ボタン: ✅/❌
- [ ] エラーメッセージ: なし/あり

### Phase 3: Bot機能
- [ ] 友だち追加: ✅/❌
- [ ] ウェルカムメッセージ: ✅/❌
- [ ] ヘルプコマンド: ✅/❌
- [ ] 各種コマンド: ✅/❌

### Phase 4: リンク動作
- [ ] メモページ: ✅/❌
- [ ] クイズページ: ✅/❌
- [ ] 設定ページ: ✅/❌

### 問題・エラー
- 問題1: [詳細]
- 解決策: [詳細]

### 次のアクション
- [ ] 本番環境での最終テスト
- [ ] ユーザー受け入れテスト
- [ ] パフォーマンステスト
```

## 🔄 継続的テスト

### 定期確認項目
- 週次: Webhook動作確認
- 月次: 通知送信テスト
- リリース前: 全機能テスト

### 自動テストスクリプト
```bash
#!/bin/bash
# LINE Bot自動テストスクリプト

BASE_URL="https://your-vercel-app.vercel.app"

echo "=== LINE Bot Automated Test ==="

# 1. エンドポイント確認
echo "1. Testing basic endpoint..."
curl -s "$BASE_URL/api/test" | jq '.status'

# 2. Webhook確認
echo "2. Testing webhook endpoint..."
curl -s "$BASE_URL/api/line/webhook" | jq '.status'

# 3. LINE設定確認
echo "3. Testing LINE configuration..."
curl -s "$BASE_URL/api/line/test" | jq '.config.hasAccessToken'

echo "=== Test Completed ==="
```

## 🚀 本番環境での最終確認

### セキュリティ設定
```bash
# 本番環境では署名検証を有効化
SKIP_LINE_SIGNATURE_VERIFICATION=false  # または削除
```

### パフォーマンステスト
- 複数ユーザーでの同時アクセス
- 大量メッセージ送信時の応答
- Webhook応答時間の測定

### ユーザー受け入れテスト
1. 実際のユーザーによるテスト
2. 使いやすさの確認
3. エラーケースの確認

## 📞 サポート・問い合わせ

### よくある質問

**Q: 友だち追加しても何も起こらない**
A: Auto-reply/Greeting messagesがOFFになっているか確認

**Q: カスタムメッセージではなくデフォルトメッセージが来る**
A: Webhook設定とLINE Official Account featuresを確認

**Q: リンクをタップしてもページが開かない**
A: NEXT_PUBLIC_BASE_URLが正しく設定されているか確認

**Q: 通知が届かない**
A: Push通知のテストAPIで動作確認

### エラー報告時に含める情報
1. エラーメッセージ（スクリーンショット）
2. Vercelログ（関連部分）
3. LINE Developers Consoleのエラーログ
4. 実行した手順
5. 期待した結果と実際の結果

## 🎉 テスト完了の判断基準

### 必須機能
- ✅ 友だち追加でウェルカムメッセージ
- ✅ 基本コマンドへの応答
- ✅ Webページリンクの動作
- ✅ エラー時の適切な応答

### 推奨機能
- ✅ Push通知の送信
- ✅ Rich Menuの表示
- ✅ 統計・設定ページの動作

すべての必須機能が動作すれば、LINE Botテストは完了です！

---

このドキュメントに従って段階的にテストを実行し、各フェーズの結果を記録してください。問題が発生した場合は、該当するトラブルシューティングセクションを参照してください。