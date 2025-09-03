-- テーブルとポリシーの確認

-- 1. テーブル存在確認
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'memos', 'quizzes', 'attempts', 'notification_logs')
ORDER BY table_name;

-- 2. RLS状態確認
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('users', 'memos', 'quizzes', 'attempts', 'notification_logs')
ORDER BY tablename;

-- 3. 現在のポリシー確認
SELECT 
  schemaname,
  tablename, 
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN ('users', 'memos', 'quizzes', 'attempts', 'notification_logs')
ORDER BY tablename, policyname;