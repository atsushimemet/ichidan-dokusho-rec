-- 書籍テーブルに不足しているカラムを追加するマイグレーション
-- 実行日: 2024年用
-- 対象: difficulty_level, reading_time_hours カラムの追加

-- 1. difficulty_level カラムの追加
-- 難易度レベル: 'beginner', 'intermediate', 'advanced'
DO $$
BEGIN
    -- カラムが存在しない場合のみ追加
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'books' 
        AND column_name = 'difficulty_level'
    ) THEN
        ALTER TABLE books 
        ADD COLUMN difficulty_level VARCHAR(20) 
        CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced'))
        DEFAULT 'beginner';
        
        RAISE NOTICE 'difficulty_level カラムを追加しました';
    ELSE
        RAISE NOTICE 'difficulty_level カラムは既に存在します';
    END IF;
END
$$;

-- 2. reading_time_hours カラムの追加
-- 読書時間（時間単位）
DO $$
BEGIN
    -- カラムが存在しない場合のみ追加
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'books' 
        AND column_name = 'reading_time_hours'
    ) THEN
        ALTER TABLE books 
        ADD COLUMN reading_time_hours DECIMAL(4,1)
        CHECK (reading_time_hours > 0);
        
        RAISE NOTICE 'reading_time_hours カラムを追加しました';
    ELSE
        RAISE NOTICE 'reading_time_hours カラムは既に存在します';
    END IF;
END
$$;

-- 3. 既存データのdifficulty_levelをジャンルベースで設定
UPDATE books 
SET difficulty_level = CASE 
    WHEN '入門書' = ANY(genre_tags) OR 'マンガ' = ANY(genre_tags) THEN 'beginner'
    WHEN '哲学' = ANY(genre_tags) OR '歴史' = ANY(genre_tags) OR '科学' = ANY(genre_tags) THEN 'advanced'
    ELSE 'intermediate'
END
WHERE difficulty_level = 'beginner'; -- デフォルト値のものだけ更新

-- 4. インデックスの作成（検索性能向上）
CREATE INDEX IF NOT EXISTS idx_books_difficulty_level ON books(difficulty_level);

-- 5. 確認用クエリ
SELECT 
    'カラム追加完了' as status,
    COUNT(*) as total_books,
    COUNT(CASE WHEN difficulty_level = 'beginner' THEN 1 END) as beginner_count,
    COUNT(CASE WHEN difficulty_level = 'intermediate' THEN 1 END) as intermediate_count,
    COUNT(CASE WHEN difficulty_level = 'advanced' THEN 1 END) as advanced_count
FROM books;

-- 6. スキーマ確認
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'books' 
AND column_name IN ('difficulty_level', 'reading_time_hours')
ORDER BY column_name;