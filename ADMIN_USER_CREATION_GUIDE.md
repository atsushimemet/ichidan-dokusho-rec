# 🔧 管理者ユーザー作成ガイド（メール認証問題対応）

## 🚨 問題
管理者登録時に確認メールが届かない

## 💡 解決方法（3つの選択肢）

### 🅰️ **方法1: Supabaseダッシュボードで直接作成**（推奨）

#### 手順
1. **Supabaseダッシュボードにアクセス**
   - https://app.supabase.com/
   - プロジェクトを選択

2. **Authentication > Users に移動**

3. **"Add user" ボタンをクリック**

4. **ユーザー情報を入力**:
   ```
   Email: your-admin-email@example.com
   Password: your-secure-password
   Email confirmed: ✅ チェックを入れる（重要！）
   ```

5. **"Create user" をクリック**

6. **Admin権限を付与**:
   ```sql
   -- SQL Editorで実行
   INSERT INTO public.user_roles (user_id, role) 
   VALUES (
     (SELECT id FROM auth.users WHERE email = 'your-admin-email@example.com'),
     'admin'
   );
   ```

### 🅱️ **方法2: SQL Editorで直接作成**

#### Supabase SQL Editorで実行:
```sql
-- 1. ユーザー作成（メール認証済みで作成）
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'your-admin-email@example.com',
  crypt('your-secure-password', gen_salt('bf')),
  NOW(),  -- メール認証済みとして設定
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}'
);

-- 2. identitiesテーブルにも追加（必要な場合）
INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM auth.users WHERE email = 'your-admin-email@example.com'),
  jsonb_build_object(
    'email', 'your-admin-email@example.com',
    'sub', (SELECT id FROM auth.users WHERE email = 'your-admin-email@example.com')::text
  ),
  'email',
  NOW(),
  NOW()
);

-- 3. Admin権限を付与
INSERT INTO public.user_roles (user_id, role) 
VALUES (
  (SELECT id FROM auth.users WHERE email = 'your-admin-email@example.com'),
  'admin'
);
```

### 🅲️ **方法3: メール設定を修正**

#### Supabaseのメール設定確認
1. **Settings > Authentication に移動**
2. **Email templates を確認**
3. **SMTP設定を確認**（カスタムSMTPを使用している場合）

#### よくある問題と対処
- **迷惑メールフォルダ確認**
- **メールアドレスのタイポ確認**
- **ドメインブロック確認**
- **Supabaseのメール送信制限確認**

## 🎯 **推奨アプローチ**

### ステップ1: 方法1を試す（最も安全）
Supabaseダッシュボードでの直接作成が最も確実です。

### ステップ2: 権限確認
```sql
-- 作成されたユーザーを確認
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users 
WHERE email = 'your-admin-email@example.com';

-- Admin権限を確認
SELECT ur.role, u.email 
FROM public.user_roles ur 
JOIN auth.users u ON ur.user_id = u.id 
WHERE u.email = 'your-admin-email@example.com';
```

### ステップ3: ログインテスト
1. `/login` ページでログイン
2. `/admin/introducers` にアクセス
3. 紹介者の作成・編集をテスト

## 🔧 **トラブルシューティング**

### Q: ダッシュボードでユーザー作成後もログインできない
**A**: パスワードの複雑さ要件を確認
```
- 最低8文字
- 大文字・小文字・数字を含む
- 特殊文字を含む（推奨）
```

### Q: "Email confirmed" チェックボックスが見つからない
**A**: Supabaseの新しいUIでは自動で確認済みになる場合があります。作成後に以下で確認：
```sql
SELECT email_confirmed_at FROM auth.users WHERE email = 'your-email@example.com';
```

### Q: user_rolesテーブルが見つからない
**A**: まず `user_roles` テーブルを作成する必要があります：
```sql
-- Option Aのマイグレーションを先に実行
\i supabase/migration_add_user_roles_and_introducers.sql
```

## 🚀 **即座に試せる手順**

1. **Supabaseダッシュボード** → **Authentication** → **Users**
2. **"Add user"** をクリック
3. **Email confirmed にチェック**を入れる
4. **ユーザー作成**
5. **SQL Editorで権限付与**:
   ```sql
   INSERT INTO public.user_roles (user_id, role) 
   VALUES (
     (SELECT id FROM auth.users WHERE email = 'your-email@example.com'),
     'admin'
   );
   ```

この方法なら確実にメール認証をスキップして管理者ユーザーを作成できます！

**どの方法を試されますか？** 方法1（ダッシュボード）が最も確実で安全です。