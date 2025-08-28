-- アーカイブ記事テーブルの作成
-- Good Archives機能用のテーブル

-- アーカイブテーブル
CREATE TABLE IF NOT EXISTS archives (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  link TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_archives_title ON archives (title);
CREATE INDEX IF NOT EXISTS idx_archives_created_at ON archives (created_at);

-- 更新日時の自動更新トリガーを追加
CREATE TRIGGER update_archives_updated_at
    BEFORE UPDATE ON archives
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) ポリシーの設定
ALTER TABLE archives ENABLE ROW LEVEL SECURITY;

-- 全てのユーザーが読み取り可能（記事の閲覧は誰でも）
CREATE POLICY "Enable read access for all users" ON archives
    FOR SELECT USING (true);

-- 認証されたユーザーのみが記事を作成・更新・削除可能（管理者のみ）
CREATE POLICY "Enable insert for authenticated users only" ON archives
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON archives
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON archives
    FOR DELETE USING (auth.role() = 'authenticated');

-- 初期データの挿入（サンプルデータ）
INSERT INTO archives (title, link, description) VALUES
  ('村上春樹の文学世界を探る', 'https://example.com/articles/haruki-murakami-analysis', '現代日本文学の巨匠・村上春樹の作品に見られる幻想的リアリズムと現代社会への洞察について深く掘り下げた記事です。'),
  ('江戸時代の読書文化', 'https://example.com/articles/edo-reading-culture', '江戸時代における庶民の読書習慣と貸本屋の発展について、当時の資料を基に詳細に解説しています。'),
  ('科学書の読み方・選び方', 'https://example.com/articles/how-to-read-science-books', '専門的な科学書を効率的に読むためのテクニックと、レベル別おすすめ書籍の紹介をまとめた実践的ガイドです。'),
  ('デジタル時代の読書論', 'https://example.com/articles/reading-in-digital-age', '電子書籍とスマートフォンが普及した現代において、読書体験がどう変化しているかを考察した論考です。'),
  ('古典文学入門ガイド', 'https://example.com/articles/classical-literature-guide', '源氏物語から枕草子まで、日本古典文学の魅力と現代での読み方について、初心者にも分かりやすく解説しています。'),
  ('翻訳文学の楽しみ方', 'https://example.com/articles/enjoying-translated-literature', '海外文学を日本語で楽しむ際のポイントと、優れた翻訳者たちの仕事について詳しく紹介した記事です。'),
  ('ビジネス書の効果的な読書法', 'https://example.com/articles/business-book-reading-methods', 'ビジネス書から最大限の学びを得るための読書戦略と、実践的なノート術について解説しています。'),
  ('子どもの読書習慣を育てる', 'https://example.com/articles/cultivating-childrens-reading-habits', '幼児期から小学生まで、年齢に応じた読書指導の方法と、家庭でできる読書環境づくりのコツを紹介します。')
ON CONFLICT (id) DO NOTHING;

-- テーブル作成の確認用コメント
COMMENT ON TABLE archives IS 'Good Archives機能用の記事管理テーブル';
COMMENT ON COLUMN archives.title IS '記事のタイトル';
COMMENT ON COLUMN archives.link IS '記事へのリンクURL';
COMMENT ON COLUMN archives.description IS '記事の説明・概要';