// データベース型定義
export interface Book {
  id: string;
  title: string;
  author: string;
  genre_tags: string[];
  amazon_link: string;
  summary_link?: string;
  cover_image_url?: string;
  description?: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  reading_time_hours?: number;
  created_at: string;
  updated_at: string;
}

// 質問回答の型定義
export interface QuestionResponse {
  purpose: string;
  genre_preference: string[];
  difficulty_preference: 'beginner' | 'intermediate' | 'advanced';
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