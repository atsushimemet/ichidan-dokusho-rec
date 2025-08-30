-- 紹介者（Introducer）テーブルの作成
-- 作成日: 2025-01-30
-- 説明: 書籍の紹介者情報を管理するテーブル

-- pg_trgm拡張が有効になっているか確認（部分一致検索用）
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 紹介者テーブル
CREATE TABLE IF NOT EXISTS public.introducers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  profile_url TEXT,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- 更新日時の自動更新トリガー
CREATE TRIGGER update_introducers_updated_at 
    BEFORE UPDATE ON public.introducers 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- インデックスの作成
-- 名前の部分一致検索用（PGTrgm GIN インデックス）
CREATE INDEX IF NOT EXISTS idx_introducers_name ON public.introducers USING gin (name gin_trgm_ops);

-- 説明の部分一致検索用（PGTrgm GIN インデックス）
CREATE INDEX IF NOT EXISTS idx_introducers_description ON public.introducers USING gin (description gin_trgm_ops);

-- アクティブ状態のインデックス
CREATE INDEX IF NOT EXISTS idx_introducers_is_active ON public.introducers (is_active);

-- 作成日時のインデックス
CREATE INDEX IF NOT EXISTS idx_introducers_created_at ON public.introducers (created_at DESC);

-- 制約の追加
-- プロフィールURLのバリデーション（http/httpsのみ許可）
ALTER TABLE public.introducers ADD CONSTRAINT chk_introducers_profile_url
  CHECK (profile_url IS NULL OR profile_url ~* '^(https?)://');

-- 名前の長さ制限（1〜100文字）
ALTER TABLE public.introducers ADD CONSTRAINT chk_introducers_name_length
  CHECK (char_length(name) >= 1 AND char_length(name) <= 100);

-- 説明の長さ制限（0〜300文字）
ALTER TABLE public.introducers ADD CONSTRAINT chk_introducers_description_length
  CHECK (description IS NULL OR char_length(description) <= 300);

-- Row Level Security (RLS) の設定
ALTER TABLE public.introducers ENABLE ROW LEVEL SECURITY;

-- 読み取り権限（全ユーザー）- 公開データとして閲覧可能
CREATE POLICY "introducers_select_public" ON public.introducers
  FOR SELECT
  USING (true);

-- 書き込み権限（Admin権限を持つユーザーのみ）
-- user_rolesテーブルでadmin権限を確認
CREATE POLICY "introducers_write_admin" ON public.introducers
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- コメント追加
COMMENT ON TABLE public.introducers IS '書籍の紹介者情報を管理するテーブル';
COMMENT ON COLUMN public.introducers.id IS '紹介者ID（UUID）';
COMMENT ON COLUMN public.introducers.name IS '紹介者名（必須、1-100文字）';
COMMENT ON COLUMN public.introducers.profile_url IS 'プロフィールURL（任意、http/httpsのみ）';
COMMENT ON COLUMN public.introducers.description IS '紹介者の説明（任意、最大300文字）';
COMMENT ON COLUMN public.introducers.is_active IS 'アクティブ状態（デフォルト：true）';
COMMENT ON COLUMN public.introducers.created_at IS '作成日時';
COMMENT ON COLUMN public.introducers.updated_at IS '更新日時';
COMMENT ON COLUMN public.introducers.created_by IS '作成者（auth.usersテーブルの参照）';

-- サンプルデータの挿入（開発・テスト用）
INSERT INTO public.introducers (name, profile_url, description, is_active) VALUES
('池上彰', 'https://www.tv-asahi.co.jp/ikegami/', 'ジャーナリスト。複雑なニュースをわかりやすく解説することで知られる。教育番組の司会も多数担当。', true),
('佐藤優', 'https://ja.wikipedia.org/wiki/佐藤優_(作家)', '元外務省主任分析官、作家。国際情勢分析や教養書の執筆で活躍。幅広い知識と独自の視点で書籍を紹介。', true),
('林修', 'https://www.watanabepro.co.jp/mypage/artist/hayashiosamu.html', '予備校講師、タレント。「いつやるか？今でしょ！」で有名。教育関連の書籍紹介に定評がある。', true),
('中田敦彦', 'https://www.youtube.com/c/NakataUniversity', 'お笑い芸人、教育系YouTuber。「中田敦彦のYouTube大学」で様々な書籍を分かりやすく解説。', true),
('メンタリストDaiGo', 'https://daigo.me/', 'メンタリスト、作家。心理学や科学的根拠に基づいた書籍の紹介で人気。効率的な学習法も提案。', true),
('ひろゆき', 'https://twitter.com/hiroyuki_ni', '実業家、論破王。独特の視点で社会問題や哲学書を紹介。辛口コメントでも知られる。', true),
('本要約チャンネル', 'https://www.youtube.com/c/本要約チャンネル', 'YouTubeチャンネル。ビジネス書や自己啓発書の要約を分かりやすくアニメーション動画で紹介。', true),
('読書猿', 'https://readingmonkey.blog.fc2.com/', 'ブロガー、作家。「独学大全」の著者。学習法や読書術に関する深い知識で書籍を紹介。', true)
ON CONFLICT DO NOTHING;

-- 将来的な拡張用テーブル（MVP外、参考用コメント）
-- 書籍と紹介者の中間テーブル（多対多関係）
/*
CREATE TABLE IF NOT EXISTS public.book_introducers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  introducer_id UUID NOT NULL REFERENCES public.introducers(id) ON DELETE CASCADE,
  note TEXT, -- 紹介コメントやメモ
  recommended_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(book_id, introducer_id)
);

CREATE INDEX IF NOT EXISTS idx_book_introducers_book_id ON public.book_introducers (book_id);
CREATE INDEX IF NOT EXISTS idx_book_introducers_introducer_id ON public.book_introducers (introducer_id);
*/