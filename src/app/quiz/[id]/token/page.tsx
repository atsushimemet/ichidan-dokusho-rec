'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Quiz } from '@/types';

interface QuizWithMemo extends Quiz {
  memo?: {
    title: string;
    text: string;
  };
}

function TokenQuizContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const quizId = params.id as string;
  const token = searchParams.get('token');
  
  const [quiz, setQuiz] = useState<QuizWithMemo | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<{
    isCorrect: boolean;
    correctAnswer: string;
    message: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (quizId && token) {
      verifyTokenAndFetchQuiz();
    } else {
      setError('クイズIDまたはトークンが無効です');
      setLoading(false);
    }
  }, [quizId, token]);

  const verifyTokenAndFetchQuiz = async () => {
    try {
      // トークンを検証してユーザーIDを取得
      const tokenResponse = await fetch('/api/auth/verify-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, quizId }),
      });

      const tokenData = await tokenResponse.json();
      
      if (!tokenResponse.ok) {
        setError(tokenData.error || 'トークンの検証に失敗しました');
        setLoading(false);
        return;
      }

      setUserId(tokenData.userId);

      // クイズを取得
      const quizResponse = await fetch(`/api/quizzes/${quizId}`);
      const quizData = await quizResponse.json();
      
      if (quizResponse.ok) {
        setQuiz(quizData.quiz);
      } else {
        setError(quizData.error || 'クイズの取得に失敗しました');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!userAnswer.trim() || !userId) {
      alert('回答を入力してください');
      return;
    }

    if (!quiz) return;

    setSubmitting(true);

    try {
      const response = await fetch(`/api/quizzes/${quiz.id}/answer`, {
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
      
      if (response.ok) {
        setResult({
          isCorrect: data.isCorrect,
          correctAnswer: data.correctAnswer,
          message: data.message
        });
        setShowResult(true);
      } else {
        alert(`エラー: ${data.error}`);
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      alert('回答の送信に失敗しました');
    } finally {
      setSubmitting(false);
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

  if (error || !quiz) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center bg-white rounded-lg shadow-md p-8">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">アクセスエラー</h2>
          <p className="text-gray-600 mb-6">
            {error || 'クイズにアクセスできません'}
          </p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="block w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              再読み込み
            </button>
            <a
              href={`${process.env.NEXT_PUBLIC_BASE_URL}/quiz/today`}
              className="block w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
            >
              今日のクイズへ
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
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <h1 className="text-2xl font-bold text-gray-900">🧠 復習クイズ</h1>
            <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">
              LINE通知
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              quiz.type === 'cloze' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {quiz.type === 'cloze' ? '穴埋め問題' : 'True/False問題'}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              quiz.status === 'today' ? 'bg-yellow-100 text-yellow-800' :
              quiz.status === 'day1' ? 'bg-orange-100 text-orange-800' :
              quiz.status === 'day7' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {quiz.status === 'today' ? '今日' :
               quiz.status === 'day1' ? '翌日復習' :
               quiz.status === 'day7' ? '1週間後復習' : '完了'}
            </span>
          </div>
        </div>

        {/* 復習の重要性を説明 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <div className="text-blue-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-blue-800 mb-1">復習の効果</h3>
              <p className="text-sm text-blue-700">
                {quiz.status === 'day1' ? 
                  '翌日の復習は記憶の定着率を大幅に向上させます。エビングハウスの忘却曲線に基づいた効果的なタイミングです。' :
                  quiz.status === 'day7' ?
                  '1週間後の復習で長期記憶への移行を促進します。この段階での復習が知識の完全な定着につながります。' :
                  '継続的な復習により、学習した内容を長期記憶に定着させることができます。'
                }
              </p>
            </div>
          </div>
        </div>

        {/* クイズカード */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          {quiz.memo && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-600 font-medium mb-1">出典メモ</p>
              <p className="text-sm text-blue-800">{quiz.memo.title}</p>
            </div>
          )}

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">問題</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                {quiz.stem}
              </p>
            </div>
          </div>

          {!showResult ? (
            <div className="space-y-4">
              <div>
                <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-2">
                  あなたの回答
                </label>
                {quiz.type === 'cloze' ? (
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
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="text-green-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-green-800 mb-1">復習完了！</h3>
                    <p className="text-sm text-green-700">
                      お疲れさまでした。継続的な復習で知識がしっかりと定着していきます。
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <a
                  href={`${process.env.NEXT_PUBLIC_BASE_URL}/quiz/today`}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors text-center"
                >
                  他のクイズを見る
                </a>
                <a
                  href={`${process.env.NEXT_PUBLIC_BASE_URL}/memos`}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-center"
                >
                  新しいメモを作成
                </a>
              </div>
            </div>
          )}
        </div>

        {/* 元のメモを表示 */}
        {quiz.memo && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">元のメモ</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                {quiz.memo.text}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TokenQuizPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">クイズを読み込み中...</p>
        </div>
      </div>
    }>
      <TokenQuizContent />
    </Suspense>
  );
}