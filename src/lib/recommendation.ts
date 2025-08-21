import { createClient } from '@supabase/supabase-js';
import { Book, QuestionResponse, RecommendationResult } from '@/types';

export class RecommendationEngine {
  static async getRecommendations(responses: QuestionResponse): Promise<RecommendationResult[]> {
    try {
      // Supabaseの環境変数が設定されていない場合はモックデータを使用
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'your_supabase_url') {
        return this.getMockRecommendations(responses);
      }

      // Supabaseクライアントを動的に作成
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      // 全ての書籍を取得
      const { data: books, error } = await supabase
        .from('books')
        .select('*');

      if (error) throw error;
      if (!books || books.length === 0) {
        return this.getMockRecommendations(responses);
      }

      // 各書籍にスコアを付けてソート
      const scoredBooks = books.map(book => ({
        book,
        score: this.calculateScore(book, responses),
        match_reasons: this.getMatchReasons(book, responses)
      }));

      // スコア順でソートして上位10件を返す
      return scoredBooks
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);

    } catch (error) {
      console.error('レコメンデーション取得エラー:', error);
      return this.getMockRecommendations(responses);
    }
  }

  private static calculateScore(book: Book, responses: QuestionResponse): number {
    let score = 0;

    // 1. 目的に基づくスコアリング
    const purposeScore = this.getPurposeScore(book, responses.purpose);
    score += purposeScore * 0.4; // 40%の重み

    // 2. ジャンル一致に基づくスコアリング
    const genreScore = this.getGenreScore(book, responses.genre_preference);
    score += genreScore * 0.4; // 40%の重み

    // 3. 難易度一致に基づくスコアリング
    const difficultyScore = this.getDifficultyScore(book, responses.difficulty_preference);
    score += difficultyScore * 0.2; // 20%の重み

    return Math.round(score * 100) / 100; // 小数点2桁で丸める
  }

  private static getPurposeScore(book: Book, purpose: string): number {
    const purposeMapping: Record<string, string[]> = {
      knowledge: ['教養', '歴史', '哲学', '科学', '社会問題', '人類学'],
      skill: ['ビジネス', 'スキルアップ', 'プレゼンテーション', 'データ分析', '統計'],
      growth: ['自己啓発', '成功法則', '習慣', '人生論', 'アドラー心理学', '心理学'],
      relaxation: ['小説', 'マンガ', 'エンタメ', '文学']
    };

    const relevantTags = purposeMapping[purpose] || [];
    const matchCount = book.genre_tags.filter(tag => 
      relevantTags.some(relevant => tag.includes(relevant))
    ).length;

    return Math.min(matchCount / relevantTags.length, 1) * 100;
  }

  private static getGenreScore(book: Book, preferredGenres: string[]): number {
    if (preferredGenres.length === 0) return 50; // デフォルトスコア

    const matchCount = book.genre_tags.filter(tag => 
      preferredGenres.some(preferred => tag.includes(preferred))
    ).length;

    return Math.min(matchCount / preferredGenres.length, 1) * 100;
  }

  private static getDifficultyScore(book: Book, preferredDifficulty: string): number {
    if (book.difficulty_level === preferredDifficulty) {
      return 100;
    }

    // 難易度が1段階違う場合は部分点
    const difficultyOrder = ['beginner', 'intermediate', 'advanced'];
    const bookIndex = difficultyOrder.indexOf(book.difficulty_level);
    const prefIndex = difficultyOrder.indexOf(preferredDifficulty);
    const diff = Math.abs(bookIndex - prefIndex);

    if (diff === 1) return 60;
    if (diff === 2) return 20;
    return 0;
  }

  private static getMatchReasons(book: Book, responses: QuestionResponse): string[] {
    const reasons: string[] = [];

    // 目的の一致をチェック
    const purposeMapping: Record<string, string> = {
      knowledge: '知識・教養が身につく',
      skill: 'スキルアップに役立つ',
      growth: '自己成長につながる',
      relaxation: 'リラックスして読める'
    };

    if (purposeMapping[responses.purpose]) {
      reasons.push(purposeMapping[responses.purpose]);
    }

    // ジャンルの一致をチェック
    const matchedGenres = book.genre_tags.filter(tag => 
      responses.genre_preference.some(preferred => tag.includes(preferred))
    );

    if (matchedGenres.length > 0) {
      reasons.push(`${matchedGenres.slice(0, 2).join('・')}分野`);
    }

    // 難易度の一致をチェック
    const difficultyMapping: Record<string, string> = {
      beginner: '読みやすく理解しやすい',
      intermediate: 'バランスの取れた内容',
      advanced: '専門的で深い内容'
    };

    if (book.difficulty_level === responses.difficulty_preference) {
      reasons.push(difficultyMapping[book.difficulty_level]);
    }

    return reasons.slice(0, 3); // 最大3つの理由まで
  }

  // サンプルデータ用のモック関数（実際のSupabaseが使えない場合）
  static getMockRecommendations(responses: QuestionResponse): RecommendationResult[] {
    const mockBooks: Book[] = [
      {
        id: '1',
        title: '人を動かす',
        author: 'デール・カーネギー',
        genre_tags: ['自己啓発', 'コミュニケーション', 'ビジネス'],
        amazon_link: 'https://amazon.co.jp/dp/4422100513',
        description: '人間関係の古典的名著。人を動かす3つの基本原則から始まり、人に好かれる6つの原則、人を説得する12の原則などを具体的なエピソードとともに紹介。',
        difficulty_level: 'beginner',
        reading_time_hours: 8,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '2',
        title: '7つの習慣',
        author: 'スティーブン・R・コヴィー',
        genre_tags: ['自己啓発', 'ビジネス', '成功法則'],
        amazon_link: 'https://amazon.co.jp/dp/4863940246',
        description: '世界的ベストセラー。私的成功から公的成功へと導く7つの習慣を体系的に解説。効果的な人生を送るための原則が学べる。',
        difficulty_level: 'intermediate',
        reading_time_hours: 12,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '3',
        title: 'LIFE SHIFT',
        author: 'リンダ・グラットン',
        genre_tags: ['ビジネス', '未来', 'ライフスタイル'],
        amazon_link: 'https://amazon.co.jp/dp/4492533879',
        description: '100年時代の人生戦略。長寿化により変化する人生設計について、具体的な戦略とともに解説。',
        difficulty_level: 'intermediate',
        reading_time_hours: 10,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '4',
        title: 'サピエンス全史',
        author: 'ユヴァル・ノア・ハラリ',
        genre_tags: ['歴史', '哲学', '教養'],
        amazon_link: 'https://amazon.co.jp/dp/430922671X',
        description: '人類の歴史を俯瞰的に捉えた壮大な物語。農業革命、科学革命、産業革命を経て現代に至る人類の歩みを描く。',
        difficulty_level: 'advanced',
        reading_time_hours: 15,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '5',
        title: '嫌われる勇気',
        author: '岸見一郎',
        genre_tags: ['心理学', '自己啓発'],
        amazon_link: 'https://amazon.co.jp/dp/4478025819',
        description: 'アドラー心理学を分かりやすく解説。対人関係の悩みを解決する考え方を哲人と青年の対話形式で学ぶ。',
        difficulty_level: 'beginner',
        reading_time_hours: 5,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '6',
        title: 'ファクトフルネス',
        author: 'ハンス・ロスリング',
        genre_tags: ['科学', '教養', '統計'],
        amazon_link: 'https://amazon.co.jp/dp/4822289605',
        description: 'データに基づいて世界を正しく見る方法。思い込みを排除し、事実に基づいた判断をするための10の本能について。',
        difficulty_level: 'intermediate',
        reading_time_hours: 8,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '7',
        title: '君たちはどう生きるか',
        author: '吉野源三郎',
        genre_tags: ['哲学', '教養', '成長'],
        amazon_link: 'https://amazon.co.jp/dp/4006000017',
        description: '人生の指針となる名著。主人公コペル君の成長を通して、人としての生き方を考えさせられる。',
        difficulty_level: 'beginner',
        reading_time_hours: 6,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '8',
        title: 'Think clearly',
        author: 'ロルフ・ドベリ',
        genre_tags: ['哲学', '思考法', '自己啓発'],
        amazon_link: 'https://amazon.co.jp/dp/4763137395',
        description: 'より良い人生を送るための52の思考法。シンプルで実践的な人生の指針。',
        difficulty_level: 'intermediate',
        reading_time_hours: 7,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '9',
        title: '1分で話せ',
        author: '伊藤羊一',
        genre_tags: ['ビジネス', 'コミュニケーション'],
        amazon_link: 'https://amazon.co.jp/dp/4797395230',
        description: '相手に伝わる話し方の技術。1分で要点を伝える方法を具体的に解説。',
        difficulty_level: 'beginner',
        reading_time_hours: 4,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '10',
        title: 'マンガでわかる心理学',
        author: 'ポーポー・ポロダクション',
        genre_tags: ['心理学', '入門書'],
        amazon_link: 'https://amazon.co.jp/dp/4797344010',
        description: '心理学の基本をマンガで楽しく学べる入門書。日常生活に活かせる心理学の知識が満載。',
        difficulty_level: 'beginner',
        reading_time_hours: 3,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ];

    return mockBooks.map(book => ({
      book,
      score: this.calculateScore(book, responses),
      match_reasons: this.getMatchReasons(book, responses)
    })).sort((a, b) => b.score - a.score);
  }
}