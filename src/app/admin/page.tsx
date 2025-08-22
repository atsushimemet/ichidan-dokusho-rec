'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { supabase } from '@/lib/supabase';
import { Book } from '@/types';
import { getReadabilityLevel } from '@/lib/utils';

export default function AdminPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    genre_tags: [] as string[],
    amazon_link: '',
    summary_link: '',
    cover_image_url: '',
    description: '',
    page_count: '',
    price: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([loadBooks(), loadTags()]);
  };

  const loadBooks = async () => {
    try {
      setIsLoading(true);
      
      // Supabaseの環境変数が設定されていない場合はモックデータを表示
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      console.log('Supabase設定確認:', {
        url: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : '未設定',
        hasKey: !!supabaseAnonKey,
        keyLength: supabaseAnonKey ? supabaseAnonKey.length : 0
      });
      
      if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'your_supabase_url') {
        setError('Supabaseが設定されていません。モックデータを表示しています。');
        setBooks([
          {
            id: '1',
            title: '人を動かす',
            author: 'デール・カーネギー',
            genre_tags: ['自己啓発', 'コミュニケーション', 'ビジネス'],
            amazon_link: 'https://amazon.co.jp/dp/4422100513',
            description: '人間関係の古典的名著。人を動かす3つの基本原則から始まり、人に好かれる6つの原則、人を説得する12の原則などを具体的なエピソードとともに紹介。',
            page_count: 320,
            price: 1540,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z'
          },
          {
            id: '2',
            title: '7つの習慣',
            author: 'スティーブン・R・コヴィー',
            genre_tags: ['自己啓発', 'ビジネス', '成功法則'],
            amazon_link: 'https://amazon.co.jp/dp/4863940246',
            description: '世界的ベストセラー。私的成功から公的成功へと導く7つの習慣を体系的に解説。',
            page_count: 560,
            price: 2420,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z'
          }
        ]);
        return;
      }

      console.log('Supabaseクエリ実行開始');
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('Supabaseクエリ結果:', { data: data?.length || 0, error });
      
      if (error) throw error;
      setBooks(data || []);
    } catch (err) {
      console.error('書籍データの読み込みエラー:', err);
      console.error('エラーの詳細:', {
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined,
        error: err
      });
      setError('書籍データの読み込みに失敗しました。モックデータを表示しています。');
      
      // モックデータを表示
      setBooks([
        {
          id: '1',
          title: '人を動かす',
          author: 'デール・カーネギー',
          genre_tags: ['自己啓発', 'コミュニケーション', 'ビジネス'],
          amazon_link: 'https://amazon.co.jp/dp/4422100513',
          description: '人間関係の古典的名著。',
          page_count: 320,
          price: 1540,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTags = async () => {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'your_supabase_url') {
        // モックデータのタグ
        setAvailableTags([
          '自己啓発', 'ビジネス', '心理学', '哲学', '歴史', '科学', '健康', '小説',
          'コミュニケーション', 'スキルアップ', '成功法則', '習慣', '教養', 'プレゼンテーション'
        ]);
        return;
      }

      console.log('タグクエリ実行開始');
      const { data, error } = await supabase
        .from('genre_tags')
        .select('name')
        .eq('is_active', true)
        .order('category, display_order');

      console.log('タグクエリ結果:', { data: data?.length || 0, error });
      
      if (error) throw error;
      setAvailableTags((data || []).map(tag => tag.name));
    } catch (err) {
      console.error('タグデータの読み込みエラー:', err);
      console.error('エラーの詳細:', {
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined,
        error: err
      });
      // フォールバック
      setAvailableTags([
        '自己啓発', 'ビジネス', '心理学', '哲学', '歴史', '科学', '健康', '小説',
        'コミュニケーション', 'スキルアップ', '成功法則', '習慣', '教養', 'プレゼンテーション'
      ]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // バリデーション
    if (formData.genre_tags.length === 0) {
      setError('少なくとも1つのジャンルタグを選択してください。');
      return;
    }

    // Supabaseが設定されていない場合はエラー表示
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'your_supabase_url') {
      setError('Supabaseが設定されていないため、書籍の保存はできません。');
      return;
    }

    try {
      const bookData = {
        title: formData.title,
        author: formData.author,
        genre_tags: formData.genre_tags,
        amazon_link: formData.amazon_link,
        summary_link: formData.summary_link || null,
        cover_image_url: formData.cover_image_url || null,
        description: formData.description || null,
        page_count: formData.page_count ? parseInt(formData.page_count) : null,
        price: formData.price ? parseFloat(formData.price) : null
      };

      if (editingBook) {
        // 更新
        const { error } = await supabase
          .from('books')
          .update(bookData)
          .eq('id', editingBook.id);

        if (error) throw error;
        setSuccessMessage('書籍を更新しました');
      } else {
        // 新規作成
        const { error } = await supabase
          .from('books')
          .insert([bookData]);

        if (error) throw error;
        setSuccessMessage('書籍を追加しました');
      }

      // フォームをリセットして書籍一覧を再読み込み
      resetForm();
      loadBooks();
    } catch (err) {
      console.error('書籍保存エラー:', err);
      setError('書籍の保存に失敗しました');
    }
  };

  const handleEdit = (book: Book) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      genre_tags: book.genre_tags,
      amazon_link: book.amazon_link,
      summary_link: book.summary_link || '',
      cover_image_url: book.cover_image_url || '',
      description: book.description || '',
      page_count: book.page_count?.toString() || '',
      price: book.price?.toString() || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (bookId: string) => {
    if (!confirm('この書籍を削除しますか？')) return;

    // Supabaseが設定されていない場合はエラー表示
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'your_supabase_url') {
      setError('Supabaseが設定されていないため、書籍の削除はできません。');
      return;
    }

    try {
      const { error } = await supabase
        .from('books')
        .delete()
        .eq('id', bookId);

      if (error) throw error;
      setSuccessMessage('書籍を削除しました');
      loadBooks();
    } catch (err) {
      console.error('書籍削除エラー:', err);
      setError('書籍の削除に失敗しました');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      author: '',
      genre_tags: [],
      amazon_link: '',
      summary_link: '',
      cover_image_url: '',
      description: '',
      page_count: '',
      price: ''
    });
    setEditingBook(null);
    setShowForm(false);
  };

  const handleTagToggle = (tagName: string) => {
    setFormData(prev => ({
      ...prev,
      genre_tags: prev.genre_tags.includes(tagName)
        ? prev.genre_tags.filter(t => t !== tagName)
        : [...prev.genre_tags, tagName]
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ios-blue/5 via-white to-ios-purple/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ios-blue mx-auto mb-4"></div>
          <p className="text-ios-gray-600">書籍データを読み込んでいます...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-ios-blue/5 via-white to-ios-purple/5 px-4 py-8">
        <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-ios-gray-800">
                管理画面
              </h1>
              <p className="text-ios-gray-600 mt-2">
                レコメンドシステムの各種データを管理できます
              </p>
            </div>
            <div className="flex space-x-4 flex-shrink-0 w-48 justify-end">
              <Link href="/admin/tags">
                <Button variant="secondary" size="sm" className="px-3 w-10">
                  🏷️
                </Button>
              </Link>
              <Link href="/admin/mappings">
                <Button variant="secondary" size="sm" className="px-3 w-10">
                  🔗
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" size="sm" className="px-3 w-10">
                  🏠
                </Button>
              </Link>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowForm(!showForm)}
                className="px-3 w-10"
              >
                {showForm ? '←' : '📚'}
              </Button>
            </div>
          </div>
        </div>

        {/* エラー・成功メッセージ */}
        {error && (
          <div className="bg-ios-red/10 border border-ios-red/30 rounded-lg p-4 mb-6">
            <p className="text-ios-red font-medium">❌ {error}</p>
          </div>
        )}

        {successMessage && (
          <div className="bg-ios-green/10 border border-ios-green/30 rounded-lg p-4 mb-6">
            <p className="text-ios-green font-medium">✅ {successMessage}</p>
          </div>
        )}

        {showForm ? (
          /* 書籍追加・編集フォーム */
          <Card variant="default" className="p-8">
            <h2 className="text-2xl font-bold text-ios-gray-800 mb-6">
              {editingBook ? '書籍を編集' : '新しい書籍を追加'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="書籍タイトル *"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
                
                <Input
                  label="著者名 *"
                  value={formData.author}
                  onChange={(e) => setFormData({...formData, author: e.target.value})}
                  required
                />
              </div>

              {/* ジャンルタグ選択 */}
              <div>
                <label className="block text-sm font-medium text-ios-gray-700 mb-4">
                  ジャンルタグ * (選択済み: {formData.genre_tags.length}個)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-2">
                  {availableTags.map(tag => (
                    <div
                      key={tag}
                      onClick={() => handleTagToggle(tag)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                        formData.genre_tags.includes(tag)
                          ? 'border-ios-blue bg-ios-blue/10 text-ios-blue'
                          : 'border-ios-gray-300 hover:border-ios-blue/50'
                      }`}
                    >
                      <div className="text-sm font-medium">{tag}</div>
                    </div>
                  ))}
                </div>
                {formData.genre_tags.length === 0 && (
                  <p className="text-sm text-ios-red">少なくとも1つのタグを選択してください</p>
                )}
                <p className="text-sm text-ios-gray-600 mt-2">
                  タグマスターに登録されたタグから選択できます。新しいタグが必要な場合は<Link href="/admin/tags" className="text-ios-blue underline">タグマスター管理</Link>で追加してください。
                </p>
              </div>

              <Input
                label="Amazon リンク *"
                value={formData.amazon_link}
                onChange={(e) => setFormData({...formData, amazon_link: e.target.value})}
                placeholder="https://amazon.co.jp/dp/..."
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="要約リンク"
                  value={formData.summary_link}
                  onChange={(e) => setFormData({...formData, summary_link: e.target.value})}
                  placeholder="https://..."
                />
                
                <Input
                  label="表紙画像URL"
                  value={formData.cover_image_url}
                  onChange={(e) => setFormData({...formData, cover_image_url: e.target.value})}
                  placeholder="https://..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="ページ数"
                  type="number"
                  value={formData.page_count}
                  onChange={(e) => setFormData({...formData, page_count: e.target.value})}
                  placeholder="320"
                />

                <Input
                  label="価格（円）"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  placeholder="1540"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ios-gray-700 mb-2">
                  説明・あらすじ
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-ios-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-ios-blue/50 focus:border-ios-blue"
                  rows={4}
                  placeholder="この本の内容や魅力を簡潔に説明してください..."
                />
              </div>

              <div className="flex space-x-4">
                <Button type="submit" variant="primary">
                  {editingBook ? '更新する' : '追加する'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  キャンセル
                </Button>
              </div>
            </form>
          </Card>
        ) : (
          /* 書籍一覧 */
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {books.map((book) => (
              <Card key={book.id} variant="default" className="overflow-hidden hover:shadow-ios-xl transition-all duration-300 flex flex-col h-full">
                <div className="p-5 flex flex-col h-full">
                  {/* 書籍情報（固定高さ） */}
                  <div className="mb-3">
                    <h3 className="text-lg font-bold text-ios-gray-800 mb-2 h-12 overflow-hidden leading-tight"
                        style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}>
                      {book.title}
                    </h3>
                    <p className="text-ios-gray-600 mb-2 h-5 text-sm">
                      著者: {book.author}
                    </p>
                    
                    {/* ジャンルタグ（固定高さ） */}
                    <div className="flex flex-wrap gap-1 mb-2 h-7 overflow-hidden">
                      {book.genre_tags.map((tag, index) => (
                        <span 
                          key={index}
                          className="bg-ios-purple/10 text-ios-purple text-xs px-2 py-1 rounded-md"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* 説明（固定高さ） */}
                    <div className="h-16 mb-3">
                      {book.description && (
                        <p className="text-sm text-ios-gray-600 overflow-hidden h-full leading-relaxed"
                           style={{
                             display: '-webkit-box',
                             WebkitLineClamp: 3,
                             WebkitBoxOrient: 'vertical'
                           }}>
                          {book.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* フレキシブルスペース */}
                  <div className="flex-grow">
                    {/* メタ情報（固定高さ） */}
                    <div className="text-sm text-ios-gray-500 space-y-1 mb-3">
                      {book.page_count && (
                        <div>ページ数: {book.page_count}ページ</div>
                      )}
                      {book.price && (
                        <div>価格: ¥{book.price.toLocaleString()}</div>
                      )}
                      {book.summary_link && (
                        <div className="text-ios-blue">
                          📝 要約リンク: <a href={book.summary_link} target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">表示</a>
                        </div>
                      )}
                      {book.page_count && (
                        <div>
                          {(() => {
                            const readability = getReadabilityLevel(book.page_count);
                            return (
                              <span className={`text-xs font-medium ${readability.color}`}>
                                📖 {readability.label}
                              </span>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 下部固定要素 */}
                  <div className="mt-auto">
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(book)}
                        className="flex-1 px-3"
                      >
                        ✏️
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(book.id)}
                        className="flex-1 px-3"
                      >
                        🗑️
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {!showForm && books.length === 0 && (
          <div className="text-center py-12">
            <p className="text-ios-gray-600 mb-4">
              まだ書籍が登録されていません
            </p>
            <Button
              variant="primary"
              onClick={() => setShowForm(true)}
            >
              📚 最初の書籍を追加
            </Button>
          </div>
        )}
        </div>
      </div>
    </ProtectedRoute>
  );
}