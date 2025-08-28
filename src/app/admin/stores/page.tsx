'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import ManagementSelector from '@/components/admin/ManagementSelector';
import { supabase } from '@/lib/supabase';
import { Store } from '@/types';

export default function AdminStoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    prefecture: '',
    city: '',
    sns_link: '',
    google_map_link: '',
    description: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showDebugConsole, setShowDebugConsole] = useState(true);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [autoSaveMessage, setAutoSaveMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    loadStores();
  }, []);

  useEffect(() => {
    return () => {
      Object.values(debounceTimers.current).forEach(timer => {
        clearTimeout(timer);
      });
    };
  }, []);

  // デバッグログ機能
  const addDebugLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString('ja-JP');
    const logMessage = `[${timestamp}] ${message}`;
    setDebugLogs(prev => [logMessage, ...prev].slice(0, 50));
    console.log(logMessage);
  };

  // 自動保存機能（フォームデータを指定）
  const autoSaveWithData = async (fieldName: string, dataToSave: typeof formData) => {
    addDebugLog(`autoSaveWithData関数呼び出し: fieldName=${fieldName}, editingStore=${editingStore?.id}, isSaving=${isSaving}`);
    
    if (!editingStore || isSaving) {
      addDebugLog(`自動保存スキップ: editingStore=${!!editingStore}, isSaving=${isSaving}`);
      return;
    }
    
    setIsSaving(true);
    setAutoSaveStatus('saving');
    setAutoSaveMessage('保存中...');
    addDebugLog(`自動保存開始: ${fieldName}, 店舗ID: ${editingStore.id}`);

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

      const storeData = {
        name: dataToSave.name,
        prefecture: dataToSave.prefecture || null,
        city: dataToSave.city || null,
        sns_link: dataToSave.sns_link || null,
        google_map_link: dataToSave.google_map_link || null,
        description: dataToSave.description || null
      };

      addDebugLog(`更新データ: ${JSON.stringify(storeData, null, 2)}`);

      const { data, error, count } = await supabase
        .from('stores')
        .update(storeData)
        .eq('id', editingStore.id)
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
      setStores(prevStores => 
        prevStores.map(store => 
          store.id === editingStore.id 
            ? { ...store, ...storeData, updated_at: new Date().toISOString() }
            : store
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

  // デバウンス用のタイマーを管理
  const debounceTimers = React.useRef<{[key: string]: NodeJS.Timeout}>({});

  // 入力フィールドのハンドラー（自動保存付き）
  const handleFieldChange = (field: string, value: any, fieldDisplayName: string) => {
    addDebugLog(`フィールド変更: ${field} = ${value}, 編集モード: ${!!editingStore}`);
    
    // フォームデータを更新
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    
    // 編集モード時のみ自動保存
    if (editingStore) {
      addDebugLog(`デバウンスタイマー設定: ${field} (${fieldDisplayName})`);
      
      // 前のタイマーをクリア
      if (debounceTimers.current[field]) {
        clearTimeout(debounceTimers.current[field]);
        addDebugLog(`前のタイマーをクリア: ${field}`);
      }
      
      // デバウンス処理（500ms後に自動保存）
      debounceTimers.current[field] = setTimeout(() => {
        addDebugLog(`デバウンス完了、自動保存実行: ${field} (${fieldDisplayName})`);
        autoSaveWithData(fieldDisplayName, newFormData);
        delete debounceTimers.current[field];
      }, 500);
    } else {
      addDebugLog(`編集モードではないため自動保存をスキップ`);
    }
  };

  const loadStores = async () => {
    try {
      setIsLoading(true);
      addDebugLog('店舗データ読み込み開始');
      
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      console.log('Supabase設定確認:', {
        url: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : '未設定',
        hasKey: !!supabaseAnonKey,
        keyLength: supabaseAnonKey ? supabaseAnonKey.length : 0
      });
      
      if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'your_supabase_url' || supabaseUrl === 'https://placeholder.supabase.co') {
        addDebugLog('Supabaseが未設定のためモックデータを使用');
        setError('Supabaseが設定されていません。モックデータを表示しています。');
        setStores([
          {
            id: '1',
            name: '青山ブックセンター本店',
            prefecture: '東京都',
            city: '港区',
            sns_link: 'https://twitter.com/aoyamabc',
            google_map_link: 'https://maps.google.com/?q=青山ブックセンター本店',
            description: 'アート、デザイン、建築書に強い青山の老舗書店。',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z'
          },
          {
            id: '2',
            name: '蔦屋書店 代官山店',
            prefecture: '東京都',
            city: '渋谷区',
            sns_link: 'https://twitter.com/tsutaya_daikanyama',
            google_map_link: 'https://maps.google.com/?q=蔦屋書店代官山店',
            description: 'ライフスタイル提案型書店。カフェも併設された文化の発信地。',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z'
          }
        ]);
        return;
      }

      addDebugLog('Supabaseクエリ実行開始');
      console.log('Supabaseクエリ実行開始');
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .order('created_at', { ascending: false });

      addDebugLog(`Supabaseクエリ結果: 店舗数=${data?.length || 0}, エラー=${error?.message || 'なし'}`);
      console.log('Supabaseクエリ結果:', { data: data?.length || 0, error });
      
      if (error) throw error;
      setStores(data || []);
    } catch (err) {
      console.error('店舗データの読み込みエラー:', err);
      setError('店舗データの読み込みに失敗しました。モックデータを表示しています。');
      
      // モックデータを表示
      setStores([
        {
          id: '1',
          name: '青山ブックセンター本店',
          prefecture: '東京都',
          city: '港区',
          sns_link: 'https://twitter.com/aoyamabc',
          google_map_link: 'https://maps.google.com/?q=青山ブックセンター本店',
          description: 'アート、デザイン、建築書に強い青山の老舗書店。',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
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
      setError('店舗名は必須です。');
      return;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'your_supabase_url' || supabaseUrl === 'https://placeholder.supabase.co') {
      setError('Supabaseが設定されていないため、店舗の保存はできません。環境変数NEXT_PUBLIC_SUPABASE_URLとNEXT_PUBLIC_SUPABASE_ANON_KEYを設定してください。');
      return;
    }

    try {
      const storeData = {
        name: formData.name,
        prefecture: formData.prefecture || null,
        city: formData.city || null,
        sns_link: formData.sns_link || null,
        google_map_link: formData.google_map_link || null,
        description: formData.description || null
      };

      if (editingStore) {
        // 更新
        addDebugLog(`店舗更新開始: ID=${editingStore.id}, 店舗名=${storeData.name}`);
        
        const { data: existingStore, error: checkError } = await supabase
          .from('stores')
          .select('id, name')
          .eq('id', editingStore.id)
          .single();

        addDebugLog(`店舗存在確認: ${existingStore ? '存在' : '存在しない'}, エラー: ${checkError?.message || 'なし'}`);
        
        if (checkError || !existingStore) {
          addDebugLog(`店舗が見つからない: ${checkError?.message || '不明なエラー'}`);
          throw new Error(`更新対象の店舗(ID: ${editingStore.id})が見つかりませんでした`);
        }
        
        const { error: updateError } = await supabase
          .from('stores')
          .update(storeData)
          .eq('id', editingStore.id);

        addDebugLog(`店舗更新結果: エラー=${updateError?.message || 'なし'}`);
        
        if (updateError) {
          addDebugLog(`店舗更新エラー: ${updateError.message}`);
          throw updateError;
        }

        // 更新成功後、別途データを取得
        const { data: updatedStore, error: fetchError } = await supabase
          .from('stores')
          .select('*')
          .eq('id', editingStore.id)
          .single();
        
        if (fetchError) {
          addDebugLog(`更新後のデータ取得エラー: ${fetchError.message}`);
          const mergedData: Store = { 
            ...editingStore, 
            ...storeData, 
            updated_at: new Date().toISOString() 
          };
          setStores(prevStores => 
            prevStores.map(store => 
              store.id === editingStore.id ? mergedData : store
            )
          );
          addDebugLog('ローカルデータで更新を反映');
        } else {
          addDebugLog('更新後のデータ取得成功');
          setStores(prevStores => 
            prevStores.map(store => 
              store.id === editingStore.id ? updatedStore : store
            )
          );
        }

        setSuccessMessage('店舗を更新しました');
        
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      } else {
        // 新規作成
        addDebugLog(`店舗追加開始: 店舗名=${storeData.name}`);
        const { data, error } = await supabase
          .from('stores')
          .insert([storeData])
          .select();

        addDebugLog(`店舗追加結果: データ数=${data?.length || 0}, エラー=${error?.message || 'なし'}`);
        
        if (error) {
          addDebugLog(`店舗追加エラー: ${error.message}`);
          throw error;
        }
        
        if (!data || data.length === 0) {
          addDebugLog('店舗の追加に失敗 - データが返されませんでした');
          throw new Error('店舗の追加に失敗しました');
        }
        
        addDebugLog('店舗追加成功');
        
        setStores(prevStores => [data[0], ...prevStores]);
        setSuccessMessage('店舗を追加しました');
        
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      }

      resetForm();
      
      setTimeout(async () => {
        await loadStores();
        console.log('店舗一覧を再読み込み完了');
      }, 500);
    } catch (err) {
      console.error('店舗保存エラー:', err);
      const errorMessage = err instanceof Error ? err.message : '店舗の保存に失敗しました';
      setError(errorMessage);
    }
  };

  const handleEdit = (store: Store) => {
    addDebugLog(`編集モード開始: 店舗ID=${store.id}, 店舗名=${store.name}`);
    setEditingStore(store);
    setFormData({
      name: store.name,
      prefecture: store.prefecture ?? '',
      city: store.city ?? '',
      sns_link: store.sns_link ?? '',
      google_map_link: store.google_map_link ?? '',
      description: store.description ?? ''
    });
    setShowForm(true);
    addDebugLog(`編集フォーム表示: editingStore=${store.id}`);
  };

  const handleDelete = async (storeId: string) => {
    if (!confirm('この店舗を削除しますか？')) return;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'your_supabase_url' || supabaseUrl === 'https://placeholder.supabase.co') {
      setError('Supabaseが設定されていないため、店舗の削除はできません。環境変数NEXT_PUBLIC_SUPABASE_URLとNEXT_PUBLIC_SUPABASE_ANON_KEYを設定してください。');
      return;
    }

    try {
      addDebugLog(`店舗削除開始: ID=${storeId}`);
      const { error } = await supabase
        .from('stores')
        .delete()
        .eq('id', storeId);

      if (error) {
        addDebugLog(`店舗削除エラー: ${error.message}`);
        throw error;
      }
      
      addDebugLog('店舗削除成功');
      setStores(prevStores => prevStores.filter(store => store.id !== storeId));
      setSuccessMessage('店舗を削除しました');
      
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      addDebugLog(`店舗削除エラー: ${err instanceof Error ? err.message : '不明なエラー'}`);
      setError('店舗の削除に失敗しました');
    }
  };

  const resetForm = () => {
    addDebugLog(`フォームリセット: 編集モード終了=${!!editingStore}`);
    
    // 保留中のタイマーをクリア
    Object.values(debounceTimers.current).forEach(timer => {
      clearTimeout(timer);
    });
    debounceTimers.current = {};
    addDebugLog(`保留中のタイマーをクリア`);
    
    setFormData({
      name: '',
      prefecture: '',
      city: '',
      sns_link: '',
      google_map_link: '',
      description: ''
    });
    setEditingStore(null);
    setShowForm(false);
    
    setAutoSaveStatus('idle');
    setAutoSaveMessage(null);
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ios-blue/5 via-white to-ios-purple/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ios-blue mx-auto mb-4"></div>
          <p className="text-ios-gray-600">店舗データを読み込んでいます...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-ios-blue/5 via-white to-ios-purple/5 px-4 py-8">
        <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-ios-gray-800">店舗管理</h1>
              <p className="text-ios-gray-600 mt-2">
                書店・本屋の情報を管理
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <ManagementSelector currentEntity="stores" compact />
              
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
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDebugConsole(!showDebugConsole)}
                className="px-3 w-10"
                title="デバッグコンソール"
              >
                🔧
              </Button>
              
              <Link href="/">
                <Button variant="outline" size="sm" className="px-3 w-10" title="ホームに戻る">
                  🏠
                </Button>
              </Link>
              
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowForm(!showForm)}
                className="px-3 w-10"
                title={showForm ? '戻る' : '新しい店舗を追加'}
              >
                {showForm ? '←' : '🏪'}
              </Button>
            </div>
          </div>
        </div>

        {/* エラー・成功メッセージ */}
        {error && (
          <div className="bg-ios-red/10 border border-ios-red/30 rounded-lg p-4 mb-6">
            <p className="text-ios-red font-medium">❌ {error}</p>
          </div>
        )}

        {successMessage && (
          <div className="bg-ios-green/10 border border-ios-green/30 rounded-lg p-4 mb-6">
            <p className="text-ios-green font-medium">✅ {successMessage}</p>
          </div>
        )}

        {/* 自動保存ステータス */}
        {autoSaveMessage && (
          <div className={`fixed top-4 right-4 z-50 max-w-sm p-4 rounded-lg shadow-lg border ${
            autoSaveStatus === 'saving' 
              ? 'bg-ios-blue/10 border-ios-blue/30 text-ios-blue' 
              : autoSaveStatus === 'saved'
              ? 'bg-ios-green/10 border-ios-green/30 text-ios-green'
              : 'bg-ios-red/10 border-ios-red/30 text-ios-red'
          }`}>
            <div className="flex items-center space-x-2">
              {autoSaveStatus === 'saving' && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              )}
              {autoSaveStatus === 'saved' && <span>✅</span>}
              {autoSaveStatus === 'error' && <span>❌</span>}
              <p className="text-sm font-medium">{autoSaveMessage}</p>
            </div>
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
                <div className="text-gray-500">ログがありません。店舗の操作を行うとここにログが表示されます。</div>
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
                <li>店舗の追加・編集・削除を行うとログが表示されます</li>
                <li>モバイルデバイスでも操作の詳細を確認できます</li>
                <li>問題が発生した場合、このログを開発者に共有してください</li>
              </ul>
            </div>
          </Card>
        )}

        {showForm ? (
          /* 店舗追加・編集フォーム */
          <Card variant="default" className="p-8">
            <h2 className="text-2xl font-bold text-ios-gray-800 mb-6">
              {editingStore ? '店舗を編集（自動保存）' : '新しい店舗を追加'}
            </h2>
            
            {editingStore && (
              <div className="mb-4 p-3 bg-ios-blue/5 border border-ios-blue/20 rounded-lg">
                <p className="text-sm text-ios-blue">
                  💡 編集中の内容は各項目の入力完了時に自動的に保存されます
                </p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="店舗名 *"
                value={formData.name}
                onChange={(e) => handleFieldChange('name', e.target.value, '店舗名')}
                required
                placeholder="青山ブックセンター本店"
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="都道府県"
                  value={formData.prefecture}
                  onChange={(e) => handleFieldChange('prefecture', e.target.value, '都道府県')}
                  placeholder="東京都"
                />
                
                <Input
                  label="市区町村"
                  value={formData.city}
                  onChange={(e) => handleFieldChange('city', e.target.value, '市区町村')}
                  placeholder="港区"
                />
              </div>
              
              <Input
                label="SNSリンク"
                value={formData.sns_link}
                onChange={(e) => handleFieldChange('sns_link', e.target.value, 'SNSリンク')}
                placeholder="https://twitter.com/example"
              />

              <Input
                label="Google Mapリンク"
                value={formData.google_map_link}
                onChange={(e) => handleFieldChange('google_map_link', e.target.value, 'Google Mapリンク')}
                placeholder="https://maps.google.com/?q=店舗名"
              />

              <div>
                <label className="block text-sm font-medium text-ios-gray-700 mb-2">
                  説明
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleFieldChange('description', e.target.value, '説明')}
                  className="w-full px-4 py-3 rounded-xl border border-ios-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-ios-blue/50 focus:border-ios-blue"
                  rows={4}
                  placeholder="この店舗の特徴や魅力を簡潔に説明してください..."
                />
              </div>

              <div className="flex space-x-4">
                {!editingStore && (
                  <Button type="submit" variant="primary">
                    追加する
                  </Button>
                )}
                <Button type="button" variant="outline" onClick={resetForm}>
                  {editingStore ? '編集を終了' : 'キャンセル'}
                </Button>
              </div>
            </form>
          </Card>
        ) : (
          /* 店舗一覧 */
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {stores.map((store) => (
              <Card key={store.id} variant="default" className="overflow-hidden hover:shadow-ios-xl transition-all duration-300 flex flex-col h-full">
                <div className="flex flex-col h-full">
                  {/* アイコンエリア */}
                  <div className="w-full h-32 bg-gradient-to-br from-ios-blue/10 to-ios-purple/10 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl mb-2">🏪</div>
                      <div className="text-xs text-ios-gray-600">店舗</div>
                    </div>
                  </div>
                   
                  <div className="p-4 flex flex-col flex-grow">
                    {/* 店舗情報 */}
                    <div className="mb-2">
                      <h3 className="text-base font-bold text-ios-gray-800 mb-1 h-10 overflow-hidden leading-tight"
                          style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical'
                          }}>
                        {store.name}
                      </h3>
                      
                      {/* 地域情報 */}
                      {(store.prefecture || store.city) && (
                        <div className="mb-2">
                          <p className="text-xs text-ios-blue-600 font-medium">
                            📍 {store.prefecture}{store.city && ` ${store.city}`}
                          </p>
                        </div>
                      )}
                      
                      {/* 説明 */}
                      <div className="h-16 mb-2">
                        {store.description && (
                          <p className="text-xs text-ios-gray-600 overflow-hidden h-full leading-relaxed"
                             style={{
                               display: '-webkit-box',
                               WebkitLineClamp: 3,
                               WebkitBoxOrient: 'vertical'
                             }}>
                            {store.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* フレキシブルスペース */}
                    <div className="flex-grow">
                      {/* リンク情報 */}
                      <div className="space-y-1 mb-2">
                        {store.sns_link && (
                          <div className="text-ios-blue text-xs">
                            📱 <a 
                              href={store.sns_link} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="underline hover:no-underline font-medium"
                            >
                              SNS
                            </a>
                          </div>
                        )}
                        {store.google_map_link && (
                          <div className="text-ios-blue text-xs">
                            🗺️ <a 
                              href={store.google_map_link} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="underline hover:no-underline"
                            >
                              地図
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                   {/* 下部固定要素 */}
                   <div className="mt-auto">
                     <div className="flex space-x-2">
                       <Button
                         variant="outline"
                         size="sm"
                         onClick={() => handleEdit(store)}
                         className="flex-1 px-3"
                       >
                         ✏️
                       </Button>
                       <Button
                         variant="danger"
                         size="sm"
                         onClick={() => handleDelete(store.id)}
                         className="flex-1 px-3"
                       >
                         🗑️
                       </Button>
                     </div>
                   </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {!showForm && stores.length === 0 && (
          <div className="text-center py-12">
            <p className="text-ios-gray-600 mb-4">
              まだ店舗が登録されていません
            </p>
            <Button
              variant="primary"
              onClick={() => setShowForm(true)}
            >
              🏪 最初の店舗を追加
            </Button>
          </div>
        )}
        </div>
      </div>
    </ProtectedRoute>
  );
}