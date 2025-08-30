# 📘 紹介者（Introducer）機能 セットアップガイド

## 概要
一段読書に「本の紹介者」機能を追加しました。このガイドでは、データベースマイグレーションから機能の利用まで、セットアップ手順を説明します。

## 📋 実装済み機能

### ✅ 完了済み
- ✅ データベーススキーマ設計（introducers テーブル）
- ✅ TypeScript型定義（Introducer型）
- ✅ 管理画面UI（/admin/introducers）
  - 紹介者一覧・検索・フィルタ
  - 新規作成・編集・削除
  - 自動保存機能
  - 重複警告
  - バリデーション
- ✅ 公開側UI（/introducers/[id]）
  - 紹介者詳細ページ
  - プロフィールリンク
  - アナリティクストラッキング
- ✅ ナビゲーション統合
  - ManagementSelectorに追加
  - AdminDashboardに統計表示
  - クイックアクションボタン

### 🔄 今後の拡張（MVP外）
- アイコン画像アップロード
- 書籍との紐付けUI（book_introducers中間テーブル）
- フォロー機能
- 紹介者ランキング

## 🗄️ データベースマイグレーション

### 1. マイグレーションファイルの実行
```sql
-- supabase/migration_add_introducers_table.sql を実行
psql -h [HOST] -U [USERNAME] -d [DATABASE] -f supabase/migration_add_introducers_table.sql
```

または Supabase Dashboard の SQL Editor で実行：

```sql
-- pg_trgm拡張が有効になっているか確認（部分一致検索用）
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 紹介者テーブル
CREATE TABLE IF NOT EXISTS public.introducers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  profile_url TEXT,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- 更新日時の自動更新トリガー
CREATE TRIGGER update_introducers_updated_at 
    BEFORE UPDATE ON public.introducers 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_introducers_name ON public.introducers USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_introducers_description ON public.introducers USING gin (description gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_introducers_is_active ON public.introducers (is_active);
CREATE INDEX IF NOT EXISTS idx_introducers_created_at ON public.introducers (created_at DESC);

-- 制約の追加
ALTER TABLE public.introducers ADD CONSTRAINT chk_introducers_profile_url
  CHECK (profile_url IS NULL OR profile_url ~* '^(https?)://');
ALTER TABLE public.introducers ADD CONSTRAINT chk_introducers_name_length
  CHECK (char_length(name) >= 1 AND char_length(name) <= 100);
ALTER TABLE public.introducers ADD CONSTRAINT chk_introducers_description_length
  CHECK (description IS NULL OR char_length(description) <= 300);

-- RLS設定
ALTER TABLE public.introducers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "introducers_select_public" ON public.introducers
  FOR SELECT USING (true);

CREATE POLICY "introducers_write_admin" ON public.introducers
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );
```

### 2. サンプルデータの挿入（オプション）
```sql
INSERT INTO public.introducers (name, profile_url, description, is_active) VALUES
('池上彰', 'https://www.tv-asahi.co.jp/ikegami/', 'ジャーナリスト。複雑なニュースをわかりやすく解説することで知られる。教育番組の司会も多数担当。', true),
('佐藤優', 'https://ja.wikipedia.org/wiki/佐藤優_(作家)', '元外務省主任分析官、作家。国際情勢分析や教養書の執筆で活躍。幅広い知識と独自の視点で書籍を紹介。', true),
('林修', 'https://www.watanabepro.co.jp/mypage/artist/hayashiosamu.html', '予備校講師、タレント。「いつやるか？今でしょ！」で有名。教育関連の書籍紹介に定評がある。', true),
('中田敦彦', 'https://www.youtube.com/c/NakataUniversity', 'お笑い芸人、教育系YouTuber。「中田敦彦のYouTube大学」で様々な書籍を分かりやすく解説。', true),
('メンタリストDaiGo', 'https://daigo.me/', 'メンタリスト、作家。心理学や科学的根拠に基づいた書籍の紹介で人気。効率的な学習法も提案。', true),
('ひろゆき', 'https://twitter.com/hiroyuki_ni', '実業家、論破王。独特の視点で社会問題や哲学書を紹介。辛口コメントでも知られる。', true),
('本要約チャンネル', 'https://www.youtube.com/c/本要約チャンネル', 'YouTubeチャンネル。ビジネス書や自己啓発書の要約を分かりやすくアニメーション動画で紹介。', true),
('読書猿', 'https://readingmonkey.blog.fc2.com/', 'ブロガー、作家。「独学大全」の著者。学習法や読書術に関する深い知識で書籍を紹介。', true)
ON CONFLICT DO NOTHING;
```

