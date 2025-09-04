# ランキング書籍テーブル タイムゾーンと週計算修正

## 問題の概要

`ranking_books`テーブルで以下の2つの問題が発生していました：

1. **タイムゾーン問題**: `created_at`、`updated_at`がUTC時刻で保存されているため、日本時間での表示・計算が正しく行われない
2. **週計算問題**: 09/01（月）以降に登録された書籍の`week_start_date`が08-25になっている（正しくは09-01）

## 根本原因の分析

### 1. タイムゾーン問題
- PostgreSQLのデフォルト動作でタイムスタンプがUTCで保存される
- アプリケーションが日本時間（JST）での操作を前提としているため、時差（9時間）による計算ずれが発生
- 特に日付境界付近での処理で問題が顕著に現れる

### 2. 週計算問題
- 2025年9月1日は月曜日（JST）だが、UTC基準では8月31日15:00（日曜日）として処理
- 日曜日なので前週の月曜日（08-25）が`week_start_date`として設定される
- 正しくは当日が月曜日なので09-01が設定されるべき

## 修正内容

### 作成したファイル

1. **`supabase/fix_timestamp_and_week_issues.sql`** - メイン修正スクリプト
2. **`supabase/rollback_timestamp_and_week_fixes.sql`** - ロールバック用スクリプト
3. **`supabase/debug_ranking_books_current_state.sql`** - デバッグ用クエリ集

### 主な修正点

#### 1. タイムスタンプのJST化
```sql
-- 既存のUTCタイムスタンプをJSTに変換
UPDATE ranking_books 
SET 
    created_at_jst = created_at AT TIME ZONE 'UTC' AT TIME ZONE 'JST',
    updated_at_jst = updated_at AT TIME ZONE 'UTC' AT TIME ZONE 'JST';

-- 列の入れ替え（UTC → JST）
ALTER TABLE ranking_books DROP COLUMN created_at;
ALTER TABLE ranking_books RENAME COLUMN created_at_jst TO created_at;
```

#### 2. JST基準の週計算関数
```sql
-- 日本時間基準で週の開始日を計算する関数
CREATE OR REPLACE FUNCTION get_week_start_date_jst(input_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW())
RETURNS DATE AS $$
DECLARE
    jst_date DATE;
    day_of_week INTEGER;
BEGIN
    -- UTCタイムスタンプを日本時間の日付に変換
    jst_date := (input_timestamp AT TIME ZONE 'JST')::DATE;
    
    -- 曜日を取得（0=日曜日, 1=月曜日, ..., 6=土曜日）
    day_of_week := EXTRACT(dow FROM jst_date)::integer;
    
    -- ISO週計算（月曜日開始、日曜日は前週扱い）
    RETURN jst_date - ((day_of_week + 6) % 7);
END;
$$ LANGUAGE plpgsql;
```

#### 3. 既存データの修正
```sql
-- JST基準でweek_start_dateを再計算・更新
UPDATE ranking_books 
SET week_start_date = get_week_start_date_jst(created_at)
WHERE created_at >= '2025-09-01'
  AND week_start_date != get_week_start_date_jst(created_at);
```

#### 4. 自動処理トリガーの更新
- `update_updated_at_column()`: JST基準でupdated_atを更新
- `set_week_start_date_on_insert()`: 新規挿入時にJST基準でweek_start_dateを自動設定
- `check_and_handle_duplicates()`: 重複チェック時のタイムスタンプもJST基準に更新

## 実行手順

### 1. 事前準備
```bash
# 現在のデータ状態を確認
psql $DATABASE_URL -f supabase/debug_ranking_books_current_state.sql
```

### 2. バックアップ（重要）
```sql
-- 修正前に必ずバックアップを取得
CREATE TABLE ranking_books_backup AS SELECT * FROM ranking_books;
```

### 3. 修正の実行
```bash
# メイン修正スクリプトの実行
psql $DATABASE_URL -f supabase/fix_timestamp_and_week_issues.sql
```

