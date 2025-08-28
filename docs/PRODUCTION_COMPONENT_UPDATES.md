# プロダクション環境用コンポーネント更新ガイド

現在の実装はモックデータを使用していますが、プロダクション環境では以下の更新が必要です。

## 🔄 更新が必要なファイル

### 1. ArchiveSlider.tsx の更新

```typescript
// src/components/ArchiveSlider.tsx
// 以下の import を変更
import { getArchives } from '@/lib/archives';  // searchArchives から変更

// fetchArchives 関数を更新
const fetchArchives = async () => {
  try {
    setLoading(true);
    setError(null);
    
    // API呼び出しに変更
    const result = await getArchives('', 1, count);
    
    if (result.archives.length === 0) {
      setError('記事が見つかりませんでした');
      return;
    }
    
    setArchives(result.archives);
    
  } catch (err) {
    console.error('記事取得エラー:', err);
    setError('記事の取得に失敗しました');
  } finally {
    setLoading(false);
  }
};
```

### 2. Archives ページの更新

```typescript
// src/app/archives/page.tsx
// import を更新
import { getArchives } from '@/lib/archives';

// fetchArchives 関数を更新
const fetchArchives = async (query: string = '', pageNum: number = 1, append: boolean = false) => {
  try {
    if (!append) {
      setLoading(true);
    }
    setIsSearching(true);
    setError(null);
    
    // API呼び出しに変更
    const result = await getArchives(query, pageNum, 12);
    
    if (append) {
      setArchives(prev => [...prev, ...result.archives]);
    } else {
      setArchives(result.archives);
    }
    
    setHasMore(result.hasMore);
    setTotal(result.total);
    
  } catch (err) {
    console.error('記事取得エラー:', err);
    setError('記事の取得に失敗しました');
  } finally {
    setLoading(false);
    setIsSearching(false);
  }
};
```

### 3. Admin Archives ページの更新

```typescript
// src/app/admin/archives/page.tsx
// import を更新
import { getArchives, createArchive, updateArchive, deleteArchive } from '@/lib/archives';

// loadArchives 関数を更新
const loadArchives = async () => {
  try {
    setIsLoading(true);
    const result = await getArchives('', 1, 100); // 管理画面では多めに取得
    setArchives(result.archives);
  } catch (err) {
    setError('アーカイブの読み込みに失敗しました');
    console.error('アーカイブ読み込みエラー:', err);
  } finally {
    setIsLoading(false);
  }
};

// handleSubmit 関数を更新
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!formData.title.trim() || !formData.link.trim() || !formData.description.trim()) {
    setError('すべての項目を入力してください');
    return;
  }

  // URLバリデーション
  try {
    new URL(formData.link);
  } catch {
    setError('有効なURLを入力してください');
    return;
  }

  try {
    setError(null);
    
    if (editingArchive) {
      // 更新
      const updatedArchive = await updateArchive(editingArchive.id, {
        title: formData.title.trim(),
        link: formData.link.trim(),
        description: formData.description.trim()
      });
      
      setArchives(prev => 
        prev.map(archive => 
          archive.id === editingArchive.id ? updatedArchive : archive
        )
      );
      
      setSuccessMessage('アーカイブが更新されました');
    } else {
      // 新規作成
      const newArchive = await createArchive({
        title: formData.title.trim(),
        link: formData.link.trim(),
        description: formData.description.trim()
      });
      
      setArchives(prev => [newArchive, ...prev]);
      setSuccessMessage('アーカイブが作成されました');
    }
    
    // フォームリセット
    setFormData({ title: '', link: '', description: '' });
    setEditingArchive(null);
    setShowForm(false);
    
    // 3秒後にメッセージを消去
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
    
  } catch (err) {
    setError(err instanceof Error ? err.message : '保存に失敗しました');
  }
};

// handleDelete 関数を更新
const handleDelete = async (id: string) => {
  if (!confirm('このアーカイブを削除しますか？この操作は取り消せません。')) {
    return;
  }
  
  try {
    await deleteArchive(id);
    setArchives(prev => prev.filter(archive => archive.id !== id));
    setSuccessMessage('アーカイブが削除されました');
    
    // 3秒後にメッセージを消去
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
    
  } catch (err) {
    setError(err instanceof Error ? err.message : '削除に失敗しました');
  }
};
```

## 🔧 環境変数による切り替え

開発とプロダクションを自動で切り替える方法：

```typescript
// src/data/archives.ts を更新
import { getArchives as getArchivesFromDB } from '@/lib/archives';

// 環境に応じてデータソースを切り替え
export const searchArchives = async (
  query?: string,
  page: number = 1,
  limit: number = 20
) => {
  const useDatabase = process.env.NEXT_PUBLIC_SUPABASE_URL && 
                     process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your_supabase_url';
  
  if (useDatabase) {
    // プロダクション: データベースから取得
    return await getArchivesFromDB(query, page, limit);
  } else {
    // 開発: モックデータを使用
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let filteredArchives = [...mockArchives];
    
    if (query && query.trim()) {
      const searchTerm = query.toLowerCase();
      filteredArchives = filteredArchives.filter(archive =>
        archive.title.toLowerCase().includes(searchTerm) ||
        archive.description.toLowerCase().includes(searchTerm)
      );
    }
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedArchives = filteredArchives.slice(startIndex, endIndex);
    
    return {
      archives: paginatedArchives,
      total: filteredArchives.length,
      hasMore: endIndex < filteredArchives.length
    };
  }
};
```

## 📦 一括更新スクリプト

以下のスクリプトで一括更新できます：

```bash
#!/bin/bash
# scripts/update-to-production.sh

echo "プロダクション環境用コンポーネントに更新中..."

# ArchiveSlider.tsx を更新
sed -i 's/import { searchArchives } from/import { getArchives } from/g' src/components/ArchiveSlider.tsx
sed -i 's/searchArchives(/getArchives(/g' src/components/ArchiveSlider.tsx

# Archives ページを更新
sed -i 's/import { searchArchives } from/import { getArchives } from/g' src/app/archives/page.tsx
sed -i 's/searchArchives(/getArchives(/g' src/app/archives/page.tsx

echo "更新完了！データベースマイグレーションを実行してください。"
```

## ✅ 更新後のテスト

1. **ビルドテスト**
   ```bash
   npm run build
   ```

2. **型チェック**
   ```bash
   npm run type-check
   ```

3. **機能テスト**
   - ホームページでのArchiveSlider表示
   - アーカイブページでの検索
   - 管理画面での CRUD 操作

これらの更新により、Good Archives機能が完全にプロダクション対応となります。