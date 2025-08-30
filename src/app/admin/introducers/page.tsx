'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import ManagementSelector from '@/components/admin/ManagementSelector';

import { supabase } from '@/lib/supabase';
import { Introducer } from '@/types';

export default function AdminIntroducersPage() {
  const [introducers, setIntroducers] = useState<Introducer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingIntroducer, setEditingIntroducer] = useState<Introducer | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    profile_url: '',
    description: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showDebugConsole, setShowDebugConsole] = useState(true);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [autoSaveMessage, setAutoSaveMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredIntroducers, setFilteredIntroducers] = useState<Introducer[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // デバウンス用のタイマーを管理
  const debounceTimers = useRef<{ [key: string]: NodeJS.Timeout }>({});

  useEffect(() => {
    window.scrollTo(0, 0);
    loadIntroducers();
  }, []);

  useEffect(() => {
    return () => {
      Object.values(debounceTimers.current).forEach(timer => {
        clearTimeout(timer);
      });
    };
  }, []);

  // 検索とフィルタリング
  useEffect(() => {
    let filtered = introducers;

    // 検索クエリでフィルタリング
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(introducer => 
        introducer.name.toLowerCase().includes(query) ||
        (introducer.description && introducer.description.toLowerCase().includes(query))
      );
    }

    // ステータスでフィルタリング
    if (statusFilter !== 'all') {
      filtered = filtered.filter(introducer => 
        statusFilter === 'active' ? introducer.is_active : !introducer.is_active
      );
    }

    setFilteredIntroducers(filtered);
  }, [introducers, searchQuery, statusFilter]);

  // デバッグログ機能
  const addDebugLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString('ja-JP');
    const logMessage = `[${timestamp}] ${message}`;
    setDebugLogs(prev => [logMessage, ...prev].slice(0, 50));
    console.log(logMessage);
  };

  // 自動保存機能（フォームデータを指定）
  const autoSaveWithData = async (fieldName: string, dataToSave: typeof formData) => {
    addDebugLog(`autoSaveWithData関数呼び出し: fieldName=${fieldName}, editingIntroducer=${editingIntroducer?.id}, isSaving=${isSaving}`);
    
    if (!editingIntroducer || isSaving) {
      addDebugLog(`自動保存スキップ: editingIntroducer=${!!editingIntroducer}, isSaving=${isSaving}`);
      return;
    }
    
    setIsSaving(true);
    setAutoSaveStatus('saving');
    setAutoSaveMessage('保存中...');
    addDebugLog(`自動保存開始: ${fieldName}, 紹介者ID: ${editingIntroducer.id}`);

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      addDebugLog(`Supabase設定確認: URL=${supabaseUrl ? 'あり' : 'なし'}, Key=${supabaseAnonKey ? 'あり' : 'なし'}`);
      
      if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'your_supabase_url' || supabaseUrl === 'https://placeholder.supabase.co') {
        setAutoSaveStatus('error');
        setAutoSaveMessage('Supabaseが設定されていません');
        addDebugLog('自動保存失敗: Supabase未設定');
        setTimeout(() => {
          setAutoSaveStatus('idle');
          setAutoSaveMessage(null);
        }, 3000);
        return;
      }

      const introducerData = {
        name: dataToSave.name,
        profile_url: dataToSave.profile_url || null,
        description: dataToSave.description || null
      };

      addDebugLog(`更新データ: ${JSON.stringify(introducerData, null, 2)}`);

      const { data, error, count } = await supabase
        .from('introducers')
        .update(introducerData)
        .eq('id', editingIntroducer.id)
        .select();

      addDebugLog(`Supabase更新結果: data=${data ? JSON.stringify(data) : 'null'}, error=${error ? error.message : 'null'}, count=${count}`);

      if (error) {
        addDebugLog(`自動保存エラー: ${error.message}, code: ${error.code}, details: ${error.details}`);
        throw error;
      }

      if (!data || data.length === 0) {
        addDebugLog('警告: 更新は成功したがデータが返されませんでした');
      }

      // ローカル状態も更新
      setIntroducers(prevIntroducers => 
        prevIntroducers.map(introducer => 
          introducer.id === editingIntroducer.id 
            ? { ...introducer, ...introducerData, updated_at: new Date().toISOString() }
            : introducer
        )
      );

      addDebugLog(`ローカル状態更新完了`);

      setAutoSaveStatus('saved');
      setAutoSaveMessage(`${fieldName}を自動保存しました`);
      addDebugLog(`自動保存成功: ${fieldName}`);
      
      setTimeout(() => {
        setAutoSaveStatus('idle');
        setAutoSaveMessage(null);
      }, 3000);
    } catch (err) {
      console.error('自動保存エラー:', err);
      setAutoSaveStatus('error');
      setAutoSaveMessage('自動保存に失敗しました');
      addDebugLog(`自動保存エラー: ${err instanceof Error ? err.message : '不明なエラー'}`);
      
      setTimeout(() => {
        setAutoSaveStatus('idle');
        setAutoSaveMessage(null);
      }, 3000);
    } finally {
      setIsSaving(false);
      addDebugLog(`自動保存処理終了: ${fieldName}`);
    }
  };

  // デバウンス機能付きの自動保存
  const debouncedAutoSave = (fieldName: string, value: string) => {
    // 既存のタイマーをクリア
    if (debounceTimers.current[fieldName]) {
      clearTimeout(debounceTimers.current[fieldName]);
    }

    // 新しいタイマーを設定（1秒後に実行）
    debounceTimers.current[fieldName] = setTimeout(() => {
      const currentFormData = {
        ...formData,
        [fieldName]: value
      };
      autoSaveWithData(fieldName, currentFormData);
    }, 1000);
  };

  const loadIntroducers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'your_supabase_url' || supabaseUrl === 'https://placeholder.supabase.co') {
        console.log('Supabase未設定 - モックデータを表示');
        setIntroducers([
          {
            id: '1',
            name: '池上彰',
            profile_url: 'https://www.tv-asahi.co.jp/ikegami/',
            description: 'ジャーナリスト。複雑なニュースをわかりやすく解説することで知られる。',
            is_active: true,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            created_by: null
          },
          {
            id: '2',
            name: '佐藤優',
            profile_url: 'https://ja.wikipedia.org/wiki/佐藤優_(作家)',
            description: '元外務省主任分析官、作家。国際情勢分析や教養書の執筆で活躍。',
            is_active: true,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            created_by: null
          }
        ]);
        return;
      }

      addDebugLog('Supabaseクエリ実行開始');
      console.log('Supabaseクエリ実行開始');
      const { data, error } = await supabase
        .from('introducers')
        .select('*')
        .order('created_at', { ascending: false });

      addDebugLog(`Supabaseクエリ結果: 紹介者数=${data?.length || 0}, エラー=${error?.message || 'なし'}`);
      console.log('Supabaseクエリ結果:', { data: data?.length || 0, error });
      
      if (error) throw error;
      setIntroducers(data || []);
    } catch (err) {
      console.error('紹介者データの読み込みエラー:', err);
      setError('紹介者データの読み込みに失敗しました。モックデータを表示しています。');
      
      // モックデータを表示
      setIntroducers([
        {
          id: '1',
          name: '池上彰',
          profile_url: 'https://www.tv-asahi.co.jp/ikegami/',
          description: 'ジャーナリスト。複雑なニュースをわかりやすく解説することで知られる。',
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          created_by: null
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // バリデーション
    if (!formData.name.trim()) {
      setError('紹介者名は必須です。');
      return;
    }

    if (formData.name.length > 100) {
      setError('紹介者名は100文字以内で入力してください。');
      return;
    }

    if (formData.description && formData.description.length > 300) {
      setError('説明は300文字以内で入力してください。');
      return;
    }

    if (formData.profile_url && !formData.profile_url.match(/^https?:\/\/.+/)) {
      setError('プロフィールURLは有効なURL（http://またはhttps://）を入力してください。');
      return;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'your_supabase_url' || supabaseUrl === 'https://placeholder.supabase.co') {
      setError('Supabaseが設定されていないため、紹介者の保存はできません。環境変数NEXT_PUBLIC_SUPABASE_URLとNEXT_PUBLIC_SUPABASE_ANON_KEYを設定してください。');
      return;
    }

    try {
      const introducerData = {
        name: formData.name,
        profile_url: formData.profile_url || null,
        description: formData.description || null
      };

      if (editingIntroducer) {
        // 更新
        addDebugLog(`紹介者更新開始: ID=${editingIntroducer.id}, 紹介者名=${introducerData.name}`);
        
        const { data: existingIntroducer, error: checkError } = await supabase
          .from('introducers')
          .select('id, name')
          .eq('id', editingIntroducer.id)
          .single();

        addDebugLog(`紹介者存在確認: ${existingIntroducer ? '存在' : '存在しない'}, エラー: ${checkError?.message || 'なし'}`);

        if (checkError) {
          addDebugLog(`紹介者存在確認エラー: ${checkError.message}`);
          throw new Error('更新対象の紹介者が見つかりません。');
        }

        const { data, error } = await supabase
          .from('introducers')
          .update(introducerData)
          .eq('id', editingIntroducer.id)
          .select();

        addDebugLog(`紹介者更新結果: data=${data ? JSON.stringify(data) : 'null'}, error=${error ? error.message : 'null'}`);

        if (error) throw error;

        // ローカル状態を更新
        setIntroducers(prevIntroducers => 
          prevIntroducers.map(introducer => 
            introducer.id === editingIntroducer.id 
              ? { ...introducer, ...introducerData, updated_at: new Date().toISOString() }
              : introducer
          )
        );

        setSuccessMessage('紹介者が正常に更新されました。');
        addDebugLog('紹介者更新成功');
      } else {
        // 新規作成
        addDebugLog(`紹介者新規作成開始: 紹介者名=${introducerData.name}`);
        
        const { data, error } = await supabase
          .from('introducers')
          .insert([introducerData])
          .select();

        addDebugLog(`紹介者新規作成結果: data=${data ? JSON.stringify(data) : 'null'}, error=${error ? error.message : 'null'}`);

        if (error) throw error;

        if (data && data.length > 0) {
          setIntroducers(prevIntroducers => [data[0], ...prevIntroducers]);
        }

        setSuccessMessage('紹介者が正常に作成されました。');
        addDebugLog('紹介者新規作成成功');
      }

      // フォームをリセット
      setFormData({
        name: '',
        profile_url: '',
        description: ''
      });
      setShowForm(false);
      setEditingIntroducer(null);

    } catch (err) {
      console.error('紹介者の保存エラー:', err);
      setError(err instanceof Error ? err.message : '紹介者の保存に失敗しました。');
      addDebugLog(`紹介者保存エラー: ${err instanceof Error ? err.message : '不明なエラー'}`);
    }
  };

  const handleEdit = (introducer: Introducer) => {
    setEditingIntroducer(introducer);
    setFormData({
      name: introducer.name,
      profile_url: introducer.profile_url || '',
      description: introducer.description || ''
    });
    setShowForm(true);
    setError(null);
    setSuccessMessage(null);
  };

  const handleDelete = async (introducer: Introducer) => {
    if (!confirm(`「${introducer.name}」を削除してもよろしいですか？この操作は元に戻せません。`)) {
      return;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'your_supabase_url' || supabaseUrl === 'https://placeholder.supabase.co') {
      setError('Supabaseが設定されていないため、紹介者の削除はできません。');
      return;
    }

    try {
      addDebugLog(`紹介者削除開始: ID=${introducer.id}, 紹介者名=${introducer.name}`);
      
      const { error } = await supabase
        .from('introducers')
        .delete()
        .eq('id', introducer.id);

      addDebugLog(`紹介者削除結果: error=${error ? error.message : 'null'}`);

      if (error) throw error;

      // ローカル状態から削除
      setIntroducers(prevIntroducers => 
        prevIntroducers.filter(p => p.id !== introducer.id)
      );

      setSuccessMessage('紹介者が正常に削除されました。');
      addDebugLog('紹介者削除成功');

    } catch (err) {
      console.error('紹介者の削除エラー:', err);
      setError('紹介者の削除に失敗しました。');
      addDebugLog(`紹介者削除エラー: ${err instanceof Error ? err.message : '不明なエラー'}`);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingIntroducer(null);
    setFormData({
      name: '',
      profile_url: '',
      description: ''
    });
    setError(null);
    setSuccessMessage(null);
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // 編集中の場合のみ自動保存
    if (editingIntroducer) {
      debouncedAutoSave(field, value);
    }
  };

  // 重複チェック
  const getDuplicateWarning = (name: string) => {
    if (!name.trim() || name === editingIntroducer?.name) return null;
    
    const duplicates = introducers.filter(introducer => 
      introducer.name.toLowerCase() === name.toLowerCase() && 
      introducer.id !== editingIntroducer?.id
    );
    
    if (duplicates.length >= 1) {
      return `同名の紹介者が${duplicates.length}件存在します。`;
    }
    
    return null;
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-ios-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* ヘッダー */}
          <div className="mb-8">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center space-x-4">
                <h1 className="text-3xl font-bold text-ios-gray-800">紹介者管理</h1>
                <div className="hidden md:block text-ios-gray-600">
                  書籍の紹介者・レビュアーを管理
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <ManagementSelector currentEntity="introducers" compact />
                
                <Link href="/admin/tags">
                  <Button variant="secondary" size="sm" className="px-3 w-10" title="タグマスター管理">
                    🏷️
                  </Button>
                </Link>
                
                <Link href="/admin/mappings">
                  <Button variant="secondary" size="sm" className="px-3 w-10" title="質問マッピング管理">
                    🔗
                  </Button>
                </Link>
                
                <Link href="/">
                  <Button variant="outline" size="sm" className="px-3 w-10" title="ホームに戻る">
                    🏠
                  </Button>
                </Link>
              </div>
            </div>
            
            <ManagementSelector currentEntity="introducers" />
          </div>

          {/* エラー・成功メッセージ */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}
          
          {successMessage && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-700">{successMessage}</p>
            </div>
          )}

          {/* 自動保存ステータス */}
          {autoSaveMessage && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${
              autoSaveStatus === 'saving' ? 'bg-blue-100 text-blue-700' :
              autoSaveStatus === 'saved' ? 'bg-green-100 text-green-700' :
              autoSaveStatus === 'error' ? 'bg-red-100 text-red-700' : ''
            }`}>
              {autoSaveMessage}
            </div>
          )}

          {/* 検索・フィルタ */}
          <Card className="mb-6">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-64">
                <Input
                  type="text"
                  placeholder="紹介者名や説明で検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                  className="px-3 py-2 border border-ios-gray-300 rounded-lg focus:ring-2 focus:ring-ios-blue focus:border-ios-blue"
                >
                  <option value="all">すべて</option>
                  <option value="active">アクティブ</option>
                  <option value="inactive">非アクティブ</option>
                </select>
              </div>
              <Button
                onClick={() => setShowForm(true)}
                variant="primary"
              >
                + 新規紹介者
              </Button>
            </div>
          </Card>

          {/* 新規作成・編集フォーム */}
          {showForm && (
            <Card className="mb-6">
              <h3 className="text-xl font-bold mb-4">
                {editingIntroducer ? '紹介者編集' : '新規紹介者作成'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-ios-gray-700 mb-2">
                    紹介者名 <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="例: 池上彰"
                    required
                    maxLength={100}
                  />
                  {getDuplicateWarning(formData.name) && (
                    <p className="text-orange-600 text-sm mt-1">
                      ⚠️ {getDuplicateWarning(formData.name)}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-ios-gray-700 mb-2">
                    プロフィールURL
                  </label>
                  <Input
                    type="url"
                    value={formData.profile_url}
                    onChange={(e) => handleInputChange('profile_url', e.target.value)}
                    placeholder="https://example.com/profile"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ios-gray-700 mb-2">
                    説明
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="紹介者の説明や経歴など（最大300文字）"
                    rows={4}
                    maxLength={300}
                    className="w-full px-3 py-2 border border-ios-gray-300 rounded-lg focus:ring-2 focus:ring-ios-blue focus:border-ios-blue resize-none"
                  />
                  <p className="text-xs text-ios-gray-500 mt-1">
                    {formData.description.length}/300文字
                  </p>
                </div>

                <div className="flex space-x-3">
                  <Button type="submit" variant="primary">
                    {editingIntroducer ? '更新' : '作成'}
                  </Button>
                  <Button type="button" variant="secondary" onClick={handleCancel}>
                    キャンセル
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* 紹介者一覧 */}
          <Card>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">
                紹介者一覧 ({filteredIntroducers.length}件)
              </h3>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ios-blue mx-auto"></div>
                <p className="text-ios-gray-600 mt-2">読み込み中...</p>
              </div>
            ) : filteredIntroducers.length === 0 ? (
              <div className="text-center py-8 text-ios-gray-600">
                {searchQuery || statusFilter !== 'all' 
                  ? '検索条件に一致する紹介者が見つかりません。'
                  : '紹介者が登録されていません。'
                }
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-ios-gray-50 border-b border-ios-gray-200">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-ios-gray-700">名前</th>
                      <th className="text-left py-3 px-4 font-medium text-ios-gray-700">プロフィール</th>
                      <th className="text-left py-3 px-4 font-medium text-ios-gray-700">説明</th>
                      <th className="text-left py-3 px-4 font-medium text-ios-gray-700">ステータス</th>
                      <th className="text-left py-3 px-4 font-medium text-ios-gray-700">更新日</th>
                      <th className="text-left py-3 px-4 font-medium text-ios-gray-700">アクション</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ios-gray-200">
                    {filteredIntroducers.map((introducer) => (
                      <tr key={introducer.id} className="hover:bg-ios-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-medium text-ios-gray-800">
                            {introducer.name}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {introducer.profile_url ? (
                            <a
                              href={introducer.profile_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-ios-blue hover:underline text-sm"
                            >
                              リンク
                            </a>
                          ) : (
                            <span className="text-ios-gray-400 text-sm">なし</span>
                          )}
                        </td>
                        <td className="py-3 px-4 max-w-xs">
                          <div className="text-sm text-ios-gray-600 truncate">
                            {introducer.description ? 
                              introducer.description.slice(0, 50) + (introducer.description.length > 50 ? '...' : '') 
                              : 'なし'
                            }
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                            introducer.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {introducer.is_active ? 'アクティブ' : '非アクティブ'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-ios-gray-600">
                          {new Date(introducer.updated_at).toLocaleDateString('ja-JP')}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(introducer)}
                              className="px-3"
                            >
                              ✏️
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(introducer)}
                              className="px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              🗑️
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* デバッグコンソール */}
          {showDebugConsole && debugLogs.length > 0 && (
            <Card className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">デバッグログ</h3>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => setDebugLogs([])}
                    variant="secondary"
                    size="sm"
                  >
                    クリア
                  </Button>
                  <Button
                    onClick={() => setShowDebugConsole(false)}
                    variant="outline"
                    size="sm"
                  >
                    非表示
                  </Button>
                </div>
              </div>
              <div className="bg-ios-gray-900 text-green-400 p-4 rounded-lg font-mono text-xs max-h-64 overflow-y-auto">
                {debugLogs.map((log, index) => (
                  <div key={index} className="mb-1">
                    {log}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {!showDebugConsole && (
            <div className="mt-6 text-center">
              <Button
                onClick={() => setShowDebugConsole(true)}
                variant="outline"
                size="sm"
              >
                デバッグログを表示
              </Button>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}