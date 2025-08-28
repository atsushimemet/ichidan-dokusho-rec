# Good Archives セットアップガイド

このガイドでは、Good Archives機能をプロダクション環境で使用するためのセットアップ手順を説明します。

## 📋 前提条件

- Supabaseプロジェクトが作成済み
- 環境変数が設定済み
- 管理者認証が機能している

## 🚀 セットアップ手順

### 1. データベースマイグレーション

Supabaseコンソールまたは CLI を使用してマイグレーションを実行します：

```sql
-- supabase/migration_add_archives_table.sql の内容を実行
```

または、Supabase CLI を使用：

```bash
supabase migration new add_archives_table
# 上記SQLファイルの内容をコピー
supabase db push
```

### 2. 環境変数の確認

`.env.local` ファイルに以下の変数が設定されていることを確認：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. プロダクション用コンポーネントの更新

現在の実装はモックデータを使用しています。本番環境では以下のファイルを更新：

#### a) ArchiveSlider.tsx の更新

```typescript
// src/components/ArchiveSlider.tsx
// searchArchives を以下に置き換え
import { getArchives } from '@/lib/archives';

// fetchArchives 関数内で：
const result = await getArchives('', 1, count);
```

#### b) Archives ページの更新

```typescript
// src/app/archives/page.tsx
// searchArchives を以下に置き換え
import { getArchives } from '@/lib/archives';

// fetchArchives 関数内で：
const result = await getArchives(query, pageNum, 12);
```

#### c) Admin Archives ページの更新

```typescript
// src/app/admin/archives/page.tsx
// API関数をインポート
import { getArchives, createArchive, updateArchive, deleteArchive } from '@/lib/archives';

// 各関数を対応するAPI呼び出しに置き換え
```

### 4. データベース権限の確認

RLS（Row Level Security）ポリシーが正しく設定されていることを確認：

```sql
-- 読み取り権限（全ユーザー）
SELECT * FROM archives; -- 成功するはず

-- 書き込み権限（認証ユーザーのみ）
INSERT INTO archives (title, link, description) VALUES (...); -- 認証が必要
```

### 5. 管理者権限の設定

より厳密な権限管理が必要な場合は、以下のポリシーに更新：

```sql
-- 管理者のみが作成・更新・削除可能
CREATE OR REPLACE POLICY "Enable insert for admin users only" ON archives
    FOR INSERT WITH CHECK (
        auth.jwt() ->> 'email' IN (
            SELECT email FROM auth.users WHERE id = auth.uid()
        ) AND
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_app_meta_data ->> 'role' = 'admin'
        )
    );
```

## 📁 ファイル構成

```
src/
├── app/
│   ├── archives/
│   │   └── page.tsx              # アーカイブ一覧ページ
│   └── admin/
│       ├── archives/
│       │   └── page.tsx          # 管理者アーカイブ管理
│       └── register/
│           └── page.tsx          # 管理者登録
├── components/
│   └── ArchiveSlider.tsx         # アーカイブスライダー
├── lib/
│   └── archives.ts               # アーカイブAPI関数
├── data/
│   └── archives.ts               # モックデータ（開発用）
└── types/
    └── index.ts                  # Archive型定義

supabase/
└── migration_add_archives_table.sql  # データベースマイグレーション
```

## 🔧 開発環境での切り替え

開発環境とプロダクション環境を切り替えるには、環境変数を使用：

```typescript
// src/data/archives.ts または各コンポーネント内
const USE_MOCK_DATA = process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_SUPABASE_URL;

if (USE_MOCK_DATA) {
  // モックデータを使用
  return mockArchives;
} else {
  // 実際のAPI呼び出し
  return await getArchives(...);
}
```

## ✅ テスト手順

1. **データベーステーブルの確認**
   ```sql
   \d archives
   ```

2. **基本的なCRUD操作のテスト**
   - 管理者ログイン
   - 記事の作成
   - 記事の編集
   - 記事の削除

3. **権限テスト**
   - 未認証ユーザーでの読み取り
   - 未認証ユーザーでの書き込み（失敗するはず）

4. **UI/UXテスト**
   - ホームページでのArchiveSlider表示
   - アーカイブページでの検索機能
   - レスポンシブデザインの確認

## 🚨 注意事項

- **セキュリティ**: 管理者権限の適切な設定
- **パフォーマンス**: 大量データでのページネーション
- **バックアップ**: 本番データの定期バックアップ
- **監視**: エラーログの監視設定

## 📞 サポート

実装中に問題が発生した場合は、以下を確認してください：

1. Supabaseコンソールでのエラーログ
2. ブラウザの開発者ツールでのネットワークエラー
3. 環境変数の設定
4. データベース接続とRLSポリシー