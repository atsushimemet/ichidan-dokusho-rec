'use client';

import React, { useState, useEffect } from 'react';
import { RankingBook, RankingSource } from '@/types';
import { supabase } from '@/lib/supabase';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import ManagementSelector from '@/components/admin/ManagementSelector';
import { AdminActionsDropdown } from '@/components/ui/DropdownMenu';
import Link from 'next/link';
import AsinImagePreview from '@/components/AsinImagePreview';
import { getWeekStartDate } from '@/utils/dateUtils';

interface RankingForm {
  title: string;
  author: string;
  genre_tags: string;
  amazon_link: string;
  asin: string;
  summary_link: string;
  description: string;
  page_count: string;
  price: string;
  ranking_source: string;
}

// 重複チェック結果を表示するコンポーネント
function DuplicateCheckSummary({ books }: { books: RankingBook[] }) {
  // Amazonリンクでグループ化
  const duplicateGroups = books.reduce((acc, book) => {
    const key = book.amazon_link;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(book);
    return acc;
  }, {} as Record<string, RankingBook[]>);

  // 重複があるグループのみを取得
  const duplicates = Object.entries(duplicateGroups).filter(([_, books]) => books.length > 1);

  if (duplicates.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <span className="text-green-500">✅</span>
          <span className="text-green-700 font-medium">重複はありません</span>
        </div>
        <p className="text-green-600 text-sm mt-1">
          全ての書籍が異なるAmazonリンクを持っています。
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-yellow-500">⚠️</span>
          <span className="text-yellow-700 font-medium">
            {duplicates.length}件の重複が検出されました
          </span>
        </div>
        <p className="text-yellow-600 text-sm">
          同一のAmazonリンクを持つ書籍があります。最新のものが表示され、その他は自動的に非表示になります。
        </p>
      </div>

      {duplicates.map(([amazonLink, duplicateBooks]) => (
        <div key={amazonLink} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-800 mb-2">
            重複グループ ({duplicateBooks.length}件)
          </h4>
          <p className="text-sm text-gray-600 mb-3 break-all">
            Amazon: {amazonLink}
          </p>
          <div className="space-y-2">
            {duplicateBooks
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .map((book, index) => (
                <div
                  key={book.id}
                  className={`flex items-center justify-between p-2 rounded ${
                    book.is_visible 
                      ? 'bg-green-100 border border-green-200' 
                      : 'bg-red-100 border border-red-200'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{book.title}</span>
                      <span className="text-sm text-gray-500">by {book.author}</span>
                      {index === 0 && (
                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                          最新
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {book.ranking_source} - {new Date(book.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div className={`text-xs px-2 py-1 rounded ${
                    book.is_visible 
                      ? 'bg-green-200 text-green-800' 
                      : 'bg-red-200 text-red-800'
                  }`}>
                    {book.is_visible ? '表示中' : '非表示'}
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function RankingManagementPage() {
  const [books, setBooks] = useState<RankingBook[]>([]);
  const [sources, setSources] = useState<RankingSource[]>([]);
  const [form, setForm] = useState<RankingForm>({
    title: '',
    author: '',
    genre_tags: '',
    amazon_link: '',
    asin: '',
    summary_link: '',
    description: '',
    page_count: '',
    price: '',
    ranking_source: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingBook, setEditingBook] = useState<RankingBook | null>(null);
  const [currentWeekStart, setCurrentWeekStart] = useState<string>('');
  const [showDebugConsole, setShowDebugConsole] = useState(true);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  // デバッグログ機能
  const addDebugLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString('ja-JP');
    const logMessage = `[${timestamp}] ${message}`;
    setDebugLogs(prev => [logMessage, ...prev].slice(0, 50)); // 最新50件まで保持
    console.log(logMessage);
  };

  useEffect(() => {
    addDebugLog('ランキング管理画面をロードしました');
    initializePage();
  }, []);

  const initializePage = async () => {
    try {
      setIsLoading(true);
      addDebugLog('ランキング管理画面初期化開始');
      
      // 今週の開始日を計算（月曜日基準）
      // 日曜日は翌週の開始週として扱う
      const weekStart = getWeekStartDate();
      setCurrentWeekStart(weekStart);
      addDebugLog(`対象週設定: ${weekStart}`);

      await Promise.all([
        loadRankingBooks(weekStart),
        loadRankingSources()
      ]);
      addDebugLog('ランキング管理画面初期化完了');
    } catch (err) {
      console.error('初期化エラー:', err);
      addDebugLog(`初期化エラー: ${err instanceof Error ? err.message : '不明なエラー'}`);
      setError('データの初期化に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const loadRankingBooks = async (weekStart: string) => {
    addDebugLog(`ランキング書籍読み込み開始: 週=${weekStart}`);
    try {
      // supabaseクライアントは既にインポート済み
      const { data, error } = await supabase
        .from('ranking_books')
        .select('*')
        .eq('week_start_date', weekStart)
        .order('created_at', { ascending: false });

      if (error) {
        addDebugLog(`ランキング書籍読み込みエラー: ${error.message}`);
        throw error;
      }

      addDebugLog(`ランキング書籍読み込み成功: ${data?.length || 0}件`);
      setBooks(data || []);
    } catch (error) {
      addDebugLog(`ランキング書籍読み込み失敗: ${error instanceof Error ? error.message : '不明なエラー'}`);
      throw error;
    }
  };

  const loadRankingSources = async () => {
    addDebugLog('ランキング元読み込み開始');
    try {
      // supabaseクライアントは既にインポート済み
      const { data, error } = await supabase
        .from('ranking_sources')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) {
        addDebugLog(`ランキング元読み込みエラー: ${error.message}`);
        throw error;
      }

      addDebugLog(`ランキング元読み込み成功: ${data?.length || 0}件`);
      setSources(data || []);
    } catch (error) {
      addDebugLog(`ランキング元読み込み失敗: ${error instanceof Error ? error.message : '不明なエラー'}`);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    addDebugLog(`フォーム送信開始: ${editingBook ? '編集' : '新規追加'}`);
    
    if (!form.title || !form.author || !form.amazon_link || !form.ranking_source) {
      addDebugLog('バリデーションエラー: 必須項目が未入力');
      setError('必須項目を入力してください');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      addDebugLog('データ保存処理開始');

      // Supabase設定確認
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      addDebugLog(`Supabase設定確認: URL=${supabaseUrl ? 'あり' : 'なし'}, Key=${supabaseAnonKey ? 'あり' : 'なし'}`);
      
      if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'your_supabase_url' || supabaseUrl === 'https://placeholder.supabase.co') {
        addDebugLog('Supabase未設定エラー');
        setError('Supabaseが設定されていません。環境変数を確認してください。');
        return;
      }

      // データを準備
      const bookData = {
        title: form.title,
        author: form.author,
        genre_tags: form.genre_tags ? form.genre_tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
        amazon_link: form.amazon_link,
        asin: form.asin || null,
        summary_link: form.summary_link || null,
        description: form.description || null,
        page_count: form.page_count ? parseInt(form.page_count) : null,
        price: form.price ? parseFloat(form.price) : null,
        ranking_source: form.ranking_source,
        week_start_date: currentWeekStart
      };

      addDebugLog(`保存データ: ${JSON.stringify(bookData, null, 2)}`);

      let result;
      if (editingBook) {
        // 更新
        addDebugLog(`書籍更新処理: ID=${editingBook.id}`);
        result = await supabase
          .from('ranking_books')
          .update(bookData)
          .eq('id', editingBook.id);
      } else {
        // 新規追加
        addDebugLog('書籍新規追加処理');
        result = await supabase
          .from('ranking_books')
          .insert([bookData]);
      }

      if (result.error) {
        addDebugLog(`データベースエラー: ${result.error.message}`);
        throw result.error;
      }

      addDebugLog(`データ保存成功: ${editingBook ? '更新' : '追加'}`);
      
      // 成功メッセージ
      setSuccessMessage(editingBook ? 'ランキング書籍を更新しました' : 'ランキング書籍を追加しました');
      
      // フォームをリセット
      cancelEdit();

      // データを再読み込み
      await loadRankingBooks(currentWeekStart);

    } catch (err) {
      console.error('保存エラー:', err);
      addDebugLog(`保存エラー: ${err instanceof Error ? err.message : '不明なエラー'}`);
      setError(`書籍の保存に失敗しました: ${err instanceof Error ? err.message : '不明なエラー'}`);
    } finally {
      setIsSubmitting(false);
      addDebugLog('フォーム送信処理終了');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('この書籍を削除しますか？')) {
      return;
    }

    addDebugLog(`書籍削除開始: ID=${id}`);
    try {
      // supabaseクライアントは既にインポート済み
      const { error } = await supabase
        .from('ranking_books')
        .delete()
        .eq('id', id);

      if (error) {
        addDebugLog(`削除エラー: ${error.message}`);
        throw error;
      }

      addDebugLog('書籍削除成功');
      setSuccessMessage('ランキング書籍を削除しました');
      await loadRankingBooks(currentWeekStart);
    } catch (err) {
      console.error('削除エラー:', err);
      addDebugLog(`削除失敗: ${err instanceof Error ? err.message : '不明なエラー'}`);
      setError('書籍の削除に失敗しました');
    }
  };

  const toggleVisibility = async (id: string, currentVisibility: boolean) => {
    addDebugLog(`表示状態切り替え開始: ID=${id}, 現在=${currentVisibility ? '表示' : '非表示'}`);
    try {
      // supabaseクライアントは既にインポート済み
      const { error } = await supabase
        .from('ranking_books')
        .update({ is_visible: !currentVisibility })
        .eq('id', id);

      if (error) {
        addDebugLog(`表示状態更新エラー: ${error.message}`);
        throw error;
      }

      addDebugLog('表示状態更新成功');
      await loadRankingBooks(currentWeekStart);
    } catch (err) {
      console.error('表示状態更新エラー:', err);
      addDebugLog(`表示状態更新失敗: ${err instanceof Error ? err.message : '不明なエラー'}`);
      setError('表示状態の更新に失敗しました');
    }
  };

  // 一括表示切り替え機能
  const toggleAllVisibility = async () => {
    const visibleCount = books.filter(book => book.is_visible).length;
    const shouldShowAll = visibleCount < books.length / 2; // 半分以下が表示中なら全て表示
    
    addDebugLog(`一括表示切り替え開始: ${shouldShowAll ? '全て表示' : '全て非表示'}`);
    
    try {
      const { error } = await supabase
        .from('ranking_books')
        .update({ is_visible: shouldShowAll })
        .eq('week_start_date', currentWeekStart);

      if (error) {
        addDebugLog(`一括表示切り替えエラー: ${error.message}`);
        throw error;
      }

      addDebugLog('一括表示切り替え成功');
      setSuccessMessage(shouldShowAll ? '全ての書籍を表示しました' : '全ての書籍を非表示にしました');
      await loadRankingBooks(currentWeekStart);
    } catch (err) {
      console.error('一括表示切り替えエラー:', err);
      addDebugLog(`一括表示切り替え失敗: ${err instanceof Error ? err.message : '不明なエラー'}`);
      setError('一括表示切り替えに失敗しました');
    }
  };

  // URLパラメータからフォーム表示状態を判定
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const formParam = params.get('form');
    if (formParam === 'new') {
      setShowForm(true);
    }
  }, []);

  // 編集開始
  const startEdit = (book: RankingBook) => {
    setEditingBook(book);
    setForm({
      title: book.title,
      author: book.author,
      genre_tags: book.genre_tags.join(', '),
      amazon_link: book.amazon_link,
      asin: book.asin || '',
      summary_link: book.summary_link || '',
      description: book.description || '',
      page_count: book.page_count ? String(book.page_count) : '',
      price: book.price ? String(book.price) : '',
      ranking_source: book.ranking_source
    });
    setShowForm(true);
  };

  // 編集取消
  const cancelEdit = () => {
    setEditingBook(null);
    setForm({
      title: '',
      author: '',
      genre_tags: '',
      amazon_link: '',
      asin: '',
      summary_link: '',
      description: '',
      page_count: '',
      price: '',
      ranking_source: ''
    });
    setShowForm(false);
    setError(null);
    setSuccessMessage(null);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-ios-blue/5 via-white to-ios-purple/5 px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* ヘッダー */}
          <div className="mb-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-ios-gray-800">🏆 ランキング管理</h1>
                <p className="text-ios-gray-600 mt-2">
                  今週のランキング書籍を管理
                </p>
                <p className="text-sm text-ios-gray-500 mt-1">
                  対象週: {currentWeekStart} 〜
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <ManagementSelector currentEntity="rankings" compact />
                
                <AdminActionsDropdown 
                  onToggleForm={() => {
                    if (showForm) {
                      cancelEdit();
                    } else {
                      setEditingBook(null);
                      setShowForm(true);
                      setError(null);
                      setSuccessMessage(null);
                    }
                  }}
                  onToggleDebug={() => setShowDebugConsole(!showDebugConsole)}
                  showForm={showForm}
                  showDebugConsole={showDebugConsole}
                  currentEntity="rankings"
                  hasDebugFeature={true}
                />
              </div>
            </div>
          </div>

          {/* エラー・成功メッセージ */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600 font-medium">❌ {error}</p>
            </div>
          )}
          
          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-600 font-medium">✅ {successMessage}</p>
            </div>
          )}

          {/* デバッグコンソール */}
          {showDebugConsole && (
            <Card variant="default" className="p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-ios-gray-800">🔧 デバッグコンソール</h3>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDebugLogs([])}
                    title="ログクリア"
                  >
                    🗑️
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const logText = debugLogs.join('\n');
                      navigator.clipboard?.writeText(logText).then(() => {
                        alert('ログをクリップボードにコピーしました');
                      });
                    }}
                    title="ログコピー"
                  >
                    📋
                  </Button>
                </div>
              </div>
              
              <div className="bg-black text-green-400 font-mono text-sm p-4 rounded-lg h-64 overflow-y-auto">
                {debugLogs.length === 0 ? (
                  <div className="text-gray-500">ログがありません。ランキング書籍の操作を行うとここにログが表示されます。</div>
                ) : (
                  debugLogs.map((log, index) => (
                    <div key={index} className="mb-1">
                      {log}
                    </div>
                  ))
                )}
              </div>
              
              <div className="mt-4 text-sm text-ios-gray-600">
                <p><strong>使い方:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li>ランキング書籍の追加・編集・削除を行うとログが表示されます</li>
                  <li>エラーが発生した場合の詳細情報も確認できます</li>
                  <li>ログはクリップボードにコピーして保存できます</li>
                </ul>
              </div>
            </Card>
          )}

          {/* 新規・編集フォーム */}
          {showForm && (
            <Card variant="default" className="mb-8">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-ios-gray-800">
                    {editingBook ? 'ランキング書籍を編集' : '新しいランキング書籍を追加'}
                  </h2>
                  <Button
                    variant="outline"
                    onClick={cancelEdit}
                    className="text-gray-600"
                  >
                    ✕ 閉じる
                  </Button>
                </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-ios-gray-700 mb-2">
                      タイトル <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      className="w-full px-3 py-2 border border-ios-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-ios-gray-700 mb-2">
                      著者 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.author}
                      onChange={(e) => setForm({ ...form, author: e.target.value })}
                      className="w-full px-3 py-2 border border-ios-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-ios-gray-700 mb-2">
                      ランキング元 <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={form.ranking_source}
                      onChange={(e) => setForm({ ...form, ranking_source: e.target.value })}
                      className="w-full px-3 py-2 border border-ios-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    >
                      <option value="">選択してください</option>
                      {sources.map((source) => (
                        <option key={source.id} value={source.name}>
                          {source.display_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-ios-gray-700 mb-2">
                      Amazonリンク <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="url"
                      value={form.amazon_link}
                      onChange={(e) => setForm({ ...form, amazon_link: e.target.value })}
                      className="w-full px-3 py-2 border border-ios-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-ios-gray-700 mb-2">
                      ASIN <span className="text-xs text-gray-500">(Amazon Standard Identification Number)</span>
                    </label>
                    <input
                      type="text"
                      value={form.asin}
                      onChange={(e) => setForm({ ...form, asin: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 border border-ios-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="例: B09XXXXXX"
                      maxLength={20}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-ios-gray-700 mb-2">
                      要約リンク
                    </label>
                    <input
                      type="url"
                      value={form.summary_link}
                      onChange={(e) => setForm({ ...form, summary_link: e.target.value })}
                      className="w-full px-3 py-2 border border-ios-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-ios-gray-700 mb-2">
                      ページ数
                    </label>
                    <input
                      type="number"
                      value={form.page_count}
                      onChange={(e) => setForm({ ...form, page_count: e.target.value })}
                      className="w-full px-3 py-2 border border-ios-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-ios-gray-700 mb-2">
                      価格（円）
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      className="w-full px-3 py-2 border border-ios-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* ASIN画像プレビュー */}
                {form.asin && (
                  <div>
                    <label className="block text-sm font-medium text-ios-gray-700 mb-2">
                      表紙プレビュー
                    </label>
                    <AsinImagePreview 
                      asin={form.asin} 
                      alt={form.title || 'Book cover'} 
                      className="w-32 h-40 mx-auto"
                      size="M"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-ios-gray-700 mb-2">
                    ジャンルタグ（カンマ区切り）
                  </label>
                  <textarea
                    value={form.genre_tags}
                    onChange={(e) => setForm({ ...form, genre_tags: e.target.value })}
                    className="w-full px-3 py-2 border border-ios-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="例: ビジネス, 自己啓発, 経済"
                    rows={2}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    カンマ（,）で区切って複数のジャンルを入力してください
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-ios-gray-700 mb-2">
                    説明
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-ios-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={cancelEdit}
                  >
                    キャンセル
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? '保存中...' : (editingBook ? '更新' : '追加')}
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        )}

        {isLoading ? (
          <Card variant="default">
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-ios-gray-600">読み込み中...</p>
            </div>
          </Card>
        ) : (
          <>
            {/* 重複チェック結果 */}
            {books.length > 0 && (
              <Card variant="default" className="mb-6">
                <div className="p-6">
                  <h2 className="text-xl font-bold text-ios-gray-800 mb-4">重複チェック結果</h2>
                  <DuplicateCheckSummary books={books} />
                </div>
              </Card>
            )}

            {/* 書籍リスト */}
            <Card variant="default">
              <div className="p-6">
                <h2 className="text-xl font-bold text-ios-gray-800 mb-4">
                  今週のランキング書籍 ({books.length}件)
                </h2>
                {books.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">📚</div>
                    <p className="text-ios-gray-600 text-lg mb-4">
                      まだランキング書籍が登録されていません
                    </p>
                    <Button
                      variant="primary"
                      onClick={() => {
                        setEditingBook(null);
                        setShowForm(true);
                      }}
                    >
                      最初のランキング書籍を追加
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {books.map((book) => (
                      <div
                        key={book.id}
                        className={`border rounded-lg p-4 ${
                          book.is_visible ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-bold text-lg">{book.title}</h3>
                              <span className={`px-2 py-1 rounded text-xs ${
                                book.is_visible 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {book.is_visible ? '表示中' : '非表示'}
                              </span>
                            </div>
                            <p className="text-ios-gray-600 mb-2">著者: {book.author}</p>
                            <p className="text-sm text-ios-gray-500 mb-2">
                              ランキング元: {sources.find(s => s.name === book.ranking_source)?.display_name || book.ranking_source}
                            </p>
                            {book.genre_tags && book.genre_tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-2">
                                {book.genre_tags.map((tag) => (
                                  <span key={tag} className="px-2 py-1 bg-orange-100 text-orange-600 rounded text-xs">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                            {book.description && (
                              <p className="text-sm text-ios-gray-600 mb-2">
                                {book.description.length > 100 
                                  ? `${book.description.substring(0, 100)}...` 
                                  : book.description}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col space-y-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => startEdit(book)}
                            >
                              編集
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleVisibility(book.id, book.is_visible)}
                            >
                              {book.is_visible ? '非表示' : '表示'}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(book.id)}
                              className="text-red-600 border-red-300 hover:bg-red-50"
                            >
                              削除
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  </ProtectedRoute>
);
}

export default function AdminRankingsPage() {
  return <RankingManagementPage />;
}