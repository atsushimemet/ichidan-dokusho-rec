-- タグマスターテーブル
CREATE TABLE IF NOT EXISTS genre_tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  purpose_mapping TEXT[] DEFAULT '{}',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 質問マッピングテーブル
CREATE TABLE IF NOT EXISTS question_mappings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id VARCHAR(50) NOT NULL,
  question_type VARCHAR(20) NOT NULL,
  option_value VARCHAR(100) NOT NULL,
  mapped_tags TEXT[] NOT NULL DEFAULT '{}',
  weight DECIMAL(3,2) DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(question_id, option_value)
);

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
  page_count INTEGER,
  price DECIMAL(10,2),
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
CREATE INDEX IF NOT EXISTS idx_books_title ON books (title);
CREATE INDEX IF NOT EXISTS idx_books_author ON books (author);
CREATE INDEX IF NOT EXISTS idx_books_page_count ON books (page_count);
CREATE INDEX IF NOT EXISTS idx_books_price ON books (price);

-- タグマスター用インデックス
CREATE INDEX IF NOT EXISTS idx_genre_tags_category ON genre_tags (category);
CREATE INDEX IF NOT EXISTS idx_genre_tags_name ON genre_tags (name);
CREATE INDEX IF NOT EXISTS idx_genre_tags_display_order ON genre_tags (display_order);

-- 質問マッピング用インデックス
CREATE INDEX IF NOT EXISTS idx_question_mappings_question_id ON question_mappings (question_id);
CREATE INDEX IF NOT EXISTS idx_question_mappings_mapped_tags ON question_mappings USING GIN (mapped_tags);

-- Row Level Security (RLS) 設定
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

-- タグマスター初期データ
INSERT INTO genre_tags (name, description, category, display_order) VALUES
-- ジャンルタグ
('自己啓発', '成功法則、習慣形成、モチベーション', 'genre', 1),
('ビジネス', '経営、マーケティング、投資', 'genre', 2),
('心理学', '人間心理、コミュニケーション', 'genre', 3),
('哲学', '人生論、価値観、思考法', 'genre', 4),
('歴史', '世界史、日本史、社会問題', 'genre', 5),
('科学', 'IT、テクノロジー、自然科学', 'genre', 6),
('健康', '健康法、料理、ライフハック', 'genre', 7),
('小説', '純文学、エンタメ小説', 'genre', 8),

-- 目的関連タグ
('教養', '一般教養・知識向上', 'knowledge', 10),
('社会問題', '現代社会の課題', 'knowledge', 11),
('人類学', '人類の歴史と文化', 'knowledge', 12),
('スキルアップ', '技術・能力向上', 'skill', 20),
('プレゼンテーション', '発表・説明技術', 'skill', 21),
('データ分析', 'データ処理・分析', 'skill', 22),
('統計', '統計学・確率', 'skill', 23),
('成功法則', '成功のためのノウハウ', 'growth', 30),
('習慣', '習慣形成・改善', 'growth', 31),
('人生論', '人生観・価値観', 'growth', 32),
('アドラー心理学', 'アドラー心理学関連', 'growth', 33),
('マンガ', 'マンガ・コミック', 'relaxation', 40),
('エンタメ', 'エンターテイメント', 'relaxation', 41),
('文学', '純文学・古典', 'relaxation', 42),
('コミュニケーション', '人間関係・対話技術', 'common', 50),
('入門書', '初心者向け・わかりやすい', 'common', 51),
('思考法', '思考方法・論理', 'common', 52),
('未来', '将来・未来予測', 'common', 53),
('ライフスタイル', '生活・ライフスタイル', 'common', 54),
('成長', '個人的成長・発達', 'common', 55);

