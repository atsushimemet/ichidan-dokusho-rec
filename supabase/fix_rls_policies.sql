-- RLSポリシーの修正（開発・テスト用）

-- 既存のポリシーを削除
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can view own memos" ON memos;
DROP POLICY IF EXISTS "Users can insert own memos" ON memos;
DROP POLICY IF EXISTS "Users can update own memos" ON memos;
DROP POLICY IF EXISTS "Users can delete own memos" ON memos;
DROP POLICY IF EXISTS "Users can view own quizzes" ON quizzes;
DROP POLICY IF EXISTS "Users can insert own quizzes" ON quizzes;
DROP POLICY IF EXISTS "Users can update own quizzes" ON quizzes;
DROP POLICY IF EXISTS "Users can view own attempts" ON attempts;
DROP POLICY IF EXISTS "Users can insert own attempts" ON attempts;
DROP POLICY IF EXISTS "Users can view own notification logs" ON notification_logs;
DROP POLICY IF EXISTS "Users can insert own notification logs" ON notification_logs;
DROP POLICY IF EXISTS "Authenticated users can manage all data" ON users;
DROP POLICY IF EXISTS "Authenticated users can manage all memos" ON memos;
DROP POLICY IF EXISTS "Authenticated users can manage all quizzes" ON quizzes;
DROP POLICY IF EXISTS "Authenticated users can manage all attempts" ON attempts;
DROP POLICY IF EXISTS "Authenticated users can manage all notification logs" ON notification_logs;

-- パブリックアクセスポリシーを作成（開発・テスト用）
CREATE POLICY "Public access for users" ON users FOR ALL USING (true);
CREATE POLICY "Public access for memos" ON memos FOR ALL USING (true);
CREATE POLICY "Public access for quizzes" ON quizzes FOR ALL USING (true);
CREATE POLICY "Public access for attempts" ON attempts FOR ALL USING (true);
CREATE POLICY "Public access for notification_logs" ON notification_logs FOR ALL USING (true);

-- 確認用：現在のポリシー一覧表示
SELECT 
  schemaname,
  tablename, 
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN ('users', 'memos', 'quizzes', 'attempts', 'notification_logs')
ORDER BY tablename, policyname;