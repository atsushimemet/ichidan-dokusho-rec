'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { supabase } from '@/lib/supabase';
import { QuestionMapping, GenreTag } from '@/types';
import { questions } from '@/data/questions';

export default function MappingsManagementPage() {
  const [mappings, setMappings] = useState<QuestionMapping[]>([]);
  const [availableTags, setAvailableTags] = useState<GenreTag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMapping, setEditingMapping] = useState<QuestionMapping | null>(null);
  const [formData, setFormData] = useState({
    question_id: 'purpose',
    question_type: 'single' as 'single' | 'multiple',
    option_value: '',
    mapped_tags: [] as string[],
    weight: '1.0'
  });
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const questionOptions = [
    { question_id: 'purpose', type: 'single' as 'single', label: '読書の目的', options: questions[0].options },
    { question_id: 'genre', type: 'multiple' as 'multiple', label: '興味のあるジャンル', options: questions[1].options }
  ];

  useEffect(() => {
    // ページ遷移時にスクロール位置を最上部に設定
    window.scrollTo(0, 0);
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'your_supabase_url') {
        setError('Supabaseが設定されていません。モックデータを表示しています。');
        setMockData();
        return;
      }

      // マッピングデータ取得
      const { data: mappingsData, error: mappingsError } = await supabase
        .from('question_mappings')
        .select('*')
        .order('question_id, option_value');

      if (mappingsError) throw mappingsError;

      // タグマスターデータ取得
      const { data: tagsData, error: tagsError } = await supabase
        .from('genre_tags')
        .select('*')
        .eq('is_active', true)
        .order('category, display_order');

      if (tagsError) throw tagsError;

      setMappings(mappingsData || []);
      setAvailableTags(tagsData || []);
    } catch (err) {
      console.error('データ読み込みエラー:', err);
      setError('データの読み込みに失敗しました。モックデータを表示しています。');
      setMockData();
    } finally {
      setIsLoading(false);
    }
  };

  const setMockData = () => {
    setMappings([
      {
        id: '1',
        question_id: 'purpose',
        question_type: 'single',
        option_value: 'knowledge',
        mapped_tags: ['教養', '歴史', '哲学'],
        weight: 1.0,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '2',
        question_id: 'purpose',
        question_type: 'single',
        option_value: 'growth',
        mapped_tags: ['自己啓発', '成功法則', '習慣'],
        weight: 1.0,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ]);
    setAvailableTags([
      {
        id: '1',
        name: '自己啓発',
        description: '成功法則、習慣形成、モチベーション',
        category: 'genre',
        purpose_mapping: [],
        display_order: 1,
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'your_supabase_url') {
      setError('Supabaseが設定されていないため、マッピングの保存はできません。');
      return;
    }

    try {
      const mappingData = {
        question_id: formData.question_id,
        question_type: formData.question_type,
        option_value: formData.option_value,
        mapped_tags: formData.mapped_tags,
        weight: parseFloat(formData.weight) || 1.0
      };

      if (editingMapping) {
        const { error } = await supabase
          .from('question_mappings')
          .update(mappingData)
          .eq('id', editingMapping.id);

        if (error) throw error;
        setSuccessMessage('マッピングを更新しました');
      } else {
        const { error } = await supabase
          .from('question_mappings')
          .insert([mappingData]);

        if (error) throw error;
        setSuccessMessage('マッピングを追加しました');
      }

      resetForm();
      loadData();
    } catch (err) {
      console.error('マッピング保存エラー:', err);
      setError('マッピングの保存に失敗しました');
    }
  };

  const handleEdit = (mapping: QuestionMapping) => {
    setEditingMapping(mapping);
    setFormData({
      question_id: mapping.question_id,
      question_type: mapping.question_type,
      option_value: mapping.option_value,
      mapped_tags: mapping.mapped_tags,
      weight: mapping.weight.toString()
    });
    setShowForm(true);
  };

  const handleDelete = async (mappingId: string) => {
    if (!confirm('このマッピングを削除しますか？レコメンド結果に影響する可能性があります。')) return;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'your_supabase_url') {
      setError('Supabaseが設定されていないため、マッピングの削除はできません。');
      return;
    }

    try {
      const { error } = await supabase
        .from('question_mappings')
        .delete()
        .eq('id', mappingId);

      if (error) throw error;
      setSuccessMessage('マッピングを削除しました');
      loadData();
    } catch (err) {
      console.error('マッピング削除エラー:', err);
      setError('マッピングの削除に失敗しました');
    }
  };

  const handleTagToggle = (tagName: string) => {
    setFormData(prev => ({
      ...prev,
      mapped_tags: prev.mapped_tags.includes(tagName)
        ? prev.mapped_tags.filter(t => t !== tagName)
        : [...prev.mapped_tags, tagName]
    }));
  };

  const resetForm = () => {
    setFormData({
      question_id: 'purpose',
      question_type: 'single',
      option_value: '',
      mapped_tags: [],
      weight: '1.0'
    });
    setEditingMapping(null);
    setShowForm(false);
  };

  const getQuestionLabel = (questionId: string) => {
    const question = questionOptions.find(q => q.question_id === questionId);
    return question ? question.label : questionId;
  };

  const getOptionLabel = (questionId: string, optionValue: string) => {
    const question = questionOptions.find(q => q.question_id === questionId);
    if (!question) return optionValue;
    const option = question.options.find(o => o.value === optionValue);
    return option ? option.label : optionValue;
  };

  const groupedMappings = mappings.reduce((acc, mapping) => {
    if (!acc[mapping.question_id]) {
      acc[mapping.question_id] = [];
    }
    acc[mapping.question_id].push(mapping);
    return acc;
  }, {} as Record<string, QuestionMapping[]>);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ios-blue/5 via-white to-ios-purple/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ios-blue mx-auto mb-4"></div>
          <p className="text-ios-gray-600">マッピングデータを読み込んでいます...</p>
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
                質問マッピング管理
              </h1>
              <p className="text-ios-gray-600 mt-2">
                目的とジャンルの選択肢とタグのマッピングを管理し、レコメンドロジックを調整できます
              </p>
            </div>
            <div className="flex space-x-4 justify-end">
              <Link href="/admin">
                <Button variant="outline" size="sm" className="px-3 w-10">
                  ←
                </Button>
              </Link>
              <Link href="/admin/tags">
                <Button variant="secondary" size="sm" className="px-3 w-10">
                  🏷️
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" size="sm" className="px-3 w-10">
                  🏠
                </Button>
              </Link>
              <Link href="/admin">
                <Button variant="primary" size="sm" className="px-3 w-10">
                  📚
                </Button>
              </Link>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowForm(!showForm)}
                className="px-3 w-10"
              >
                {showForm ? '←' : '🔗'}
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

        {showForm ? (
          /* マッピング追加・編集フォーム（目的とジャンルのみ） */
          <Card variant="default" className="p-8">
            <h2 className="text-2xl font-bold text-ios-gray-800 mb-6">
              {editingMapping ? 'マッピングを編集' : '新しいマッピングを追加'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-ios-gray-700 mb-2">
                    質問 *
                  </label>
                  <select
                    value={formData.question_id}
                    onChange={(e) => {
                      const selected = questionOptions.find(q => q.question_id === e.target.value);
                      setFormData({
                        ...formData,
                        question_id: e.target.value,
                        question_type: selected?.type || 'single',
                        option_value: ''
                      });
                    }}
                    className="w-full px-4 py-3 rounded-xl border border-ios-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-ios-blue/50 focus:border-ios-blue"
                    required
                  >
                    {questionOptions.map(q => (
                      <option key={q.question_id} value={q.question_id}>{q.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-ios-gray-700 mb-2">
                    選択肢 *
                  </label>
                  <select
                    value={formData.option_value}
                    onChange={(e) => setFormData({...formData, option_value: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-ios-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-ios-blue/50 focus:border-ios-blue"
                    required
                  >
                    <option value="">選択してください</option>
                    {questionOptions
                      .find(q => q.question_id === formData.question_id)
                      ?.options.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))
                    }
                  </select>
                </div>

                <Input
                  label="重み"
                  type="number"
                  step="0.1"
                  min="0"
                  max="2"
                  value={formData.weight}
                  onChange={(e) => setFormData({...formData, weight: e.target.value})}
                  placeholder="1.0"
                  helperText="0.0-2.0の範囲"
                />
              </div>

              {/* タグ選択 */}
              <div>
                <label className="block text-sm font-medium text-ios-gray-700 mb-4">
                  マッピングするタグ * (選択済み: {formData.mapped_tags.length}個)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {availableTags.map(tag => (
                    <div
                      key={tag.id}
                      onClick={() => handleTagToggle(tag.name)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                        formData.mapped_tags.includes(tag.name)
                          ? 'border-ios-blue bg-ios-blue/10 text-ios-blue'
                          : 'border-ios-gray-300 hover:border-ios-blue/50'
                      }`}
                    >
                      <div className="text-sm font-medium">{tag.name}</div>
                      <div className="text-xs text-gray-500">{tag.category}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-4">
                <Button type="submit" variant="primary">
                  {editingMapping ? '更新する' : '追加する'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  キャンセル
                </Button>
              </div>
            </form>
          </Card>
        ) : (
          /* マッピング一覧（目的とジャンルのみ） */
          <div className="space-y-8">
            {questionOptions.map(question => {
              const questionMappings = groupedMappings[question.question_id] || [];
              
              return (
                <div key={question.question_id}>
                  <h2 className="text-xl font-bold text-ios-gray-800 mb-4">
                    ❓ {question.label} ({questionMappings.length}件)
                  </h2>
                  
                  {questionMappings.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {questionMappings.map((mapping) => (
                        <Card key={mapping.id} variant="default" className="p-6">
                          <div className="space-y-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-bold text-ios-gray-800">
                                  {getOptionLabel(mapping.question_id, mapping.option_value)}
                                </h3>
                                <p className="text-sm text-ios-gray-600">
                                  重み: {mapping.weight} | タイプ: {mapping.question_type}
                                </p>
                              </div>
                            </div>

                            <div>
                              <p className="text-sm font-medium text-ios-gray-700 mb-2">
                                マッピングタグ ({mapping.mapped_tags.length}個):
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {mapping.mapped_tags.map((tag, index) => (
                                  <span 
                                    key={index}
                                    className="bg-ios-purple/10 text-ios-purple text-xs px-2 py-1 rounded-md"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(mapping)}
                                className="flex-1"
                              >
                                ✏️ 編集
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleDelete(mapping.id)}
                                className="flex-1"
                              >
                                🗑️ 削除
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <p className="text-ios-gray-600">
                        この質問のマッピングがまだ登録されていません
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {!showForm && Object.keys(groupedMappings).length === 0 && (
          <div className="text-center py-12">
            <p className="text-ios-gray-600 mb-4">
              まだマッピングが登録されていません
            </p>
            <Button
              variant="primary"
              onClick={() => setShowForm(true)}
            >
              🔗 最初のマッピングを追加
            </Button>
          </div>
        )}
        </div>
      </div>
    </ProtectedRoute>
  );
}