'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { RecommendationEngine } from '@/lib/recommendation';
import { RecommendationResult, QuestionResponse } from '@/types';
import { getReadabilityLevel } from '@/lib/utils';

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [recommendations, setRecommendations] = useState<RecommendationResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // ページの一番上にスクロール
    window.scrollTo(0, 0);
    
    const loadRecommendations = async () => {
      try {
        // URLパラメータから回答を取得
        const purpose = searchParams.get('purpose');
        const genres = searchParams.get('genres');

        if (!purpose || !genres) {
          router.push('/questions');
          return;
        }

        const responses: QuestionResponse = {
          purpose,
          genre_preference: genres ? genres.split(',').filter(g => g) : []
        };

        // レコメンデーションを取得
        const results = await RecommendationEngine.getRecommendations(responses);
        
        // Supabaseが使えない場合はモックデータを使用
        if (results.length === 0) {
          const mockResults = RecommendationEngine.getMockRecommendations(responses);
          setRecommendations(mockResults);
        } else {
          setRecommendations(results);
        }

      } catch (err) {
        console.error('レコメンデーション取得エラー:', err);
        setError('レコメンデーションの取得に失敗しました');
        
        // エラー時もモックデータを表示
        const responses: QuestionResponse = {
          purpose: searchParams.get('purpose') || 'growth',
          genre_preference: searchParams.get('genres')?.split(',').filter(g => g) || ['自己啓発']
        };
        const mockResults = RecommendationEngine.getMockRecommendations(responses);
        setRecommendations(mockResults);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecommendations();
  }, [searchParams, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ios-blue/5 via-white to-ios-purple/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ios-blue mx-auto mb-4"></div>
          <p className="text-ios-gray-600">あなたにぴったりの本を探しています...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ios-blue/5 via-white to-ios-purple/5 px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-ios-gray-800 mb-4">
            あなたにおすすめの本
          </h1>
          <p className="text-xl text-ios-gray-600 mb-6">
            質問への回答に基づいて、{recommendations.length}冊の本をセレクトしました
          </p>
          
          {error && (
            <div className="bg-ios-orange/10 border border-ios-orange/30 rounded-lg p-4 mb-6 max-w-md mx-auto">
              <p className="text-ios-orange font-medium">⚠️ {error}</p>
              <p className="text-sm text-ios-gray-600 mt-1">サンプルデータを表示しています</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <Link href="/questions">
              <Button variant="outline" className="w-full sm:w-auto text-sm sm:text-base px-6 sm:px-8 py-3">
                🔄 もう一度質問に答える
              </Button>
            </Link>
            <Link href="/">
              <Button variant="secondary" className="w-full sm:w-auto text-sm sm:text-base px-6 sm:px-8 py-3">
                🏠 ホームに戻る
              </Button>
            </Link>
          </div>
        </div>

        {/* 書籍一覧 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((result, index) => (
            <Card 
              key={result.book.id} 
              variant="default" 
              className="overflow-hidden hover:shadow-ios-xl transition-all duration-300 flex flex-col h-full"
            >
              <div className="p-5 flex flex-col h-full">
                {/* スコアバッジ */}
                <div className="flex justify-between items-start mb-3">
                  <div className="bg-ios-blue text-white text-sm font-bold px-3 py-1 rounded-full">
                    #{index + 1}
                  </div>
                  <div className="bg-ios-green text-white text-sm font-bold px-3 py-1 rounded-full">
                    {result.score}% マッチ
                  </div>
                </div>

                {/* 書籍情報（固定高さ） */}
                <div className="mb-3">
                  <h3 className="text-lg font-bold text-ios-gray-800 mb-2 h-12 overflow-hidden leading-tight"
                      style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}>
                    {result.book.title}
                  </h3>
                  <p className="text-ios-gray-600 mb-2 h-5 text-sm">
                    著者: {result.book.author}
                  </p>
                  
                  {/* ジャンルタグ（固定高さ） */}
                  <div className="flex flex-wrap gap-1 mb-2 h-7 overflow-hidden">
                                         {result.book.genre_tags.slice(0, 3).map((tag, tagIndex) => {
                       // タグの分類に応じて色を変更
                       const getTagColor = (tagName: string) => {
                         const companyTags = ['リクルート', 'サイバーエージェント', 'ライブドア', '楽天', 'メルカリ', 'GMO', 'ファーストリテイリング', 'LINEヤフー', 'ビズリーチ', 'Apple', 'パタゴニア', 'PayPal', 'Harvard Business Review', 'PMI'];
                         
                         if (companyTags.includes(tagName)) {
                           return 'bg-ios-orange/10 text-ios-orange';
                         } else {
                           return 'bg-ios-purple/10 text-ios-purple';
                         }
                       };
                       
                       return (
                         <span 
                           key={tagIndex}
                           className={`text-xs px-2 py-1 rounded-md ${getTagColor(tag)}`}
                         >
                           {tag}
                         </span>
                       );
                     })}
                  </div>

                  {/* 説明（固定高さ） */}
                  <div className="h-16 mb-3">
                    {result.book.description && (
                      <p className="text-sm text-ios-gray-600 overflow-hidden h-full leading-relaxed"
                         style={{
                           display: '-webkit-box',
                           WebkitLineClamp: 3,
                           WebkitBoxOrient: 'vertical'
                         }}>
                        {result.book.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* フレキシブルスペース */}
                <div className="flex-grow">
                  {/* マッチ理由（固定高さ） */}
                  <div className="h-18 mb-3">
                    {result.match_reasons.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-ios-gray-700 mb-1">
                          おすすめの理由:
                        </h4>
                        <ul className="text-sm text-ios-gray-600 space-y-0.5 overflow-hidden">
                          {result.match_reasons.slice(0, 2).map((reason, reasonIndex) => (
                            <li key={reasonIndex} className="flex items-center">
                              <span className="text-ios-green mr-2">✓</span>
                              {reason}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* 下部固定要素 */}
                <div className="mt-auto">
                  {/* メタ情報 */}
                  <div className="flex justify-between items-center text-sm text-ios-gray-500 mb-3 h-4">
                    {result.book.page_count && (
                      <span>{result.book.page_count}ページ</span>
                    )}
                    {result.book.price && (
                      <span>¥{result.book.price.toLocaleString()}</span>
                    )}
                  </div>
                  
                  {/* 読みやすさレベル */}
                  {result.book.page_count && (
                    <div className="mb-3">
                      {(() => {
                        const readability = getReadabilityLevel(result.book.page_count);
                        return (
                          <div className={`text-xs font-medium ${readability.color} bg-${readability.color.replace('text-', '')}/10 px-2 py-1 rounded-md inline-block`}>
                            📖 {readability.label}
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* アクションボタン */}
                  <div className="flex space-x-2">
                    <a
                      href={result.book.amazon_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1"
                    >
                      <Button variant="primary" className="w-full text-sm">
                        📚 Amazon
                      </Button>
                    </a>
                    {result.book.summary_link ? (
                      <a
                        href={result.book.summary_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1"
                      >
                        <Button variant="outline" className="w-full text-sm">
                          📝 要約を読む
                        </Button>
                      </a>
                    ) : (
                      <div className="flex-1">
                        <Button variant="outline" className="w-full text-sm opacity-50" disabled>
                          📝 要約なし
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* フッター */}
        <div className="text-center mt-12 space-y-4">
          <p className="text-ios-gray-600">
            気になる本は見つかりましたか？
          </p>
          <div className="flex justify-center">
            <Link href="/questions">
              <Button variant="primary" className="w-full sm:w-auto text-sm sm:text-base px-6 sm:px-8 py-3">
                🔄 別の条件で探す
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-ios-blue/5 via-white to-ios-purple/5 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ios-blue mx-auto mb-4"></div>
        <p className="text-ios-gray-600">読み込み中...</p>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ResultsContent />
    </Suspense>
  );
}