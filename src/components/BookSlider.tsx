'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Book } from '@/types';
import { searchBooks } from '@/lib/search';

interface BookSliderProps {
  title: string;
  subtitle?: string;
  count?: number;
}

export default function BookSlider({ title, subtitle, count = 8 }: BookSliderProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRandomBooks = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // ランダムに書籍を取得
        const result = await searchBooks({}, 1, 50); // 多めに取得してランダム選定
        
        if (result.books.length === 0) {
          setError('書籍が見つかりませんでした');
          return;
        }
        
        // ランダムに指定数選択
        const shuffled = [...result.books].sort(() => Math.random() - 0.5);
        setBooks(shuffled.slice(0, count));
        
      } catch (err) {
        console.error('書籍取得エラー:', err);
        setError('書籍の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchRandomBooks();
  }, [count]);

  if (loading) {
    return (
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-ios-gray-800 mb-8">{title}</h2>
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: count }).map((_, index) => (
              <div key={index} className="flex-shrink-0 w-64 h-[500px] bg-ios-gray-100 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-ios-gray-800 mb-4">{title}</h2>
          <p className="text-ios-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 bg-gradient-to-br from-ios-gray-50 via-white to-ios-blue/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-light text-ios-gray-800 tracking-tight mb-4">{title}</h2>
          {subtitle && (
            <p className="text-lg font-light text-ios-gray-600 max-w-2xl mx-auto leading-relaxed">{subtitle}</p>
          )}
        </div>
        
        <div className="relative">
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
            {books.map((book, index) => (
              <div
                key={book.id}
                className="flex-shrink-0 w-64 snap-start hover-lift"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="bg-white rounded-2xl shadow-ios hover:shadow-ios-lg transition-all duration-300 overflow-hidden flex flex-col h-[500px]">
                  {/* 書籍画像 */}
                  <div className="w-full h-40 bg-gradient-to-br from-ios-blue/10 to-ios-purple/10 flex items-center justify-center overflow-hidden">
                    {book.cover_image_url ? (
                      <img
                        src={book.cover_image_url}
                        alt={book.title}
                        className="w-24 h-32 object-cover rounded-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.parentElement!.innerHTML = `
                            <div class="flex items-center justify-center w-full h-full bg-ios-gray-200 text-ios-gray-500">
                              <span class="text-sm">画像が読み込めません</span>
                            </div>
                          `;
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full bg-ios-gray-200 text-ios-gray-400">
                        <div className="text-center">
                          <div className="text-3xl mb-2">📚</div>
                          <div className="text-xs">画像なし</div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* 書籍情報 */}
                  <div className="p-4 flex flex-col flex-grow">
                    {/* タイトル・著者（固定高さ） */}
                    <div className="mb-2">
                      <h3 className="font-bold text-base text-ios-gray-800 mb-1 h-10 overflow-hidden leading-tight line-clamp-2">
                        {book.title}
                      </h3>
                      <p className="text-ios-gray-600 mb-2 h-4 text-sm line-clamp-1">
                        著者: {book.author}
                      </p>
                    </div>
                    
                    {/* ジャンルタグ（固定高さ） */}
                    <div className="flex flex-wrap gap-1 mb-2 h-6 overflow-hidden">
                      {book.genre_tags?.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-1 bg-ios-blue/10 text-ios-blue rounded-md"
                        >
                          {tag}
                        </span>
                      ))}
                      {book.genre_tags && book.genre_tags.length > 2 && (
                        <span className="text-xs text-ios-gray-400 px-1 py-1">
                          +{book.genre_tags.length - 2}
                        </span>
                      )}
                    </div>
                    
                    {/* 説明（固定高さ） */}
                    <div className="h-20 mb-3">
                      {book.description && (
                        <p className="text-xs text-ios-gray-600 overflow-hidden h-full leading-relaxed">
                          {book.description.length > 150 
                            ? `${book.description.substring(0, 150)}...` 
                            : book.description}
                        </p>
                      )}
                    </div>
                    
                    {/* フレキシブルスペース */}
                    <div className="flex-grow">
                      {/* 価格・ページ数 */}
                      <div className="flex justify-between items-center text-xs text-ios-gray-500 mb-2">
                        {book.price && (
                          <span>¥{book.price.toLocaleString()}</span>
                        )}
                        {book.page_count && (
                          <span>{book.page_count}p</span>
                        )}
                      </div>
                    </div>
                    
                    {/* アクションボタン（下部固定） */}
                    <div className="mt-auto">
                      <div className="flex gap-2">
                        <Link
                          href={book.amazon_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 bg-ios-blue text-white text-center py-2 px-3 rounded-lg text-xs font-medium hover:bg-ios-blue/90 transition-colors"
                        >
                          Amazon (PR)
                        </Link>
                        {book.summary_link && (
                          <Link
                            href={book.summary_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-2 border border-ios-gray-300 text-ios-gray-700 rounded-lg text-xs hover:bg-ios-gray-50 transition-colors"
                          >
                            要約
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* 最後に「もっと見る」カード */}
            <div className="flex-shrink-0 w-64 snap-start">
              <Link href="/search">
                <div className="h-[500px] bg-gradient-to-br from-ios-blue/10 to-ios-purple/10 rounded-2xl border-2 border-dashed border-ios-blue/30 flex flex-col items-center justify-center hover:border-ios-blue transition-all duration-300 hover-lift">
                  <div className="text-4xl mb-4">🔍</div>
                  <p className="text-ios-blue font-semibold text-lg">もっと探す</p>
                  <p className="text-ios-gray-600 text-sm mt-2 text-center px-4">
                    あなたにぴったりの<br />書籍を見つけよう
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}