'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseAuth } from '@/components/auth/SupabaseAuthContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, user } = useSupabaseAuth();
  const router = useRouter();

  // 既にログイン済みの場合はリダイレクト
  useEffect(() => {
    if (user) {
      router.push('/admin');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const success = await login(email, password);
      if (success) {
        router.push('/admin');
      } else {
        setError('メールアドレスまたはパスワードが正しくありません');
      }
    } catch (err) {
      setError('ログインに失敗しました');
      console.error('ログインエラー:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ios-blue/5 via-white to-ios-purple/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-ios-gray-900 mb-2">
              管理者ログイン
            </h1>
            <p className="text-ios-gray-600">
              書籍推薦システムの管理画面にアクセス
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Input
                label="メールアドレス"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="noap3b69n@gmail.com"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <Input
                label="パスワード"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="パスワードを入力"
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={isLoading || !email || !password}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  ログイン中...
                </div>
              ) : (
                'ログイン'
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-ios-gray-200">
            <div className="text-center text-sm text-ios-gray-600">
              <p className="mb-2">テスト用アカウント:</p>
              <p className="font-mono text-xs bg-ios-gray-50 p-2 rounded">
                noap3b69n@gmail.com
              </p>
              <p className="text-xs text-ios-gray-500 mt-2">
                ※ Supabaseダッシュボードでユーザーを作成してください
              </p>
            </div>
          </div>
        </Card>

        <div className="text-center mt-6">
          <button
            onClick={() => router.push('/')}
            className="text-ios-blue hover:text-ios-blue-dark transition-colors text-sm"
          >
            ← ホームに戻る
          </button>
        </div>
      </div>
    </div>
  );
}