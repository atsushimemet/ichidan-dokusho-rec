-- クイズ機能のためのデータベーススキーマ

-- ユーザーテーブル（LINE連携用）
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
  source_book_id UUID REFERENCES books(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- クイズテーブル
CREATE TABLE IF NOT EXISTS quizzes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  memo_id UUID NOT NULL REFERENCES memos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type quiz_type NOT NULL,
  stem TEXT NOT NULL, -- 問題文
  answer TEXT NOT NULL, -- 正解
  choices JSONB, -- 選択肢（True/Falseの場合は不要）
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status quiz_status DEFAULT 'today',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- クイズタイプのenum
CREATE TYPE quiz_type AS ENUM ('cloze', 'tf');

-- クイズステータスのenum  
CREATE TYPE quiz_status AS ENUM ('today', 'day1', 'day7', 'done');

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

-- 通知チャンネルのenum
CREATE TYPE notification_channel AS ENUM ('line');

-- 通知ステータスのenum
CREATE TYPE notification_status AS ENUM ('sent', 'failed', 'delivered');

-- 更新日時の自動更新トリガー
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_memos_updated_at 
    BEFORE UPDATE ON memos 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

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

-- RLS (Row Level Security) 設定
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE memos ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分のデータのみアクセス可能
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Users can view own memos" ON memos FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own memos" ON memos FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own memos" ON memos FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own memos" ON memos FOR DELETE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own quizzes" ON quizzes FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own quizzes" ON quizzes FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own quizzes" ON quizzes FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own attempts" ON attempts FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own attempts" ON attempts FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own notification logs" ON notification_logs FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own notification logs" ON notification_logs FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- 管理者用のポリシー
CREATE POLICY "Authenticated users can manage all data" ON users FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage all memos" ON memos FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage all quizzes" ON quizzes FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage all attempts" ON attempts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage all notification logs" ON notification_logs FOR ALL USING (auth.role() = 'authenticated');