-- 既存ポリシーの確実な削除と再作成

-- 1. 現在のポリシーを確認
SELECT 
  tablename, 
  policyname
FROM pg_policies 
WHERE tablename IN ('users', 'memos', 'quizzes', 'attempts', 'notification_logs')
ORDER BY tablename, policyname;

-- 2. 既存のパブリックアクセスポリシーを削除
DROP POLICY IF EXISTS "Public access for users" ON users;
DROP POLICY IF EXISTS "Public access for memos" ON memos;
DROP POLICY IF EXISTS "Public access for quizzes" ON quizzes;
DROP POLICY IF EXISTS "Public access for attempts" ON attempts;
DROP POLICY IF EXISTS "Public access for notification_logs" ON notification_logs;

-- 3. 他の可能性のあるポリシー名も削除
DROP POLICY IF EXISTS "Enable read access for all users" ON users;
DROP POLICY IF EXISTS "Enable insert for all users" ON users;
DROP POLICY IF EXISTS "Enable update for all users" ON users;
DROP POLICY IF EXISTS "Enable delete for all users" ON users;

DROP POLICY IF EXISTS "Enable read access for all users" ON memos;
DROP POLICY IF EXISTS "Enable insert for all users" ON memos;
DROP POLICY IF EXISTS "Enable update for all users" ON memos;
DROP POLICY IF EXISTS "Enable delete for all users" ON memos;

DROP POLICY IF EXISTS "Enable read access for all users" ON quizzes;
DROP POLICY IF EXISTS "Enable insert for all users" ON quizzes;
DROP POLICY IF EXISTS "Enable update for all users" ON quizzes;
DROP POLICY IF EXISTS "Enable delete for all users" ON quizzes;

DROP POLICY IF EXISTS "Enable read access for all users" ON attempts;
DROP POLICY IF EXISTS "Enable insert for all users" ON attempts;
DROP POLICY IF EXISTS "Enable update for all users" ON attempts;
DROP POLICY IF EXISTS "Enable delete for all users" ON attempts;

DROP POLICY IF EXISTS "Enable read access for all users" ON notification_logs;
DROP POLICY IF EXISTS "Enable insert for all users" ON notification_logs;
DROP POLICY IF EXISTS "Enable update for all users" ON notification_logs;
DROP POLICY IF EXISTS "Enable delete for all users" ON notification_logs;

-- 4. 新しいポリシーを作成（ユニークな名前で）
CREATE POLICY "allow_all_users_access" ON users FOR ALL USING (true);
CREATE POLICY "allow_all_memos_access" ON memos FOR ALL USING (true);
CREATE POLICY "allow_all_quizzes_access" ON quizzes FOR ALL USING (true);
CREATE POLICY "allow_all_attempts_access" ON attempts FOR ALL USING (true);
CREATE POLICY "allow_all_notification_logs_access" ON notification_logs FOR ALL USING (true);

-- 5. 確認
SELECT 
  tablename, 
  policyname,
  cmd
FROM pg_policies 
WHERE tablename IN ('users', 'memos', 'quizzes', 'attempts', 'notification_logs')
ORDER BY tablename, policyname;