'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { MANAGEMENT_ENTITIES, ManagementEntityType } from '@/types';

interface ManagementSelectorProps {
  currentEntity?: ManagementEntityType;
  showAsGrid?: boolean;
  compact?: boolean;
}

export default function ManagementSelector({ 
  currentEntity, 
  showAsGrid = false, 
  compact = false 
}: ManagementSelectorProps) {
  const pathname = usePathname();
  
  // 現在のパスから現在のエンティティを自動判定
  const getCurrentEntity = (): ManagementEntityType | undefined => {
    if (currentEntity) return currentEntity;
    
    if (pathname === '/admin') return 'books';
    if (pathname.startsWith('/admin/stores')) return 'stores';
    if (pathname.startsWith('/admin/archives')) return 'archives';
    if (pathname.startsWith('/admin/rankings')) return 'rankings';
    if (pathname.startsWith('/admin/introducers')) return 'introducers';
    
    return undefined;
  };

  const currentEntityType = getCurrentEntity();

  // グリッド表示の場合（管理ダッシュボード用）
  if (showAsGrid) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.values(MANAGEMENT_ENTITIES).map((entity) => (
          <Link key={entity.type} href={entity.path}>
            <Card 
              variant="default" 
              className="p-6 hover:shadow-ios-xl transition-all duration-300 cursor-pointer group"
            >
              <div className="text-center">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {entity.icon}
                </div>
                <h3 className="text-xl font-bold text-ios-gray-800 mb-2">
                  {entity.name}
                </h3>
                <p className="text-ios-gray-600 text-sm">
                  {entity.description}
                </p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    );
  }

  // ナビゲーションバー表示（コンパクト）
  if (compact) {
    return (
      <div className="flex space-x-2">
        {Object.values(MANAGEMENT_ENTITIES).map((entity) => (
          <Link key={entity.type} href={entity.path}>
            <Button
              variant={currentEntityType === entity.type ? 'primary' : 'secondary'}
              size="sm"
              className="px-3 w-10"
              title={entity.name}
            >
              {entity.icon}
            </Button>
          </Link>
        ))}
      </div>
    );
  }

  // デフォルト表示（水平ナビゲーション）
  return (
    <div className="bg-white rounded-xl shadow-ios-sm border border-ios-gray-200 p-4 mb-6">
      <h3 className="text-lg font-bold text-ios-gray-800 mb-4">管理対象選択</h3>
      <div className="flex flex-wrap gap-3">
        {Object.values(MANAGEMENT_ENTITIES).map((entity) => (
          <Link key={entity.type} href={entity.path}>
            <div
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                currentEntityType === entity.type
                  ? 'border-ios-blue bg-ios-blue/10 text-ios-blue'
                  : 'border-ios-gray-300 hover:border-ios-blue/50 hover:bg-ios-gray-50'
              }`}
            >
              <span className="text-xl">{entity.icon}</span>
              <div>
                <div className="font-medium">{entity.name}</div>
                <div className="text-xs text-ios-gray-500">{entity.description}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// 統計情報を表示するコンポーネント
interface ManagementStatsProps {
  booksCount?: number;
  storesCount?: number;
  archivesCount?: number;
  rankingsCount?: number;
  introducersCount?: number;
  isLoading?: boolean;
}

export function ManagementStats({ 
  booksCount = 0, 
  storesCount = 0, 
  archivesCount = 0, 
  rankingsCount = 0,
  introducersCount = 0,
  isLoading = false 
}: ManagementStatsProps) {
  const stats = [
    { 
      entity: MANAGEMENT_ENTITIES.books, 
      count: booksCount,
      label: '登録書籍'
    },
    { 
      entity: MANAGEMENT_ENTITIES.rankings, 
      count: rankingsCount,
      label: 'ランキング書籍'
    },
    { 
      entity: MANAGEMENT_ENTITIES.stores, 
      count: storesCount,
      label: '登録店舗'
    },
    { 
      entity: MANAGEMENT_ENTITIES.archives, 
      count: archivesCount,
      label: '登録記事'
    },
    { 
      entity: MANAGEMENT_ENTITIES.introducers, 
      count: introducersCount,
      label: '登録紹介者'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => (
        <Link key={stat.entity.type} href={stat.entity.path}>
          <Card 
            variant="default" 
            className="p-4 hover:shadow-ios-lg transition-all duration-300 cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-ios-gray-500 mb-1">{stat.label}</div>
                <div className="text-2xl font-bold text-ios-gray-800">
                  {isLoading ? (
                    <div className="animate-pulse bg-ios-gray-200 h-8 w-16 rounded"></div>
                  ) : (
                    stat.count.toLocaleString()
                  )}
                </div>
              </div>
              <div className="text-2xl group-hover:scale-110 transition-transform duration-300">
                {stat.entity.icon}
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}

// 管理画面のメインナビゲーション
export function ManagementNavigation() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center space-x-4">
        <h1 className="text-3xl font-bold text-ios-gray-800">管理画面</h1>
        <div className="hidden md:block text-ios-gray-600">
          レコメンドシステムの各種データを管理
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <ManagementSelector compact />
        
        {/* 共通ナビゲーションボタン */}
        <Link href="/admin/tags">
          <Button variant="secondary" size="sm" className="px-3 w-10" title="タグマスター管理">
            🏷️
          </Button>
        </Link>
        
        <Link href="/admin/mappings">
          <Button variant="secondary" size="sm" className="px-3 w-10" title="質問マッピング管理">
            🔗
          </Button>
        </Link>
        
        <Link href="/">
          <Button variant="outline" size="sm" className="px-3 w-10" title="ホームに戻る">
            🏠
          </Button>
        </Link>
      </div>
    </div>
  );
}