-- 完全なスキーマ（RLS無効版）

-- ENUMタイプを先に定義
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'quiz_type') THEN
    CREATE TYPE quiz_type AS ENUM ('cloze', 'tf');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'quiz_status') THEN
    CREATE TYPE quiz_status AS ENUM ('today', 'day1', 'day7', 'done');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_channel') THEN
    CREATE TYPE notification_channel AS ENUM ('line');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_status') THEN
    CREATE TYPE notification_status AS ENUM ('sent', 'failed', 'delivered');
  END IF;
END $$;

-- ユーザーテーブル
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  line_user_id VARCHAR(255) UNIQUE,
  email VARCHAR(255) UNIQUE,
  display_name VARCHAR(100),
  avatar_url TEXT,
  notification_enabled BOOLEAN DEFAULT true,
  notification_time TIME DEFAULT '09:00:00',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- メモテーブル
CREATE TABLE IF NOT EXISTS memos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  text TEXT NOT NULL,
  source_book_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- クイズテーブル
CREATE TABLE IF NOT EXISTS quizzes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  memo_id UUID NOT NULL REFERENCES memos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type quiz_type NOT NULL,
  stem TEXT NOT NULL,
  answer TEXT NOT NULL,
  choices JSONB,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status quiz_status DEFAULT 'today',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 回答テーブル
CREATE TABLE IF NOT EXISTS attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 通知ログテーブル
CREATE TABLE IF NOT EXISTS notification_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  channel notification_channel NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status notification_status DEFAULT 'sent',
  retry_count INTEGER DEFAULT 0,
  error_message TEXT
);

-- 更新日時の自動更新関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガー
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_memos_updated_at ON memos;
CREATE TRIGGER update_memos_updated_at 
    BEFORE UPDATE ON memos 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_quizzes_updated_at ON quizzes;
CREATE TRIGGER update_quizzes_updated_at 
    BEFORE UPDATE ON quizzes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- インデックス
CREATE INDEX IF NOT EXISTS idx_users_line_user_id ON users (line_user_id);
CREATE INDEX IF NOT EXISTS idx_memos_user_id ON memos (user_id);
CREATE INDEX IF NOT EXISTS idx_memos_created_at ON memos (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quizzes_user_id ON quizzes (user_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_status ON quizzes (status);
CREATE INDEX IF NOT EXISTS idx_quizzes_scheduled_at ON quizzes (scheduled_at);
CREATE INDEX IF NOT EXISTS idx_attempts_quiz_id ON attempts (quiz_id);
CREATE INDEX IF NOT EXISTS idx_attempts_user_id ON attempts (user_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_quiz_id ON notification_logs (quiz_id);

-- RLSを無効化（開発・テスト用）
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE memos DISABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes DISABLE ROW LEVEL SECURITY;
ALTER TABLE attempts DISABLE ROW LEVEL SECURITY;
ALTER TABLE notification_logs DISABLE ROW LEVEL SECURITY;

-- リトライカウント増加用の関数
CREATE OR REPLACE FUNCTION increment_retry_count(log_id UUID)
RETURNS notification_logs AS $$
DECLARE
    updated_log notification_logs;
BEGIN
    UPDATE notification_logs 
    SET retry_count = retry_count + 1
    WHERE id = log_id
    RETURNING * INTO updated_log;
    
    RETURN updated_log;
END;
$$ LANGUAGE plpgsql;

-- 確認
SELECT 'Tables created successfully' as status;