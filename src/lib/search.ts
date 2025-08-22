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

    // 著者検索（部分一致 + トークン化検索）
    if (filters.author) {
      const authorQuery = filters.author.trim();
      if (authorQuery.includes(' ')) {
        // 空白を含む場合は、トークン化してOR検索
        const tokens = authorQuery.split(/\s+/).filter(token => token.length > 0);
        if (tokens.length > 1) {
          // 複数のトークンがある場合は、各トークンでOR検索
          const orConditions = tokens.map(token => `author.ilike.%${token}%`);
          query = query.or(orConditions.join(','));
        } else {
          // 単一トークンの場合は通常の部分一致
          query = query.ilike('author', `%${authorQuery}%`);
        }
      } else {
        // 空白を含まない場合は通常の部分一致
        query = query.ilike('author', `%${authorQuery}%`);
      }
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
 * 全タグを取得する（書籍数が多い順）
 * @param limit 取得件数（デフォルトは制限なし）
 * @returns タグと書籍数の配列
 */
export async function getPopularTags(limit?: number): Promise<Array<{ tag: string; count: number }>> {
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
      .sort((a, b) => b.count - a.count);

    // 制限がある場合のみスライス
    return limit ? sortedTags.slice(0, limit) : sortedTags;
  } catch (error) {
    console.error('人気タグ取得エラー:', error);
    throw error;
  }
}

/**
 * ジャンルタグと著者タグを分けて取得する
 * @returns ジャンルタグと著者タグの配列
 */
export async function getSeparatedTags(): Promise<{
  genreTags: Array<{ tag: string; count: number }>;
  authorTags: Array<{ tag: string; count: number }>;
}> {
  try {
    const { data, error } = await supabase
      .from('books')
      .select('genre_tags, author');

    if (error) {
      console.error('タグ分離取得エラー:', error);
      throw error;
    }

    // ジャンルタグの出現回数をカウント
    const genreTagCounts: Record<string, number> = {};
    const authorTagCounts: Record<string, number> = {};
    
    (data || []).forEach(book => {
      // ジャンルタグのカウント
      (book.genre_tags || []).forEach(tag => {
        // 著者名でないタグのみをジャンルタグとして扱う
        if (!isAuthorTag(tag)) {
          genreTagCounts[tag] = (genreTagCounts[tag] || 0) + 1;
        }
      });
      
      // 著者名のカウント
      if (book.author) {
        authorTagCounts[book.author] = (authorTagCounts[book.author] || 0) + 1;
      }
    });

    // ジャンルタグを出現回数順にソート
    const sortedGenreTags = Object.entries(genreTagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);

    // 著者タグを出現回数順にソート
    const sortedAuthorTags = Object.entries(authorTagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);

    return {
      genreTags: sortedGenreTags,
      authorTags: sortedAuthorTags
    };
  } catch (error) {
    console.error('タグ分離取得エラー:', error);
    throw error;
  }
}

/**
 * タグが著者名かどうかを判定する
 * @param tag タグ名
 * @returns 著者名の場合true
 */
function isAuthorTag(tag: string): boolean {
  // 著者名として扱われるタグのリスト
  const authorTags = [
    '江副浩正', '藤田晋', '堀江貴文', '三木谷浩史', '山田進太郎', '熊谷正寿',
    '柳井正', '見城徹', '草彅剛', 'ピーターティール', '岸見一郎', 'スティーブン・R・コヴィー',
    'デール・カーネギー', '吉野源三郎', 'ハンス・ロスリング', 'ユヴァル・ノア・ハラリ',
    '伊藤羊一', 'リンダ・グラットン', '宇野康秀'
  ];
  
  return authorTags.includes(tag);
}
