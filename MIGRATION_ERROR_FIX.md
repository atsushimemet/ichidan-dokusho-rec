# 🔧 Supabaseマイグレーションエラー解決ガイド

## 🚨 発生したエラー
```
ERROR: 42P01: relation "public.user_roles" does not exist
```

## 🔍 原因分析
- `user_roles` テーブルが存在しない
- 既存システムでは `auth.role() = 'authenticated'` パターンを使用
- Admin権限管理システムが未実装

## 💡 解決策（2つの選択肢）

### 🅰️ Option A: 完全な権限管理システム実装（推奨）

**ファイル**: `supabase/migration_add_user_roles_and_introducers.sql`

**特徴**:
- ✅ PRD要件通りのAdmin限定権限
- ✅ 将来的な権限拡張に対応
- ✅ セキュリティレベル向上

**実行手順**:
```sql
-- 1. マイグレーション実行
\i supabase/migration_add_user_roles_and_introducers.sql

-- 2. 管理者権限付与（あなたのユーザーIDに置き換え）
INSERT INTO public.user_roles (user_id, role) 
VALUES ('[YOUR_USER_UUID]', 'admin');
```

### 🅱️ Option B: 既存パターン準拠（簡単）

**ファイル**: `supabase/migration_add_introducers_simple_auth.sql`

**特徴**:
- ✅ 既存システムとの一貫性
- ✅ 即座に動作
- ⚠️ 認証済み全ユーザーが編集可能

**実行手順**:
```sql
-- マイグレーション実行のみ
\i supabase/migration_add_introducers_simple_auth.sql
```

## 🎯 推奨アプローチ

### 本番環境: **Option A** (完全権限管理)
- セキュリティが重要
- 将来的な権限拡張に対応
- PRD要件を完全に満たす

### 開発/テスト環境: **Option B** (簡単)
- 素早くテスト開始
- 権限管理の複雑さを回避
- 後でOption Aに移行可能

## 🔄 実行手順（推奨: Option A）

### 1. マイグレーション実行
```bash
# Supabase CLI使用の場合
supabase db reset
supabase db push

# または直接SQL実行
psql -h [HOST] -U [USERNAME] -d [DATABASE] -f supabase/migration_add_user_roles_and_introducers.sql
```

### 2. 管理者権限付与
```sql
-- あなたのユーザーUUIDを確認
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- 管理者権限を付与（UUIDを実際の値に置き換え）
INSERT INTO public.user_roles (user_id, role) 
VALUES ('YOUR_ACTUAL_USER_UUID', 'admin');

-- 権限確認
SELECT ur.role, u.email 
FROM public.user_roles ur 
JOIN auth.users u ON ur.user_id = u.id 
WHERE ur.role = 'admin';
```

### 3. 動作確認
1. `/admin/introducers` にアクセス
2. 紹介者の作成・編集・削除をテスト
3. 非管理者ユーザーでアクセス権限をテスト

## 🛠️ トラブルシューティング

### Q: 「権限がありません」エラーが出る
**A**: user_rolesテーブルでadmin権限が正しく設定されているか確認
```sql
SELECT * FROM public.user_roles WHERE user_id = auth.uid();
```

### Q: 既存のテーブルにも権限エラーが出る
**A**: 既存のRLSポリシーを確認し、必要に応じて更新
```sql
-- 既存テーブルのポリシー確認
SELECT schemaname, tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';
```

### Q: Option Bから Option Aに移行したい
**A**: 以下の手順で移行可能
```sql
-- 1. user_rolesテーブル作成
CREATE TABLE public.user_roles (...);

-- 2. 管理者権限付与
INSERT INTO public.user_roles (user_id, role) VALUES (...);

-- 3. introducersのRLSポリシー更新
DROP POLICY "introducers_write_authenticated" ON public.introducers;
CREATE POLICY "introducers_write_admin" ON public.introducers
  FOR ALL
  USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'));
```

## 📋 チェックリスト

### マイグレーション前
- [ ] バックアップ取得
- [ ] Supabase接続確認
- [ ] 管理者ユーザーのUUID確認

### マイグレーション後
- [ ] テーブル作成確認: `\dt public.introducers`
- [ ] 権限設定確認: `SELECT * FROM public.user_roles;`
- [ ] サンプルデータ確認: `SELECT count(*) FROM public.introducers;`
- [ ] RLSポリシー確認: `\dp public.introducers`

### 動作テスト
- [ ] 管理画面アクセス: `/admin/introducers`
- [ ] CRUD操作テスト
- [ ] 検索機能テスト
- [ ] 公開ページアクセス: `/introducers/[id]`

---

**どちらのオプションを選択されますか？**
- 🅰️ **完全権限管理** (推奨): より安全、PRD準拠
- 🅱️ **簡単実装**: 素早くテスト開始

選択されたオプションに応じて、適切なマイグレーションファイルを実行してください。