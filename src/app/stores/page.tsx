'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { supabase } from '@/lib/supabase';
import { Store } from '@/types';

interface StoreGroup {
  prefecture: string;
  stores: Store[];
}

export default function StoresSearchPage() {
  const [storeGroups, setStoreGroups] = useState<StoreGroup[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPrefecture, setSelectedPrefecture] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    loadStores();
  }, []);

  const loadStores = async () => {
    try {
      setIsLoading(true);
      
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'your_supabase_url' || supabaseUrl === 'https://placeholder.supabase.co') {
        // モックデータを使用
        const mockStores: Store[] = [
          {
            id: '1',
            name: '青山ブックセンター本店',
            prefecture: '東京都',
            city: '港区',
            sns_link: 'https://twitter.com/aoyamabc',
            google_map_link: 'https://maps.google.com/?q=青山ブックセンター本店',
            description: 'アート、デザイン、建築書に強い青山の老舗書店。',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z'
          },
          {
            id: '2',
            name: '蔦屋書店 代官山店',
            prefecture: '東京都',
            city: '渋谷区',
            sns_link: 'https://twitter.com/tsutaya_daikanyama',
            google_map_link: 'https://maps.google.com/?q=蔦屋書店代官山店',
            description: 'ライフスタイル提案型書店。カフェも併設された文化の発信地。',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z'
          },
          {
            id: '3',
            name: 'SHIBUYA TSUTAYA',
            prefecture: '東京都',
            city: '渋谷区',
            sns_link: 'https://twitter.com/shibuya_tsutaya',
            google_map_link: 'https://maps.google.com/?q=SHIBUYA TSUTAYA',
            description: '渋谷の中心地にある大型書店。豊富な品揃えが自慢。',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z'
          },
          {
            id: '4',
            name: '有隣堂 横浜駅西口店',
            prefecture: '神奈川県',
            city: '横浜市',
            sns_link: 'https://twitter.com/yurindobooks',
            google_map_link: 'https://maps.google.com/?q=有隣堂横浜駅西口店',
            description: '横浜の老舗書店。地域密着型の品揃えが魅力。',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z'
          },
          {
            id: '5',
            name: 'TSUTAYA 横浜みなとみらい店',
            prefecture: '神奈川県',
            city: '横浜市',
            sns_link: 'https://twitter.com/tsutaya_mm',
            google_map_link: 'https://maps.google.com/?q=TSUTAYA横浜みなとみらい店',
            description: 'みなとみらいの景色を楽しみながら本が読める。',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z'
          }
        ];
        
        groupStoresByPrefecture(mockStores);
        setError('Supabaseが設定されていません。モックデータを表示しています。');
        return;
      }

      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .order('prefecture', { ascending: true })
        .order('city', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      
      groupStoresByPrefecture(data || []);
    } catch (err) {
      console.error('店舗データの読み込みエラー:', err);
      setError('店舗データの読み込みに失敗しました。');
    } finally {
      setIsLoading(false);
    }
  };

  const groupStoresByPrefecture = (stores: Store[]) => {
    const groups: { [key: string]: Store[] } = {};
    
    stores.forEach(store => {
      const prefecture = store.prefecture || 'その他';
      if (!groups[prefecture]) {
        groups[prefecture] = [];
      }
      groups[prefecture].push(store);
    });
    
    const storeGroups: StoreGroup[] = Object.entries(groups).map(([prefecture, stores]) => ({
      prefecture,
      stores: stores.sort((a, b) => a.name.localeCompare(b.name))
    }));
    
    setStoreGroups(storeGroups.sort((a, b) => a.prefecture.localeCompare(b.prefecture)));
  };

  const filteredStoreGroups = storeGroups.map(group => ({
    ...group,
    stores: group.stores.filter(store => 
      store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (store.city && store.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (store.description && store.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  })).filter(group => 
    !selectedPrefecture || group.prefecture === selectedPrefecture
  ).filter(group => group.stores.length > 0);

  const StoreCard = ({ store }: { store: Store }) => (
    <Card variant="default" className="overflow-hidden hover:shadow-ios-xl transition-all duration-300 flex flex-col h-full">
      <div className="flex flex-col h-full">
        {/* アイコンエリア */}
        <div className="w-full h-24 bg-gradient-to-br from-ios-blue/10 to-ios-purple/10 flex items-center justify-center">
          <div className="text-center">
            <div className="text-3xl mb-1">📚</div>
            <div className="text-xs text-ios-gray-600">書店</div>
          </div>
        </div>
         
        <div className="p-4 flex flex-col flex-grow">
          {/* 店舗情報 */}
          <div className="mb-2">
            <h3 className="text-sm font-bold text-ios-gray-800 mb-1 leading-tight">
              {store.name}
            </h3>
            
            {/* 地域情報 */}
            {(store.prefecture || store.city) && (
              <div className="mb-2">
                <p className="text-xs text-ios-blue-600 font-medium">
                  📍 {store.prefecture}{store.city && ` ${store.city}`}
                </p>
              </div>
            )}
            
            {/* 説明 */}
            <div className="h-14 mb-3">
              {store.description && (
                <p className="text-xs text-ios-gray-600 overflow-hidden h-full leading-relaxed"
                   style={{
                     display: '-webkit-box',
                     WebkitLineClamp: 3,
                     WebkitBoxOrient: 'vertical'
                   }}>
                  {store.description}
                </p>
              )}
            </div>
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
        </div>
      </div>
    </Card>
  );

  const StoreSlider = ({ group }: { group: StoreGroup }) => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-ios-gray-800">
          {group.prefecture}の本屋さん
        </h2>
        <span className="text-sm text-ios-gray-600 bg-ios-gray-100 px-3 py-1 rounded-full">
          {group.stores.length}件
        </span>
      </div>
      
      <div className="overflow-x-auto pb-4">
        <div className="flex space-x-4 w-max">
          {group.stores.map((store) => (
            <div key={store.id} className="w-80 flex-shrink-0">
              <StoreCard store={store} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ios-blue/5 via-white to-ios-purple/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ios-blue mx-auto mb-4"></div>
          <p className="text-ios-gray-600">店舗データを読み込んでいます...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ios-blue/5 via-white to-ios-purple/5 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-ios-gray-800 mb-2">
              📚 本屋さん検索
            </h1>
            <p className="text-ios-gray-600">
              地域別に本屋さんを探して、お気に入りの書店を見つけよう
            </p>
          </div>

          <div className="flex justify-center mb-6">
            <Link href="/">
              <Button variant="outline" size="sm">
                🏠 ホームに戻る
              </Button>
            </Link>
          </div>

          {/* 検索・フィルター */}
          <div className="max-w-2xl mx-auto space-y-4">
            <Input
              label="店舗検索"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="店舗名、地域、説明で検索..."
            />
            
            <div className="flex flex-wrap gap-2 justify-center">
              <Button
                variant={selectedPrefecture === null ? "primary" : "outline"}
                size="sm"
                onClick={() => setSelectedPrefecture(null)}
              >
                すべて
              </Button>
              {storeGroups.map(group => (
                <Button
                  key={group.prefecture}
                  variant={selectedPrefecture === group.prefecture ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setSelectedPrefecture(group.prefecture)}
                >
                  {group.prefecture} ({group.stores.length})
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* エラーメッセージ */}
        {error && (
          <div className="bg-ios-orange/10 border border-ios-orange/30 rounded-lg p-4 mb-6 max-w-2xl mx-auto">
            <p className="text-ios-orange font-medium text-center">⚠️ {error}</p>
          </div>
        )}

        {/* 店舗スライダー */}
        {filteredStoreGroups.length > 0 ? (
          <div>
            {filteredStoreGroups.map((group) => (
              <StoreSlider key={group.prefecture} group={group} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-ios-gray-600 mb-4">
              {searchTerm || selectedPrefecture 
                ? '検索条件に一致する店舗が見つかりませんでした' 
                : 'まだ店舗が登録されていません'}
            </p>
            {(searchTerm || selectedPrefecture) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedPrefecture(null);
                }}
              >
                検索条件をクリア
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}