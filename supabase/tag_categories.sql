-- タグ分類構造の定義
-- 大分類 > 小分類の階層構造

-- タグ分類マスターテーブル
CREATE TABLE IF NOT EXISTS tag_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- タグ分類マッピングテーブル
CREATE TABLE IF NOT EXISTS tag_category_mappings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tag_name VARCHAR(100) NOT NULL,
  category_name VARCHAR(100) NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tag_name, category_name)
);

-- 大分類の挿入
INSERT INTO tag_categories (name, description, display_order) VALUES
('ジャンルタグ', '書籍のジャンルを表すタグ', 1),
('知識・教養タグ', '知識や教養に関連するタグ', 2),
('スキル・能力タグ', 'スキルや能力向上に関連するタグ', 3),
('自己成長タグ', '自己成長やメンタルヘルスに関連するタグ', 4),
('リラックス・娯楽タグ', 'リラックスや娯楽に関連するタグ', 5),
('人物タグ', '特定の人物に関連するタグ', 6),
('企業・組織タグ', '企業や組織に関連するタグ', 7),
('技術・ITタグ', '技術やITに関連するタグ', 8),
('社会・問題タグ', '社会問題や社会現象に関連するタグ', 9),
('その他タグ', 'その他の分類に属さないタグ', 10);

-- タグ分類マッピングの挿入
INSERT INTO tag_category_mappings (tag_name, category_name, display_order) VALUES
-- ジャンルタグ
('自己啓発', 'ジャンルタグ', 1),
('ビジネス', 'ジャンルタグ', 2),
('心理学', 'ジャンルタグ', 3),
('哲学', 'ジャンルタグ', 4),
('歴史', 'ジャンルタグ', 5),
('科学', 'ジャンルタグ', 6),
('健康', 'ジャンルタグ', 7),
('小説', 'ジャンルタグ', 8),
('SF', 'ジャンルタグ', 9),
('ファッション', 'ジャンルタグ', 10),
('映画', 'ジャンルタグ', 11),
('経済', 'ジャンルタグ', 12),
('投資', 'ジャンルタグ', 13),
('政治', 'ジャンルタグ', 14),
('社会学', 'ジャンルタグ', 15),
('子育て', 'ジャンルタグ', 16),
('経営', 'ジャンルタグ', 17),
('リーダーシップ', 'ジャンルタグ', 18),
('建築', 'ジャンルタグ', 19),
('物理', 'ジャンルタグ', 20),
('食事', 'ジャンルタグ', 21),
('洋書', 'ジャンルタグ', 22),
('技術', 'ジャンルタグ', 23),
('労働', 'ジャンルタグ', 24),

-- 知識・教養タグ
('教養', '知識・教養タグ', 1),
('社会問題', '知識・教養タグ', 2),
('人類学', '知識・教養タグ', 3),
('数学', '知識・教養タグ', 4),
('暗号', '知識・教養タグ', 5),
('ヴィンテージ', '知識・教養タグ', 6),
('SDGs', '知識・教養タグ', 7),
('ノーベル賞受賞者', '知識・教養タグ', 8),
('リスキリング', '知識・教養タグ', 9),

-- スキル・能力タグ
('スキルアップ', 'スキル・能力タグ', 1),
('プレゼンテーション', 'スキル・能力タグ', 2),
('データ分析', 'スキル・能力タグ', 3),
('統計', 'スキル・能力タグ', 4),
('コミュニケーション', 'スキル・能力タグ', 5),
('入門書', 'スキル・能力タグ', 6),
('思考法', 'スキル・能力タグ', 7),
('問題解決', 'スキル・能力タグ', 8),
('デザイン', 'スキル・能力タグ', 9),
('ファシリテーション', 'スキル・能力タグ', 10),
('マネージャー', 'スキル・能力タグ', 11),
('プロダクト開発', 'スキル・能力タグ', 12),
('プロセス', 'スキル・能力タグ', 13),
('計画', 'スキル・能力タグ', 14),
('チーム', 'スキル・能力タグ', 15),
('組織', 'スキル・能力タグ', 16),

-- 自己成長タグ
('成功法則', '自己成長タグ', 1),
('習慣', '自己成長タグ', 2),
('人生論', '自己成長タグ', 3),
('アドラー心理学', '自己成長タグ', 4),
('成長', '自己成長タグ', 5),
('セルフケア', '自己成長タグ', 6),
('未来', '自己成長タグ', 7),
('ライフスタイル', '自己成長タグ', 8),

-- リラックス・娯楽タグ
('マンガ', 'リラックス・娯楽タグ', 1),
('エンタメ', 'リラックス・娯楽タグ', 2),
('文学', 'リラックス・娯楽タグ', 3),
('アイドル', 'リラックス・娯楽タグ', 4),
('本屋大賞', 'リラックス・娯楽タグ', 5),

