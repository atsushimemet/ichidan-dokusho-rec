-- 適切なRLSポリシーの復元
-- Supabase認証システムに対応したセキュアなポリシー設定

-- 一時的なポリシーを削除
DROP POLICY IF EXISTS "Books are editable by everyone (temporary)" ON books;
DROP POLICY IF EXISTS "Genre tags are editable by everyone (temporary)" ON genre_tags;
DROP POLICY IF EXISTS "Question mappings are editable by everyone (temporary)" ON question_mappings;

-- 適切なポリシーを再作成

-- Books テーブル
CREATE POLICY "Books are viewable by everyone" 
ON books FOR SELECT 
USING (true);

CREATE POLICY "Books are editable by authenticated users" 
ON books FOR ALL 
USING (auth.role() = 'authenticated');

-- Genre Tags テーブル
CREATE POLICY "Genre tags are viewable by everyone" 
ON genre_tags FOR SELECT 
USING (true);

CREATE POLICY "Genre tags are editable by authenticated users" 
ON genre_tags FOR ALL 
USING (auth.role() = 'authenticated');

-- Question Mappings テーブル
CREATE POLICY "Question mappings are viewable by everyone" 
ON question_mappings FOR SELECT 
USING (true);

CREATE POLICY "Question mappings are editable by authenticated users" 
ON question_mappings FOR ALL 
USING (auth.role() = 'authenticated');

-- Tag Categories テーブル（存在する場合）
DROP POLICY IF EXISTS "Tag categories are editable by everyone (temporary)" ON tag_categories;
DROP POLICY IF EXISTS "Tag category mappings are editable by everyone (temporary)" ON tag_category_mappings;

-- Tag Categories の適切なポリシー
CREATE POLICY "Tag categories are viewable by everyone" 
ON tag_categories FOR SELECT 
USING (true);

CREATE POLICY "Tag categories are editable by authenticated users" 
ON tag_categories FOR ALL 
USING (auth.role() = 'authenticated');

CREATE POLICY "Tag category mappings are viewable by everyone" 
ON tag_category_mappings FOR SELECT 
USING (true);

CREATE POLICY "Tag category mappings are editable by authenticated users" 
ON tag_category_mappings FOR ALL 
USING (auth.role() = 'authenticated');

-- 確認用: ポリシー一覧を表示
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename IN ('books', 'genre_tags', 'question_mappings', 'tag_categories', 'tag_category_mappings')
ORDER BY tablename, policyname;