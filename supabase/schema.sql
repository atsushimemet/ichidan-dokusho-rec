-- 書籍テーブル
CREATE TABLE IF NOT EXISTS books (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  genre_tags TEXT[] NOT NULL DEFAULT '{}',
  amazon_link TEXT NOT NULL,
  summary_link TEXT,
  cover_image_url TEXT,
  description TEXT,
  difficulty_level VARCHAR(20) CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')) NOT NULL DEFAULT 'beginner',
  reading_time_hours INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 更新日時の自動更新トリガー
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

-- インデックス作成（検索パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_books_genre_tags ON books USING GIN (genre_tags);
CREATE INDEX IF NOT EXISTS idx_books_difficulty_level ON books (difficulty_level);
CREATE INDEX IF NOT EXISTS idx_books_title ON books (title);
CREATE INDEX IF NOT EXISTS idx_books_author ON books (author);

-- Row Level Security (RLS) 設定
ALTER TABLE books ENABLE ROW LEVEL SECURITY;

-- 読み取り権限（全ユーザー）
CREATE POLICY "Books are viewable by everyone" 
ON books FOR SELECT 
USING (true);

-- 書き込み権限（認証済みユーザーのみ）
CREATE POLICY "Books are editable by authenticated users" 
ON books FOR ALL 
USING (auth.role() = 'authenticated');

-- サンプルデータの挿入
INSERT INTO books (title, author, genre_tags, amazon_link, description, difficulty_level, reading_time_hours) VALUES
('人を動かす', 'デール・カーネギー', ARRAY['自己啓発', 'コミュニケーション', 'ビジネス'], 'https://amazon.co.jp/dp/4422100513', '人間関係の古典的名著。人を動かす3つの基本原則から始まり、人に好かれる6つの原則、人を説得する12の原則などを具体的なエピソードとともに紹介。', 'beginner', 8),
('7つの習慣', 'スティーブン・R・コヴィー', ARRAY['自己啓発', 'ビジネス', '成功法則'], 'https://amazon.co.jp/dp/4863940246', '世界的ベストセラー。私的成功から公的成功へと導く7つの習慣を体系的に解説。効果的な人生を送るための原則が学べる。', 'intermediate', 12),
('LIFE SHIFT', 'リンダ・グラットン', ARRAY['キャリア', 'ビジネス', '未来', 'ライフスタイル'], 'https://amazon.co.jp/dp/4492533879', '100年時代の人生戦略。長寿化により変化する人生設計について、具体的な戦略とともに解説。', 'intermediate', 10),
('サピエンス全史', 'ユヴァル・ノア・ハラリ', ARRAY['歴史', '哲学', '人類学', '教養'], 'https://amazon.co.jp/dp/430922671X', '人類の歴史を俯瞰的に捉えた壮大な物語。農業革命、科学革命、産業革命を経て現代に至る人類の歩みを描く。', 'advanced', 15),
('1分で話せ', '伊藤羊一', ARRAY['コミュニケーション', 'ビジネス', 'プレゼンテーション'], 'https://amazon.co.jp/dp/4797395230', '相手に伝わる話し方の技術。1分で要点を伝える方法を具体的に解説。', 'beginner', 4),
('君たちはどう生きるか', '吉野源三郎', ARRAY['哲学', '教養', '成長', '人生論'], 'https://amazon.co.jp/dp/4006000017', '人生の指針となる名著。主人公コペル君の成長を通して、人としての生き方を考えさせられる。', 'beginner', 6),
('嫌われる勇気', '岸見一郎', ARRAY['心理学', '自己啓発', 'アドラー心理学'], 'https://amazon.co.jp/dp/4478025819', 'アドラー心理学を分かりやすく解説。対人関係の悩みを解決する考え方を哲人と青年の対話形式で学ぶ。', 'beginner', 5),
('ファクトフルネス', 'ハンス・ロスリング', ARRAY['データ分析', '教養', '社会問題', '統計'], 'https://amazon.co.jp/dp/4822289605', 'データに基づいて世界を正しく見る方法。思い込みを排除し、事実に基づいた判断をするための10の本能について。', 'intermediate', 8),
('マンガでわかる心理学', 'ポーポー・ポロダクション', ARRAY['心理学', 'マンガ', '入門書'], 'https://amazon.co.jp/dp/4797344010', '心理学の基本をマンガで楽しく学べる入門書。日常生活に活かせる心理学の知識が満載。', 'beginner', 3),
('Think clearly', 'ロルフ・ドベリ', ARRAY['思考法', '自己啓発', '哲学'], 'https://amazon.co.jp/dp/4763137395', 'より良い人生を送るための52の思考法。シンプルで実践的な人生の指針。', 'intermediate', 7);