'use client';

import { useEffect, useState } from 'react';
import { Archive } from '@/types';
import { searchArchives } from '@/data/archives';

interface ArchiveSliderProps {
  title: string;
  subtitle?: string;
  count?: number;
}

export default function ArchiveSlider({ title, subtitle, count = 8 }: ArchiveSliderProps) {
  const [archives, setArchives] = useState<Archive[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArchives = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // アーカイブ記事を取得
        const result = await searchArchives('', 1, count);
        
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

    fetchArchives();
  }, [count]);

  if (loading) {
    return (
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-ios-gray-800 mb-4">{title}</h2>
            {subtitle && (
              <p className="text-lg text-ios-gray-600">{subtitle}</p>
            )}
          </div>
          
          <div className="flex gap-6 overflow-x-auto pb-4">
            {Array.from({ length: count }).map((_, index) => (
              <div key={index} className="flex-shrink-0 w-80">
                <div className="bg-white rounded-2xl shadow-ios overflow-hidden h-64 animate-pulse">
                  <div className="p-6">
                    <div className="h-6 bg-ios-gray-200 rounded mb-3"></div>
                    <div className="h-4 bg-ios-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-ios-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-ios-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-ios-gray-800 mb-4">{title}</h2>
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <div className="text-red-600 mb-2">⚠️ エラーが発生しました</div>
              <div className="text-red-800">{error}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (archives.length === 0) {
    return (
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-ios-gray-800 mb-4">{title}</h2>
            <div className="bg-ios-gray-50 rounded-xl p-8">
              <div className="text-ios-gray-400 text-4xl mb-4">📰</div>
              <div className="text-ios-gray-600">記事が見つかりませんでした</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 fade-in">
          <h2 className="text-3xl font-bold text-ios-gray-800 mb-4">{title}</h2>
          {subtitle && (
            <p className="text-lg text-ios-gray-600">{subtitle}</p>
          )}
        </div>
        
        <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
          {archives.map((archive, index) => (
            <div
              key={archive.id}
              className="flex-shrink-0 w-80 snap-start hover-lift"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="bg-white rounded-2xl shadow-ios hover:shadow-ios-lg transition-all duration-300 overflow-hidden h-64">
                {/* アーカイブ記事情報 */}
                <div className="p-6 flex flex-col h-full">
                  {/* タイトル */}
                  <div className="mb-3">
                    <h3 className="font-bold text-lg text-ios-gray-800 mb-2 line-clamp-2 leading-tight">
                      {archive.title}
                    </h3>
                  </div>
                  
                  {/* 説明 */}
                  <div className="flex-grow mb-4">
                    <p className="text-ios-gray-600 text-sm leading-relaxed line-clamp-4">
                      {archive.description}
                    </p>
                  </div>
                  
                  {/* リンクボタン */}
                  <div className="mt-auto">
                    <a
                      href={archive.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-full px-4 py-3 bg-gradient-to-r from-ios-blue to-ios-purple text-white font-medium rounded-xl hover:shadow-lg transition-all duration-300 text-sm"
                    >
                      <span>記事を読む</span>
                      <svg
                        className="ml-2 w-4 h-4"
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
            </div>
          ))}
        </div>
        
        {/* すべての記事を見るリンク */}
        <div className="text-center mt-8">
          <a
            href="/archives"
            className="inline-flex items-center px-6 py-3 bg-white border-2 border-ios-blue text-ios-blue font-medium rounded-xl hover:bg-ios-blue hover:text-white transition-all duration-300"
          >
            すべての記事を見る
            <svg
              className="ml-2 w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}