'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { RecommendationEngine } from '@/lib/recommendation';
import { RecommendationResult, QuestionResponse } from '@/types';

export default function ResultsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [recommendations, setRecommendations] = useState<RecommendationResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        // URLパラメータから回答を取得
        const purpose = searchParams.get('purpose');
        const genres = searchParams.get('genres');
        const difficulty = searchParams.get('difficulty');

        if (!purpose || !genres || !difficulty) {
          router.push('/questions');
          return;
        }

        const responses: QuestionResponse = {
          purpose,
          genre_preference: genres ? genres.split(',').filter(g => g) : [],
          difficulty_preference: difficulty as 'beginner' | 'intermediate' | 'advanced'
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
          genre_preference: searchParams.get('genres')?.split(',').filter(g => g) || ['自己啓発'],
          difficulty_preference: (searchParams.get('difficulty') as 'beginner' | 'intermediate' | 'advanced') || 'beginner'
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

          <div className="flex justify-center space-x-4">
            <Link href="/questions">
              <Button variant="outline">
                🔄 もう一度質問に答える
              </Button>
            </Link>
            <Link href="/">
              <Button variant="secondary">
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
              className="overflow-hidden hover:shadow-ios-xl transition-all duration-300"
            >
              <div className="p-6">
                {/* スコアバッジ */}
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-ios-blue text-white text-sm font-bold px-3 py-1 rounded-full">
                    #{index + 1}
                  </div>
                  <div className="bg-ios-green text-white text-sm font-bold px-3 py-1 rounded-full">
                    {result.score}% マッチ
                  </div>
                </div>

                {/* 書籍情報 */}
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-ios-gray-800 mb-2 overflow-hidden"
                      style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}>
                    {result.book.title}
                  </h3>
                  <p className="text-ios-gray-600 mb-3">
                    著者: {result.book.author}
                  </p>
                  
                  {/* ジャンルタグ */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {result.book.genre_tags.slice(0, 3).map((tag, tagIndex) => (
                      <span 
                        key={tagIndex}
                        className="bg-ios-purple/10 text-ios-purple text-xs px-2 py-1 rounded-md"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* 説明 */}
                  {result.book.description && (
                    <p className="text-sm text-ios-gray-600 mb-4 overflow-hidden"
                       style={{
                         display: '-webkit-box',
                         WebkitLineClamp: 3,
                         WebkitBoxOrient: 'vertical'
                       }}>
                      {result.book.description}
                    </p>
                  )}
                </div>

                {/* マッチ理由 */}
                {result.match_reasons.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-ios-gray-700 mb-2">
                      おすすめの理由:
                    </h4>
                    <ul className="text-sm text-ios-gray-600 space-y-1">
                      {result.match_reasons.map((reason, reasonIndex) => (
                        <li key={reasonIndex} className="flex items-center">
                          <span className="text-ios-green mr-2">✓</span>
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* メタ情報 */}
                <div className="flex justify-between items-center text-sm text-ios-gray-500 mb-4">
                  <span>
                    難易度: {
                      result.book.difficulty_level === 'beginner' ? '初級' :
                      result.book.difficulty_level === 'intermediate' ? '中級' : '上級'
                    }
                  </span>
                  {result.book.reading_time_hours && (
                    <span>約{result.book.reading_time_hours}時間</span>
                  )}
                </div>

                {/* アクションボタン */}
                <div className="flex space-x-2">
                  <a
                    href={result.book.amazon_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button variant="primary" className="w-full text-sm">
                      📚 Amazonで見る
                    </Button>
                  </a>
                  {result.book.summary_link && (
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
                  )}
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
          <div className="flex justify-center space-x-4">
            <Link href="/questions">
              <Button variant="primary">
                🔄 別の条件で探す
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}