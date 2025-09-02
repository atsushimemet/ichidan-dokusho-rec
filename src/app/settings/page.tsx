'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { User } from '@/types';

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  const lineUserId = searchParams.get('lineUserId');

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    notificationEnabled: true,
    notificationTime: '09:00',
    displayName: ''
  });

  useEffect(() => {
    if (userId || lineUserId) {
      fetchUserSettings();
    } else {
      setLoading(false);
    }
  }, [userId, lineUserId]);

  const fetchUserSettings = async () => {
    try {
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId);
      if (lineUserId) params.append('lineUserId', lineUserId);

      const response = await fetch(`/api/users/settings?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setUser(data.user);
        setSettings({
          notificationEnabled: data.user.notification_enabled,
          notificationTime: data.user.notification_time || '09:00',
          displayName: data.user.display_name || ''
        });
      } else {
        console.error('Error fetching settings:', data.error);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const response = await fetch('/api/users/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lineUserId: user.line_user_id,
          settings
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setUser(data.user);
        alert('設定を保存しました');
      } else {
        alert(`エラー: ${data.error}`);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('設定の保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">設定を読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center bg-white rounded-lg shadow-md p-8">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">ユーザーが見つかりません</h2>
          <p className="text-gray-600 mb-6">
            設定ページにアクセスするには、LINEからのリンクをご利用ください
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
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">⚙️ 設定</h1>
          <p className="text-gray-600">
            通知設定やプロフィール情報をカスタマイズできます
          </p>
        </div>

        {/* ユーザー情報 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">プロフィール</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
                表示名
              </label>
              <input
                type="text"
                id="displayName"
                value={settings.displayName}
                onChange={(e) => setSettings(prev => ({ ...prev, displayName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="表示名を入力してください"
              />
            </div>
            <div className="text-sm text-gray-500">
              <p><strong>登録日:</strong> {new Date(user.created_at).toLocaleDateString('ja-JP')}</p>
              {user.line_user_id && (
                <p><strong>LINE連携:</strong> 連携済み</p>
              )}
            </div>
          </div>
        </div>

        {/* 通知設定 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">通知設定</h2>
          <div className="space-y-6">
            <div>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="notificationEnabled"
                  checked={settings.notificationEnabled}
                  onChange={(e) => setSettings(prev => ({ ...prev, notificationEnabled: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="notificationEnabled" className="text-sm font-medium text-gray-700">
                  LINE通知を受け取る
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1 ml-7">
                復習タイミングでLINEにクイズ通知が届きます
              </p>
            </div>

            <div className={`transition-opacity ${settings.notificationEnabled ? 'opacity-100' : 'opacity-50'}`}>
              <label htmlFor="notificationTime" className="block text-sm font-medium text-gray-700 mb-2">
                通知時刻
              </label>
              <select
                id="notificationTime"
                value={settings.notificationTime}
                onChange={(e) => setSettings(prev => ({ ...prev, notificationTime: e.target.value }))}
                disabled={!settings.notificationEnabled}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="07:00">7:00</option>
                <option value="08:00">8:00</option>
                <option value="09:00">9:00</option>
                <option value="10:00">10:00</option>
                <option value="11:00">11:00</option>
                <option value="12:00">12:00</option>
                <option value="13:00">13:00</option>
                <option value="14:00">14:00</option>
                <option value="15:00">15:00</option>
                <option value="16:00">16:00</option>
                <option value="17:00">17:00</option>
                <option value="18:00">18:00</option>
                <option value="19:00">19:00</option>
                <option value="20:00">20:00</option>
                <option value="21:00">21:00</option>
                <option value="22:00">22:00</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                指定した時間の±30分以内に通知が送信されます
              </p>
            </div>
          </div>
        </div>

        {/* 復習について */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">📚 復習システムについて</h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p><strong>翌日復習:</strong> メモ作成の翌日に復習通知が届きます</p>
            <p><strong>1週間後復習:</strong> さらに1週間後に最終復習通知が届きます</p>
            <p><strong>効果:</strong> エビングハウスの忘却曲線に基づいた効果的な復習タイミングです</p>
          </div>
        </div>

        {/* 保存ボタン */}
        <div className="space-y-4">
          <button
            onClick={saveSettings}
            disabled={saving}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {saving ? '保存中...' : '設定を保存'}
          </button>

          {/* ナビゲーション */}
          <div className="flex space-x-3">
            <a
              href={`/stats?${lineUserId ? `lineUserId=${lineUserId}` : `userId=${userId}`}`}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors text-center"
            >
              📊 学習統計を見る
            </a>
            <a
              href="/memos"
              className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors text-center"
            >
              📝 メモ一覧へ
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}