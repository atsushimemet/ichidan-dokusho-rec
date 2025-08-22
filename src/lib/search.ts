import { supabase } from './supabase';
import { Book } from './supabase';

export interface SearchFilters {
  tags?: string[];
  title?: string;
  author?: string;
  minPages?: number;
  maxPages?: number;
  minPrice?: number;
  maxPrice?: number;
}

export interface SearchResult {
  books: Book[];
  totalCount: number;
  appliedFilters: SearchFilters;
}

/**
 * 書籍を検索する
 * @param filters 検索フィルター
 * @param page ページ番号（1から開始）
 * @param pageSize 1ページあたりの件数
 * @returns 検索結果
 */
export async function searchBooks(
  filters: SearchFilters = {},
  page: number = 1,
  pageSize: number = 20
): Promise<SearchResult> {
  try {
    let query = supabase
      .from('books')
      .select('*', { count: 'exact' });

    // タグフィルター
    if (filters.tags && filters.tags.length > 0) {
      query = query.overlaps('genre_tags', filters.tags);
    }

    // タイトル検索（部分一致）
    if (filters.title) {
      query = query.ilike('title', `%${filters.title}%`);
    }

    // 著者検索（部分一致）
    if (filters.author) {
      query = query.ilike('author', `%${filters.author}%`);
    }

    // ページ数フィルター
    if (filters.minPages !== undefined) {
      query = query.gte('page_count', filters.minPages);
    }
    if (filters.maxPages !== undefined) {
      query = query.lte('page_count', filters.maxPages);
    }

    // 価格フィルター
    if (filters.minPrice !== undefined) {
      query = query.gte('price', filters.minPrice);
    }
    if (filters.maxPrice !== undefined) {
      query = query.lte('price', filters.maxPrice);
    }

    // ページネーション
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    // 作成日順でソート
    query = query.order('created_at', { ascending: false });

    const { data: books, error, count } = await query;

    if (error) {
      console.error('書籍検索エラー:', error);
      throw error;
    }

    return {
      books: books || [],
      totalCount: count || 0,
      appliedFilters: filters
    };
  } catch (error) {
    console.error('書籍検索エラー:', error);
    throw error;
  }
}

/**
 * 利用可能なタグを取得する
 * @returns タグの配列
 */
export async function getAvailableTags(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('genre_tags')
      .select('name')
      .eq('is_active', true)
      .order('category, display_order');

    if (error) {
      console.error('タグ取得エラー:', error);
      throw error;
    }

    return (data || []).map(tag => tag.name);
  } catch (error) {
    console.error('タグ取得エラー:', error);
    throw error;
  }
}

/**
 * 人気のタグを取得する（書籍数が多い順）
 * @param limit 取得件数
 * @returns タグと書籍数の配列
 */
export async function getPopularTags(limit: number = 10): Promise<Array<{ tag: string; count: number }>> {
  try {
    const { data, error } = await supabase
      .from('books')
      .select('genre_tags');

    if (error) {
      console.error('人気タグ取得エラー:', error);
      throw error;
    }

    // タグの出現回数をカウント
    const tagCounts: Record<string, number> = {};
    (data || []).forEach(book => {
      (book.genre_tags || []).forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    // 出現回数順にソート
    const sortedTags = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    return sortedTags;
  } catch (error) {
    console.error('人気タグ取得エラー:', error);
    throw error;
  }
}
