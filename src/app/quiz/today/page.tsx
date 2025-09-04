'use client';

import { useState, useEffect } from 'react';
import { Quiz } from '@/types';

interface QuizWithMemo extends Quiz {
  memo?: {
    title: string;
  };
}

export default function TodayQuizPage() {
  const [quizzes, setQuizzes] = useState<QuizWithMemo[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<{
    isCorrect: boolean;
    correctAnswer: string;
    message: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [showDebug, setShowDebug] = useState(false);

  // 仮のユーザーID（実際の実装では認証システムから取得）
  const userId = 'temp-user-id';

  useEffect(() => {
    fetchTodayQuizzes();
    fetchDebugInfo();
  }, []);

  const fetchDebugInfo = async () => {
    try {
      const response = await fetch(`/api/debug/quizzes?userId=${userId}`);
      const data = await response.json();
      setDebugInfo(data.debug);
    } catch (error) {
      console.error('Error fetching debug info:', error);
    }
  };

  const fetchTodayQuizzes = async () => {
    try {
      console.log('Fetching today quizzes for userId:', userId);
      const response = await fetch(`/api/quizzes?userId=${userId}&today=true`);
      const data = await response.json();
      
      console.log('Quiz API response:', { status: response.status, data });
      
      if (response.ok) {
        console.log('Quizzes fetched:', data.quizzes?.length || 0);
        setQuizzes(data.quizzes || []);
      } else {
        console.error('Error fetching quizzes:', data.error);
        alert(`クイズの取得に失敗しました: ${data.error}`);
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      alert('クイズの取得中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!userAnswer.trim()) {
      alert('回答を入力してください');
      return;
    }

    const currentQuiz = quizzes[currentQuizIndex];
    setSubmitting(true);

    try {
      const response = await fetch(`/api/quizzes/${currentQuiz.id}/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAnswer: userAnswer.trim(),
          userId
        }),
      });

      const data = await response.json();
      
      console.log('Answer API response:', { status: response.status, data });
      
      if (response.ok) {
        setResult({
          isCorrect: data.isCorrect,
          correctAnswer: data.correctAnswer,
          message: data.message
        });
        setShowResult(true);
      } else {
        console.error('Answer API error:', data);
        const errorMessage = data.details ? `${data.error}: ${data.details}` : data.error;
        alert(`エラー: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      alert('回答の送信に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  const [allQuizzesCompleted, setAllQuizzesCompleted] = useState(false);

  const nextQuiz = () => {
    if (currentQuizIndex < quizzes.length - 1) {
      setCurrentQuizIndex(currentQuizIndex + 1);
      setUserAnswer('');
      setShowResult(false);
      setResult(null);
    } else {
      // すべてのクイズが完了 - LINE友だち追加UIを表示
      setAllQuizzesCompleted(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">クイズを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (quizzes.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center bg-white rounded-lg shadow-md p-8">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">今日のクイズはありません</h2>
          <p className="text-gray-600 mb-6">
            メモを作成すると自動でクイズが生成されます
          </p>
          
          {/* デバッグ情報 */}
          <div className="mb-4">
            <button
              onClick={() => setShowDebug(!showDebug)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {showDebug ? 'デバッグ情報を隠す' : 'デバッグ情報を表示'}
            </button>
            
            {showDebug && debugInfo && (
              <div className="mt-2 p-3 bg-gray-100 rounded text-xs text-gray-700">
                <div><strong>ユーザーID:</strong> {userId}</div>
                <div><strong>ユーザー存在:</strong> {debugInfo.user?.found || 0}件</div>
                <div><strong>全クイズ数:</strong> {debugInfo.allQuizzes?.count || 0}件</div>
                <div><strong>ユーザーのクイズ数:</strong> {debugInfo.userQuizzes?.count || 0}件</div>
                <div><strong>メモ数:</strong> {debugInfo.memos?.count || 0}件</div>
                {debugInfo.user?.error && (
                  <div className="text-red-600"><strong>ユーザーエラー:</strong> {debugInfo.user.error}</div>
                )}
                {debugInfo.allQuizzes?.error && (
                  <div className="text-red-600"><strong>クイズエラー:</strong> {debugInfo.allQuizzes.error}</div>
                )}
              </div>
            )}
          </div>
          
          <div className="space-y-3">
            <a
              href="/memos"
              className="block w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              メモを作成する
            </a>
            <a
              href="/debug"
              className="block w-full bg-yellow-600 text-white py-2 px-4 rounded-md hover:bg-yellow-700 transition-colors"
            >
              🔧 デバッグページ
            </a>
            <a
              href="/"
              className="block w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
            >
              ホームに戻る
            </a>
          </div>
        </div>
      </div>
    );
  }

  // 全クイズ完了時の表示
  if (allQuizzesCompleted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🎉</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">今日のクイズ完了！</h1>
              <p className="text-gray-600">お疲れさまでした。継続的な復習で知識がしっかりと定着していきます。</p>
            </div>

            {/* LINE友だち追加案内 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <div className="text-blue-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-blue-800 mb-1">📱 継続的な復習のために</h3>
                  <p className="text-sm text-blue-700 mb-3">
                    LINEで復習通知を受け取って、学習を継続しましょう。翌日・1週間後に自動でクイズが届きます。
                  </p>
                  <div className="space-y-2">
                    <a
                      href={`https://line.me/R/ti/p/@${process.env.NEXT_PUBLIC_LINE_BOT_ID || 'YOUR_BOT_ID'}`}
                      className="block w-full bg-green-500 text-white px-4 py-3 rounded-md hover:bg-green-600 transition-colors text-sm font-medium text-center"
                    >
                      📱 LINEで通知を受け取る
                    </a>
                    <p className="text-xs text-gray-500 text-center">
                      ↑ タップするとLINEアプリで友だち追加画面が開きます
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <a
                href="/memos"
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-center"
              >
                新しいメモを作成
              </a>
              <a
                href="/"
                className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors text-center"
              >
                ホームに戻る
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuiz = quizzes[currentQuizIndex];
  const progress = ((currentQuizIndex + 1) / quizzes.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* プログレスバー */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-gray-900">🧠 今日のクイズ</h1>
            <span className="text-sm text-gray-600">
              {currentQuizIndex + 1} / {quizzes.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* クイズカード */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                currentQuiz.type === 'cloze' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {currentQuiz.type === 'cloze' ? '穴埋め問題' : 'True/False問題'}
              </span>
              {currentQuiz.memo && (
                <span className="text-xs text-gray-500">
                  出典: {currentQuiz.memo.title}
                </span>
              )}
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">問題</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                {currentQuiz.stem}
              </p>
            </div>
          </div>

          {!showResult ? (
            <div className="space-y-4">
              <div>
                <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-2">
                  あなたの回答
                </label>
                {currentQuiz.type === 'cloze' ? (
                  <input
                    type="text"
                    id="answer"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="回答を入力してください"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !submitting) {
                        submitAnswer();
                      }
                    }}
                  />
                ) : (
                  <div className="space-y-2">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="tfAnswer"
                        value="True"
                        checked={userAnswer === 'True'}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-gray-700">True（正しい）</span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="tfAnswer"
                        value="False"
                        checked={userAnswer === 'False'}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-gray-700">False（間違い）</span>
                    </label>
                  </div>
                )}
              </div>
              <button
                onClick={submitAnswer}
                disabled={submitting || !userAnswer.trim()}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? '回答を送信中...' : '回答する'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className={`rounded-lg p-4 ${
                result?.isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center space-x-2 mb-2">
                  <span className={`text-lg ${result?.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                    {result?.isCorrect ? '✅' : '❌'}
                  </span>
                  <span className={`font-semibold ${result?.isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                    {result?.message}
                  </span>
                </div>
                <div className="text-sm text-gray-700">
                  <p><strong>あなたの回答:</strong> {userAnswer}</p>
                  <p><strong>正解:</strong> {result?.correctAnswer}</p>
                </div>
              </div>
              <button
                onClick={nextQuiz}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
              >
                {currentQuizIndex < quizzes.length - 1 ? '次の問題へ' : '完了'}
              </button>
            </div>
          )}
        </div>

        {/* ナビゲーション */}
        <div className="text-center">
          <a
            href="/memos"
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            メモ一覧に戻る
          </a>
        </div>
      </div>
    </div>
  );
}