-- 簡単な修正：RLSを一時的に無効化

-- テーブルが存在する場合のみRLSを無効化
DO $$
BEGIN
  -- usersテーブル
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') THEN
    ALTER TABLE users DISABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'RLS disabled for users table';
  END IF;

  -- memosテーブル
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'memos' AND table_schema = 'public') THEN
    ALTER TABLE memos DISABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'RLS disabled for memos table';
  END IF;

  -- quizzesテーブル
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quizzes' AND table_schema = 'public') THEN
    ALTER TABLE quizzes DISABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'RLS disabled for quizzes table';
  END IF;

  -- attemptsテーブル
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'attempts' AND table_schema = 'public') THEN
    ALTER TABLE attempts DISABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'RLS disabled for attempts table';
  END IF;

  -- notification_logsテーブル
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notification_logs' AND table_schema = 'public') THEN
    ALTER TABLE notification_logs DISABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'RLS disabled for notification_logs table';
  END IF;
END $$;

-- 確認：RLS状態をチェック
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('users', 'memos', 'quizzes', 'attempts', 'notification_logs')
ORDER BY tablename;