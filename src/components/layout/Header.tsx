'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthContext';
import LoginModal from '@/components/auth/LoginModal';
import Button from '@/components/ui/Button';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleAdminAccess = () => {
    if (user) {
      router.push('/admin');
      setIsMenuOpen(false);
    } else {
      setIsLoginModalOpen(true);
      setIsMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    router.push('/');
  };

  const handleLoginSuccess = () => {
    router.push('/admin');
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-ios-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            {/* ロゴ */}
            <Link href="/" className="text-2xl font-bold text-ios-gray-800">
              📚 一冊読書
            </Link>

            {/* ハンバーガーメニューボタン */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="relative w-8 h-8 flex flex-col justify-center items-center space-y-1.5 transition-all duration-300"
              aria-label="メニュー"
            >
              <span 
                className={`block w-6 h-0.5 bg-ios-gray-700 transition-all duration-300 ${
                  isMenuOpen ? 'rotate-45 translate-y-2' : ''
                }`}
              />
              <span 
                className={`block w-6 h-0.5 bg-ios-gray-700 transition-all duration-300 ${
                  isMenuOpen ? 'opacity-0' : ''
                }`}
              />
              <span 
                className={`block w-6 h-0.5 bg-ios-gray-700 transition-all duration-300 ${
                  isMenuOpen ? '-rotate-45 -translate-y-2' : ''
                }`}
              />
            </button>
          </div>
        </div>

        {/* スライドダウンメニュー */}
        <div 
          className={`absolute top-full left-0 right-0 bg-white/95 backdrop-blur-md border-b border-ios-gray-200 transition-all duration-300 ${
            isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 py-6">
            <nav className="space-y-4">
              <Link 
                href="/questions"
                className="block text-ios-gray-700 hover:text-ios-blue transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                📝 質問に答える
              </Link>
              
              <button
                onClick={handleAdminAccess}
                className="block text-ios-gray-700 hover:text-ios-blue transition-colors py-2 text-left w-full"
              >
                ⚙️ 管理者画面
              </button>

              {user && (
                <>
                  <div className="border-t border-ios-gray-200 pt-4">
                    <p className="text-sm text-ios-gray-600 mb-2">
                      ログイン中: {user.email}
                    </p>
                    <button
                      onClick={handleLogout}
                      className="text-ios-red hover:text-ios-red/80 transition-colors py-2"
                    >
                      🚪 ログアウト
                    </button>
                  </div>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* メニューが開いている時のオーバーレイ */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-30"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* ログインモーダル */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
      />
    </>
  );
}