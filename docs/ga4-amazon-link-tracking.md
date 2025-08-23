# GA4 Amazonリンククリック追跡 設計書

## 概要
`/results`および`/search`ページでAmazonリンクがクリックされた際のイベントをGoogle Analytics 4 (GA4)で追跡する機能を実装します。

## 目的
- ユーザーのAmazonリンククリック行動を分析
- 書籍の人気度や推薦効果を測定
- コンバージョン率の向上に向けたデータ収集

## 実装対象ページ
1. `/results` - レコメンド結果ページ
2. `/search` - 書籍検索ページ

## 追跡するイベント

### イベント名: `amazon_link_click`

### イベントパラメータ
| パラメータ名 | 型 | 説明 | 例 |
|-------------|----|----|-----|
| `page_location` | string | クリックが発生したページのURL | `/results?purpose=growth&genres=自己啓発` |
| `page_title` | string | ページタイトル | `検索結果` |
| `book_title` | string | クリックされた書籍のタイトル | `7つの習慣` |
| `book_author` | string | 書籍の著者 | `スティーブン・R・コヴィー` |
| `book_id` | string | 書籍の一意識別子 | `book_123` |
| `amazon_url` | string | AmazonのURL | `https://amazon.co.jp/dp/...` |
| `click_position` | number | リスト内での位置（resultsページのみ） | `1, 2, 3...` |
| `source_page` | string | クリック元ページ | `results` or `search` |
| `recommendation_score` | number | レコメンドスコア（resultsページのみ） | `85` |

## 技術実装

### 1. GA4ユーティリティ関数
- ファイル: `/src/lib/analytics.ts`
- GA4イベント送信用の共通関数を作成

### 2. イベント送信タイミング
- Amazonリンクの`onClick`イベント発生時
- リンクの実際のクリック前にイベントを送信

### 3. エラーハンドリング
- GA4送信失敗時もユーザー体験に影響しないよう配慮
- コンソールログでデバッグ情報を出力

## GA4コンソール設定

### カスタムイベントの確認方法
1. GA4プロパティにログイン
2. 「レポート」→「エンゲージメント」→「イベント」
3. `amazon_link_click`イベントを確認

### カスタムディメンションの設定
以下のパラメータをカスタムディメンションとして設定推奨：
- `book_title`
- `book_author`
- `source_page`
- `recommendation_score`

### 推奨レポート設定
1. **書籍別クリック数レポート**
   - ディメンション: `book_title`, `book_author`
   - 指標: イベント数

2. **ページ別パフォーマンス**
   - ディメンション: `source_page`
   - 指標: イベント数、ユニークユーザー数

3. **レコメンド効果分析**
   - ディメンション: `click_position`, `recommendation_score`
   - 指標: イベント数

## 実装後の検証方法

### 1. リアルタイムテスト
1. GA4の「リアルタイム」レポートを開く
2. 各ページでAmazonリンクをクリック
3. イベントがリアルタイムで表示されることを確認

### 2. デバッグモード
```javascript
// ブラウザのコンソールで確認
window.dataLayer
```

### 3. GA4 DebugView
- GA4の「設定」→「DebugView」でイベントの詳細を確認

## セキュリティ・プライバシー考慮事項
- 個人を特定できる情報（PII）は送信しない
- 書籍情報のみを追跡対象とする
- GDPR/CCPA等のプライバシー規制に準拠

## パフォーマンス考慮事項
- イベント送信は非同期で実行
- ユーザーのクリック体験に遅延を与えない
- GA4の1日あたりのイベント制限に注意

## 今後の拡張可能性
- 要約リンククリックの追跡
- ページ滞在時間の測定
- スクロール深度の追跡
- A/Bテスト用のイベント追跡