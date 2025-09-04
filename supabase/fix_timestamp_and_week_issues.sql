-- ランキング書籍テーブルのタイムスタンプとweek_start_date修正
-- 
-- 問題1: created_at, updated_atがUTC時刻になっている → JSTに変更
-- 問題2: 09/01以降に登録された書籍のweek_start_dateが08-25になっている → 09-01に修正

-- ========================================
-- 1. 現在のデータ確認（実行前の状態確認）
-- ========================================

-- 現在のタイムスタンプとweek_start_dateの状況を確認
SELECT 
    id,
    title,
    week_start_date,
    created_at,
    created_at AT TIME ZONE 'UTC' AT TIME ZONE 'JST' as created_at_jst,
    updated_at,
    updated_at AT TIME ZONE 'UTC' AT TIME ZONE 'JST' as updated_at_jst
FROM ranking_books 
WHERE created_at >= '2025-09-01'
ORDER BY created_at;

-- 問題のあるレコード数を確認
SELECT 
    COUNT(*) as total_records,
    COUNT(CASE WHEN week_start_date = '2025-08-25' AND created_at >= '2025-09-01' THEN 1 END) as incorrect_week_records
FROM ranking_books;

-- ========================================
-- 2. 週計算関数の修正（JST基準）
-- ========================================

-- 日本時間（JST）基準で週の開始日を計算する関数
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
    -- 月曜日=0, 火曜日=1, ..., 日曜日=6として計算
    RETURN jst_date - ((day_of_week + 6) % 7);
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 3. タイムスタンプ列の変更（UTC → JST）
-- ========================================

-- 注意: この操作は既存のタイムスタンプをJST基準に変換します
-- バックアップを取ってから実行することを強く推奨します

-- Step 1: 新しい列を追加（JST基準）
ALTER TABLE ranking_books 
ADD COLUMN IF NOT EXISTS created_at_jst TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS updated_at_jst TIMESTAMP WITH TIME ZONE;

-- Step 2: 既存のUTCタイムスタンプをJSTに変換して新しい列に設定
UPDATE ranking_books 
SET 
    created_at_jst = created_at AT TIME ZONE 'UTC' AT TIME ZONE 'JST',
    updated_at_jst = updated_at AT TIME ZONE 'UTC' AT TIME ZONE 'JST';

-- Step 3: 古い列を削除して新しい列をリネーム
ALTER TABLE ranking_books DROP COLUMN created_at;
ALTER TABLE ranking_books DROP COLUMN updated_at;
ALTER TABLE ranking_books RENAME COLUMN created_at_jst TO created_at;
ALTER TABLE ranking_books RENAME COLUMN updated_at_jst TO updated_at;

-- Step 4: デフォルト値を設定（JST基準の現在時刻）
ALTER TABLE ranking_books 
ALTER COLUMN created_at SET DEFAULT (NOW() AT TIME ZONE 'JST'),
ALTER COLUMN updated_at SET DEFAULT (NOW() AT TIME ZONE 'JST');

-- ========================================
-- 4. week_start_dateの修正
-- ========================================

-- JST基準でweek_start_dateを再計算・更新
UPDATE ranking_books 
SET week_start_date = get_week_start_date_jst(created_at)
WHERE created_at >= '2025-09-01'
  AND week_start_date != get_week_start_date_jst(created_at);

-- ========================================
-- 5. トリガー関数の更新（JST基準）
-- ========================================

-- updated_at自動更新関数をJST基準に修正
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = (NOW() AT TIME ZONE 'JST');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 重複チェック関数もJST基準に更新
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
    SET is_visible = false,
        updated_at = (NOW() AT TIME ZONE 'JST')
    WHERE amazon_link = p_amazon_link 
      AND week_start_date = p_week_start_date
      AND id != latest_record_id;
    
    -- 最新レコードを表示にする
    UPDATE ranking_books 
    SET is_visible = true,
        updated_at = (NOW() AT TIME ZONE 'JST')
    WHERE id = latest_record_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 6. 新規挿入時のweek_start_date自動設定トリガー
-- ========================================

-- 新規レコード挿入時にJST基準でweek_start_dateを自動設定
CREATE OR REPLACE FUNCTION set_week_start_date_on_insert()
RETURNS TRIGGER AS $$
BEGIN
    -- 新規挿入時にJST基準でweek_start_dateを設定
    IF NEW.week_start_date IS NULL THEN
        NEW.week_start_date = get_week_start_date_jst(NEW.created_at);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガーを作成（既存のものがあれば削除してから作成）
DROP TRIGGER IF EXISTS set_week_start_date_trigger ON ranking_books;
CREATE TRIGGER set_week_start_date_trigger
    BEFORE INSERT ON ranking_books
    FOR EACH ROW
    EXECUTE FUNCTION set_week_start_date_on_insert();

-- ========================================
-- 7. 修正後のデータ確認
-- ========================================

-- 修正後のタイムスタンプとweek_start_dateの状況を確認
SELECT 
    id,
    title,
    week_start_date,
    created_at,
    updated_at,
    (created_at AT TIME ZONE 'JST')::DATE as created_date_jst
FROM ranking_books 
WHERE created_at >= '2025-09-01'
ORDER BY created_at;

-- 修正されたレコード数を確認
SELECT 
    COUNT(*) as total_records,
    COUNT(CASE WHEN week_start_date = '2025-09-01' AND created_at >= '2025-09-01' THEN 1 END) as corrected_week_records,
    COUNT(CASE WHEN week_start_date = '2025-08-25' AND created_at >= '2025-09-01' THEN 1 END) as remaining_incorrect_records
FROM ranking_books;

-- ========================================
-- 8. 動作確認用のテストケース
-- ========================================

-- テスト用の確認クエリ（実際のデータは挿入しません）
SELECT 
    '2025-09-01 10:00:00+09'::TIMESTAMP WITH TIME ZONE as test_timestamp,
    get_week_start_date_jst('2025-09-01 10:00:00+09'::TIMESTAMP WITH TIME ZONE) as calculated_week_start,
    'Expected: 2025-09-01' as expected_result;

SELECT 
    '2025-09-07 10:00:00+09'::TIMESTAMP WITH TIME ZONE as test_timestamp,
    get_week_start_date_jst('2025-09-07 10:00:00+09'::TIMESTAMP WITH TIME ZONE) as calculated_week_start,
    'Expected: 2025-09-01 (same week)' as expected_result;

SELECT 
    '2025-09-08 10:00:00+09'::TIMESTAMP WITH TIME ZONE as test_timestamp,
    get_week_start_date_jst('2025-09-08 10:00:00+09'::TIMESTAMP WITH TIME ZONE) as calculated_week_start,
    'Expected: 2025-09-08 (next week)' as expected_result;

-- ========================================
-- 実行完了メッセージ
-- ========================================

DO $$
BEGIN
    RAISE NOTICE '=== ランキング書籍テーブルの修正が完了しました ===';
    RAISE NOTICE '1. タイムスタンプをUTCからJSTに変換';
    RAISE NOTICE '2. week_start_dateをJST基準で再計算';
    RAISE NOTICE '3. 新規データ用のトリガーを更新';
    RAISE NOTICE '4. 重複チェック関数をJST基準に更新';
    RAISE NOTICE '';
    RAISE NOTICE '修正内容の確認は上記のSELECT文で実行してください。';
END $$;