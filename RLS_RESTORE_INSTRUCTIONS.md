# RLSポリシー復元手順

## 🚨 重複エラーの解決

**エラー内容**: `policy "Books are viewable by everyone" for table "books" already exists`

## 📋 修正手順

### 1. 修正版SQLスクリプトの実行

Supabase SQL Editorで以下のファイルの内容を実行してください：

**`supabase/restore_proper_rls_policy_fixed.sql`**

このスクリプトは：
- ✅ 既存のポリシーをすべて削除
- ✅ 新しいポリシーを作成
- ✅ テーブル存在確認付き
- ✅ 実行結果の確認表示

### 2. 実行方法

1. **Supabaseダッシュボード**にアクセス
2. **SQL Editor**に移動
3. `supabase/restore_proper_rls_policy_fixed.sql`の内容をコピー＆ペースト
4. **"Run"**ボタンをクリック

### 3. 実行後の確認

正常に実行されると以下が表示されます：

```
✅ RLSポリシーの復元が完了しました！

📊 ポリシー一覧:
- books: 読み取り（全ユーザー）、全操作（認証済みユーザー）
- genre_tags: 読み取り（全ユーザー）、全操作（認証済みユーザー）
- question_mappings: 読み取り（全ユーザー）、全操作（認証済みユーザー）
```

## 🔧 トラブルシューティング

### 他のエラーが出た場合

1. **テーブルが存在しないエラー**
   → 正常です。存在しないテーブルはスキップされます

2. **権限エラー**
   → Supabaseのダッシュボードで実行していることを確認

3. **構文エラー**
   → スクリプトをコピーし直して再実行

### エラーが解決しない場合

一時的に以下の簡易版を実行：

```sql
-- 最小限のポリシー設定
DROP POLICY IF EXISTS "Books are editable by everyone (temporary)" ON books;
CREATE POLICY "Books are editable by authenticated users" 
ON books FOR ALL 
USING (auth.role() = 'authenticated');
```

## ✅ 完了後の確認

1. **管理画面**にアクセス
2. **書籍編集**をテスト
3. **コンソールログ**で以下を確認：
   ```
   書籍更新結果: エラー=なし
   更新成功、更新後のデータを取得中...
   更新後のデータ取得成功
   ```

RLSポリシーが正しく設定されると、認証済みユーザーとして書籍データを正常に更新できるようになります！