-- 一段読書システム システム設定初期データ投入SQL

-- 1. インデックスの作成（パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_books_genre_tags ON books USING GIN (genre_tags);
CREATE INDEX IF NOT EXISTS idx_books_title ON books (title);
CREATE INDEX IF NOT EXISTS idx_books_author ON books (author);
CREATE INDEX IF NOT EXISTS idx_books_page_count ON books (page_count);
CREATE INDEX IF NOT EXISTS idx_books_price ON books (price);

CREATE INDEX IF NOT EXISTS idx_genre_tags_category ON genre_tags (category);
CREATE INDEX IF NOT EXISTS idx_genre_tags_name ON genre_tags (name);
CREATE INDEX IF NOT EXISTS idx_genre_tags_display_order ON genre_tags (display_order);

CREATE INDEX IF NOT EXISTS idx_question_mappings_question_id ON question_mappings (question_id);
CREATE INDEX IF NOT EXISTS idx_question_mappings_mapped_tags ON question_mappings USING GIN (mapped_tags);

-- 2. 更新日時の自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_books_updated_at 
    BEFORE UPDATE ON books 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_genre_tags_updated_at 
    BEFORE UPDATE ON genre_tags 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_question_mappings_updated_at 
    BEFORE UPDATE ON question_mappings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 3. Row Level Security (RLS) 設定
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE genre_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_mappings ENABLE ROW LEVEL SECURITY;

-- Books: 読み取り権限（全ユーザー）
CREATE POLICY "Books are viewable by everyone" 
ON books FOR SELECT 
USING (true);

-- Books: 書き込み権限（認証済みユーザーのみ）
CREATE POLICY "Books are editable by authenticated users" 
ON books FOR ALL 
USING (auth.role() = 'authenticated');

-- Genre Tags: 読み取り権限（全ユーザー）
CREATE POLICY "Genre tags are viewable by everyone" 
ON genre_tags FOR SELECT 
USING (true);

-- Genre Tags: 書き込み権限（認証済みユーザーのみ）
CREATE POLICY "Genre tags are editable by authenticated users" 
ON genre_tags FOR ALL 
USING (auth.role() = 'authenticated');

-- Question Mappings: 読み取り権限（全ユーザー）
CREATE POLICY "Question mappings are viewable by everyone" 
ON question_mappings FOR SELECT 
USING (true);

-- Question Mappings: 書き込み権限（認証済みユーザーのみ）
CREATE POLICY "Question mappings are editable by authenticated users" 
ON question_mappings FOR ALL 
USING (auth.role() = 'authenticated');
