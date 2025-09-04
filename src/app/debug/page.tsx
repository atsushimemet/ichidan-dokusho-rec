'use client';

import { useState, useEffect } from 'react';

interface TableInfo {
  exists: boolean;
  count: number;
  error: string | null;
}

interface DebugInfo {
  tables: Record<string, TableInfo>;
  supabaseConfig: {
    url: string;
    hasAnonKey: boolean;
  };
  timestamp: string;
}

export default function DebugPage() {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDebugInfo();
  }, []);

  const fetchDebugInfo = async () => {
    try {
      const response = await fetch('/api/debug/tables');
      const data = await response.json();
      
      if (response.ok) {
        setDebugInfo(data);
      } else {
        console.error('Debug API error:', data);
      }
    } catch (error) {
      console.error('Error fetching debug info:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">デバッグ情報を読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🔧 デバッグ情報</h1>
          <p className="text-gray-600">
            データベースの状態とシステム設定を確認できます
          </p>
        </div>

        {/* Supabase設定 */}
        {debugInfo && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Supabase設定</h2>
            <div className="space-y-2 text-sm">
              <p><strong>URL:</strong> {debugInfo.supabaseConfig.url}</p>
              <p><strong>Anon Key:</strong> {debugInfo.supabaseConfig.hasAnonKey ? '設定済み' : '未設定'}</p>
            </div>
          </div>
        )}

        {/* テーブル状態 */}
        {debugInfo && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">テーブル状態</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left font-medium text-gray-900">テーブル名</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-900">存在</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-900">レコード数</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-900">エラー</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(debugInfo.tables).map(([tableName, info]) => (
                    <tr key={tableName} className="border-t">
                      <td className="px-4 py-2 font-medium">{tableName}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          info.exists ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {info.exists ? '✅ 存在' : '❌ 未作成'}
                        </span>
                      </td>
                      <td className="px-4 py-2">{info.count}</td>
                      <td className="px-4 py-2 text-red-600 text-xs">
                        {info.error || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}



        {/* 推奨アクション */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-3">⚠️ 推奨アクション</h3>
          {debugInfo && Object.values(debugInfo.tables).some(table => !table.exists) ? (
            <div className="text-yellow-700 space-y-2">
              <p>一部のテーブルが作成されていません。以下の手順を実行してください：</p>
              <ol className="list-decimal list-inside space-y-1 ml-4">
                <li>Supabase Dashboard → SQL Editor</li>
                <li>「New query」をクリック</li>
                <li>supabase/quiz_schema_fixed.sql の内容をコピー&ペースト</li>
                <li>「RUN」をクリック</li>
              </ol>
            </div>
          ) : (
            <div className="text-green-700">
              ✅ すべてのテーブルが正常に作成されています
            </div>
          )}
        </div>

        {/* ナビゲーション */}
        <div className="flex space-x-3">
          <a
            href="/memos"
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-center"
          >
            メモページに戻る
          </a>
          <button
            onClick={fetchDebugInfo}
            className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
          >
            再読み込み
          </button>
        </div>
      </div>
    </div>
  );
}