## 🎯 利用方法

### 管理者向け（Admin）

#### 1. 紹介者管理画面へのアクセス
- URL: `/admin/introducers`
- 管理画面ダッシュボードの「紹介者管理」カードをクリック
- または上部ナビゲーションの👤アイコンをクリック

#### 2. 新規紹介者の作成
1. 「+ 新規紹介者」ボタンをクリック
2. 必須項目を入力：
   - **紹介者名**（必須、1-100文字）
   - **プロフィールURL**（任意、http/https形式）
   - **説明**（任意、最大300文字）
3. 「作成」ボタンをクリック

#### 3. 紹介者の編集
1. 一覧から編集したい紹介者の「アクション」ドロップダウンをクリック
2. 「編集」を選択
3. フォームが表示されるので、内容を修正
4. 自動保存機能により、入力中に自動で保存されます

#### 4. 紹介者の削除
1. 一覧から削除したい紹介者の「アクション」ドロップダウンをクリック
2. 「削除」を選択
3. 確認ダイアログで「OK」をクリック

#### 5. 検索・フィルタ機能
- **検索**: 紹介者名や説明文での部分一致検索
- **ステータスフィルタ**: アクティブ/非アクティブ/すべて

### 一般ユーザー向け

#### 紹介者詳細ページ
- URL: `/introducers/[id]`
- 紹介者の基本情報（名前、説明、プロフィールリンク）を表示
- プロフィールリンクのクリックは外部サイトで開きます
- 将来的に紹介書籍一覧も表示予定

## 🔒 権限管理

### RLS（Row Level Security）ポリシー
- **読み取り**: 全ユーザー（public）
- **書き込み**: Admin権限を持つユーザーのみ

### 必要な権限設定
管理機能を利用するには、`user_roles`テーブルで`role = 'admin'`の設定が必要です。

## 📊 アナリティクス

### 実装済みトラッキングイベント
- `introducer_detail_viewed`: 紹介者詳細ページ表示
- `introducer_profile_clicked`: プロフィールリンククリック

### 将来実装予定
- `introducer_list_viewed`: 一覧ページ表示
- `introducer_created/updated/deleted`: 管理者操作

## 🧪 テスト観点

### バリデーション
- ✅ 必須項目（名前）の未入力チェック
- ✅ 名前の文字数制限（1-100文字）
- ✅ 説明の文字数制限（0-300文字）
- ✅ プロフィールURLの形式チェック（http/https）

### 権限チェック
- ✅ 非Admin ユーザーの書き込み操作は403エラー
- ✅ 全ユーザーが読み取り可能

### UI/UX
- ✅ 重複名の警告表示
- ✅ 自動保存機能
- ✅ レスポンシブデザイン
- ✅ エラーハンドリング

## 🚨 注意事項

### 既知の制限事項
1. **物理削除**: MVPでは削除時に論理削除ではなく物理削除を行います
2. **画像アップロード**: アイコン画像機能は将来実装予定
3. **書籍紐付け**: 書籍との関連付けは将来実装予定

### セキュリティ考慮事項
- XSS対策: ユーザー入力は適切にエスケープ
- URLインジェクション対策: プロフィールURLの形式チェック
- Admin権限チェック: RLSポリシーで書き込み制限

