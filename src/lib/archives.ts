import { supabase } from './supabase';
import { Archive } from '@/types';

// アーカイブ一覧の取得
export const getArchives = async (
  query?: string,
  page: number = 1,
  limit: number = 20
): Promise<{ archives: Archive[]; total: number; hasMore: boolean }> => {
  try {
    let supabaseQuery = supabase
      .from('archives')
      .select('*', { count: 'exact' });

    // 検索クエリがある場合はフィルタリング
    if (query && query.trim()) {
      supabaseQuery = supabaseQuery.or(
        `title.ilike.%${query}%,description.ilike.%${query}%`
      );
    }

    // ページネーション
    const startIndex = (page - 1) * limit;
    supabaseQuery = supabaseQuery
      .order('created_at', { ascending: false })
      .range(startIndex, startIndex + limit - 1);

    const { data, error, count } = await supabaseQuery;

    if (error) {
      console.error('アーカイブ取得エラー:', error);
      throw new Error('アーカイブの取得に失敗しました');
    }

    const total = count || 0;
    const hasMore = startIndex + limit < total;

    return {
      archives: data || [],
      total,
      hasMore
    };
  } catch (error) {
    console.error('アーカイブ取得エラー:', error);
    throw error;
  }
};

// アーカイブの作成
export const createArchive = async (archiveData: {
  title: string;
  link: string;
  description: string;
}): Promise<Archive> => {
  try {
    const { data, error } = await supabase
      .from('archives')
      .insert([archiveData])
      .select()
      .single();

    if (error) {
      console.error('アーカイブ作成エラー:', error);
      throw new Error('アーカイブの作成に失敗しました');
    }

    return data;
  } catch (error) {
    console.error('アーカイブ作成エラー:', error);
    throw error;
  }
};

// アーカイブの更新
export const updateArchive = async (
  id: string,
  archiveData: {
    title: string;
    link: string;
    description: string;
  }
): Promise<Archive> => {
  try {
    const { data, error } = await supabase
      .from('archives')
      .update(archiveData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('アーカイブ更新エラー:', error);
      throw new Error('アーカイブの更新に失敗しました');
    }

    return data;
  } catch (error) {
    console.error('アーカイブ更新エラー:', error);
    throw error;
  }
};

// アーカイブの削除
export const deleteArchive = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('archives')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('アーカイブ削除エラー:', error);
      throw new Error('アーカイブの削除に失敗しました');
    }
  } catch (error) {
    console.error('アーカイブ削除エラー:', error);
    throw error;
  }
};

// 特定のアーカイブを取得
export const getArchiveById = async (id: string): Promise<Archive | null> => {
  try {
    const { data, error } = await supabase
      .from('archives')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // レコードが見つからない場合
        return null;
      }
      console.error('アーカイブ取得エラー:', error);
      throw new Error('アーカイブの取得に失敗しました');
    }

    return data;
  } catch (error) {
    console.error('アーカイブ取得エラー:', error);
    throw error;
  }
};