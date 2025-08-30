-- ランキング書籍機能のロールバック用SQL
-- 既存のマイグレーションを取り消します

-- トリガーを削除
DROP TRIGGER IF EXISTS ranking_books_duplicate_check ON ranking_books;

-- 関数を削除
DROP FUNCTION IF EXISTS trigger_handle_duplicates();
DROP FUNCTION IF EXISTS check_and_handle_duplicates(TEXT, DATE);
DROP FUNCTION IF EXISTS get_week_start_date(DATE);

-- テーブルを削除
DROP TABLE IF EXISTS ranking_books CASCADE;
DROP TABLE IF EXISTS ranking_sources CASCADE;

-- 注意: この操作により、ランキング書籍のデータは全て削除されます
-- 実行前にバックアップを取ることを推奨します