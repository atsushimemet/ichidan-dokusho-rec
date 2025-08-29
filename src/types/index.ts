// データベース型定義
export interface Book {
  id: string;
  title: string;
  author: string;
  genre_tags: string[];
  amazon_link: string;
  summary_link: string | null;
  cover_image_url: string | null;
  description: string | null;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  reading_time_hours: number | null;
  page_count: number | null;
  price: number | null;
  created_at: string;
  updated_at: string;
}

// 質問回答の型定義
export interface QuestionResponse {
  purpose: string;
  genre_preference: string[];
}

// レコメンド結果の型定義
export interface RecommendationResult {
  book: Book;
  score: number;
  match_reasons: string[];
}

// 質問選択肢の型定義
export interface QuestionOption {
  value: string;
  label: string;
  description?: string;
  icon?: string;
}

// 各質問の定義
export interface Question {
  id: string;
  title: string;
  description: string;
  type: 'single' | 'multiple';
  options: QuestionOption[];
}

// タグマスター型定義
export interface GenreTag {
  id: string;
  name: string;
  description?: string;
  category: string;
  purpose_mapping: string[];
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// 質問マッピング型定義
export interface QuestionMapping {
  id: string;
  question_id: string;
  question_type: 'single' | 'multiple';
  option_value: string;
  mapped_tags: string[];
  weight: number;
  created_at: string;
  updated_at: string;
}

// 店舗型定義
export interface Store {
  id: string;
  name: string;
  prefecture: string | null;
  city: string | null;
  sns_link: string | null;
  google_map_link: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

// アーカイブ記事型定義
export interface Archive {
  id: string;
  title: string;
  link: string;
  description: string;
  created_at: string;
  updated_at: string;
}

// ランキング書籍型定義
export interface RankingBook {
  id: string;
  title: string;
  author: string;
  genre_tags: string[];
  amazon_link: string;
  summary_link: string | null;
  cover_image_url: string | null;
  description: string | null;
  page_count: number | null;
  price: number | null;
  ranking_source: string;
  is_visible: boolean;
  week_start_date: string;
  created_at: string;
  updated_at: string;
}

// ランキング元型定義
export interface RankingSource {
  id: string;
  name: string;
  display_name: string;
  category: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

// 管理対象の共通型定義
export type ManagementEntityType = 'books' | 'stores' | 'archives' | 'rankings';

export interface ManagementEntityConfig {
  type: ManagementEntityType;
  name: string;
  icon: string;
  description: string;
  path: string;
  color: string;
}

// 管理対象のメタデータ
export const MANAGEMENT_ENTITIES: Record<ManagementEntityType, ManagementEntityConfig> = {
  books: {
    type: 'books',
    name: '書籍管理',
    icon: '📚',
    description: 'レコメンドシステムの書籍データを管理',
    path: '/admin',
    color: 'blue'
  },
  stores: {
    type: 'stores',
    name: '店舗管理',
    icon: '🏪',
    description: '書店・本屋の情報を管理',
    path: '/admin/stores',
    color: 'green'
  },
  archives: {
    type: 'archives',
    name: 'アーカイブ管理',
    icon: '📰',
    description: '関連記事・コンテンツを管理',
    path: '/admin/archives',
    color: 'purple'
  },
  rankings: {
    type: 'rankings',
    name: 'ランキング管理',
    icon: '🏆',
    description: '今週のランキング書籍を管理',
    path: '/admin/rankings',
    color: 'orange'
  }
};