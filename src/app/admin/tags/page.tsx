'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import ManagementSelector from '@/components/admin/ManagementSelector';
import { supabase } from '@/lib/supabase';
import { getTagCategories } from '@/lib/search';
import { GenreTag } from '@/types';

export default function TagsManagementPage() {
  const [tags, setTags] = useState<GenreTag[]>([]);
  const [tagCategories, setTagCategories] = useState<Array<{
    category: string;
    description: string;
    tags: Array<{ tag: string; count: number }>;
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTag, setEditingTag] = useState<GenreTag | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'genre',
    display_order: '1',
    is_active: true
  });

  const categories = [
    { value: 'genre', label: 'ジャンル' },
    { value: 'knowledge', label: '知識・教養' },
    { value: 'skill', label: 'スキル' },
    { value: 'growth', label: '自己成長' },
    { value: 'relaxation', label: 'リラックス' },
    { value: 'common', label: '共通' }
  ];

  // 質問で使用されているジャンルタグ
  const questionGenres = [
    '自己啓発', 'ビジネス', '心理学', '哲学', '歴史', '科学', '健康', '小説'
  ];

  useEffect(() => {
    // ページ遷移時にスクロール位置を最上部に設定
    window.scrollTo(0, 0);
    loadTags();
    loadTagCategories();
  }, []);

  const loadTags = async () => {
    try {
      setIsLoading(true);
      
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'your_supabase_url') {
        setError('Supabaseが設定されていません。モックデータを表示しています。');
        setTags([
          {
            id: '1',
            name: '自己啓発',
            description: '成功法則、習慣形成、モチベーション',
            category: 'genre',
            purpose_mapping: [],
            display_order: 1,
            is_active: true,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z'
          },
          {
            id: '2',
            name: 'ビジネス',
            description: '経営、マーケティング、投資',
            category: 'genre',
            purpose_mapping: [],
            display_order: 2,
            is_active: true,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z'
          }
        ]);
        return;
      }

      console.log('タグマスタークエリ実行開始');
      const { data, error } = await supabase
        .from('genre_tags')
        .select('*')
        .order('category, display_order');

      console.log('タグマスタークエリ結果:', { data: data?.length || 0, error });
      
      if (error) throw error;
      setTags(data || []);
    } catch (err) {
      console.error('タグデータの読み込みエラー:', err);
      console.error('エラーの詳細:', {
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined,
        error: err
      });
      setError('タグデータの読み込みに失敗しました。モックデータを表示しています。');
      setTags([
        {
          id: '1',
          name: '自己啓発',
          description: '成功法則、習慣形成、モチベーション',
          category: 'genre',
          purpose_mapping: [],
          display_order: 1,
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTagCategories = async () => {
    try {
      const categories = await getTagCategories();
      setTagCategories(categories);
    } catch (err) {
      console.error('タグ分類データの読み込みエラー:', err);
      // エラーの場合は空の配列を設定
      setTagCategories([]);
    }
  };


  const groupedTags = tags.reduce((acc, tag) => {
    if (!acc[tag.category]) {
      acc[tag.category] = [];
    }
    acc[tag.category].push(tag);
    return acc;
  }, {} as Record<string, GenreTag[]>);

  const handleEdit = (tag: GenreTag) => {
    setEditingTag(tag);
    setFormData({
      name: tag.name,
      description: tag.description || '',
      category: tag.category,
      display_order: tag.display_order.toString(),
      is_active: tag.is_active
    });
    setShowForm(true);
  };

  const handleDelete = async (tagId: string) => {
    if (!confirm('このタグを削除しますか？')) return;

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'your_supabase_url') {
        setError('Supabaseが設定されていないため、タグの削除はできません。');
        return;
      }

      const { error } = await supabase
        .from('genre_tags')
        .delete()
        .eq('id', tagId);

      if (error) throw error;
      setSuccessMessage('タグを削除しました');
      loadTags();
    } catch (err) {
      console.error('タグ削除エラー:', err);
      setError('タグの削除に失敗しました');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'your_supabase_url') {
        setError('Supabaseが設定されていないため、タグの保存はできません。');
        return;
      }

      const tagData = {
        name: formData.name,
        description: formData.description || null,
        category: formData.category,
        display_order: parseInt(formData.display_order),
        is_active: formData.is_active
      };

      if (editingTag) {
        // 更新
        const { error } = await supabase
          .from('genre_tags')
          .update(tagData)
          .eq('id', editingTag.id);

        if (error) throw error;
        setSuccessMessage('タグを更新しました');
      } else {
        // 新規作成
        const { error } = await supabase
          .from('genre_tags')
          .insert([tagData]);

        if (error) throw error;
        setSuccessMessage('タグを追加しました');
      }

      resetForm();
      loadTags();
    } catch (err) {
      console.error('タグ保存エラー:', err);
      setError('タグの保存に失敗しました');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'genre',
      display_order: '1',
      is_active: true
    });
    setEditingTag(null);
    setShowForm(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ios-blue/5 via-white to-ios-purple/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ios-blue mx-auto mb-4"></div>
          <p className="text-ios-gray-600">タグデータを読み込んでいます...</p>
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
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-ios-gray-800">タグマスター管理</h1>
              <p className="text-ios-gray-600 mt-2">
                システムで使用されるすべてのタグを管理
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <ManagementSelector compact />
              
              <Link href="/admin/mappings">
                <Button variant="secondary" size="sm" className="px-3 w-10" title="質問マッピング管理">
                  🔗
                </Button>
              </Link>
              
              <Link href="/">
                <Button variant="outline" size="sm" className="px-3 w-10" title="ホームに戻る">
                  🏠
                </Button>
              </Link>
              
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowForm(!showForm)}
                className="px-3 w-10"
                title={showForm ? '戻る' : '新しいタグを追加'}
              >
                {showForm ? '←' : '🏷️'}
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
          /* タグ追加・編集フォーム */
          <Card variant="default" className="p-8 mb-8">
            <h2 className="text-2xl font-bold text-ios-gray-800 mb-6">
              {editingTag ? 'タグを編集' : '新しいタグを追加'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="タグ名 *"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
                
                <Input
                  label="表示順 *"
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({...formData, display_order: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ios-gray-700 mb-2">
                  カテゴリ *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-ios-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-ios-blue/50 focus:border-ios-blue"
                  required
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>{category.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-ios-gray-700 mb-2">
                  説明
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-ios-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-ios-blue/50 focus:border-ios-blue"
                  rows={3}
                  placeholder="タグの説明を入力してください..."
                />
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  className="rounded border-ios-gray-300 text-ios-blue focus:ring-ios-blue/50"
                />
                <label htmlFor="is_active" className="text-sm text-ios-gray-700">
                  アクティブ（使用可能）
                </label>
              </div>

              <div className="flex space-x-4">
                <Button type="submit" variant="primary">
                  {editingTag ? '更新する' : '追加する'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  キャンセル
                </Button>
              </div>
            </form>
          </Card>
        ) : (
          /* タグ一覧（分類別または従来の表示） */
          <div className="space-y-8">
            {tagCategories.length > 0 ? (
              /* 分類別表示 */
              tagCategories.map(category => {
                if (category.tags.length === 0) return null;
                
                return (
                  <div key={category.category}>
                    <h2 className="text-xl font-bold text-ios-gray-800 mb-4">
                      📁 {category.category} ({category.tags.length}件)
                    </h2>
                    <p className="text-sm text-ios-gray-600 mb-4">
                      {category.description}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {category.tags.map((tagInfo) => {
                        const tag = tags.find(t => t.name === tagInfo.tag);
                        if (!tag) return null;
                        
                        return (
                          <Card key={tag.id} variant="default" className="overflow-hidden hover:shadow-ios-xl transition-all duration-300 flex flex-col h-full">
                            <div className="p-4 flex flex-col h-full">
                              <div className="flex-grow">
                                <div className="flex justify-between items-start mb-2">
                                  <h3 className="font-bold text-ios-gray-800">
                                    {tag.name}
                                  </h3>
                                  <span className="text-xs text-ios-gray-500">
                                    {tagInfo.count}冊
                                  </span>
                                </div>

                                {tag.description && (
                                  <p className="text-sm text-ios-gray-600 mb-2">
                                    {tag.description}
                                  </p>
                                )}

                                {/* 質問で使用されているかどうかの表示 */}
                                {questionGenres.includes(tag.name) && (
                                  <div className="mb-2">
                                    <span className="text-xs bg-ios-blue/10 text-ios-blue px-2 py-1 rounded-md">
                                      📝 質問項目で使用中
                                    </span>
                                  </div>
                                )}

                                <div className="text-xs text-ios-gray-500">
                                  作成日: {new Date(tag.created_at).toLocaleDateString('ja-JP')}
                                </div>
                              </div>

                              {/* 編集・削除ボタン */}
                              <div className="mt-3 flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEdit(tag)}
                                  className="flex-1 px-3"
                                >
                                  ✏️
                                </Button>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => handleDelete(tag.id)}
                                  className="flex-1 px-3"
                                >
                                  🗑️
                                </Button>
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            ) : (
              /* 従来の表示（フォールバック） */
              categories.map(category => {
                const categoryTags = groupedTags[category.value] || [];
                if (categoryTags.length === 0) return null;
                
                return (
                  <div key={category.value}>
                    <h2 className="text-xl font-bold text-ios-gray-800 mb-4">
                      📁 {category.label} ({categoryTags.length}件)
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {categoryTags.map((tag) => (
                        <Card key={tag.id} variant="default" className="overflow-hidden hover:shadow-ios-xl transition-all duration-300 flex flex-col h-full">
                          <div className="p-4 flex flex-col h-full">
                            <div className="flex-grow">
                              <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-ios-gray-800">
                                  {tag.name}
                                </h3>
                                <span className="text-xs text-ios-gray-500">
                                  #{tag.display_order}
                                </span>
                              </div>

                              {tag.description && (
                                <p className="text-sm text-ios-gray-600 mb-2">
                                  {tag.description}
                                </p>
                              )}

                              {/* 質問で使用されているかどうかの表示 */}
                              {questionGenres.includes(tag.name) && (
                                <div className="mb-2">
                                  <span className="text-xs bg-ios-blue/10 text-ios-blue px-2 py-1 rounded-md">
                                    📝 質問項目で使用中
                                  </span>
                                </div>
                              )}

                              <div className="text-xs text-ios-gray-500">
                                作成日: {new Date(tag.created_at).toLocaleDateString('ja-JP')}
                              </div>
                            </div>

                            {/* 編集・削除ボタン */}
                            <div className="mt-3 flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(tag)}
                                className="flex-1 px-3"
                              >
                                ✏️
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleDelete(tag.id)}
                                className="flex-1 px-3"
                              >
                                🗑️
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {!showForm && Object.keys(groupedTags).length === 0 && (
          <div className="text-center py-12">
            <p className="text-ios-gray-600 mb-4">
              まだタグが登録されていません
            </p>
            <Button
              variant="primary"
              onClick={() => setShowForm(true)}
            >
              🏷️ 最初のタグを追加
            </Button>
          </div>
        )}
        </div>
      </div>
    </ProtectedRoute>
  );
}