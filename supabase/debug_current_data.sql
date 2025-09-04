-- 現在のデータを確認

-- 1. 全ユーザー表示
SELECT 
  id, 
  line_user_id, 
  display_name, 
  created_at
FROM users 
ORDER BY created_at DESC;

-- 2. 全メモ表示
SELECT 
  id,
  user_id,
  title,
  substring(text, 1, 50) as text_preview,
  created_at
FROM memos 
ORDER BY created_at DESC;

-- 3. 全クイズ表示
SELECT 
  id,
  memo_id,
  user_id,
  type,
  substring(stem, 1, 50) as stem_preview,
  answer,
  status,
  created_at
FROM quizzes 
ORDER BY created_at DESC;

-- 4. ユーザーとメモの関連確認
SELECT 
  u.line_user_id,
  u.display_name,
  m.title,
  m.created_at as memo_created
FROM users u
LEFT JOIN memos m ON u.id = m.user_id
ORDER BY m.created_at DESC;