-- 人物タグ
('江副浩正', '人物タグ', 1),
('藤田晋', '人物タグ', 2),
('堀江貴文', '人物タグ', 3),
('宇野康秀', '人物タグ', 4),
('三木谷浩史', '人物タグ', 5),
('山田進太郎', '人物タグ', 6),
('熊谷正寿', '人物タグ', 7),
('柳井正', '人物タグ', 8),
('見城徹', '人物タグ', 9),
('草彅剛', '人物タグ', 10),
('ピーターティール', '人物タグ', 11),
('岸見一郎', '人物タグ', 12),
('スティーブン・R・コヴィー', '人物タグ', 13),
('デール・カーネギー', '人物タグ', 14),
('吉野源三郎', '人物タグ', 15),
('ハンス・ロスリング', '人物タグ', 16),
('ユヴァル・ノア・ハラリ', '人物タグ', 17),
('伊藤羊一', '人物タグ', 18),
('リンダ・グラットン', '人物タグ', 19),
('小澤隆生', '人物タグ', 20),
('蛯谷 敏', '人物タグ', 21),

-- 企業・組織タグ
('リクルート', '企業・組織タグ', 1),
('サイバーエージェント', '企業・組織タグ', 2),
('ライブドア', '企業・組織タグ', 3),
('楽天', '企業・組織タグ', 4),
('メルカリ', '企業・組織タグ', 5),
('GMO', '企業・組織タグ', 6),
('ファーストリテイリング', '企業・組織タグ', 7),
('LINEヤフー', '企業・組織タグ', 8),
('ビズリーチ', '企業・組織タグ', 9),
('Apple', '企業・組織タグ', 10),
('パタゴニア', '企業・組織タグ', 11),
('PayPal', '企業・組織タグ', 12),
('Harvard Business Review', '企業・組織タグ', 13),
('PMI', '企業・組織タグ', 14),

-- 技術・ITタグ
('IT', '技術・ITタグ', 1),
('エンジニアリング', '技術・ITタグ', 2),
('アジャイル', '技術・ITタグ', 3),
('DevOps', '技術・ITタグ', 4),

-- 社会・問題タグ
('労働問題', '社会・問題タグ', 1),

-- その他タグ
('起業家', 'その他タグ', 1),
('ビジネス書', 'その他タグ', 2),
('事業開発', 'その他タグ', 3),
('アパレル業界', 'その他タグ', 4),
('イタリアファッションアイコン', 'その他タグ', 5),
('労働問題', 'その他タグ', 6),
('朝日文庫', 'その他タグ', 7),
('中公文庫', 'その他タグ', 8),
('創元推理文庫', 'その他タグ', 9),
('創元文芸文庫', 'その他タグ', 10),
('文春文庫', 'その他タグ', 11),
('角川文庫', 'その他タグ', 12),
('新潮文庫', 'その他タグ', 13),
('講談社文庫', 'その他タグ', 14),
('光文社文庫', 'その他タグ', 15),
('小学館文庫', 'その他タグ', 16),
('双葉文庫', 'その他タグ', 17),
('ハヤカワ文庫SF', 'その他タグ', 18),
('ハヤカワ文庫JA', 'その他タグ', 19),
('ちくま文庫', 'その他タグ', 20),
('集英社新書', 'その他タグ', 21),
('新潮新書', 'その他タグ', 22),
('講談社現代新書', 'その他タグ', 23),
('きずな出版', 'その他タグ', 24),
('日本経済新聞出版', 'その他タグ', 25),
('幻冬舎文庫', 'その他タグ', 26),
('文春e-book', 'その他タグ', 27),
('集英社文庫', 'その他タグ', 28);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_tag_categories_name ON tag_categories (name);
CREATE INDEX IF NOT EXISTS idx_tag_categories_display_order ON tag_categories (display_order);
CREATE INDEX IF NOT EXISTS idx_tag_category_mappings_tag_name ON tag_category_mappings (tag_name);
CREATE INDEX IF NOT EXISTS idx_tag_category_mappings_category_name ON tag_category_mappings (category_name);
CREATE INDEX IF NOT EXISTS idx_tag_category_mappings_display_order ON tag_category_mappings (display_order);

-- 更新日時の自動更新トリガー
CREATE TRIGGER update_tag_categories_updated_at 
    BEFORE UPDATE ON tag_categories 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tag_category_mappings_updated_at 
    BEFORE UPDATE ON tag_category_mappings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) 設定
ALTER TABLE tag_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tag_category_mappings ENABLE ROW LEVEL SECURITY;

-- Tag Categories: 読み取り権限（全ユーザー）
CREATE POLICY "Tag categories are viewable by everyone" 
ON tag_categories FOR SELECT 
USING (true);

-- Tag Categories: 書き込み権限（認証済みユーザーのみ）
CREATE POLICY "Tag categories are editable by authenticated users" 
ON tag_categories FOR ALL 
USING (auth.role() = 'authenticated');

-- Tag Category Mappings: 読み取り権限（全ユーザー）
CREATE POLICY "Tag category mappings are viewable by everyone" 
ON tag_category_mappings FOR SELECT 
USING (true);

-- Tag Category Mappings: 書き込み権限（認証済みユーザーのみ）
CREATE POLICY "Tag category mappings are editable by authenticated users" 
ON tag_category_mappings FOR ALL 
USING (auth.role() = 'authenticated');
