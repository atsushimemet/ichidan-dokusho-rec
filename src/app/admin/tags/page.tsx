'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { createClient } from '@supabase/supabase-js';
import { GenreTag } from '@/types';

export default function TagsManagementPage() {
  const [tags, setTags] = useState<GenreTag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    { value: 'genre', label: 'ジャンル' },
    { value: 'knowledge', label: '知識・教養' },
    { value: 'skill', label: 'スキル' },
    { value: 'growth', label: '自己成長' },
    { value: 'relaxation', label: 'リラックス' },
    { value: 'common', label: '共通' }
  ];

  useEffect(() => {
    loadTags();
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

      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const { data, error } = await supabase
        .from('genre_tags')
        .select('*')
        .order('category, display_order');

      if (error) throw error;
      setTags(data || []);
    } catch (err) {
      console.error('タグデータの読み込みエラー:', err);
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


  const groupedTags = tags.reduce((acc, tag) => {
    if (!acc[tag.category]) {
      acc[tag.category] = [];
    }
    acc[tag.category].push(tag);
    return acc;
  }, {} as Record<string, GenreTag[]>);

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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-ios-gray-800">
              タグマスター一覧
            </h1>
            <p className="text-ios-gray-600 mt-2">
              システムで使用されるすべてのタグを確認できます
            </p>
            <div className="flex space-x-4 mt-4">
              <Link href="/admin">
                <Button variant="outline" size="sm" className="px-3">
                  ←
                </Button>
              </Link>
              <Link href="/admin/mappings">
                <Button variant="secondary" size="sm" className="px-3">
                  🔗
                </Button>
              </Link>
            </div>
          </div>
          <div className="text-sm text-ios-gray-500">
            読み取り専用
          </div>
        </div>

        {/* エラーメッセージ */}
        {error && (
          <div className="bg-ios-red/10 border border-ios-red/30 rounded-lg p-4 mb-6">
            <p className="text-ios-red font-medium">❌ {error}</p>
          </div>
        )}

        {/* タグ一覧 */}
          /* タグ一覧 */
          <div className="space-y-8">
            {categories.map(category => {
              const categoryTags = groupedTags[category.value] || [];
              if (categoryTags.length === 0) return null;
              
              return (
                <div key={category.value}>
                  <h2 className="text-xl font-bold text-ios-gray-800 mb-4">
                    📁 {category.label} ({categoryTags.length}件)
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {categoryTags.map((tag) => (
                      <Card key={tag.id} variant="default" className="p-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <h3 className="font-bold text-ios-gray-800">
                              {tag.name}
                            </h3>
                            <span className="text-xs text-ios-gray-500">
                              #{tag.display_order}
                            </span>
                          </div>

                          {tag.description && (
                            <p className="text-sm text-ios-gray-600">
                              {tag.description}
                            </p>
                          )}

                          <div className="text-xs text-ios-gray-500">
                            作成日: {new Date(tag.created_at).toLocaleDateString('ja-JP')}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )

        {Object.keys(groupedTags).length === 0 && (
          <div className="text-center py-12">
            <p className="text-ios-gray-600 mb-4">
              まだタグが登録されていません
            </p>
            <p className="text-ios-gray-500 text-sm">
              タグの追加・編集は別の管理機能で行います
            </p>
          </div>
        )}
        </div>
      </div>
    </ProtectedRoute>
  );
}