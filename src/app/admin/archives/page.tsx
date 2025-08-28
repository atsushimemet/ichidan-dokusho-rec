'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import ManagementSelector from '@/components/admin/ManagementSelector';
import { AdminActionsDropdown } from '@/components/ui/DropdownMenu';
import { Archive } from '@/types';
import { getArchives, createArchive, updateArchive, deleteArchive } from '@/lib/archives';

export default function AdminArchivesPage() {
  const [archives, setArchives] = useState<Archive[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingArchive, setEditingArchive] = useState<Archive | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    link: '',
    description: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDebugConsole, setShowDebugConsole] = useState(false);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  useEffect(() => {
    loadArchives();
  }, []);

  // デバッグログ機能
  const addDebugLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString('ja-JP');
    const logMessage = `[${timestamp}] ${message}`;
    setDebugLogs(prev => [logMessage, ...prev].slice(0, 50)); // 最新50件まで保持
    console.log(logMessage);
  };

  const loadArchives = async () => {
    try {
      setIsLoading(true);
      addDebugLog('アーカイブデータ読み込み開始');
      // 本番環境: Supabaseからデータを取得
      const result = await getArchives('', 1, 100); // 管理画面では多めに取得
      setArchives(result.archives);
      addDebugLog(`アーカイブデータ読み込み完了: ${result.archives.length}件`);
    } catch (err) {
      setError('アーカイブの読み込みに失敗しました');
      addDebugLog(`アーカイブ読み込みエラー: ${err instanceof Error ? err.message : '不明なエラー'}`);
      console.error('アーカイブ読み込みエラー:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.link.trim() || !formData.description.trim()) {
      setError('すべての項目を入力してください');
      return;
    }

    // URLの簡単なバリデーション
    try {
      new URL(formData.link);
    } catch {
      setError('有効なURLを入力してください');
      return;
    }

    try {
      setError(null);
      
      if (editingArchive) {
        // 編集の場合
        addDebugLog(`アーカイブ更新開始: ID=${editingArchive.id}, タイトル=${formData.title}`);
        const updatedArchive = await updateArchive(editingArchive.id, {
          title: formData.title.trim(),
          link: formData.link.trim(),
          description: formData.description.trim()
        });
        
        setArchives(prev => 
          prev.map(archive => 
            archive.id === editingArchive.id ? updatedArchive : archive
          )
        );
        
        addDebugLog('アーカイブ更新成功');
        setSuccessMessage('アーカイブが更新されました');
      } else {
        // 新規作成の場合
        addDebugLog(`アーカイブ作成開始: タイトル=${formData.title}`);
        const newArchive = await createArchive({
          title: formData.title.trim(),
          link: formData.link.trim(),
          description: formData.description.trim()
        });
        
        setArchives(prev => [newArchive, ...prev]);
        addDebugLog('アーカイブ作成成功');
        setSuccessMessage('アーカイブが作成されました');
      }
      
      // フォームをリセット
      setFormData({ title: '', link: '', description: '' });
      setEditingArchive(null);
      setShowForm(false);
      
      // 3秒後にメッセージを消去
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存に失敗しました');
      console.error('保存エラー:', err);
    }
  };

  const handleEdit = (archive: Archive) => {
    setEditingArchive(archive);
    setFormData({
      title: archive.title,
      link: archive.link,
      description: archive.description
    });
    setShowForm(true);
    setError(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('このアーカイブを削除しますか？この操作は取り消せません。')) {
      return;
    }
    
    try {
      addDebugLog(`アーカイブ削除開始: ID=${id}`);
      // 本番環境: Supabaseから削除
      await deleteArchive(id);
      setArchives(prev => prev.filter(archive => archive.id !== id));
      addDebugLog('アーカイブ削除成功');
      setSuccessMessage('アーカイブが削除されました');
      
      // 3秒後にメッセージを消去
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      
    } catch (err) {
      addDebugLog(`アーカイブ削除エラー: ${err instanceof Error ? err.message : '不明なエラー'}`);
      setError(err instanceof Error ? err.message : '削除に失敗しました');
      console.error('削除エラー:', err);
    }
  };

  const handleCancel = () => {
    setFormData({ title: '', link: '', description: '' });
    setEditingArchive(null);
    setShowForm(false);
    setError(null);
  };



  const filteredArchives = archives.filter(archive =>
    archive.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    archive.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-ios-blue/5 via-white to-ios-purple/5 px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* ヘッダー */}
          <div className="mb-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-ios-gray-800">アーカイブ管理</h1>
                <p className="text-ios-gray-600 mt-2">
                  関連記事・コンテンツを管理
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <ManagementSelector currentEntity="archives" compact />
                
                <AdminActionsDropdown
                  onToggleForm={() => setShowForm(!showForm)}
                  onToggleDebug={() => setShowDebugConsole(!showDebugConsole)}
                  showForm={showForm}
                  showDebugConsole={showDebugConsole}
                  currentEntity="archives"
                  hasDebugFeature={true}
                />
              </div>
            </div>
          </div>

          {/* 成功メッセージ */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg">
              <div className="flex">
                <svg className="flex-shrink-0 h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div className="ml-3">
                  <p className="text-sm font-medium">{successMessage}</p>
                </div>
              </div>
            </div>
          )}

          {/* エラーメッセージ */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg">
              <div className="flex">
                <svg className="flex-shrink-0 h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="ml-3">
                  <p className="text-sm font-medium">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* デバッグコンソール */}
          {showDebugConsole && (
            <div className="mb-6 bg-white rounded-xl shadow-ios-sm border border-ios-gray-200 p-6">
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
                  <div className="text-gray-500">ログがありません。アーカイブの操作を行うとここにログが表示されます。</div>
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
                  <li>アーカイブの作成・編集・削除を行うとログが表示されます</li>
                  <li>モバイルデバイスでも操作の詳細を確認できます</li>
                  <li>問題が発生した場合、このログを開発者に共有してください</li>
                </ul>
              </div>
            </div>
          )}

          {/* 操作バー */}
          <div className="mb-6">
            <div className="flex-1 max-w-md">
              <Input
                type="text"
                placeholder="アーカイブを検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          {/* フォーム */}
          {showForm && (
            <Card className="mb-8 p-6">
              <h2 className="text-xl font-bold text-ios-gray-800 mb-4">
                {editingArchive ? 'アーカイブ編集' : '新規アーカイブ作成'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-ios-gray-700 mb-2">
                    記事タイトル *
                  </label>
                  <Input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="記事のタイトルを入力"
                    className="w-full"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-ios-gray-700 mb-2">
                    記事URL *
                  </label>
                  <Input
                    type="url"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    placeholder="https://example.com/article"
                    className="w-full"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-ios-gray-700 mb-2">
                    説明 *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="記事の説明を入力"
                    rows={4}
                    className="w-full px-3 py-2 border border-ios-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ios-blue focus:border-transparent resize-vertical"
                    required
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-ios-blue to-ios-purple text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-300"
                  >
                    {editingArchive ? '更新' : '作成'}
                  </Button>
                  <Button
                    type="button"
                    onClick={handleCancel}
                    className="bg-ios-gray-200 text-ios-gray-700 px-6 py-2 rounded-lg hover:bg-ios-gray-300 transition-all duration-300"
                  >
                    キャンセル
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* アーカイブ一覧 */}
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-bold text-ios-gray-800 mb-4">
                アーカイブ一覧 ({filteredArchives.length}件)
              </h2>
              
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="border border-ios-gray-200 rounded-lg p-4 animate-pulse">
                      <div className="h-6 bg-ios-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-ios-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-ios-gray-200 rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              ) : filteredArchives.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-ios-gray-400 text-4xl mb-4">📰</div>
                  <p className="text-ios-gray-600">
                    {searchQuery ? '該当するアーカイブが見つかりませんでした' : 'アーカイブがありません'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredArchives.map((archive) => (
                    <div key={archive.id} className="border border-ios-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg text-ios-gray-800 flex-1 pr-4">
                          {archive.title}
                        </h3>
                        <div className="flex gap-2 flex-shrink-0">
                          <Button
                            onClick={() => handleEdit(archive)}
                            className="bg-ios-blue text-white px-3 py-1 text-sm rounded hover:bg-ios-blue/80 transition-colors"
                          >
                            編集
                          </Button>
                          <Button
                            onClick={() => handleDelete(archive.id)}
                            className="bg-red-500 text-white px-3 py-1 text-sm rounded hover:bg-red-600 transition-colors"
                          >
                            削除
                          </Button>
                        </div>
                      </div>
                      <div className="mb-2">
                        <a
                          href={archive.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-ios-blue hover:text-ios-purple text-sm break-all"
                        >
                          {archive.link}
                        </a>
                      </div>
                      <p className="text-ios-gray-600 text-sm mb-2">
                        {archive.description}
                      </p>
                      <div className="text-xs text-ios-gray-400">
                        作成: {new Date(archive.created_at).toLocaleDateString('ja-JP')} |
                        更新: {new Date(archive.updated_at).toLocaleDateString('ja-JP')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}