-- 質問マッピング初期データ
INSERT INTO question_mappings (question_id, question_type, option_value, mapped_tags) VALUES
-- 質問1: 読書の目的
('purpose', 'single', 'knowledge', ARRAY['教養', '歴史', '哲学', '科学', '社会問題', '人類学']),
('purpose', 'single', 'skill', ARRAY['ビジネス', 'スキルアップ', 'プレゼンテーション', 'データ分析', '統計']),
('purpose', 'single', 'growth', ARRAY['自己啓発', '成功法則', '習慣', '人生論', 'アドラー心理学', '心理学']),
('purpose', 'single', 'relaxation', ARRAY['小説', 'マンガ', 'エンタメ', '文学']),

-- 質問2: ジャンル選択（複数選択可）
('genre', 'multiple', '自己啓発', ARRAY['自己啓発', '成功法則', '習慣']),
('genre', 'multiple', 'ビジネス', ARRAY['ビジネス', 'スキルアップ', 'プレゼンテーション']),
('genre', 'multiple', '心理学', ARRAY['心理学', 'アドラー心理学', 'コミュニケーション']),
('genre', 'multiple', '哲学', ARRAY['哲学', '人生論', '思考法']),
('genre', 'multiple', '歴史', ARRAY['歴史', '社会問題', '人類学']),
('genre', 'multiple', '科学', ARRAY['科学', 'データ分析', '統計']),
('genre', 'multiple', '健康', ARRAY['健康', 'ライフスタイル']),
('genre', 'multiple', '小説', ARRAY['小説', '文学', 'エンタメ']);

-- 店舗テーブル
CREATE TABLE IF NOT EXISTS stores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  prefecture VARCHAR(50),
  city VARCHAR(100),
  sns_link TEXT,
  google_map_link TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 店舗テーブルの更新日時自動更新トリガー
CREATE TRIGGER update_stores_updated_at 
    BEFORE UPDATE ON stores 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 店舗用インデックス
CREATE INDEX IF NOT EXISTS idx_stores_name ON stores (name);
CREATE INDEX IF NOT EXISTS idx_stores_prefecture ON stores (prefecture);
CREATE INDEX IF NOT EXISTS idx_stores_city ON stores (city);

-- 店舗テーブルのRLS設定
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

-- Stores: 読み取り権限（全ユーザー）
CREATE POLICY "Stores are viewable by everyone" 
ON stores FOR SELECT 
USING (true);

-- Stores: 書き込み権限（認証済みユーザーのみ）
CREATE POLICY "Stores are editable by authenticated users" 
ON stores FOR ALL 
USING (auth.role() = 'authenticated');

-- 店舗サンプルデータの挿入
INSERT INTO stores (name, prefecture, city, sns_link, google_map_link, description) VALUES
('青山ブックセンター本店', '東京都', '港区', 'https://twitter.com/aoyamabc', 'https://maps.google.com/?q=青山ブックセンター本店', 'アート、デザイン、建築書に強い青山の老舗書店。'),
('蔦屋書店 代官山店', '東京都', '渋谷区', 'https://twitter.com/tsutaya_daikanyama', 'https://maps.google.com/?q=蔦屋書店代官山店', 'ライフスタイル提案型書店。カフェも併設された文化の発信地。'),
('SHIBUYA TSUTAYA', '東京都', '渋谷区', 'https://twitter.com/shibuya_tsutaya', 'https://maps.google.com/?q=SHIBUYA TSUTAYA', '渋谷の中心地にある大型書店。豊富な品揃えが自慢。'),
('丸善 丸の内本店', '東京都', '千代田区', 'https://twitter.com/maruzen_info', 'https://maps.google.com/?q=丸善丸の内本店', '明治2年創業の老舗書店。ビジネス書や専門書に定評。'),
('紀伊國屋書店 新宿本店', '東京都', '新宿区', 'https://twitter.com/kinokuniya_jp', 'https://maps.google.com/?q=紀伊國屋書店新宿本店', '新宿の老舗大型書店。あらゆるジャンルを網羅。'),
('有隣堂 横浜駅西口店', '神奈川県', '横浜市', 'https://twitter.com/yurindobooks', 'https://maps.google.com/?q=有隣堂横浜駅西口店', '横浜の老舗書店。地域密着型の品揃えが魅力。'),
('TSUTAYA 横浜みなとみらい店', '神奈川県', '横浜市', 'https://twitter.com/tsutaya_mm', 'https://maps.google.com/?q=TSUTAYA横浜みなとみらい店', 'みなとみらいの景色を楽しみながら本が読める。'),
('ブックファースト青葉台店', '神奈川県', '横浜市', 'https://twitter.com/bookfirst_aoba', 'https://maps.google.com/?q=ブックファースト青葉台店', '青葉台駅直結の便利な立地。幅広いジャンルの本を扱う。');