## 🔄 今後のロードマップ

### v1.1（次期バージョン）
- アイコン画像アップロード機能
- 論理削除への変更
- 表示トグル機能

### v1.2（書籍連携）
- `book_introducers`中間テーブル実装
- 書籍詳細ページでの紹介者表示
- 紹介者詳細ページでの紹介書籍一覧

### v1.3（ソーシャル機能）
- ユーザーによる紹介者フォロー機能
- 紹介者ランキング
- 活動履歴の可視化

## 📁 ファイル構成

```
src/
├── app/
│   ├── admin/
│   │   └── introducers/
│   │       └── page.tsx              # 管理画面
│   └── introducers/
│       └── [id]/
│           └── page.tsx              # 公開詳細ページ
├── components/
│   └── admin/
│       ├── ManagementSelector.tsx    # ナビゲーション（更新）
│       └── AdminDashboard.tsx        # ダッシュボード（更新）
├── types/
│   └── index.ts                      # 型定義（更新）
└── supabase/
    └── migration_add_introducers_table.sql  # DBマイグレーション
```

## ✅ 受け入れ基準チェックリスト

- [x] 管理画面から紹介者の新規作成・編集・削除・検索が行える
- [x] 紹介者詳細ページで基本3項目（名前・説明・プロフィールリンク）が表示される
- [x] 権限外ユーザーのPOST/PATCH/DELETEは403（RLSポリシーで実装）
- [x] バリデーション・重複警告がUIで機能する
- [x] 主要イベントが計測される（アナリティクストラッキング実装済み）
- [x] 既存UIとの一貫性を保持
- [x] レスポンシブデザイン対応
- [x] エラーハンドリング・デバッグ機能

## 🚀 デプロイ手順

1. **データベースマイグレーション実行**
   ```bash
   # Supabase CLIを使用する場合
   supabase db push
   
   # または直接SQLを実行
   psql -h [HOST] -U [USERNAME] -d [DATABASE] -f supabase/migration_add_introducers_table.sql
   ```

2. **アプリケーションデプロイ**
   ```bash
   npm run build
   npm run start
   # または Vercel等にデプロイ
   ```

3. **Admin権限の設定**
   ```sql
   -- 管理者ユーザーにadmin権限を付与
   INSERT INTO public.user_roles (user_id, role) 
   VALUES ('[USER_UUID]', 'admin');
   ```

4. **動作確認**
   - `/admin/introducers` にアクセス
   - 紹介者の作成・編集・削除をテスト
   - `/introducers/[id]` で詳細ページをテスト

## 🐛 トラブルシューティング

### よくある問題

#### 1. 「Supabaseが設定されていません」エラー
**原因**: 環境変数が正しく設定されていない
**解決方法**: 
```bash
# .env.local に以下を設定
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### 2. 権限エラー（403 Forbidden）
**原因**: Admin権限が設定されていない
**解決方法**: 
```sql
-- user_rolesテーブルでadmin権限を確認・付与
SELECT * FROM public.user_roles WHERE user_id = auth.uid();
INSERT INTO public.user_roles (user_id, role) VALUES (auth.uid(), 'admin');
```

#### 3. 検索機能が動作しない
**原因**: pg_trgm拡張が有効になっていない
**解決方法**: 
```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

#### 4. テーブルが見つからないエラー
**原因**: マイグレーションが実行されていない
**解決方法**: `supabase/migration_add_introducers_table.sql` を実行

## 📈 パフォーマンス最適化

### 実装済み最適化
- GINインデックスによる高速部分一致検索
- 自動保存のデバウンス機能（1秒）
- 並列データ取得
- RLSによる効率的な権限チェック

### 推奨設定
- Supabaseの接続プーリング設定
- CDNキャッシュ設定（静的アセット）
- 画像最適化（将来のアイコン機能用）

---

**実装完了日**: 2025-01-30  
**バージョン**: v1.0  
**ステータス**: 本番デプロイ準備完了 ✅