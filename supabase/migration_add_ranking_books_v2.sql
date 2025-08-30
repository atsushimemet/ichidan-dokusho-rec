-- ランキング書籍テーブル（v2: ASIN対応版）
CREATE TABLE IF NOT EXISTS ranking_books (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  genre_tags TEXT[] NOT NULL DEFAULT '{}',
  amazon_link TEXT NOT NULL,
  asin VARCHAR(20), -- Amazon Standard Identification Number
  summary_link TEXT,
  description TEXT,
  page_count INTEGER,
  price DECIMAL(10,2),
  ranking_source VARCHAR(100) NOT NULL, -- ランキング元
  is_visible BOOLEAN DEFAULT true, -- 表示/非表示フラグ
  week_start_date DATE NOT NULL, -- 当該週の開始日（月曜日）
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 更新日時の自動更新トリガー
CREATE TRIGGER update_ranking_books_updated_at 
    BEFORE UPDATE ON ranking_books 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_ranking_books_ranking_source ON ranking_books (ranking_source);
CREATE INDEX IF NOT EXISTS idx_ranking_books_week_start_date ON ranking_books (week_start_date);
CREATE INDEX IF NOT EXISTS idx_ranking_books_is_visible ON ranking_books (is_visible);
CREATE INDEX IF NOT EXISTS idx_ranking_books_amazon_link ON ranking_books (amazon_link);
CREATE INDEX IF NOT EXISTS idx_ranking_books_asin ON ranking_books (asin);
CREATE INDEX IF NOT EXISTS idx_ranking_books_title ON ranking_books (title);
CREATE INDEX IF NOT EXISTS idx_ranking_books_author ON ranking_books (author);

-- RLS設定
ALTER TABLE ranking_books ENABLE ROW LEVEL SECURITY;

-- Ranking Books: 読み取り権限（全ユーザー）
CREATE POLICY "Ranking books are viewable by everyone" 
ON ranking_books FOR SELECT 
USING (true);

-- Ranking Books: 書き込み権限（認証済みユーザーのみ）
CREATE POLICY "Ranking books are editable by authenticated users" 
ON ranking_books FOR ALL 
USING (auth.role() = 'authenticated');

-- 週の開始日を取得する関数（月曜日）
CREATE OR REPLACE FUNCTION get_week_start_date(input_date DATE DEFAULT CURRENT_DATE)
RETURNS DATE AS $$
BEGIN
  -- ISO週の月曜日を返す（月曜日=1、日曜日=7）
  RETURN input_date - (EXTRACT(dow FROM input_date)::integer + 6) % 7;
END;
$$ LANGUAGE plpgsql;

-- 重複チェック関数
CREATE OR REPLACE FUNCTION check_and_handle_duplicates(
  p_amazon_link TEXT,
  p_week_start_date DATE
) RETURNS VOID AS $$
DECLARE
  latest_record_id UUID;
BEGIN
  -- 同一週、同一Amazonリンクの最新レコードを取得
  SELECT id INTO latest_record_id
  FROM ranking_books 
  WHERE amazon_link = p_amazon_link 
    AND week_start_date = p_week_start_date
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF latest_record_id IS NOT NULL THEN
    -- 最新レコード以外を非表示にする
    UPDATE ranking_books 
    SET is_visible = false, updated_at = NOW()
    WHERE amazon_link = p_amazon_link 
      AND week_start_date = p_week_start_date
      AND id != latest_record_id;
    
    -- 最新レコードを表示にする
    UPDATE ranking_books 
    SET is_visible = true, updated_at = NOW()
    WHERE id = latest_record_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- トリガー：挿入・更新時の重複チェック
CREATE OR REPLACE FUNCTION trigger_handle_duplicates()
RETURNS TRIGGER AS $$
BEGIN
  -- 重複処理を実行
  PERFORM check_and_handle_duplicates(NEW.amazon_link, NEW.week_start_date);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ranking_books_duplicate_check
  AFTER INSERT OR UPDATE ON ranking_books
  FOR EACH ROW
  EXECUTE FUNCTION trigger_handle_duplicates();

-- ランキング元のマスターデータ
CREATE TABLE IF NOT EXISTS ranking_sources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  category VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ランキング元初期データ
INSERT INTO ranking_sources (name, display_name, category, display_order) VALUES
('tsutaya_bunko', 'TSUTAYA 文庫', '文庫', 1),
('maruzen_business', '丸善 経済・ビジネス', 'ビジネス', 2),
('junkudo_business', 'ジュンク堂 経済・ビジネス', 'ビジネス', 3),
('bunkyodo_business', '文教堂 経済・ビジネス', 'ビジネス', 4),
('kinokuniya_general', '紀伊國屋 総合', '総合', 5),
('miraiya_bunko', '未来屋書店 文庫', '文庫', 6),
('miraiya_business', '未来屋書店 ビジネス', 'ビジネス', 7),
('miraiya_literature', '未来屋書店 文芸', '文芸', 8),
('yurindo_business', '有隣堂 ビジネス', 'ビジネス', 9),
('yurindo_bunko', '有隣堂 文庫', '文庫', 10),
('amazon_bestseller', 'Amazon 売れ筋ランキング', '総合', 11);

-- RLS設定
ALTER TABLE ranking_sources ENABLE ROW LEVEL SECURITY;

-- Ranking Sources: 読み取り権限（全ユーザー）
CREATE POLICY "Ranking sources are viewable by everyone" 
ON ranking_sources FOR SELECT 
USING (true);

-- Ranking Sources: 書き込み権限（認証済みユーザーのみ）
CREATE POLICY "Ranking sources are editable by authenticated users" 
ON ranking_sources FOR ALL 
USING (auth.role() = 'authenticated');

-- ASIN から Amazon 画像URL を生成する関数
CREATE OR REPLACE FUNCTION get_amazon_image_url(asin_code TEXT, size TEXT DEFAULT 'L')
RETURNS TEXT AS $$
BEGIN
  IF asin_code IS NULL OR asin_code = '' THEN
    RETURN NULL;
  END IF;
  
  -- Amazon の商品画像URL形式
  -- サイズ: S(小), M(中), L(大)
  RETURN 'https://images-na.ssl-images-amazon.com/images/P/' || asin_code || '.01.' || size || '.jpg';
END;
$$ LANGUAGE plpgsql;