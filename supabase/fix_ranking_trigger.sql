-- ランキング書籍のトリガー修正（無限ループ回避）

-- 既存のトリガーを削除
DROP TRIGGER IF EXISTS ranking_books_duplicate_check ON ranking_books;

-- 修正版トリガー関数（更新時の無限ループを回避）
CREATE OR REPLACE FUNCTION trigger_handle_duplicates()
RETURNS TRIGGER AS $$
BEGIN
  -- INSERT時のみ重複処理を実行（UPDATE時は実行しない）
  IF TG_OP = 'INSERT' THEN
    PERFORM check_and_handle_duplicates(NEW.amazon_link, NEW.week_start_date);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガーを再作成（INSERT時のみ）
CREATE TRIGGER ranking_books_duplicate_check
  AFTER INSERT ON ranking_books
  FOR EACH ROW
  EXECUTE FUNCTION trigger_handle_duplicates();

-- 注意: この修正により、既存データの重複問題は解決されますが、
-- 手動でのデータ編集時の重複チェックは行われなくなります。
-- 重複チェックは新規追加時のみ実行されます。