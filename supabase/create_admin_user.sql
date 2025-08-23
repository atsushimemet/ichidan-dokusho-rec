-- 管理者ユーザー作成用SQL
-- 注意: このスクリプトはSupabaseのSQL Editorで実行する必要があります

-- 管理者ユーザーの手動作成（Supabaseの認証システムを使用）
-- メールアドレス: noap3b69n@gmail.com
-- パスワード: 19930322

-- このスクリプトは直接実行できません。
-- 以下の手順でユーザーを作成してください：

-- 1. Supabaseダッシュボードにアクセス
-- 2. Authentication > Users に移動
-- 3. "Add user" ボタンをクリック
-- 4. 以下の情報を入力：
--    Email: noap3b69n@gmail.com
--    Password: 19930322
--    Email confirmed: チェックを入れる

-- または、以下のSQLを実行（auth.usersテーブルに直接挿入）
-- 注意: このアプローチは推奨されません
/*
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'noap3b69n@gmail.com',
  crypt('19930322', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);
*/

-- 推奨方法: Supabaseの認証UIまたはダッシュボードを使用してユーザーを作成