'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { Introducer } from '@/types';

export default function IntroducerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [introducer, setIntroducer] = useState<Introducer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const introducerId = params.id as string;

  useEffect(() => {
    if (introducerId) {
      loadIntroducer();
    }
  }, [introducerId]);

  const loadIntroducer = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'your_supabase_url' || supabaseUrl === 'https://placeholder.supabase.co') {
        console.log('Supabase未設定 - モックデータを表示');
        setIntroducer({
          id: introducerId,
          name: '池上彰',
          profile_url: 'https://www.tv-asahi.co.jp/ikegami/',
          description: 'ジャーナリスト。複雑なニュースをわかりやすく解説することで知られる。教育番組の司会も多数担当し、幅広い分野の書籍を紹介している。',
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          created_by: null
        });
        return;
      }

      const { data, error } = await supabase
        .from('introducers')
        .select('*')
        .eq('id', introducerId)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // データが見つからない場合
          setError('指定された紹介者が見つかりません。');
        } else {
          throw error;
        }
        return;
      }

      setIntroducer(data);
    } catch (err) {
      console.error('紹介者データの読み込みエラー:', err);
      setError('紹介者データの読み込みに失敗しました。');
    } finally {
      setIsLoading(false);
    }
  };

  // プロフィールリンククリックのトラッキング
  const handleProfileClick = () => {
    // Analytics tracking (Amplitude/GA4)
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'introducer_profile_clicked', {
        introducer_id: introducer?.id,
        introducer_name: introducer?.name
      });
    }
    
    // Amplitude tracking (if implemented)
    if (typeof window !== 'undefined' && (window as any).amplitude) {
      (window as any).amplitude.track('introducer_profile_clicked', {
        introducer_id: introducer?.id,
        introducer_name: introducer?.name
      });
    }
  };

  // ページビューのトラッキング
  useEffect(() => {
    if (introducer) {
      // Analytics tracking
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'introducer_detail_viewed', {
          introducer_id: introducer.id,
          introducer_name: introducer.name
        });
      }
      
      // Amplitude tracking
      if (typeof window !== 'undefined' && (window as any).amplitude) {
        (window as any).amplitude.track('introducer_detail_viewed', {
          introducer_id: introducer.id,
          introducer_name: introducer.name
        });
      }
    }
  }, [introducer]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-ios-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ios-blue mx-auto"></div>
            <p className="text-ios-gray-600 mt-4">読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !introducer) {
    return (
      <div className="min-h-screen bg-ios-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <div className="text-6xl mb-4">😔</div>
            <h1 className="text-2xl font-bold text-ios-gray-800 mb-2">
              紹介者が見つかりません
            </h1>
            <p className="text-ios-gray-600 mb-6">
              {error || '指定された紹介者は存在しないか、現在利用できません。'}
            </p>
            <Link href="/">
              <Button variant="primary">
                ホームに戻る
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ios-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* パンくずナビ */}
        <nav className="mb-6">
          <div className="flex items-center space-x-2 text-sm text-ios-gray-600">
            <Link href="/" className="hover:text-ios-blue">
              ホーム
            </Link>
            <span>/</span>
            <span className="text-ios-gray-800">紹介者詳細</span>
          </div>
        </nav>

        {/* 紹介者詳細 */}
        <div className="max-w-4xl mx-auto">
          <Card className="mb-6">
            <div className="p-8">
              {/* ヘッダー */}
              <div className="text-center mb-8">
                <div className="text-6xl mb-4">👤</div>
                <h1 className="text-3xl font-bold text-ios-gray-800 mb-2">
                  {introducer.name}
                </h1>
                {introducer.profile_url && (
                  <div className="mb-4">
                    <a
                      href={introducer.profile_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={handleProfileClick}
                      className="inline-flex items-center space-x-2 text-ios-blue hover:text-ios-blue-dark transition-colors"
                    >
                      <span>プロフィールを見る</span>
                      <svg 
                        className="w-4 h-4" 
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
                )}
              </div>

              {/* 説明 */}
              {introducer.description && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-ios-gray-800 mb-4">紹介者について</h2>
                  <div className="bg-ios-gray-50 rounded-lg p-6">
                    <p className="text-ios-gray-700 leading-relaxed whitespace-pre-wrap">
                      {introducer.description}
                    </p>
                  </div>
                </div>
              )}

              {/* 将来の拡張エリア */}
              <div className="border-t border-ios-gray-200 pt-8">
                <h2 className="text-xl font-bold text-ios-gray-800 mb-4">紹介書籍</h2>
                <div className="bg-ios-gray-50 rounded-lg p-8 text-center">
                  <div className="text-4xl mb-4">📚</div>
                  <p className="text-ios-gray-600 mb-4">
                    この紹介者による書籍紹介は準備中です。
                  </p>
                  <p className="text-sm text-ios-gray-500">
                    今後のアップデートで、{introducer.name}さんが紹介した書籍一覧を表示予定です。
                  </p>
                </div>
              </div>

              {/* アクションボタン */}
              <div className="text-center mt-8">
                <Link href="/">
                  <Button variant="outline">
                    ホームに戻る
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          {/* その他の紹介者 */}
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-bold text-ios-gray-800 mb-4">その他の紹介者</h2>
              <div className="bg-ios-gray-50 rounded-lg p-6 text-center">
                <p className="text-ios-gray-600 mb-4">
                  他の紹介者も見てみませんか？
                </p>
                <p className="text-sm text-ios-gray-500">
                  紹介者一覧機能は今後のアップデートで追加予定です。
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}