-- サンプルデータの挿入
INSERT INTO books (title, author, genre_tags, amazon_link, description, page_count, price) VALUES
('人を動かす', 'デール・カーネギー', ARRAY['自己啓発', 'コミュニケーション', 'ビジネス'], 'https://amazon.co.jp/dp/4422100513', '人間関係の古典的名著。人を動かす3つの基本原則から始まり、人に好かれる6つの原則、人を説得する12の原則などを具体的なエピソードとともに紹介。', 320, 1540),
('7つの習慣', 'スティーブン・R・コヴィー', ARRAY['自己啓発', 'ビジネス', '成功法則'], 'https://amazon.co.jp/dp/4863940246', '世界的ベストセラー。私的成功から公的成功へと導く7つの習慣を体系的に解説。効果的な人生を送るための原則が学べる。', 560, 2420),
('LIFE SHIFT', 'リンダ・グラットン', ARRAY['ビジネス', '未来', 'ライフスタイル'], 'https://amazon.co.jp/dp/4492533879', '100年時代の人生戦略。長寿化により変化する人生設計について、具体的な戦略とともに解説。', 399, 1980),
('サピエンス全史', 'ユヴァル・ノア・ハラリ', ARRAY['歴史', '哲学', '人類学', '教養'], 'https://amazon.co.jp/dp/430922671X', '人類の歴史を俯瞰的に捉えた壮大な物語。農業革命、科学革命、産業革命を経て現代に至る人類の歩みを描く。', 512, 2090),
('1分で話せ', '伊藤羊一', ARRAY['ビジネス', 'コミュニケーション', 'プレゼンテーション'], 'https://amazon.co.jp/dp/4797395230', '相手に伝わる話し方の技術。1分で要点を伝える方法を具体的に解説。', 240, 1540),
('君たちはどう生きるか', '吉野源三郎', ARRAY['哲学', '教養', '成長', '人生論'], 'https://amazon.co.jp/dp/4006000017', '人生の指針となる名著。主人公コペル君の成長を通して、人としての生き方を考えさせられる。', 318, 1045),
('嫌われる勇気', '岸見一郎', ARRAY['心理学', '自己啓発', 'アドラー心理学'], 'https://amazon.co.jp/dp/4478025819', 'アドラー心理学を分かりやすく解説。対人関係の悩みを解決する考え方を哲人と青年の対話形式で学ぶ。', 296, 1650),
('ファクトフルネス', 'ハンス・ロスリング', ARRAY['データ分析', '教養', '社会問題', '統計'], 'https://amazon.co.jp/dp/4822289605', 'データに基づいて世界を正しく見る方法。思い込みを排除し、事実に基づいた判断をするための10の本能について。', 400, 1800),
('マンガでわかる心理学', 'ポーポー・ポロダクション', ARRAY['心理学', 'マンガ', '入門書'], 'https://amazon.co.jp/dp/4797344010', '心理学の基本をマンガで楽しく学べる入門書。日常生活に活かせる心理学の知識が満載。', 192, 1430),
('Think clearly', 'ロルフ・ドベリ', ARRAY['思考法', '自己啓発', '哲学'], 'https://amazon.co.jp/dp/4763137395', 'より良い人生を送るための52の思考法。シンプルで実践的な人生の指針。', 288, 1760);