'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Store } from '@/types';
import { supabase } from '@/lib/supabase';

interface StoreSliderProps {
  title: string;
  subtitle?: string;
  count?: number;
}

export default function StoreSlider({ title, subtitle, count = 8 }: StoreSliderProps) {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRandomStores = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // ランダムに本屋さんを取得
        const { data, error } = await supabase
          .from('stores')
          .select('*')
          .limit(50); // 多めに取得してランダム選定
        
        if (error) {
          throw error;
        }
        
        if (!data || data.length === 0) {
          setError('本屋さんが見つかりませんでした');
          return;
        }
        
        // ランダムに指定数選択
        const shuffled = [...data].sort(() => Math.random() - 0.5);
        setStores(shuffled.slice(0, count));
        
      } catch (err) {
        console.error('本屋さん取得エラー:', err);
        setError('本屋さんの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchRandomStores();
  }, [count]);

  if (loading) {
    return (
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-ios-gray-800 mb-8">{title}</h2>
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: count }).map((_, index) => (
              <div key={index} className="flex-shrink-0 w-64 h-80 bg-ios-gray-100 rounded-2xl animate-pulse"></div>
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
    <div className="py-16 bg-gradient-to-br from-ios-purple/5 via-white to-ios-green/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-light text-ios-gray-900 tracking-tight mb-4">{title}</h2>
          {subtitle && (
            <p className="text-lg font-light text-ios-gray-600 max-w-2xl mx-auto leading-relaxed">{subtitle}</p>
          )}
        </div>
        
        <div className="relative">
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
            {stores.map((store, index) => (
              <div
                key={store.id}
                className="flex-shrink-0 w-64 snap-start hover-lift"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="bg-white rounded-2xl shadow-ios hover:shadow-ios-lg transition-all duration-300 overflow-hidden flex flex-col h-80">
                  {/* 店舗画像エリア */}
                  <div className="w-full h-24 bg-gradient-to-br from-ios-purple/10 to-ios-green/10 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl mb-1">📚</div>
                      <div className="text-xs text-ios-gray-600">書店</div>
                    </div>
                  </div>
                  
                  {/* 店舗情報 */}
                  <div className="p-4 flex flex-col flex-grow">
                    {/* 店舗名（固定高さ） */}
                    <div className="mb-2">
                      <h3 className="font-bold text-sm text-ios-gray-800 mb-1 leading-tight line-clamp-2">
                        {store.name}
                      </h3>
                      
                      {/* 場所情報（固定高さ） */}
                      {(store.prefecture || store.city) && (
                        <div className="mb-2">
                          <p className="text-xs text-ios-blue-600 font-medium line-clamp-1">
                            📍 {store.prefecture}{store.city && ` ${store.city}`}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {/* 説明（固定高さ） */}
                    <div className="h-14 mb-3">
                      {store.description && (
                        <p className="text-xs text-ios-gray-600 overflow-hidden h-full leading-relaxed line-clamp-3">
                          {store.description}
                        </p>
                      )}
                    </div>
                    
                    {/* フレキシブルスペース */}
                    <div className="flex-grow">
                      {/* リンク情報 */}
                      <div className="space-y-1 mb-3">
                        {store.sns_link && (
                          <div className="text-ios-blue text-xs">
                            📱 <a 
                              href={store.sns_link} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="underline hover:no-underline font-medium"
                            >
                              SNS
                            </a>
                          </div>
                        )}
                        {store.google_map_link && (
                          <div className="text-ios-blue text-xs">
                            🗺️ <a 
                              href={store.google_map_link} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="underline hover:no-underline"
                            >
                              地図
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* アクションボタン（下部固定） */}
                    <div className="mt-auto">
                      <div className="flex gap-2">
                        {store.google_map_link && (
                          <Link
                            href={store.google_map_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 bg-ios-green text-white text-center py-2 px-3 rounded-lg text-xs font-medium hover:bg-ios-green/90 transition-colors"
                          >
                            地図
                          </Link>
                        )}
                        {store.sns_link && (
                          <Link
                            href={store.sns_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-2 border border-ios-gray-300 text-ios-gray-700 rounded-lg text-xs hover:bg-ios-gray-50 transition-colors"
                          >
                            SNS
                          </Link>
                        )}
                        {!store.google_map_link && !store.sns_link && (
                          <div className="flex-1 bg-ios-gray-100 text-ios-gray-400 text-center py-2 px-3 rounded-lg text-xs">
                            詳細準備中
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* 最後に「もっと見る」カード */}
            <div className="flex-shrink-0 w-64 snap-start">
              <Link href="/stores">
                <div className="h-80 bg-gradient-to-br from-ios-purple/10 to-ios-green/10 rounded-2xl border-2 border-dashed border-ios-purple/30 flex flex-col items-center justify-center hover:border-ios-purple transition-all duration-300 hover-lift">
                  <div className="text-4xl mb-4">🏪</div>
                  <p className="text-ios-purple font-semibold text-lg">もっと探す</p>
                  <p className="text-ios-gray-600 text-sm mt-2 text-center px-4">
                    お近くの<br />本屋さんを見つけよう
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