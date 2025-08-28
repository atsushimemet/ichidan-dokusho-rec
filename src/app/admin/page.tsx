'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { supabase } from '@/lib/supabase';
import { Book } from '@/types';
import { getReadabilityLevel, buildCoverImageUrl, extractAsinFromCoverUrl } from '@/lib/utils';

export default function AdminPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    genre_tags: [] as string[],
    amazon_link: '',
    summary_link: '',
    asin: '',
    description: '',
    page_count: '',
    price: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showDebugConsole, setShowDebugConsole] = useState(true);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [isTagAccordionOpen, setIsTagAccordionOpen] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [autoSaveMessage, setAutoSaveMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // ページ遷移時にスクロール位置を最上部に設定
    window.scrollTo(0, 0);
    loadData();
  }, []);

  // コンポーネントのクリーンアップ時にタイマーをクリア
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
    setDebugLogs(prev => [logMessage, ...prev].slice(0, 50)); // 最新50件まで保持
    console.log(logMessage);
  };

  // 自動保存機能（フォームデータを指定）
  const autoSaveWithData = async (fieldName: string, dataToSave: typeof formData) => {
    addDebugLog(`autoSaveWithData関数呼び出し: fieldName=${fieldName}, editingBook=${editingBook?.id}, isSaving=${isSaving}`);
    
    if (!editingBook || isSaving) {
      addDebugLog(`自動保存スキップ: editingBook=${!!editingBook}, isSaving=${isSaving}`);
      return;
    }
    
    setIsSaving(true);
    setAutoSaveStatus('saving');
    setAutoSaveMessage('保存中...');
    addDebugLog(`自動保存開始: ${fieldName}, 書籍ID: ${editingBook.id}`);

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

      const bookData = {
        title: dataToSave.title,
        author: dataToSave.author,
        genre_tags: dataToSave.genre_tags,
        amazon_link: dataToSave.amazon_link,
        summary_link: dataToSave.summary_link || null,
        cover_image_url: dataToSave.asin ? buildCoverImageUrl(dataToSave.asin) : null,
        description: dataToSave.description || null,
        page_count: dataToSave.page_count ? parseInt(dataToSave.page_count) : null,
        price: dataToSave.price ? parseFloat(dataToSave.price) : null
      };

      addDebugLog(`更新データ: ${JSON.stringify(bookData, null, 2)}`);

      const { data, error, count } = await supabase
        .from('books')
        .update(bookData)
        .eq('id', editingBook.id)
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
      setBooks(prevBooks => 
        prevBooks.map(book => 
          book.id === editingBook.id 
            ? { ...book, ...bookData, updated_at: new Date().toISOString() }
            : book
        )
      );

      addDebugLog(`ローカル状態更新完了`);

      setAutoSaveStatus('saved');
      setAutoSaveMessage(`${fieldName}を自動保存しました`);
      addDebugLog(`自動保存成功: ${fieldName}`);
      
      // 3秒後にメッセージをクリア
      setTimeout(() => {
        setAutoSaveStatus('idle');
        setAutoSaveMessage(null);
      }, 3000);
    } catch (err) {
      console.error('自動保存エラー:', err);
      setAutoSaveStatus('error');
      setAutoSaveMessage('自動保存に失敗しました');
      addDebugLog(`自動保存エラー: ${err instanceof Error ? err.message : '不明なエラー'}`);
      
      // 3秒後にメッセージをクリア
      setTimeout(() => {
        setAutoSaveStatus('idle');
        setAutoSaveMessage(null);
      }, 3000);
    } finally {
      setIsSaving(false);
      addDebugLog(`自動保存処理終了: ${fieldName}`);
    }
  };

  // 自動保存機能（現在のformDataを使用）
  const autoSave = async (fieldName: string) => {
    return autoSaveWithData(fieldName, formData);
  };

  // デバウンス用のタイマーを管理
  const debounceTimers = React.useRef<{[key: string]: NodeJS.Timeout}>({});

  // 入力フィールドのハンドラー（自動保存付き）
  const handleFieldChange = (field: string, value: any, fieldDisplayName: string) => {
    addDebugLog(`フィールド変更: ${field} = ${value}, 編集モード: ${!!editingBook}`);
    
    // フォームデータを更新
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    
    // 編集モード時のみ自動保存
    if (editingBook) {
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

  // タグ変更時の自動保存ハンドラー
  const handleTagToggleWithAutoSave = (tagName: string) => {
    const newTags = formData.genre_tags.includes(tagName)
      ? formData.genre_tags.filter(t => t !== tagName)
      : [...formData.genre_tags, tagName];
    
    addDebugLog(`タグ変更: ${tagName}, 新しいタグ配列: [${newTags.join(', ')}], 編集モード: ${!!editingBook}`);
    
    // フォームデータを更新
    const newFormData = { ...formData, genre_tags: newTags };
    setFormData(newFormData);
    
    // 編集モード時のみ自動保存
    if (editingBook) {
      addDebugLog(`タグ変更デバウンスタイマー設定`);
      
      // 前のタイマーをクリア
      if (debounceTimers.current['genre_tags']) {
        clearTimeout(debounceTimers.current['genre_tags']);
        addDebugLog(`前のタグタイマーをクリア`);
      }
      
      debounceTimers.current['genre_tags'] = setTimeout(() => {
        addDebugLog(`タグ変更デバウンス完了、自動保存実行`);
        autoSaveWithData('ジャンルタグ', newFormData);
        delete debounceTimers.current['genre_tags'];
      }, 500);
    } else {
      addDebugLog(`編集モードではないためタグ自動保存をスキップ`);
    }
  };

  const loadData = async () => {
    await Promise.all([loadBooks(), loadTags()]);
  };

  const loadBooks = async () => {
    try {
      setIsLoading(true);
      addDebugLog('書籍データ読み込み開始');
      
      // Supabaseの環境変数が設定されていない場合はモックデータを表示
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
        setBooks([
          {
            id: '1',
            title: '人を動かす',
            author: 'デール・カーネギー',
            genre_tags: ['自己啓発', 'コミュニケーション', 'ビジネス'],
            amazon_link: 'https://amazon.co.jp/dp/4422100513',
            summary_link: null,
            cover_image_url: null,
            description: '人間関係の古典的名著。人を動かす3つの基本原則から始まり、人に好かれる6つの原則、人を説得する12の原則などを具体的なエピソードとともに紹介。',
            difficulty_level: 'beginner' as const,
            reading_time_hours: null,
            page_count: 320,
            price: 1540,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z'
          },
          {
            id: '2',
            title: '7つの習慣',
            author: 'スティーブン・R・コヴィー',
            genre_tags: ['自己啓発', 'ビジネス', '成功法則'],
            amazon_link: 'https://amazon.co.jp/dp/4863940246',
            summary_link: null,
            cover_image_url: null,
            description: '世界的ベストセラー。私的成功から公的成功へと導く7つの習慣を体系的に解説。',
            difficulty_level: 'intermediate' as const,
            reading_time_hours: null,
            page_count: 560,
            price: 2420,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z'
          }
        ]);
        return;
      }

      addDebugLog('Supabaseクエリ実行開始');
      console.log('Supabaseクエリ実行開始');
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false });

      addDebugLog(`Supabaseクエリ結果: 書籍数=${data?.length || 0}, エラー=${error?.message || 'なし'}`);
      console.log('Supabaseクエリ結果:', { data: data?.length || 0, error });
      
      if (error) throw error;
      setBooks(data || []);
    } catch (err) {
      console.error('書籍データの読み込みエラー:', err);
      console.error('エラーの詳細:', {
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined,
        error: err
      });
      setError('書籍データの読み込みに失敗しました。モックデータを表示しています。');
      
      // モックデータを表示
      setBooks([
        {
          id: '1',
          title: '人を動かす',
          author: 'デール・カーネギー',
          genre_tags: ['自己啓発', 'コミュニケーション', 'ビジネス'],
          amazon_link: 'https://amazon.co.jp/dp/4422100513',
          summary_link: null,
          cover_image_url: null,
          description: '人間関係の古典的名著。',
          difficulty_level: 'beginner' as const,
          reading_time_hours: null,
          page_count: 320,
          price: 1540,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTags = async () => {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'your_supabase_url' || supabaseUrl === 'https://placeholder.supabase.co') {
        // モックデータのタグ
        setAvailableTags([
          '自己啓発', 'ビジネス', '心理学', '哲学', '歴史', '科学', '健康', '小説',
          'コミュニケーション', 'スキルアップ', '成功法則', '習慣', '教養', 'プレゼンテーション'
        ]);
        return;
      }

      console.log('タグクエリ実行開始');
      const { data, error } = await supabase
        .from('genre_tags')
        .select('name')
        .eq('is_active', true)
        .order('category, display_order');

      console.log('タグクエリ結果:', { data: data?.length || 0, error });
      
      if (error) throw error;
      setAvailableTags((data || []).map(tag => tag.name));
    } catch (err) {
      console.error('タグデータの読み込みエラー:', err);
      console.error('エラーの詳細:', {
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined,
        error: err
      });
      // フォールバック
      setAvailableTags([
        '自己啓発', 'ビジネス', '心理学', '哲学', '歴史', '科学', '健康', '小説',
        'コミュニケーション', 'スキルアップ', '成功法則', '習慣', '教養', 'プレゼンテーション'
      ]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // バリデーション
    if (formData.genre_tags.length === 0) {
      setError('少なくとも1つのジャンルタグを選択してください。');
      return;
    }

    // 環境変数の詳細ログ
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    console.log('環境変数チェック:', {
      url: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : '未設定',
      hasKey: !!supabaseAnonKey,
      keyLength: supabaseAnonKey ? supabaseAnonKey.length : 0,
      isPlaceholder: supabaseUrl === 'https://placeholder.supabase.co'
    });
    
    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'your_supabase_url' || supabaseUrl === 'https://placeholder.supabase.co') {
      setError('Supabaseが設定されていないため、書籍の保存はできません。環境変数NEXT_PUBLIC_SUPABASE_URLとNEXT_PUBLIC_SUPABASE_ANON_KEYを設定してください。');
      return;
    }

    try {
      // 一時的修正: データベースに存在しないカラムを除外
      const bookData = {
        title: formData.title,
        author: formData.author,
        genre_tags: formData.genre_tags,
        amazon_link: formData.amazon_link,
        summary_link: formData.summary_link || null,
        cover_image_url: formData.asin ? buildCoverImageUrl(formData.asin) : null,
        description: formData.description || null,
        // difficulty_level: 'beginner' as const, // 一時的にコメントアウト（DBにカラムが無い）
        // reading_time_hours: null, // 一時的にコメントアウト（DBにカラムが無い）
        page_count: formData.page_count ? parseInt(formData.page_count) : null,
        price: formData.price ? parseFloat(formData.price) : null
      };

      if (editingBook) {
        // 更新
        addDebugLog(`書籍更新開始: ID=${editingBook.id}, タイトル=${bookData.title}`);
        console.log('書籍更新開始:', { bookId: editingBook.id, bookData });
        
        // まず、更新対象の書籍が存在するか確認
        const { data: existingBook, error: checkError } = await supabase
          .from('books')
          .select('id, title')
          .eq('id', editingBook.id)
          .single();

        addDebugLog(`書籍存在確認: ${existingBook ? '存在' : '存在しない'}, エラー: ${checkError?.message || 'なし'}`);
        
        if (checkError || !existingBook) {
          addDebugLog(`書籍が見つからない: ${checkError?.message || '不明なエラー'}`);
          throw new Error(`更新対象の書籍(ID: ${editingBook.id})が見つかりませんでした`);
        }
        
        // まず更新のみを実行（selectなし）
        const { error: updateError } = await supabase
          .from('books')
          .update(bookData)
          .eq('id', editingBook.id);

        addDebugLog(`書籍更新結果: エラー=${updateError?.message || 'なし'}`);
        console.log('書籍更新結果:', { error: updateError });
        
        if (updateError) {
          addDebugLog(`書籍更新エラー: ${updateError.message}`);
          console.error('書籍更新エラー:', updateError);
          throw updateError;
        }

        // 更新成功後、別途データを取得
        addDebugLog('更新成功、更新後のデータを取得中...');
        const { data: updatedBook, error: fetchError } = await supabase
          .from('books')
          .select('*')
          .eq('id', editingBook.id)
          .single();
        
        if (fetchError) {
          addDebugLog(`更新後のデータ取得エラー: ${fetchError.message}`);
          console.error('更新後のデータ取得エラー:', fetchError);
          // エラーでも更新は成功しているので、ローカルデータから推測して更新
          const mergedData: Book = { 
            ...editingBook, 
            ...bookData, 
            // 不足しているプロパティを明示的に設定
            difficulty_level: editingBook.difficulty_level || 'beginner',
            reading_time_hours: editingBook.reading_time_hours || null,
            updated_at: new Date().toISOString() 
          };
          setBooks(prevBooks => 
            prevBooks.map(book => 
              book.id === editingBook.id ? mergedData : book
            )
          );
          addDebugLog('ローカルデータで更新を反映');
        } else {
          addDebugLog('更新後のデータ取得成功');
          console.log('書籍更新成功:', updatedBook);
          
          // ローカルのbooksステートを更新
          setBooks(prevBooks => 
            prevBooks.map(book => 
              book.id === editingBook.id ? updatedBook : book
            )
          );
        }

        
        setSuccessMessage('書籍を更新しました');
        
        // 3秒後にメッセージをクリア
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      } else {
        // 新規作成
        addDebugLog(`書籍追加開始: タイトル=${bookData.title}`);
        console.log('書籍追加開始:', bookData);
        const { data, error } = await supabase
          .from('books')
          .insert([bookData])
          .select();

        addDebugLog(`書籍追加結果: データ数=${data?.length || 0}, エラー=${error?.message || 'なし'}`);
        console.log('書籍追加結果:', { data, error });
        
        if (error) {
          addDebugLog(`書籍追加エラー: ${error.message}`);
          console.error('書籍追加エラー:', error);
          throw error;
        }
        
        if (!data || data.length === 0) {
          addDebugLog('書籍の追加に失敗 - データが返されませんでした');
          throw new Error('書籍の追加に失敗しました');
        }
        
        addDebugLog('書籍追加成功');
        console.log('書籍追加成功:', data[0]);
        
        // ローカルのbooksステートに新しい書籍を追加
        setBooks(prevBooks => [data[0], ...prevBooks]);
        
        setSuccessMessage('書籍を追加しました');
        
        // 3秒後にメッセージをクリア
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      }

      // フォームをリセット
      resetForm();
      
      // 念のため、少し遅延を入れてからデータを再読み込み
      setTimeout(async () => {
        await loadBooks();
        console.log('書籍一覧を再読み込み完了');
      }, 500);
    } catch (err) {
      console.error('書籍保存エラー:', err);
      const errorMessage = err instanceof Error ? err.message : '書籍の保存に失敗しました';
      setError(errorMessage);
    }
  };

  const handleEdit = (book: Book) => {
    addDebugLog(`編集モード開始: 書籍ID=${book.id}, タイトル=${book.title}`);
    setEditingBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      genre_tags: book.genre_tags,
      amazon_link: book.amazon_link,
      summary_link: book.summary_link ?? '',
      asin: extractAsinFromCoverUrl(book.cover_image_url ?? ''),
      description: book.description ?? '',
      page_count: book.page_count?.toString() ?? '',
      price: book.price?.toString() ?? ''
    });
    setShowForm(true);
    addDebugLog(`編集フォーム表示: editingBook=${book.id}`);
  };

  const handleDelete = async (bookId: string) => {
    if (!confirm('この書籍を削除しますか？')) return;

    // Supabaseが設定されていない場合はエラー表示
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'your_supabase_url' || supabaseUrl === 'https://placeholder.supabase.co') {
      setError('Supabaseが設定されていないため、書籍の削除はできません。環境変数NEXT_PUBLIC_SUPABASE_URLとNEXT_PUBLIC_SUPABASE_ANON_KEYを設定してください。');
      return;
    }

    try {
      addDebugLog(`書籍削除開始: ID=${bookId}`);
      console.log('書籍削除開始:', bookId);
      const { error } = await supabase
        .from('books')
        .delete()
        .eq('id', bookId);

      if (error) {
        addDebugLog(`書籍削除エラー: ${error.message}`);
        console.error('書籍削除エラー:', error);
        throw error;
      }
      
      addDebugLog('書籍削除成功');
      console.log('書籍削除成功:', bookId);
      
      // ローカルのbooksステートからも削除
      setBooks(prevBooks => prevBooks.filter(book => book.id !== bookId));
      
      setSuccessMessage('書籍を削除しました');
      
      // 3秒後にメッセージをクリア
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      addDebugLog(`書籍削除エラー: ${err instanceof Error ? err.message : '不明なエラー'}`);
      console.error('書籍削除エラー:', err);
      setError('書籍の削除に失敗しました');
    }
  };

  const resetForm = () => {
    addDebugLog(`フォームリセット: 編集モード終了=${!!editingBook}`);
    
    // 保留中のタイマーをクリア
    Object.values(debounceTimers.current).forEach(timer => {
      clearTimeout(timer);
    });
    debounceTimers.current = {};
    addDebugLog(`保留中のタイマーをクリア`);
    
    setFormData({
      title: '',
      author: '',
      genre_tags: [],
      amazon_link: '',
      summary_link: '',
      asin: '',
      description: '',
      page_count: '',
      price: ''
    });
    setEditingBook(null);
    setShowForm(false);
    
    // 自動保存ステータスもクリア
    setAutoSaveStatus('idle');
    setAutoSaveMessage(null);
    setIsSaving(false);
  };



  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ios-blue/5 via-white to-ios-purple/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ios-blue mx-auto mb-4"></div>
          <p className="text-ios-gray-600">書籍データを読み込んでいます...</p>
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
          <div>
            <div className="mb-4">
              <h1 className="text-3xl font-bold text-ios-gray-800">
                管理画面
              </h1>
              <p className="text-ios-gray-600 mt-2">
                レコメンドシステムの各種データを管理できます
              </p>
            </div>
            <div className="flex space-x-4 justify-end">
              <Link href="/admin/stores">
                <Button variant="secondary" size="sm" className="px-3 w-10">
                  🏪
                </Button>
              </Link>
              <Link href="/admin/tags">
                <Button variant="secondary" size="sm" className="px-3 w-10">
                  🏷️
                </Button>
              </Link>
              <Link href="/admin/mappings">
                <Button variant="secondary" size="sm" className="px-3 w-10">
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
                <Button variant="outline" size="sm" className="px-3 w-10">
                  🏠
                </Button>
              </Link>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowForm(!showForm)}
                className="px-3 w-10"
              >
                {showForm ? '←' : '📚'}
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
                <div className="text-gray-500">ログがありません。書籍の操作を行うとここにログが表示されます。</div>
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
                <li>書籍の追加・編集・削除を行うとログが表示されます</li>
                <li>モバイルデバイスでも操作の詳細を確認できます</li>
                <li>問題が発生した場合、このログを開発者に共有してください</li>
              </ul>
            </div>
          </Card>
        )}

        {showForm ? (
          /* 書籍追加・編集フォーム */
          <Card variant="default" className="p-8">
            <h2 className="text-2xl font-bold text-ios-gray-800 mb-6">
              {editingBook ? '書籍を編集（自動保存）' : '新しい書籍を追加'}
            </h2>
            
            {editingBook && (
              <div className="mb-4 p-3 bg-ios-blue/5 border border-ios-blue/20 rounded-lg">
                <p className="text-sm text-ios-blue">
                  💡 編集中の内容は各項目の入力完了時に自動的に保存されます
                </p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="書籍タイトル *"
                  value={formData.title}
                  onChange={(e) => handleFieldChange('title', e.target.value, 'タイトル')}
                  required
                />
                
                <Input
                  label="著者名 *"
                  value={formData.author}
                  onChange={(e) => handleFieldChange('author', e.target.value, '著者名')}
                  required
                />
              </div>

              {/* タグ選択 */}
              <div>
                {/* アコーディオンヘッダー */}
                <div 
                  onClick={() => setIsTagAccordionOpen(!isTagAccordionOpen)}
                  className="flex items-center justify-between p-4 border border-ios-gray-300 rounded-lg cursor-pointer hover:bg-ios-gray-50 transition-colors duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <label className="text-sm font-medium text-ios-gray-700">
                      タグ * (選択済み: {formData.genre_tags.length}個)
                    </label>
                    {formData.genre_tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {formData.genre_tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="bg-ios-blue/10 text-ios-blue text-xs px-2 py-1 rounded">
                            {tag}
                          </span>
                        ))}
                        {formData.genre_tags.length > 3 && (
                          <span className="text-ios-gray-500 text-xs">+{formData.genre_tags.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className={`transform transition-transform duration-200 ${isTagAccordionOpen ? 'rotate-180' : ''}`}>
                    <svg className="w-5 h-5 text-ios-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* アコーディオンコンテンツ */}
                {isTagAccordionOpen && (
                  <div className="mt-4 p-4 border border-ios-gray-200 rounded-lg bg-ios-gray-25">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-2">
                      {availableTags.map(tag => (
                        <div
                          key={tag}
                          onClick={() => handleTagToggleWithAutoSave(tag)}
                          className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                            formData.genre_tags.includes(tag)
                              ? 'border-ios-blue bg-ios-blue/10 text-ios-blue'
                              : 'border-ios-gray-300 hover:border-ios-blue/50'
                          }`}
                        >
                          <div className="text-sm font-medium">{tag}</div>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-ios-gray-600 mt-2">
                      タグマスターに登録されたタグから選択できます。新しいタグが必要な場合は<Link href="/admin/tags" className="text-ios-blue underline">タグマスター管理</Link>で追加してください。
                    </p>
                  </div>
                )}

                {/* エラーメッセージ */}
                {formData.genre_tags.length === 0 && (
                  <p className="text-sm text-ios-red mt-2">少なくとも1つのタグを選択してください</p>
                )}
              </div>

              <Input
                label="Amazon リンク *"
                value={formData.amazon_link}
                onChange={(e) => handleFieldChange('amazon_link', e.target.value, 'Amazonリンク')}
                placeholder="https://amazon.co.jp/dp/..."
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="要約リンク"
                  value={formData.summary_link}
                  onChange={(e) => handleFieldChange('summary_link', e.target.value, '要約リンク')}
                  placeholder="https://..."
                />
                
                <div>
                  <Input
                    label="ASIN"
                    value={formData.asin}
                    onChange={(e) => handleFieldChange('asin', e.target.value, 'ASIN')}
                    placeholder="B08GJWJ5B2"
                  />
                  {/* ASIN入力プレビュー */}
                  {formData.asin && (
                    <div className="mt-2">
                      <p className="text-xs text-ios-gray-600 mb-1">プレビュー:</p>
                      <div className="w-20 h-28 bg-ios-gray-100 rounded border flex items-center justify-center overflow-hidden">
                        <img 
                          src={buildCoverImageUrl(formData.asin)} 
                          alt="表紙プレビュー"
                          className="max-w-full max-h-full object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.parentElement!.innerHTML = `
                              <span class="text-xs text-ios-gray-400 text-center">画像が<br/>見つかりません</span>
                            `;
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="ページ数"
                  type="number"
                  value={formData.page_count}
                  onChange={(e) => handleFieldChange('page_count', e.target.value, 'ページ数')}
                  placeholder="320"
                />

                <Input
                  label="価格（円）"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleFieldChange('price', e.target.value, '価格')}
                  placeholder="1540"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ios-gray-700 mb-2">
                  説明・あらすじ
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleFieldChange('description', e.target.value, '説明・あらすじ')}
                  className="w-full px-4 py-3 rounded-xl border border-ios-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-ios-blue/50 focus:border-ios-blue"
                  rows={4}
                  placeholder="この本の内容や魅力を簡潔に説明してください..."
                />
              </div>

              <div className="flex space-x-4">
                {!editingBook && (
                  <Button type="submit" variant="primary">
                    追加する
                  </Button>
                )}
                <Button type="button" variant="outline" onClick={resetForm}>
                  {editingBook ? '編集を終了' : 'キャンセル'}
                </Button>
              </div>
            </form>
          </Card>
        ) : (
          /* 書籍一覧 */
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {books.map((book) => (
              <Card key={book.id} variant="default" className="overflow-hidden hover:shadow-ios-xl transition-all duration-300 flex flex-col h-full">
                                <div className="flex flex-col h-full">
                  {/* 書籍画像エリア */}
                  <div className="w-full h-40 bg-ios-gray-100 flex items-center justify-center overflow-hidden rounded-t-lg">
                    {book.cover_image_url ? (
                      <img 
                        src={book.cover_image_url} 
                        alt={`${book.title}の表紙`}
                        className="max-w-full max-h-full object-contain"
                        style={{ width: 'auto', height: 'auto', maxWidth: '150px' }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.parentElement!.innerHTML = `
                            <div class="flex items-center justify-center w-full h-full bg-ios-gray-200 text-ios-gray-500">
                              <span class="text-sm">画像が読み込めません</span>
                            </div>
                          `;
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full bg-ios-gray-200 text-ios-gray-400">
                        <div className="text-center">
                          <div className="text-3xl mb-2">📚</div>
                          <div className="text-xs">画像なし</div>
                        </div>
                      </div>
                    )}
                  </div>
                   
                   <div className="p-4 flex flex-col flex-grow">
                                         {/* 書籍情報（固定高さ） */}
                     <div className="mb-2">
                       <h3 className="text-base font-bold text-ios-gray-800 mb-1 h-10 overflow-hidden leading-tight"
                           style={{
                             display: '-webkit-box',
                             WebkitLineClamp: 2,
                             WebkitBoxOrient: 'vertical'
                           }}>
                         {book.title}
                       </h3>
                       <p className="text-ios-gray-600 mb-2 h-4 text-sm">
                         著者: {book.author}
                       </p>
                       
                       {/* ジャンルタグ（固定高さ） */}
                       <div className="flex flex-wrap gap-1 mb-2 h-6 overflow-hidden">
                         {book.genre_tags.slice(0, 3).map((tag, index) => (
                           <span 
                             key={index}
                             className="bg-ios-purple/10 text-ios-purple text-xs px-2 py-1 rounded-md"
                           >
                             {tag}
                           </span>
                         ))}
                         {book.genre_tags.length > 3 && (
                           <span className="text-xs text-ios-gray-400 px-1 py-1">
                             +{book.genre_tags.length - 3}
                           </span>
                         )}
                       </div>

                                               {/* 説明（固定高さ） */}
                        <div className="h-16 mb-2">
                          {book.description && (
                            <p className="text-xs text-ios-gray-600 overflow-hidden h-full leading-relaxed"
                               style={{
                                 display: '-webkit-box',
                                 WebkitLineClamp: 3,
                                 WebkitBoxOrient: 'vertical'
                               }}>
                              {book.description}
                            </p>
                          )}
                        </div>
                     </div>

                                         {/* フレキシブルスペース */}
                     <div className="flex-grow">
                       {/* メタ情報 */}
                       <div className="text-xs text-ios-gray-500 space-y-1 mb-2">
                         <div className="flex justify-between items-center">
                           {book.page_count && (
                             <span>{book.page_count}p</span>
                           )}
                           {book.price && (
                             <span>¥{book.price.toLocaleString()}</span>
                           )}
                         </div>
                         {book.page_count && (
                           <div>
                             {(() => {
                               const readability = getReadabilityLevel(book.page_count);
                               return (
                                 <span className={`text-xs font-medium ${readability.color}`}>
                                   📖 {readability.label}
                                 </span>
                               );
                             })()}
                           </div>
                         )}
                       </div>
                         
                       {/* リンク情報 */}
                       <div className="space-y-1 mb-2">
                         {book.amazon_link && (
                           <div className="text-ios-blue text-xs">
                             🛒 <a 
                               href={book.amazon_link} 
                               target="_blank" 
                               rel="noopener noreferrer" 
                               className="underline hover:no-underline font-medium"
                             >
                               Amazon PR
                             </a>
                           </div>
                         )}
                         {book.summary_link && (
                           <div className="text-ios-blue text-xs">
                             📝 <a 
                               href={book.summary_link} 
                               target="_blank" 
                               rel="noopener noreferrer" 
                               className="underline hover:no-underline"
                             >
                               要約
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
                          onClick={() => handleEdit(book)}
                          className="flex-1 px-3"
                        >
                          ✏️
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(book.id)}
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

        {!showForm && books.length === 0 && (
          <div className="text-center py-12">
            <p className="text-ios-gray-600 mb-4">
              まだ書籍が登録されていません
            </p>
            <Button
              variant="primary"
              onClick={() => setShowForm(true)}
            >
              📚 最初の書籍を追加
            </Button>
          </div>
        )}
        </div>
      </div>
    </ProtectedRoute>
  );
}