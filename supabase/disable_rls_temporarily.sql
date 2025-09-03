-- 一時的にRLSを無効化（開発・テスト用のみ）
-- 本番環境では絶対に実行しないでください

ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE memos DISABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes DISABLE ROW LEVEL SECURITY;
ALTER TABLE attempts DISABLE ROW LEVEL SECURITY;
ALTER TABLE notification_logs DISABLE ROW LEVEL SECURITY;

-- 確認用：RLS状態をチェック
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('users', 'memos', 'quizzes', 'attempts', 'notification_logs');