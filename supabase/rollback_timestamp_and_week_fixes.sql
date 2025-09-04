-- ランキング書籍テーブルのタイムスタンプとweek_start_date修正のロールバック
-- 
-- 注意: このスクリプトは fix_timestamp_and_week_issues.sql の変更を元に戻します
-- 実行前に必ずバックアップを確認してください

-- ========================================
-- 1. 現在の状態確認
-- ========================================

SELECT 
    id,
    title,
    week_start_date,
    created_at,
    updated_at
FROM ranking_books 
WHERE created_at >= '2025-09-01'
ORDER BY created_at
LIMIT 5;

-- ========================================
-- 2. トリガーとカスタム関数の削除
-- ========================================

-- 新規作成したトリガーを削除
DROP TRIGGER IF EXISTS set_week_start_date_trigger ON ranking_books;

-- 新規作成した関数を削除
DROP FUNCTION IF EXISTS set_week_start_date_on_insert();
DROP FUNCTION IF EXISTS get_week_start_date_jst(TIMESTAMP WITH TIME ZONE);

-- ========================================
-- 3. タイムスタンプ列をUTC基準に戻す
-- ========================================

-- Step 1: 新しい列を追加（UTC基準）
ALTER TABLE ranking_books 
ADD COLUMN IF NOT EXISTS created_at_utc TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS updated_at_utc TIMESTAMP WITH TIME ZONE;

-- Step 2: 現在のJSTタイムスタンプをUTCに変換して新しい列に設定
UPDATE ranking_books 
SET 
    created_at_utc = created_at AT TIME ZONE 'JST' AT TIME ZONE 'UTC',
    updated_at_utc = updated_at AT TIME ZONE 'JST' AT TIME ZONE 'UTC';

-- Step 3: 古い列を削除して新しい列をリネーム
ALTER TABLE ranking_books DROP COLUMN created_at;
ALTER TABLE ranking_books DROP COLUMN updated_at;
ALTER TABLE ranking_books RENAME COLUMN created_at_utc TO created_at;
ALTER TABLE ranking_books RENAME COLUMN updated_at_utc TO updated_at;

-- Step 4: デフォルト値をUTC基準に戻す
ALTER TABLE ranking_books 
ALTER COLUMN created_at SET DEFAULT NOW(),
ALTER COLUMN updated_at SET DEFAULT NOW();

-- ========================================
-- 4. 週計算関数を元の仕様に戻す
-- ========================================

-- 元のUTC基準の週計算関数に戻す
CREATE OR REPLACE FUNCTION get_week_start_date(input_date DATE DEFAULT CURRENT_DATE)
RETURNS DATE AS $$
BEGIN
  -- ISO週の月曜日を返す（月曜日=1、日曜日=7）
  RETURN input_date - (EXTRACT(dow FROM input_date)::integer + 6) % 7;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 5. updated_at自動更新関数を元に戻す
-- ========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 6. 重複チェック関数を元の仕様に戻す
-- ========================================

CREATE OR REPLACE FUNCTION check_and_handle_duplicates(
  p_amazon_link TEXT,
  p_week_start_date DATE
) RETURNS VOID AS $$
DECLARE
  latest_record_id UUID;
  duplicate_count INTEGER;
BEGIN
  -- まず重複があるかチェック
  SELECT COUNT(*) INTO duplicate_count
  FROM ranking_books 
  WHERE amazon_link = p_amazon_link 
    AND week_start_date = p_week_start_date;
  
  -- 重複がない場合は何もしない
  IF duplicate_count <= 1 THEN
    RETURN;
  END IF;
  
  -- 重複がある場合のみ処理を実行
  -- 最新レコードのIDを取得
  SELECT id INTO latest_record_id
  FROM ranking_books 
  WHERE amazon_link = p_amazon_link 
    AND week_start_date = p_week_start_date
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF latest_record_id IS NOT NULL THEN
    -- 最新レコード以外を非表示にする
    UPDATE ranking_books 
    SET is_visible = false
    WHERE amazon_link = p_amazon_link 
      AND week_start_date = p_week_start_date
      AND id != latest_record_id;
    
    -- 最新レコードを表示にする
    UPDATE ranking_books 
    SET is_visible = true
    WHERE id = latest_record_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 7. week_start_dateを元の計算方法で再設定（必要に応じて）
-- ========================================

-- 注意: これを実行すると、week_start_dateが元の（問題のある）値に戻る可能性があります
-- 必要な場合のみ実行してください

-- UPDATE ranking_books 
-- SET week_start_date = get_week_start_date(created_at::DATE)
-- WHERE created_at >= '2025-09-01';

-- ========================================
-- 8. ロールバック完了確認
-- ========================================

SELECT 
    id,
    title,
    week_start_date,
    created_at,
    updated_at,
    created_at AT TIME ZONE 'UTC' AT TIME ZONE 'JST' as created_at_jst_display
FROM ranking_books 
WHERE created_at >= '2025-09-01'
ORDER BY created_at
LIMIT 5;

-- 関数の存在確認
SELECT 
    proname as function_name,
    prosrc as function_body
FROM pg_proc 
WHERE proname IN ('get_week_start_date', 'get_week_start_date_jst', 'update_updated_at_column', 'check_and_handle_duplicates');

-- ========================================
-- 実行完了メッセージ
-- ========================================

DO $$
BEGIN
    RAISE NOTICE '=== ランキング書籍テーブルのロールバックが完了しました ===';
    RAISE NOTICE '1. タイムスタンプをJSTからUTCに戻しました';
    RAISE NOTICE '2. カスタム関数とトリガーを削除しました';
    RAISE NOTICE '3. 元の関数仕様に戻しました';
    RAISE NOTICE '';
    RAISE NOTICE 'データの確認は上記のSELECT文で実行してください。';
    RAISE NOTICE '注意: week_start_dateは手動で再計算が必要な場合があります。';
END $$;