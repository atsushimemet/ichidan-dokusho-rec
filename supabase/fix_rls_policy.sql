-- 書籍データ更新問題の一時的な修正
-- RLSポリシーを調整して匿名ユーザーでも更新可能にする

-- 既存のポリシーを削除
DROP POLICY IF EXISTS "Books are editable by authenticated users" ON books;
DROP POLICY IF EXISTS "Genre tags are editable by authenticated users" ON genre_tags;
DROP POLICY IF EXISTS "Question mappings are editable by authenticated users" ON question_mappings;

-- 新しいポリシーを作成（一時的に全ユーザーに書き込み権限を付与）
CREATE POLICY "Books are editable by everyone (temporary)" 
ON books FOR ALL 
USING (true);

CREATE POLICY "Genre tags are editable by everyone (temporary)" 
ON genre_tags FOR ALL 
USING (true);

CREATE POLICY "Question mappings are editable by everyone (temporary)" 
ON question_mappings FOR ALL 
USING (true);

-- 注意: これは一時的な修正です
-- 本格的にはSupabase認証システムの導入を推奨します