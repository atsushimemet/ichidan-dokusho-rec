'use client';

import { useState, useEffect } from 'react';
import { Memo } from '@/types';

interface MemoWithQuiz extends Memo {
  hasQuiz?: boolean;
}

export default function MemosPage() {
  const [memos, setMemos] = useState<MemoWithQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newMemo, setNewMemo] = useState({
    title: '',
    text: ''
  });
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [showDebug, setShowDebug] = useState(false);

  // 仮のユーザーID（実際の実装では認証システムから取得）
  const userId = 'temp-user-id';

  useEffect(() => {
    fetchMemos();
    fetchDebugInfo();
  }, []);

  const fetchDebugInfo = async () => {
    try {
      const response = await fetch(`/api/debug/memos?userId=${userId}`);
      const data = await response.json();
      setDebugInfo(data.debug);
    } catch (error) {
      console.error('Error fetching debug info:', error);
    }
  };

  const fetchMemos = async () => {
    try {
      console.log('Fetching memos for userId:', userId);
      const response = await fetch(`/api/memos?userId=${userId}`);
      const data = await response.json();
      
      console.log('Memos API response:', { status: response.status, data });
      
      if (response.ok) {
        console.log('Memos fetched successfully:', data.memos?.length || 0);
        setMemos(data.memos || []);
      } else {
        console.error('Error fetching memos:', data.error);
        if (data.details) {
          console.error('Error details:', data.details);
        }
      }
    } catch (error) {
      console.error('Error fetching memos:', error);
    } finally {
      setLoading(false);
    }
  };

  const createMemo = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMemo.title.trim() || !newMemo.text.trim()) {
      alert('タイトルと内容を入力してください');
      return;
    }

    setCreating(true);
    try {
      const response = await fetch('/api/memos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newMemo,
          userId
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        alert(data.message);
        setNewMemo({ title: '', text: '' });
        fetchMemos(); // メモ一覧を更新
        
        if (data.quiz) {
          // クイズが生成された場合、今日のクイズページに誘導
          if (confirm('クイズが生成されました！今すぐ挑戦しますか？')) {
            window.location.href = '/quiz/today';
          }
        } else if (data.quizError) {
          console.warn('Quiz generation failed:', data.quizError);
        }
      } else {
        console.error('API Error:', data);
        const errorMessage = data.details ? `${data.error}: ${data.details}` : data.error;
        alert(`エラー: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error creating memo:', error);
      alert('メモの作成に失敗しました');
    } finally {
      setCreating(false);
    }
  };

  const deleteMemo = async (id: string) => {
    if (!confirm('このメモを削除しますか？')) return;

    try {
      const response = await fetch(`/api/memos/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (response.ok) {
        alert(data.message);
        fetchMemos(); // メモ一覧を更新
      } else {
        alert(`エラー: ${data.error}`);
      }
    } catch (error) {
      console.error('Error deleting memo:', error);
      alert('メモの削除に失敗しました');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📝 読書メモ</h1>
          <p className="text-gray-600">
            読んだ本の内容をメモして、自動でクイズを生成しましょう
          </p>
        </div>

        {/* メモ作成フォーム */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">新しいメモを作成</h2>
          <form onSubmit={createMemo} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                タイトル
              </label>
              <input
                type="text"
                id="title"
                value={newMemo.title}
                onChange={(e) => setNewMemo(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例: 『7つの習慣』第1章のメモ"
                required
              />
            </div>
            <div>
              <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-2">
                内容
              </label>
              <textarea
                id="text"
                value={newMemo.text}
                onChange={(e) => setNewMemo(prev => ({ ...prev, text: e.target.value }))}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="読書メモの内容を入力してください。重要な概念や学んだことを詳しく書くと、より良いクイズが生成されます。"
                required
              />
            </div>
            <button
              type="submit"
              disabled={creating}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {creating ? 'メモを作成中...' : 'メモを作成してクイズを生成'}
            </button>
          </form>
        </div>

        {/* メモ一覧 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">保存されたメモ</h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">{memos.length}件のメモ</span>
              <button
                onClick={() => setShowDebug(!showDebug)}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                {showDebug ? 'デバッグ非表示' : 'デバッグ表示'}
              </button>
            </div>
          </div>
          
          {/* デバッグ情報 */}
          {showDebug && debugInfo && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-xs">
              <h3 className="font-semibold text-yellow-800 mb-2">🔧 デバッグ情報</h3>
              <div className="space-y-1 text-yellow-700">
                <div><strong>検索ユーザーID:</strong> {debugInfo.searchUserId}</div>
                <div><strong>全ユーザー数:</strong> {debugInfo.allUsers?.count || 0}件</div>
                <div><strong>ユーザー発見:</strong> {debugInfo.foundUser ? '✅' : '❌'}</div>
                {debugInfo.foundUser && (
                  <div><strong>実際のユーザーID:</strong> {debugInfo.foundUser.id}</div>
                )}
                <div><strong>全メモ数:</strong> {debugInfo.allMemos?.count || 0}件</div>
                <div><strong>ユーザーのメモ数:</strong> {debugInfo.userMemos?.count || 0}件</div>
                <div><strong>直接検索結果:</strong> {debugInfo.directSearch?.count || 0}件</div>
                {debugInfo.allUsers?.error && (
                  <div className="text-red-600"><strong>ユーザーエラー:</strong> {debugInfo.allUsers.error}</div>
                )}
                {debugInfo.allMemos?.error && (
                  <div className="text-red-600"><strong>メモエラー:</strong> {debugInfo.allMemos.error}</div>
                )}
              </div>
            </div>
          )}
          
          {memos.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-500">まだメモがありません</p>
              <p className="text-gray-400 text-sm mt-2">最初のメモを作成してクイズを生成してみましょう</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {memos.map((memo) => (
                <div key={memo.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 flex-1">{memo.title}</h3>
                    <div className="flex items-center space-x-2 ml-4">
                      <span className="text-xs text-gray-500">
                        {new Date(memo.created_at).toLocaleDateString('ja-JP')}
                      </span>
                      <button
                        onClick={() => deleteMemo(memo.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        削除
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-4 whitespace-pre-wrap line-clamp-3">
                    {memo.text}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      {memo.text.length}文字
                    </span>
                    <div className="flex items-center space-x-2">
                      {memo.hasQuiz && (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                          クイズ生成済み
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ナビゲーション */}
        <div className="mt-8 flex justify-center space-x-4">
          <a
            href="/quiz/today"
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            今日のクイズに挑戦
          </a>
          <a
            href="/"
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
          >
            ホームに戻る
          </a>
        </div>
      </div>
    </div>
  );
}