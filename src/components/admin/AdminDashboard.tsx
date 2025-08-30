'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import ManagementSelector, { ManagementStats, ManagementNavigation } from './ManagementSelector';
import { supabase } from '@/lib/supabase';

interface DashboardStats {
  books: number;
  stores: number;
  archives: number;
  rankings: number;
  introducers: number;
  tags: number;
  mappings: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    books: 0,
    stores: 0,
    archives: 0,
    rankings: 0,
    introducers: 0,
    tags: 0,
    mappings: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      // Supabaseが設定されていない場合はモックデータを使用
      if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'your_supabase_url' || supabaseUrl === 'https://placeholder.supabase.co') {
        setStats({
          books: 25,
          stores: 12,
          archives: 8,
          rankings: 11,
          introducers: 8,
          tags: 15,
          mappings: 18
        });
        return;
      }

      // 各テーブルのカウントを並列で取得
      const [booksResult, storesResult, archivesResult, rankingsResult, introducersResult, tagsResult, mappingsResult] = await Promise.all([
        supabase.from('books').select('id', { count: 'exact', head: true }),
        supabase.from('stores').select('id', { count: 'exact', head: true }),
        supabase.from('archives').select('id', { count: 'exact', head: true }),
        supabase.from('ranking_books').select('id', { count: 'exact', head: true }).eq('is_visible', true),
        supabase.from('introducers').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('genre_tags').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('question_mappings').select('id', { count: 'exact', head: true })
      ]);

      setStats({
        books: booksResult.count || 0,
        stores: storesResult.count || 0,
        archives: archivesResult.count || 0,
        rankings: rankingsResult.count || 0,
        introducers: introducersResult.count || 0,
        tags: tagsResult.count || 0,
        mappings: mappingsResult.count || 0
      });

      // エラーチェック
      const errors = [booksResult.error, storesResult.error, archivesResult.error, rankingsResult.error, introducersResult.error, tagsResult.error, mappingsResult.error].filter(Boolean);
      if (errors.length > 0) {
        console.warn('一部の統計データ取得でエラーが発生:', errors);
      }

    } catch (err) {
      console.error('統計データの読み込みエラー:', err);
      setError('統計データの読み込みに失敗しました');
      
      // フォールバック用のモックデータ
      setStats({
        books: 0,
        stores: 0,
        archives: 0,
        rankings: 0,
        introducers: 0,
        tags: 0,
        mappings: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ios-blue/5 via-white to-ios-purple/5 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* メインナビゲーション */}
        <div className="mb-8">
          <ManagementNavigation />
        </div>

        {/* エラーメッセージ */}
        {error && (
          <div className="bg-ios-red/10 border border-ios-red/30 rounded-lg p-4 mb-6">
            <p className="text-ios-red font-medium">❌ {error}</p>
          </div>
        )}

        {/* 統計カード */}
        <ManagementStats
          booksCount={stats.books}
          storesCount={stats.stores}
          archivesCount={stats.archives}
          rankingsCount={stats.rankings}
          introducersCount={stats.introducers}
          isLoading={isLoading}
        />

        {/* 管理対象選択（グリッド表示） */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-ios-gray-800 mb-6">管理対象を選択</h2>
          <ManagementSelector showAsGrid />
        </div>

        {/* システム管理セクション */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-ios-gray-800 mb-6">システム管理</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/admin/tags">
              <Card 
                variant="default" 
                className="p-6 hover:shadow-ios-xl transition-all duration-300 cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-2xl group-hover:scale-110 transition-transform duration-300">
                        🏷️
                      </span>
                      <h3 className="text-xl font-bold text-ios-gray-800">
                        タグマスター管理
                      </h3>
                    </div>
                    <p className="text-ios-gray-600 text-sm mb-2">
                      ジャンルタグの作成・編集・管理
                    </p>
                    <div className="text-2xl font-bold text-ios-purple">
                      {isLoading ? (
                        <div className="animate-pulse bg-ios-gray-200 h-8 w-16 rounded"></div>
                      ) : (
                        `${stats.tags}個`
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </Link>

            <Link href="/admin/mappings">
              <Card 
                variant="default" 
                className="p-6 hover:shadow-ios-xl transition-all duration-300 cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-2xl group-hover:scale-110 transition-transform duration-300">
                        🔗
                      </span>
                      <h3 className="text-xl font-bold text-ios-gray-800">
                        質問マッピング管理
                      </h3>
                    </div>
                    <p className="text-ios-gray-600 text-sm mb-2">
                      質問とタグの関連付け管理
                    </p>
                    <div className="text-2xl font-bold text-ios-blue">
                      {isLoading ? (
                        <div className="animate-pulse bg-ios-gray-200 h-8 w-16 rounded"></div>
                      ) : (
                        `${stats.mappings}個`
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          </div>
        </div>

        {/* クイックアクション */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-ios-gray-800 mb-6">クイックアクション</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link href="/admin?form=new">
              <Button variant="primary" className="w-full p-4 h-auto flex flex-col items-center space-y-2">
                <span className="text-2xl">📚</span>
                <span>新しい書籍を追加</span>
              </Button>
            </Link>
            
            <Link href="/admin/rankings">
              <Button variant="secondary" className="w-full p-4 h-auto flex flex-col items-center space-y-2 bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200 text-orange-600 hover:bg-gradient-to-r hover:from-orange-100 hover:to-yellow-100">
                <span className="text-2xl">🏆</span>
                <span>ランキング書籍を追加</span>
              </Button>
            </Link>
            
            <Link href="/admin/stores?form=new">
              <Button variant="secondary" className="w-full p-4 h-auto flex flex-col items-center space-y-2">
                <span className="text-2xl">🏪</span>
                <span>新しい店舗を追加</span>
              </Button>
            </Link>
            
            <Link href="/admin/archives?form=new">
              <Button variant="secondary" className="w-full p-4 h-auto flex flex-col items-center space-y-2">
                <span className="text-2xl">📰</span>
                <span>新しい記事を追加</span>
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Link href="/admin/introducers">
              <Button variant="secondary" className="w-full p-4 h-auto flex flex-col items-center space-y-2 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200 text-indigo-600 hover:bg-gradient-to-r hover:from-indigo-100 hover:to-purple-100">
                <span className="text-2xl">👤</span>
                <span>紹介者を管理</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* リフレッシュボタン */}
        <div className="text-center">
          <Button
            variant="outline"
            onClick={loadStats}
            disabled={isLoading}
            className="flex items-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                <span>読み込み中...</span>
              </>
            ) : (
              <>
                <span>🔄</span>
                <span>統計を更新</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}