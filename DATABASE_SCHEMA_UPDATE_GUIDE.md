# データベーススキーマ更新ガイド

## 🚨 発生した問題

**エラー**: `Could not find the 'difficulty_level' column of 'books' in the schema cache`

**原因**: TypeScriptの型定義では`difficulty_level`と`reading_time_hours`カラムが定義されているが、実際のSupabaseデータベースにはこれらのカラムが存在しない。

## ✅ 解決策

### 1. 即座の対応（実装済み）

書籍更新処理から一時的に不足カラムを除外：

```typescript
// 一時的修正: データベースに存在しないカラムを除外
const bookData = {
  title: formData.title,
  author: formData.author,
  genre_tags: formData.genre_tags,
  amazon_link: formData.amazon_link,
  summary_link: formData.summary_link || null,
  cover_image_url: formData.cover_image_url || null,
  description: formData.description || null,
  // difficulty_level: 'beginner' as const, // 一時的にコメントアウト
  // reading_time_hours: null, // 一時的にコメントアウト
  page_count: formData.page_count ? parseInt(formData.page_count) : null,
  price: formData.price ? parseFloat(formData.price) : null
};
```

### 2. 根本的解決（推奨）

データベーススキーマにカラムを追加：

**ファイル**: `supabase/migration_add_missing_columns.sql`

#### 実行手順

1. **Supabaseダッシュボード**にアクセス
2. **SQL Editor**を開く
3. `migration_add_missing_columns.sql`の内容をコピー＆ペースト
4. **"Run"**をクリック

#### 追加されるカラム

1. **difficulty_level** (VARCHAR(20))
   - 値: `'beginner'`, `'intermediate'`, `'advanced'`
   - デフォルト: `'beginner'`
   - 制約: CHECK制約付き

2. **reading_time_hours** (DECIMAL(4,1))
   - 読書時間（時間単位）
   - NULL許可
   - 制約: 正の値のみ

#### 実行後の確認

マイグレーション実行後、以下が表示されます：

```
✅ difficulty_level カラムを追加しました
✅ reading_time_hours カラムを追加しました

📊 確認結果:
- total_books: 84
- beginner_count: XX
- intermediate_count: XX  
- advanced_count: XX
```

### 3. コード復元（マイグレーション後）

マイグレーション完了後、以下のコメントアウトを解除：

```typescript
const bookData = {
  // ... 他のフィールド
  difficulty_level: 'beginner' as const, // コメントアウト解除
  reading_time_hours: null, // コメントアウト解除
  // ... 残りのフィールド
};
```

## 📋 現在の状態

### ✅ 完了済み
- 一時的修正による書籍更新エラーの解決
- マイグレーションスクリプトの作成
- エラーハンドリングの強化

### 🔄 実行待ち
- Supabaseでのマイグレーション実行
- コードの復元

## 🧪 テスト手順

### マイグレーション前
1. 書籍編集 → エラーが発生しない
2. コンソールログ確認:
   ```
   書籍更新結果: エラー=なし
   更新成功、更新後のデータを取得中...
   更新後のデータ取得成功
   ```

### マイグレーション後
1. コードのコメントアウト解除
2. 書籍編集でdifficulty_levelが正常に保存される
3. 新機能（難易度表示など）の実装が可能

## 📝 注意事項

### 既存データの処理
マイグレーションスクリプトは既存の書籍データの`difficulty_level`をジャンルベースで自動設定します：

- **入門書/マンガ** → `beginner`
- **哲学/歴史/科学** → `advanced`  
- **その他** → `intermediate`

### インデックス
検索性能向上のため、`difficulty_level`にインデックスが作成されます。

## 🔄 今後の作業

1. マイグレーション実行
2. コード復元
3. 新機能実装（難易度フィルター等）

現在のコード修正により、書籍更新は正常に動作するようになりました！