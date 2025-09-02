'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

interface UserStats {
  user: {
    id: string;
    display_name: string;
    created_at: string;
  };
  stats: {
    basic: {
      memoCount: number;
      quizCount: number;
      totalAttempts: number;
      correctAttempts: number;
      accuracy: number;
      continuityDays: number;
    };
    period: {
      totalAttempts: number;
      correctAttempts: number;
      accuracy: number;
    };
    daily: Array<{
      date: string;
      correct: number;
      total: number;
      accuracy: number;
    }>;
    weekly: Array<{
      weekStart: string;
      weekEnd: string;
      totalAttempts: number;
      correctAttempts: number;
      activeDays: number;
      continuityRate: number;
    }>;
  };
  recentAttempts: Array<{
    id: string;
    quiz_id: string;
    user_answer: string;
    is_correct: boolean;
    answered_at: string;
  }>;
}

export default function StatsPage() {
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  const lineUserId = searchParams.get('lineUserId');
  const [days, setDays] = useState(30);

  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId || lineUserId) {
      fetchStats();
    } else {
      setLoading(false);
    }
  }, [userId, lineUserId, days]);

  const fetchStats = async () => {
    try {
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId);
      if (lineUserId) params.append('lineUserId', lineUserId);
      params.append('days', days.toString());

      const response = await fetch(`/api/users/stats?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setStats(data);
      } else {
        console.error('Error fetching stats:', data.error);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">統計情報を読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center bg-white rounded-lg shadow-md p-8">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">統計情報がありません</h2>
          <p className="text-gray-600 mb-6">
            統計を表示するには、LINEからのリンクをご利用ください
          </p>
          <div className="space-y-3">
            <a
              href="/memos"
              className="block w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              メモ一覧へ
            </a>
            <a
              href="/"
              className="block w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
            >
              ホームへ
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-900">📊 学習統計</h1>
            <select
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value))}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={7}>過去7日間</option>
              <option value={30}>過去30日間</option>
              <option value={90}>過去90日間</option>
            </select>
          </div>
          <p className="text-gray-600">
            {stats.user.display_name || 'あなた'}の学習進捗を確認しましょう
          </p>
        </div>

        {/* 基本統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">作成メモ数</p>
                <p className="text-2xl font-bold text-gray-900">{stats.stats.basic.memoCount}</p>
              </div>
              <div className="text-blue-600">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">生成クイズ数</p>
                <p className="text-2xl font-bold text-gray-900">{stats.stats.basic.quizCount}</p>
              </div>
              <div className="text-green-600">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">正答率</p>
                <p className="text-2xl font-bold text-gray-900">{stats.stats.basic.accuracy}%</p>
              </div>
              <div className="text-purple-600">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">継続日数</p>
                <p className="text-2xl font-bold text-gray-900">{stats.stats.basic.continuityDays}日</p>
              </div>
              <div className="text-orange-600">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* 日別統計グラフ */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">日別学習状況</h2>
          <div className="overflow-x-auto">
            <div className="flex space-x-1 min-w-full">
              {stats.stats.daily.slice(-14).map((day) => (
                <div key={day.date} className="flex-1 min-w-[40px]">
                  <div className="text-center">
                    <div className={`h-20 flex items-end justify-center mb-2 ${
                      day.total > 0 ? 'bg-blue-100' : 'bg-gray-100'
                    } rounded`}>
                      {day.total > 0 && (
                        <div 
                          className="bg-blue-600 w-full rounded-t"
                          style={{ height: `${Math.max(day.accuracy, 10)}%` }}
                        ></div>
                      )}
                    </div>
                    <div className="text-xs text-gray-600">
                      {new Date(day.date).getDate()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {day.total > 0 ? `${day.accuracy}%` : '-'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            過去2週間の正答率推移（高さが正答率を表します）
          </p>
        </div>

        {/* 週別統計 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">週別継続率</h2>
          <div className="space-y-4">
            {stats.stats.weekly.map((week, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-24 text-sm text-gray-600">
                  {new Date(week.weekStart).getMonth() + 1}/{new Date(week.weekStart).getDate()} -
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-4">
                      <div 
                        className="bg-green-600 h-4 rounded-full transition-all duration-300"
                        style={{ width: `${week.continuityRate}%` }}
                      ></div>
                    </div>
                    <div className="w-12 text-sm text-gray-600">
                      {week.continuityRate}%
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {week.activeDays}日学習 / {week.totalAttempts}回答
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 最近の回答履歴 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">最近の回答履歴</h2>
          {stats.recentAttempts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">まだ回答履歴がありません</p>
          ) : (
            <div className="space-y-3">
              {stats.recentAttempts.map((attempt) => (
                <div key={attempt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm ${
                      attempt.is_correct ? 'bg-green-600' : 'bg-red-600'
                    }`}>
                      {attempt.is_correct ? '○' : '×'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        回答: {attempt.user_answer}
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(attempt.answered_at).toLocaleDateString('ja-JP')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 学習のコツ */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">📚 効果的な学習のコツ</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2">継続のポイント</h4>
              <ul className="space-y-1 text-blue-700">
                <li>• 毎日少しずつでも学習する</li>
                <li>• 復習通知に素早く反応する</li>
                <li>• 間違えた問題は元のメモを確認</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">記憶定着のコツ</h4>
              <ul className="space-y-1 text-blue-700">
                <li>• メモは具体的に詳しく書く</li>
                <li>• 重要なキーワードを意識する</li>
                <li>• 定期的に復習する</li>
              </ul>
            </div>
          </div>
        </div>

        {/* ナビゲーション */}
        <div className="flex space-x-3">
          <a
            href={`/settings?${lineUserId ? `lineUserId=${lineUserId}` : `userId=${userId}`}`}
            className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors text-center"
          >
            ⚙️ 設定を変更
          </a>
          <a
            href="/quiz/today"
            className="flex-1 bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition-colors text-center"
          >
            🧠 今日のクイズ
          </a>
          <a
            href="/memos"
            className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-md hover:bg-gray-700 transition-colors text-center"
          >
            📝 メモ一覧
          </a>
        </div>
      </div>
    </div>
  );
}