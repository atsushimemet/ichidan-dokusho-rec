import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

export interface QuestionResponse {
  purpose: string;
  genre_preference: string[];
  difficulty_preference: 'beginner' | 'intermediate' | 'advanced';
}

export interface RecommendationResult {
  book: Book;
  score: number;
  match_reasons: string[];
}