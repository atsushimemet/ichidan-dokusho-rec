'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { searchBooks, getAvailableTags, getPopularTags, SearchFilters } from '@/lib/search';
import { Book } from '@/lib/supabase';
import { getReadabilityLevel } from '@/lib/utils';

export default function SearchPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [popularTags, setPopularTags] = useState<Array<{ tag: string; count: number }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  const pageSize = 12;

  useEffect(() => {
    // ページ遷移時にスクロール位置を最上部に設定
    window.scrollTo(0, 0);
    loadInitialData();
  }, []);

  useEffect(() => {
    if (currentPage > 1) {
      performSearch();
    }
  }, [currentPage]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const [tags, popular] = await Promise.all([
        getAvailableTags(),
        getPopularTags() // 制限なしで全てのタグを取得
      ]);
      setAvailableTags(tags);
      setPopularTags(popular);
      await performSearch();
    } catch (err) {
      console.error('初期データ読み込みエラー:', err);
      setError('データの読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const performSearch = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await searchBooks(filters, currentPage, pageSize);
      setBooks(result.books);
      setTotalCount(result.totalCount);
    } catch (err) {
      console.error('検索エラー:', err);
      setError('検索に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    performSearch();
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleTagToggle = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags?.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...(prev.tags || []), tag]
    }));
  };

  const handlePopularTagClick = (tag: string) => {
    // 人気タグをクリックした時は、そのタグのみで検索
    setFilters({ tags: [tag] });
    setCurrentPage(1);
    // 即座に検索実行
    setTimeout(() => performSearch(), 0);
  };

  const clearFilters = () => {
    setFilters({});
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="min-h-screen bg-gradient-to-br from-ios-blue/5 via-white to-ios-purple/5 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-ios-gray-800">
              書籍検索
            </h1>
            <p className="text-ios-gray-600 mt-2">
              タグ、タイトル、著者から書籍を検索できます
            </p>
          </div>
          <div className="flex space-x-4 justify-end">
            <Link href="/">
              <Button variant="outline" size="sm" className="px-3 w-10">
                🏠
              </Button>
            </Link>
            <Link href="/admin">
              <Button variant="primary" size="sm" className="px-3 w-10">
                📚
              </Button>
            </Link>
          </div>
        </div>

        {/* エラーメッセージ */}
        {error && (
          <div className="bg-ios-red/10 border border-ios-red/30 rounded-lg p-4 mb-6">
            <p className="text-ios-red font-medium">❌ {error}</p>
          </div>
        )}

        {/* 検索フィルター */}
        <Card variant="default" className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-ios-gray-800">検索条件</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? 'フィルターを隠す' : 'フィルターを表示'}
            </Button>
          </div>

          {/* 基本検索 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Input
              label="タイトル"
              placeholder="書籍タイトルを入力"
              value={filters.title || ''}
              onChange={(e) => handleFilterChange('title', e.target.value)}
            />
            <Input
              label="著者"
              placeholder="著者名を入力"
              value={filters.author || ''}
              onChange={(e) => handleFilterChange('author', e.target.value)}
            />
            <div className="flex items-end">
              <Button
                variant="primary"
                onClick={handleSearch}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? '検索中...' : '🔍 検索'}
              </Button>
            </div>
          </div>

          {/* 詳細フィルター */}
          {showFilters && (
            <div className="border-t pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <Input
                  label="最大ページ数"
                  type="number"
                  placeholder="500"
                  value={filters.maxPages?.toString() || ''}
                  onChange={(e) => handleFilterChange('maxPages', e.target.value ? parseInt(e.target.value) : undefined)}
                />
                <Input
                  label="最大価格"
                  type="number"
                  placeholder="3000"
                  value={filters.maxPrice?.toString() || ''}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value ? parseInt(e.target.value) : undefined)}
                />
              </div>

              {/* タグフィルター */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-ios-gray-800 mb-3">タグで絞り込み</h3>
                <p className="text-ios-gray-600 text-sm mb-3">複数のタグを選択できます</p>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => {
                        handleTagToggle(tag);
                        // タグ選択後、少し遅延してから検索実行
                        setTimeout(() => {
                          setCurrentPage(1);
                          performSearch();
                        }, 100);
                      }}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                        filters.tags?.includes(tag)
                          ? 'bg-ios-blue text-white shadow-md'
                          : 'bg-ios-gray-100 text-ios-gray-700 hover:bg-ios-gray-200 hover:shadow-sm'
                      }`}
                      title={`${tag}で絞り込み`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="flex-1"
                >
                  🗑️ 条件をクリア
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSearch}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? '検索中...' : '🔍 検索実行'}
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* 全タグ */}
        <Card variant="default" className="p-6 mb-6">
          <h3 className="text-lg font-semibold text-ios-gray-800 mb-3">全タグ一覧</h3>
          <p className="text-ios-gray-600 text-sm mb-3">タグをクリックすると、そのタグを持つ書籍が表示されます（将来的にクリック回数順でソート予定）</p>
          <div className="flex flex-wrap gap-2">
            {popularTags.map(({ tag, count }) => (
              <button
                key={tag}
                onClick={() => handlePopularTagClick(tag)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                  filters.tags?.includes(tag)
                    ? 'bg-ios-blue text-white shadow-md'
                    : 'bg-ios-gray-100 text-ios-gray-700 hover:bg-ios-gray-200 hover:shadow-sm'
                }`}
                title={`${tag}を持つ書籍を検索 (${count}冊)`}
              >
                {tag} ({count})
              </button>
            ))}
          </div>
        </Card>

        {/* 検索結果 */}
        <div className="mb-6" id="search-results">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-ios-gray-800">
              検索結果 ({totalCount}件)
            </h2>
            {filters.tags && filters.tags.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-ios-gray-600">選択中:</span>
                <div className="flex flex-wrap gap-1">
                  {filters.tags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => {
                        handleTagToggle(tag);
                        setTimeout(() => {
                          setCurrentPage(1);
                          performSearch();
                        }, 100);
                      }}
                      className="px-2 py-1 bg-ios-blue text-white text-xs rounded-full hover:bg-ios-blue/80 transition-colors flex items-center gap-1"
                      title={`${tag}を削除`}
                    >
                      {tag} ×
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ios-blue mx-auto mb-4"></div>
              <p className="text-ios-gray-600">検索中...</p>
            </div>
          ) : books.length === 0 ? (
            <Card variant="default" className="p-8 text-center">
              <p className="text-ios-gray-600 text-lg">該当する書籍が見つかりませんでした</p>
              <p className="text-ios-gray-500 mt-2">検索条件を変更してお試しください</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {books.map(book => (
                <Card key={book.id} variant="default" className="overflow-hidden hover:shadow-ios-xl transition-all duration-300 flex flex-col h-full">
                  <div className="p-5 flex flex-col h-full">
                    {/* 書籍情報 */}
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
                      <div className="flex flex-wrap gap-1 mb-2">
                        {book.genre_tags.map(tag => (
                          <button
                            key={tag}
                            onClick={() => handlePopularTagClick(tag)}
                            className="px-2 py-1 bg-ios-blue/10 text-ios-blue text-xs rounded-full hover:bg-ios-blue/20 transition-colors cursor-pointer"
                            title={`${tag}で検索`}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                      {book.description && (
                        <p className="text-ios-gray-600 text-sm mb-3 h-16 overflow-hidden leading-tight"
                           style={{
                             display: '-webkit-box',
                             WebkitLineClamp: 3,
                             WebkitBoxOrient: 'vertical'
                           }}>
                          {book.description}
                        </p>
                      )}
                    </div>

                    {/* メタ情報 */}
                    <div className="flex-grow">
                      <div className="text-sm text-ios-gray-500 space-y-1 mb-3">
                        {book.page_count && (
                          <div>ページ数: {book.page_count}ページ</div>
                        )}
                        {book.price && (
                          <div>価格: ¥{book.price.toLocaleString()}</div>
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

                    {/* アクションボタン */}
                    <div className="mt-auto">
                      <div className="flex space-x-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => window.open(book.amazon_link, '_blank')}
                          className="flex-1"
                        >
                          📚 Amazon
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* ページネーション */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCurrentPage(prev => Math.max(1, prev - 1));
                // ページ変更後にスクロール位置を最上部に設定
                setTimeout(() => window.scrollTo(0, 0), 100);
              }}
              disabled={currentPage === 1}
            >
              ← 前へ
            </Button>
            
            <span className="text-ios-gray-600">
              {currentPage} / {totalPages}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCurrentPage(prev => Math.min(totalPages, prev + 1));
                // ページ変更後にスクロール位置を最上部に設定
                setTimeout(() => window.scrollTo(0, 0), 100);
              }}
              disabled={currentPage === totalPages}
            >
              次へ →
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