### 4. 修正結果の確認
```bash
# 修正後のデータ状態を確認
psql $DATABASE_URL -f supabase/debug_ranking_books_current_state.sql
```

### 5. 必要に応じてロールバック
```bash
# 問題がある場合のロールバック
psql $DATABASE_URL -f supabase/rollback_timestamp_and_week_fixes.sql
```

## 修正後の動作

### タイムスタンプ
- `created_at`、`updated_at`が日本時間（JST）で保存される
- フロントエンドでの表示が正確になる
- 新規レコードも自動的にJSTで保存される

### 週計算
- 日本時間基準で週の開始日（月曜日）が正しく計算される
- 09/01以降のレコードの`week_start_date`が09-01に修正される
- 新規登録時も自動的にJST基準で計算される

## 検証方法

### 1. タイムスタンプ確認
```sql
SELECT 
    title,
    created_at,
    created_at AT TIME ZONE 'JST' as created_at_jst_display
FROM ranking_books 
WHERE created_at >= '2025-09-01'
ORDER BY created_at;
```

### 2. 週計算確認
```sql
SELECT 
    title,
    week_start_date,
    (created_at AT TIME ZONE 'JST')::DATE as created_date_jst,
    CASE 
        WHEN EXTRACT(dow FROM (created_at AT TIME ZONE 'JST')::DATE) = 1 THEN '月曜日'
        WHEN EXTRACT(dow FROM (created_at AT TIME ZONE 'JST')::DATE) = 0 THEN '日曜日'
        ELSE '他の曜日'
    END as day_name
FROM ranking_books 
WHERE created_at >= '2025-09-01'
ORDER BY created_at;
```

### 3. 新規登録テスト
```sql
-- テスト用の新規レコード挿入（実際の運用では使用しないでください）
INSERT INTO ranking_books (title, author, genre_tags, amazon_link, ranking_source)
VALUES ('テスト書籍', 'テスト著者', ARRAY['テスト'], 'https://amazon.co.jp/test', 'test_source');

-- 自動設定されたweek_start_dateを確認
SELECT title, week_start_date, created_at FROM ranking_books WHERE title = 'テスト書籍';
```

## 影響範囲

### 直接影響
- `ranking_books`テーブルの全レコード
- ランキング管理画面（`/admin/rankings`）
- フロントエンドのランキング表示

### 間接影響
- 週別の書籍分類・表示
- ランキング集計処理
- 重複チェック機能

## 注意事項

1. **バックアップ必須**: 修正前に必ずデータのバックアップを取得してください
2. **ダウンタイム**: 修正中はランキング関連機能が一時的に利用できません
3. **テスト環境での事前検証**: 本番適用前にテスト環境での動作確認を推奨します
4. **ロールバック準備**: 問題発生時に備えてロールバックスクリプトを準備済みです

## トラブルシューティング

### よくある問題

1. **権限エラー**: データベースユーザーにALTER TABLE権限があることを確認
2. **関数作成エラー**: 既存の関数と競合する場合は一度削除してから再作成
3. **データ不整合**: 修正中にアプリケーションからの書き込みがある場合は一時停止を検討

### 確認コマンド
```sql
-- 関数の存在確認
SELECT proname FROM pg_proc WHERE proname LIKE '%week%';

-- トリガーの確認
SELECT tgname FROM pg_trigger WHERE tgrelid = 'ranking_books'::regclass;

-- データ整合性確認
SELECT COUNT(*) FROM ranking_books WHERE week_start_date IS NULL;
```

## 完了チェックリスト

- [ ] バックアップの取得
- [ ] デバッグスクリプトによる現状確認
- [ ] メイン修正スクリプトの実行
- [ ] 修正結果の確認
- [ ] フロントエンドでの動作確認
- [ ] 新規登録機能のテスト
- [ ] ロールバックスクリプトの動作確認（テスト環境）

この修正により、ランキング書籍の時刻表示と週分類が日本時間基準で正しく動作するようになります。