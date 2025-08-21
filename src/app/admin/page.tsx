'use client';

import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { createClient } from '@supabase/supabase-js';
import { Book } from '@/types';

export default function AdminPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    genre_tags: '',
    amazon_link: '',
    summary_link: '',
    cover_image_url: '',
    description: '',
    difficulty_level: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    reading_time_hours: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      setIsLoading(true);
      
      // Supabaseの環境変数が設定されていない場合はモックデータを表示
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
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
            difficulty_level: 'beginner',
            reading_time_hours: 8,
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
            difficulty_level: 'intermediate',
            reading_time_hours: 12,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z'
          }
        ]);
        return;
      }

      // Supabaseクライアントを動的に作成
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBooks(data || []);
    } catch (err) {
      console.error('書籍データの読み込みエラー:', err);
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
          difficulty_level: 'beginner',
          reading_time_hours: 8,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // Supabaseが設定されていない場合はエラー表示
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'your_supabase_url') {
      setError('Supabaseが設定されていないため、書籍の保存はできません。');
      return;
    }

    try {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      
      const bookData = {
        title: formData.title,
        author: formData.author,
        genre_tags: formData.genre_tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        amazon_link: formData.amazon_link,
        summary_link: formData.summary_link || null,
        cover_image_url: formData.cover_image_url || null,
        description: formData.description || null,
        difficulty_level: formData.difficulty_level,
        reading_time_hours: formData.reading_time_hours ? parseInt(formData.reading_time_hours) : null
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
      genre_tags: book.genre_tags.join(', '),
      amazon_link: book.amazon_link,
      summary_link: book.summary_link || '',
      cover_image_url: book.cover_image_url || '',
      description: book.description || '',
      difficulty_level: book.difficulty_level,
      reading_time_hours: book.reading_time_hours?.toString() || ''
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
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      
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
      genre_tags: '',
      amazon_link: '',
      summary_link: '',
      cover_image_url: '',
      description: '',
      difficulty_level: 'beginner',
      reading_time_hours: ''
    });
    setEditingBook(null);
    setShowForm(false);
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
    <div className="min-h-screen bg-gradient-to-br from-ios-blue/5 via-white to-ios-purple/5 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-ios-gray-800">
              書籍管理
            </h1>
            <p className="text-ios-gray-600 mt-2">
              レコメンドシステムの書籍データを管理できます
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? '一覧に戻る' : '📚 新しい書籍を追加'}
          </Button>
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

              <Input
                label="ジャンルタグ * (カンマ区切りで入力)"
                value={formData.genre_tags}
                onChange={(e) => setFormData({...formData, genre_tags: e.target.value})}
                placeholder="自己啓発, ビジネス, コミュニケーション"
                helperText="例: 自己啓発, ビジネス, コミュニケーション"
                required
              />

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
                <div>
                  <label className="block text-sm font-medium text-ios-gray-700 mb-2">
                    難易度 *
                  </label>
                  <select
                    value={formData.difficulty_level}
                    onChange={(e) => setFormData({...formData, difficulty_level: e.target.value as 'beginner' | 'intermediate' | 'advanced'})}
                    className="w-full px-4 py-3 rounded-xl border border-ios-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-ios-blue/50 focus:border-ios-blue"
                    required
                  >
                    <option value="beginner">初級（読みやすい）</option>
                    <option value="intermediate">中級（標準的）</option>
                    <option value="advanced">上級（専門的）</option>
                  </select>
                </div>

                <Input
                  label="読書時間（時間）"
                  type="number"
                  value={formData.reading_time_hours}
                  onChange={(e) => setFormData({...formData, reading_time_hours: e.target.value})}
                  placeholder="8"
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
              <Card key={book.id} variant="default" className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-ios-gray-800 mb-1">
                      {book.title}
                    </h3>
                    <p className="text-ios-gray-600">
                      著者: {book.author}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {book.genre_tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="bg-ios-purple/10 text-ios-purple text-xs px-2 py-1 rounded-md"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {book.description && (
                    <p className="text-sm text-ios-gray-600 overflow-hidden"
                       style={{
                         display: '-webkit-box',
                         WebkitLineClamp: 3,
                         WebkitBoxOrient: 'vertical'
                       }}>
                      {book.description}
                    </p>
                  )}

                  <div className="text-sm text-ios-gray-500 space-y-1">
                    <div>
                      難易度: {
                        book.difficulty_level === 'beginner' ? '初級' :
                        book.difficulty_level === 'intermediate' ? '中級' : '上級'
                      }
                    </div>
                    {book.reading_time_hours && (
                      <div>読書時間: 約{book.reading_time_hours}時間</div>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(book)}
                      className="flex-1"
                    >
                      ✏️ 編集
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(book.id)}
                      className="flex-1"
                    >
                      🗑️ 削除
                    </Button>
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
  );
}