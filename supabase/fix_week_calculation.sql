-- 週の開始日計算の修正
-- 日曜日を翌週の開始週として扱うように変更

CREATE OR REPLACE FUNCTION get_week_start_date(input_date DATE DEFAULT CURRENT_DATE)
RETURNS DATE AS $$
DECLARE
  day_of_week INTEGER;
  date_of_month INTEGER;
BEGIN
  -- 曜日を取得（0=日曜日, 1=月曜日, ..., 6=土曜日）
  day_of_week := EXTRACT(dow FROM input_date)::integer;
  date_of_month := EXTRACT(day FROM input_date)::integer;
  
  -- 月末・月初の特別処理
  -- 土曜日・日曜日が月の最初の2日間にある場合、次の月曜日を週開始とする
  IF (day_of_week = 0 OR day_of_week = 6) AND date_of_month <= 2 THEN
    -- 次の月曜日を計算
    IF day_of_week = 0 THEN
      -- 日曜日なら翌日（月曜日）
      RETURN input_date + 1;
    ELSE
      -- 土曜日なら翌々日（月曜日）
      RETURN input_date + 2;
    END IF;
  ELSE
    -- 通常の週計算（月曜日基準）
    RETURN input_date - ((day_of_week + 6) % 7);
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