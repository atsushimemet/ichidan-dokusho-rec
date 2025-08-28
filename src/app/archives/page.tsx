'use client';

import { useEffect, useState } from 'react';
import { Archive } from '@/types';
import { searchArchives } from '@/data/archives';

export default function ArchivesPage() {
  const [archives, setArchives] = useState<Archive[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [isSearching, setIsSearching] = useState(false);

  const fetchArchives = async (query: string = '', pageNum: number = 1, append: boolean = false) => {
    try {
      if (!append) {
        setLoading(true);
      }
      setIsSearching(true);
      setError(null);
      
      const result = await searchArchives(query, pageNum, 12);
      
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

  useEffect(() => {
    fetchArchives();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setPage(1);
      fetchArchives(searchQuery, 1, false);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchArchives(searchQuery, nextPage, true);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ios-gray-50 to-white">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-ios-gray-800 mb-4">
              Good Archives
            </h1>
            <p className="text-lg text-ios-gray-600 max-w-2xl mx-auto">
              過去の本にまつわる貴重な記事やコンテンツをお楽しみください
            </p>
          </div>
          
          {/* 検索バー */}
          <div className="max-w-xl mx-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-ios-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="記事を検索..."
                className="block w-full pl-10 pr-3 py-3 border border-ios-gray-200 rounded-xl bg-white text-ios-gray-900 placeholder-ios-gray-500 focus:outline-none focus:ring-2 focus:ring-ios-blue focus:border-transparent transition-all duration-300"
              />
              {isSearching && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-ios-blue"></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 結果数表示 */}
        {!loading && !error && (
          <div className="mb-8">
            <p className="text-ios-gray-600">
              {searchQuery ? `"${searchQuery}" の検索結果: ` : ''}
              {total}件の記事
            </p>
          </div>
        )}

        {/* ローディング状態 */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-ios overflow-hidden h-80 animate-pulse">
                <div className="p-6">
                  <div className="h-6 bg-ios-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-ios-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-ios-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-ios-gray-200 rounded mb-4"></div>
                  <div className="h-10 bg-ios-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* エラー状態 */}
        {error && (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md mx-auto">
              <div className="text-red-600 text-4xl mb-4">⚠️</div>
              <div className="text-red-800 font-medium mb-2">エラーが発生しました</div>
              <div className="text-red-600">{error}</div>
              <button
                onClick={() => fetchArchives(searchQuery, 1, false)}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                再試行
              </button>
            </div>
          </div>
        )}

        {/* 記事なし */}
        {!loading && !error && archives.length === 0 && (
          <div className="text-center py-12">
            <div className="text-ios-gray-400 text-6xl mb-6">📰</div>
            <h3 className="text-xl font-medium text-ios-gray-800 mb-2">
              記事が見つかりませんでした
            </h3>
            <p className="text-ios-gray-600">
              {searchQuery ? '検索条件を変更してみてください' : '記事が登録されていません'}
            </p>
          </div>
        )}

        {/* 記事グリッド */}
        {!loading && !error && archives.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {archives.map((archive, index) => (
                <div
                  key={archive.id}
                  className="bg-white rounded-2xl shadow-ios hover:shadow-ios-lg transition-all duration-300 overflow-hidden group hover-lift"
                  style={{ animationDelay: `${(index % 12) * 0.1}s` }}
                >
                  <div className="p-6 flex flex-col h-80">
                    {/* タイトル */}
                    <div className="mb-4">
                      <h3 className="font-bold text-xl text-ios-gray-800 mb-2 line-clamp-2 leading-tight group-hover:text-ios-blue transition-colors">
                        {archive.title}
                      </h3>
                    </div>
                    
                    {/* 説明 */}
                    <div className="flex-grow mb-6">
                      <p className="text-ios-gray-600 leading-relaxed line-clamp-5">
                        {archive.description}
                      </p>
                    </div>
                    
                    {/* 作成日とリンクボタン */}
                    <div className="mt-auto">
                      <div className="text-xs text-ios-gray-400 mb-3">
                        {new Date(archive.created_at).toLocaleDateString('ja-JP', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                      <a
                        href={archive.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center w-full px-4 py-3 bg-gradient-to-r from-ios-blue to-ios-purple text-white font-medium rounded-xl hover:shadow-lg transition-all duration-300 group"
                      >
                        <span>記事を読む</span>
                        <svg
                          className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* もっと読み込むボタン */}
            {hasMore && (
              <div className="text-center mt-12">
                <button
                  onClick={handleLoadMore}
                  disabled={isSearching}
                  className="px-8 py-3 bg-white border-2 border-ios-blue text-ios-blue font-medium rounded-xl hover:bg-ios-blue hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSearching ? (
                    <>
                      <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                      読み込み中...
                    </>
                  ) : (
                    <>
                      さらに読み込む
                      <svg
                        className="ml-2 w-4 h-4 inline"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}