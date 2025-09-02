-- 週の開始日計算の修正
-- 日本時間基準でISO週計算（月曜日開始、日曜日は前週扱い）

CREATE OR REPLACE FUNCTION get_week_start_date(input_date DATE DEFAULT CURRENT_DATE)
RETURNS DATE AS $$
DECLARE
  day_of_week INTEGER;
BEGIN
  -- 曜日を取得（0=日曜日, 1=月曜日, ..., 6=土曜日）
  day_of_week := EXTRACT(dow FROM input_date)::integer;
  
  -- ISO週計算（月曜日開始、日曜日は前週扱い）
  -- 月曜日=0, 火曜日=1, ..., 日曜日=6として計算
  RETURN input_date - ((day_of_week + 6) % 7);
END;
$$ LANGUAGE plpgsql;

-- 既存のランキング書籍で08-25になっているデータを修正
-- 2025年9月1日（日本時間）に登録された書籍は2025-09-01週に属するべき
UPDATE ranking_books 
SET week_start_date = '2025-09-01'
WHERE week_start_date = '2025-08-25'
  AND created_at >= '2025-09-01 00:00:00'
  AND created_at < '2025-09-02 00:00:00';

-- 確認用：更新されたレコード数を表示
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE '修正されたレコード数: %', updated_count;
END $$;