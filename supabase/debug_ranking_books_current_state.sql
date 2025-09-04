-- ランキング書籍テーブルの現在の状態をデバッグするためのクエリ集

-- ========================================
-- 1. 基本情報の確認
-- ========================================

-- テーブル構造の確認
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'ranking_books' 
ORDER BY ordinal_position;

-- ========================================
-- 2. データの概要確認
-- ========================================

-- 全レコード数
SELECT COUNT(*) as total_records FROM ranking_books;

-- 日付範囲の確認
SELECT 
    MIN(created_at) as earliest_created,
    MAX(created_at) as latest_created,
    MIN(week_start_date) as earliest_week,
    MAX(week_start_date) as latest_week
FROM ranking_books;

-- ========================================
-- 3. タイムスタンプの詳細確認（UTC vs JST）
-- ========================================

-- 09/01以降のレコードのタイムスタンプ詳細
SELECT 
    id,
    title,
    week_start_date,
    created_at,
    created_at AT TIME ZONE 'UTC' as created_at_utc_display,
    created_at AT TIME ZONE 'JST' as created_at_jst_display,
    (created_at AT TIME ZONE 'JST')::DATE as created_date_jst,
    updated_at,
    updated_at AT TIME ZONE 'UTC' as updated_at_utc_display,
    updated_at AT TIME ZONE 'JST' as updated_at_jst_display
FROM ranking_books 
WHERE created_at >= '2025-09-01'
ORDER BY created_at;

-- ========================================
-- 4. week_start_date問題の詳細確認
-- ========================================

-- 問題のあるレコード（09/01以降で08-25週になっているもの）
SELECT 
    id,
    title,
    week_start_date,
    created_at,
    created_at AT TIME ZONE 'JST' as created_at_jst,
    (created_at AT TIME ZONE 'JST')::DATE as created_date_jst,
    EXTRACT(dow FROM (created_at AT TIME ZONE 'JST')::DATE) as day_of_week_jst,
    CASE 
        WHEN EXTRACT(dow FROM (created_at AT TIME ZONE 'JST')::DATE) = 0 THEN '日曜日'
        WHEN EXTRACT(dow FROM (created_at AT TIME ZONE 'JST')::DATE) = 1 THEN '月曜日'
        WHEN EXTRACT(dow FROM (created_at AT TIME ZONE 'JST')::DATE) = 2 THEN '火曜日'
        WHEN EXTRACT(dow FROM (created_at AT TIME ZONE 'JST')::DATE) = 3 THEN '水曜日'
        WHEN EXTRACT(dow FROM (created_at AT TIME ZONE 'JST')::DATE) = 4 THEN '木曜日'
        WHEN EXTRACT(dow FROM (created_at AT TIME ZONE 'JST')::DATE) = 5 THEN '金曜日'
        WHEN EXTRACT(dow FROM (created_at AT TIME ZONE 'JST')::DATE) = 6 THEN '土曜日'
    END as day_name_jst
FROM ranking_books 
WHERE created_at >= '2025-09-01'
  AND week_start_date = '2025-08-25'
ORDER BY created_at;

-- ========================================
-- 5. 週計算の検証
-- ========================================

-- 現在の週計算関数の動作確認
SELECT 
    '2025-09-01'::DATE as input_date,
    get_week_start_date('2025-09-01'::DATE) as calculated_week_start,
    '期待値: 2025-09-01 (月曜日なので同じ日)' as note;

SELECT 
    '2025-09-07'::DATE as input_date,
    get_week_start_date('2025-09-07'::DATE) as calculated_week_start,
    '期待値: 2025-09-01 (同じ週の月曜日)' as note;

SELECT 
    '2025-09-08'::DATE as input_date,
    get_week_start_date('2025-09-08'::DATE) as calculated_week_start,
    '期待値: 2025-09-08 (次の週の月曜日)' as note;

-- ========================================
-- 6. JST基準での正しい週計算の確認
-- ========================================

-- JST基準で正しい週開始日を計算（関数を使わずに直接計算）
SELECT 
    id,
    title,
    week_start_date as current_week_start,
    created_at,
    (created_at AT TIME ZONE 'JST')::DATE as created_date_jst,
    -- JST基準での正しい週開始日計算
    (created_at AT TIME ZONE 'JST')::DATE - 
    ((EXTRACT(dow FROM (created_at AT TIME ZONE 'JST')::DATE)::integer + 6) % 7) as correct_week_start_jst,
    -- 現在の値と正しい値の比較
    CASE 
        WHEN week_start_date = (created_at AT TIME ZONE 'JST')::DATE - 
            ((EXTRACT(dow FROM (created_at AT TIME ZONE 'JST')::DATE)::integer + 6) % 7)
        THEN '正しい'
        ELSE '間違い'
    END as week_start_status
FROM ranking_books 
WHERE created_at >= '2025-09-01'
ORDER BY created_at;

-- ========================================
-- 7. 統計情報
-- ========================================

-- week_start_dateの分布
SELECT 
    week_start_date,
    COUNT(*) as record_count,
    MIN(created_at AT TIME ZONE 'JST') as earliest_created_jst,
    MAX(created_at AT TIME ZONE 'JST') as latest_created_jst
FROM ranking_books 
GROUP BY week_start_date 
ORDER BY week_start_date DESC;

-- 問題のあるレコード数の統計
SELECT 
    COUNT(*) as total_records_since_0901,
    COUNT(CASE WHEN week_start_date = '2025-08-25' THEN 1 END) as incorrect_week_records,
    COUNT(CASE WHEN week_start_date = '2025-09-01' THEN 1 END) as correct_week_records,
    ROUND(
        COUNT(CASE WHEN week_start_date = '2025-08-25' THEN 1 END) * 100.0 / COUNT(*), 2
    ) as incorrect_percentage
FROM ranking_books 
WHERE created_at >= '2025-09-01';

-- ========================================
-- 8. 関数とトリガーの確認
-- ========================================

-- 現在定義されている関数の確認
SELECT 
    proname as function_name,
    CASE 
        WHEN proname = 'get_week_start_date' THEN 'メインの週計算関数'
        WHEN proname = 'check_and_handle_duplicates' THEN '重複チェック関数'
        WHEN proname = 'update_updated_at_column' THEN 'updated_at自動更新関数'
        WHEN proname = 'trigger_handle_duplicates' THEN '重複チェックトリガー関数'
        ELSE 'その他'
    END as description
FROM pg_proc 
WHERE proname IN (
    'get_week_start_date', 
    'get_week_start_date_jst',
    'check_and_handle_duplicates', 
    'update_updated_at_column',
    'trigger_handle_duplicates',
    'set_week_start_date_on_insert'
)
ORDER BY proname;

-- トリガーの確認
SELECT 
    tgname as trigger_name,
    tgrelid::regclass as table_name,
    CASE tgtype & 66
        WHEN 2 THEN 'BEFORE'
        WHEN 64 THEN 'AFTER'
        ELSE 'OTHER'
    END as trigger_timing,
    CASE tgtype & 28
        WHEN 4 THEN 'INSERT'
        WHEN 8 THEN 'DELETE'
        WHEN 16 THEN 'UPDATE'
        WHEN 20 THEN 'INSERT, UPDATE'
        WHEN 28 THEN 'INSERT, UPDATE, DELETE'
        ELSE 'OTHER'
    END as trigger_events
FROM pg_trigger 
WHERE tgrelid = 'ranking_books'::regclass
  AND NOT tgisinternal
ORDER BY tgname;