-- 週の開始日計算の修正
-- 日曜日を翌週の開始週として扱うように変更

CREATE OR REPLACE FUNCTION get_week_start_date(input_date DATE DEFAULT CURRENT_DATE)
RETURNS DATE AS $$
DECLARE
  day_of_week INTEGER;
BEGIN
  -- 曜日を取得（0=日曜日, 1=月曜日, ..., 6=土曜日）
  day_of_week := EXTRACT(dow FROM input_date)::integer;
  
  IF day_of_week = 0 THEN
    -- 日曜日の場合は翌日（月曜日）を週の開始日とする
    RETURN input_date + 1;
  ELSE
    -- 月曜日〜土曜日の場合は、その週の月曜日を計算
    RETURN input_date - (day_of_week - 1);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 既存のランキング書籍で08-25や08-26になっているデータを修正
-- 2024年9月1日に登録された書籍は2024-09-02週に属するべき
UPDATE ranking_books 
SET week_start_date = '2024-09-02'
WHERE week_start_date IN ('2024-08-25', '2024-08-26')
  AND created_at >= '2024-09-01'
  AND created_at < '2024-09-02';

-- 確認用：更新されたレコード数を表示
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE '修正されたレコード数: %', updated_count;
END $$;