-- 適切なRLSポリシーの復元（重複エラー修正版）
-- 既存のポリシーをすべて削除してから再作成

-- 既存のポリシーをすべて削除（READ/SELECT用も含む）
DROP POLICY IF EXISTS "Books are viewable by everyone" ON books;
DROP POLICY IF EXISTS "Books are editable by authenticated users" ON books;
DROP POLICY IF EXISTS "Books are editable by everyone (temporary)" ON books;

DROP POLICY IF EXISTS "Genre tags are viewable by everyone" ON genre_tags;
DROP POLICY IF EXISTS "Genre tags are editable by authenticated users" ON genre_tags;
DROP POLICY IF EXISTS "Genre tags are editable by everyone (temporary)" ON genre_tags;

DROP POLICY IF EXISTS "Question mappings are viewable by everyone" ON question_mappings;
DROP POLICY IF EXISTS "Question mappings are editable by authenticated users" ON question_mappings;
DROP POLICY IF EXISTS "Question mappings are editable by everyone (temporary)" ON question_mappings;

-- Tag Categories テーブル（存在する場合）
DROP POLICY IF EXISTS "Tag categories are viewable by everyone" ON tag_categories;
DROP POLICY IF EXISTS "Tag categories are editable by authenticated users" ON tag_categories;
DROP POLICY IF EXISTS "Tag categories are editable by everyone (temporary)" ON tag_categories;

DROP POLICY IF EXISTS "Tag category mappings are viewable by everyone" ON tag_category_mappings;
DROP POLICY IF EXISTS "Tag category mappings are editable by authenticated users" ON tag_category_mappings;
DROP POLICY IF EXISTS "Tag category mappings are editable by everyone (temporary)" ON tag_category_mappings;

-- 新しいポリシーを作成

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

-- Tag Categories テーブル（存在する場合のみ実行される）
DO $$
BEGIN
    -- tag_categories テーブルが存在するかチェック
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tag_categories') THEN
        EXECUTE 'CREATE POLICY "Tag categories are viewable by everyone" ON tag_categories FOR SELECT USING (true)';
        EXECUTE 'CREATE POLICY "Tag categories are editable by authenticated users" ON tag_categories FOR ALL USING (auth.role() = ''authenticated'')';
    END IF;
    
    -- tag_category_mappings テーブルが存在するかチェック
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tag_category_mappings') THEN
        EXECUTE 'CREATE POLICY "Tag category mappings are viewable by everyone" ON tag_category_mappings FOR SELECT USING (true)';
        EXECUTE 'CREATE POLICY "Tag category mappings are editable by authenticated users" ON tag_category_mappings FOR ALL USING (auth.role() = ''authenticated'')';
    END IF;
END
$$;

-- 成功メッセージ
SELECT 'RLSポリシーの復元が完了しました！' as status;

-- 確認用: ポリシー一覧を表示
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    cmd as command,
    CASE 
        WHEN cmd = 'SELECT' THEN '読み取り'
        WHEN cmd = 'ALL' THEN '全操作'
        ELSE cmd::text
    END as operation_type,
    qual as condition
FROM pg_policies 
WHERE tablename IN ('books', 'genre_tags', 'question_mappings', 'tag_categories', 'tag_category_mappings')
ORDER BY tablename, policyname;