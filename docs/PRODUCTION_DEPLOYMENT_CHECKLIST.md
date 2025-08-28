# 本番環境デプロイメント チェックリスト

Good Archives機能を本番環境にデプロイする前の最終確認項目です。

## ✅ 本番環境対応完了項目

### 1. **ファイル更新状況**
- ✅ `src/components/ArchiveSlider.tsx` - `getArchives` を使用
- ✅ `src/app/archives/page.tsx` - `getArchives` を使用  
- ✅ `src/app/admin/archives/page.tsx` - 完全にSupabase API連携

### 2. **API関数の実装**
- ✅ `src/lib/archives.ts` - 完全なCRUD操作
- ✅ `getArchives()` - 検索・ページネーション対応
- ✅ `createArchive()` - 新規作成
- ✅ `updateArchive()` - 更新
- ✅ `deleteArchive()` - 削除

### 3. **データベースマイグレーション**
- ✅ `supabase/migration_add_archives_table.sql` - テーブル作成SQL
- ✅ RLSポリシー設定済み
- ✅ インデックス作成済み

## 🚀 デプロイ前の必須作業

### 1. **Supabaseマイグレーション実行**
```sql
-- 以下のSQLをSupabaseで実行
-- supabase/migration_add_archives_table.sql の内容
```

### 2. **環境変数の確認**
```bash
# 以下の環境変数が正しく設定されているか確認
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. **デプロイ環境での動作確認**
```bash
# 本番ビルドのテスト
npm run build

# 本番環境での起動テスト
npm start
```

## 🔍 機能テスト項目

### フロントエンド機能
- [ ] ホームページでArchiveSlider表示
- [ ] `/archives` ページでの記事一覧表示
- [ ] 記事検索機能
- [ ] 記事リンクからの外部サイト遷移

### 管理機能
- [ ] `/admin/register` で管理者登録
- [ ] `/admin/archives` での記事管理
- [ ] 記事の作成・編集・削除
- [ ] 権限制御（未認証ユーザーの管理画面アクセス拒否）

### データベース連携
- [ ] 記事データの永続化
- [ ] 検索機能の動作
- [ ] ページネーションの動作
- [ ] エラーハンドリングの動作

## ⚠️ セキュリティ確認

### RLSポリシー
- [ ] 全ユーザーが記事を読み取り可能
- [ ] 認証ユーザーのみが記事を作成・更新・削除可能
- [ ] 管理者権限の適切な設定

### 環境変数
- [ ] 本番環境でのSupabase URL/Key設定
- [ ] 開発環境との分離

## 📊 パフォーマンス確認

### データベース
- [ ] インデックスが適切に設定されている
- [ ] クエリのパフォーマンス確認

### フロントエンド
- [ ] ページ読み込み速度
- [ ] 画像最適化
- [ ] バンドルサイズ最適化

## 🐛 エラーハンドリング

### API エラー
- [ ] ネットワークエラー時の表示
- [ ] 権限エラー時の表示
- [ ] データ未取得時の表示

### UI/UX
- [ ] ローディング状態の表示
- [ ] エラーメッセージの適切な表示
- [ ] 成功メッセージの表示

## 📱 レスポンシブ対応

### デバイス別確認
- [ ] デスクトップ（1920px以上）
- [ ] タブレット（768px-1024px）
- [ ] モバイル（375px-768px）

### 機能別確認
- [ ] ArchiveSliderのスクロール
- [ ] 管理画面のフォーム
- [ ] 検索機能

## 🔄 本番環境移行手順

### 1. データベースセットアップ
```bash
# Supabase CLIを使用する場合
supabase migration new add_archives_table
# SQLファイルの内容をコピー
supabase db push
```

### 2. 環境変数設定
```bash
# Vercel, Netlify等の場合
NEXT_PUBLIC_SUPABASE_URL=your_production_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_key
```

### 3. デプロイ
```bash
npm run build
# デプロイ先に応じてコマンド実行
```

### 4. 本番環境テスト
- 基本機能テスト
- 権限テスト
- パフォーマンステスト

## 📞 トラブルシューティング

### よくある問題

#### 1. 「記事が読み込めません」エラー
- 環境変数の確認
- Supabaseの接続確認
- RLSポリシーの確認

#### 2. 管理画面で「権限エラー」
- ユーザー認証の確認
- RLSポリシーの確認

#### 3. 記事が表示されない
- データベースにデータが存在するか確認
- SQLクエリの実行確認

### ログ確認場所
- ブラウザの開発者ツール（Console）
- Supabaseダッシュボード（Logs）
- デプロイ環境のログ

## ✨ 追加推奨機能（オプション）

### SEO対応
- [ ] メタタグの設定
- [ ] OGP画像の設定
- [ ] サイトマップの生成

### 分析・監視
- [ ] Google Analytics設定
- [ ] エラー監視（Sentry等）
- [ ] パフォーマンス監視

### 機能拡張
- [ ] 記事カテゴリ機能
- [ ] 記事の並び替え機能
- [ ] RSS/Atom フィード

---

**注意**: このチェックリストの全項目を確認してからデプロイを実行してください。