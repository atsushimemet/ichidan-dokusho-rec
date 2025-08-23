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

      // 質問マッピングデータを取得
      const { data: mappings, error: mappingsError } = await supabase
        .from('question_mappings')
        .select('*');

      if (mappingsError) {
        console.error('マッピングデータ取得エラー:', mappingsError);
        return this.getMockRecommendations(responses);
      }

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
        score: this.calculateScore(book, responses, mappings || []),
        match_reasons: this.getMatchReasons(book, responses, mappings || [])
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

  private static calculateScore(book: Book, responses: QuestionResponse, mappings: any[] = []): number {
    let score = 0;

    // 1. 目的に基づくスコアリング
    const purposeScore = this.getPurposeScore(book, responses.purpose, mappings);
    score += purposeScore * 0.4; // 40%の重み

    // 2. ジャンル一致に基づくスコアリング
    const genreScore = this.getGenreScore(book, responses.genre_preference, mappings);
    score += genreScore * 0.4; // 40%の重み

    // 3. 読みやすさスコア（ページ数による）
    const readabilityScore = this.getReadabilityScore(book);
    score += readabilityScore * 0.1; // 10%の重み

    // 4. 価格スコア
    const priceScore = this.getPriceScore(book);
    score += priceScore * 0.1; // 10%の重み

    return Math.round(score * 100) / 100; // 小数点2桁で丸める
  }

  private static getPurposeScore(book: Book, purpose: string, mappings: any[] = []): number {
    // データベースのマッピングを使用
    const purposeMapping = mappings.find(m => 
      m.question_id === 'purpose' && m.option_value === purpose
    );

    if (purposeMapping) {
      const relevantTags = purposeMapping.mapped_tags || [];
      const weight = purposeMapping.weight || 1.0;
      const matchCount = book.genre_tags.filter(tag => 
        relevantTags.some((relevant: string) => tag.includes(relevant))
      ).length;

      if (relevantTags.length === 0) return 50; // デフォルトスコア
      return Math.min(matchCount / relevantTags.length, 1) * 100 * weight;
    }

    // フォールバック（従来のロジック）
    const purposeMappingFallback: Record<string, string[]> = {
      knowledge: ['教養', '歴史', '哲学', '科学', '社会問題', '人類学'],
      skill: ['ビジネス', 'スキルアップ', 'プレゼンテーション', 'データ分析', '統計'],
      growth: ['自己啓発', '成功法則', '習慣', '人生論', 'アドラー心理学', '心理学'],
      relaxation: ['小説', 'マンガ', 'エンタメ', '文学']
    };

    const relevantTags = purposeMappingFallback[purpose] || [];
    const matchCount = book.genre_tags.filter(tag => 
      relevantTags.some(relevant => tag.includes(relevant))
    ).length;

    return Math.min(matchCount / relevantTags.length, 1) * 100;
  }

  private static getGenreScore(book: Book, preferredGenres: string[], mappings: any[] = []): number {
    if (preferredGenres.length === 0) return 50; // デフォルトスコア

    let totalScore = 0;
    let mappingCount = 0;

    // 各選択ジャンルについてマッピングを確認
    for (const genre of preferredGenres) {
      const genreMapping = mappings.find(m => 
        m.question_id === 'genre' && m.option_value === genre
      );

      if (genreMapping) {
        const relevantTags = genreMapping.mapped_tags || [genre];
        const weight = genreMapping.weight || 1.0;
        const matchCount = book.genre_tags.filter(tag => 
          relevantTags.some((relevant: string) => tag.includes(relevant))
        ).length;

        if (matchCount > 0) {
          totalScore += (matchCount / relevantTags.length) * 100 * weight;
          mappingCount++;
        }
      } else {
        // フォールバック：直接マッチング
        const directMatch = book.genre_tags.some(tag => tag.includes(genre));
        if (directMatch) {
          totalScore += 100;
          mappingCount++;
        }
      }
    }

    return mappingCount > 0 ? totalScore / mappingCount : 0;
  }

  private static getReadabilityScore(book: Book): number {
    // ページ数による読みやすさスコア
    if (!book.page_count) return 50; // デフォルトスコア

    // ページ数が少ないほど読みやすい
    if (book.page_count <= 200) return 100;
    if (book.page_count <= 350) return 80;
    if (book.page_count <= 500) return 60;
    if (book.page_count <= 700) return 40;
    return 20;
  }

  private static getPriceScore(book: Book): number {
    // 価格による手軽さスコア
    if (!book.price) return 50; // デフォルトスコア

    // 価格が安いほど手に取りやすい
    if (book.price <= 1000) return 100;
    if (book.price <= 1500) return 80;
    if (book.price <= 2000) return 60;
    if (book.price <= 3000) return 40;
    return 20;
  }

  private static getMatchReasons(book: Book, responses: QuestionResponse, mappings: any[] = []): string[] {
    const reasons: string[] = [];

    // 目的の一致をチェック
    const purposeMapping = mappings.find(m => 
      m.question_id === 'purpose' && m.option_value === responses.purpose
    );

    if (purposeMapping) {
      const relevantTags = purposeMapping.mapped_tags || [];
      const matchedTags = book.genre_tags.filter(tag => 
        relevantTags.some((relevant: string) => tag.includes(relevant))
      );
      
      if (matchedTags.length > 0) {
        const purposeLabels: Record<string, string> = {
          knowledge: '知識・教養が身につく',
          skill: 'スキルアップに役立つ',
          growth: '自己成長につながる',
          relaxation: 'リラックスして読める'
        };
        
        const label = purposeLabels[responses.purpose];
        if (label) reasons.push(label);
      }
    }

    // ジャンルの一致をチェック
    const matchedGenres: string[] = [];
    for (const genre of responses.genre_preference) {
      const genreMapping = mappings.find(m => 
        m.question_id === 'genre' && m.option_value === genre
      );

      if (genreMapping) {
        const relevantTags = genreMapping.mapped_tags || [genre];
        const hasMatch = book.genre_tags.some(tag => 
          relevantTags.some((relevant: string) => tag.includes(relevant))
        );
        
        if (hasMatch) {
          matchedGenres.push(genre);
        }
      } else {
        // フォールバック：直接マッチング
        const hasDirectMatch = book.genre_tags.some(tag => tag.includes(genre));
        if (hasDirectMatch) {
          matchedGenres.push(genre);
        }
      }
    }

    if (matchedGenres.length > 0) {
      reasons.push(`${matchedGenres.slice(0, 2).join('・')}分野`);
    }

    // 読みやすさと価格の情報を追加
    if (book.page_count && book.page_count <= 300) {
      reasons.push('短時間で読める');
    }
    
    if (book.price && book.price <= 1500) {
      reasons.push('手頃な価格');
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
        description: '世界的ベストセラー。私的成功から公的成功へと導く7つの習慣を体系的に解説。効果的な人生を送るための原則が学べる。',
        difficulty_level: 'intermediate' as const,
        reading_time_hours: null,
        page_count: 560,
        price: 2420,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '3',
        title: 'LIFE SHIFT',
        author: 'リンダ・グラットン',
        genre_tags: ['ビジネス', '未来', 'ライフスタイル'],
        amazon_link: 'https://amazon.co.jp/dp/4492533879',
        summary_link: null,
        cover_image_url: null,
        description: '100年時代の人生戦略。長寿化により変化する人生設計について、具体的な戦略とともに解説。',
        difficulty_level: 'intermediate' as const,
        reading_time_hours: null,
        page_count: 399,
        price: 1980,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '4',
        title: 'サピエンス全史',
        author: 'ユヴァル・ノア・ハラリ',
        genre_tags: ['歴史', '哲学', '教養'],
        amazon_link: 'https://amazon.co.jp/dp/430922671X',
        summary_link: null,
        cover_image_url: null,
        description: '人類の歴史を俯瞰的に捉えた壮大な物語。農業革命、科学革命、産業革命を経て現代に至る人類の歩みを描く。',
        difficulty_level: 'advanced' as const,
        reading_time_hours: null,
        page_count: 512,
        price: 2090,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '5',
        title: '嫌われる勇気',
        author: '岸見一郎',
        genre_tags: ['心理学', '自己啓発'],
        amazon_link: 'https://amazon.co.jp/dp/4478025819',
        summary_link: null,
        cover_image_url: null,
        description: 'アドラー心理学を分かりやすく解説。対人関係の悩みを解決する考え方を哲人と青年の対話形式で学ぶ。',
        difficulty_level: 'beginner' as const,
        reading_time_hours: null,
        page_count: 296,
        price: 1650,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '6',
        title: 'ファクトフルネス',
        author: 'ハンス・ロスリング',
        genre_tags: ['科学', '教養', '統計'],
        amazon_link: 'https://amazon.co.jp/dp/4822289605',
        summary_link: null,
        cover_image_url: null,
        description: 'データに基づいて世界を正しく見る方法。思い込みを排除し、事実に基づいた判断をするための10の本能について。',
        difficulty_level: 'intermediate' as const,
        reading_time_hours: null,
        page_count: 400,
        price: 1800,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '7',
        title: '君たちはどう生きるか',
        author: '吉野源三郎',
        genre_tags: ['哲学', '教養', '成長'],
        amazon_link: 'https://amazon.co.jp/dp/4006000017',
        summary_link: null,
        cover_image_url: null,
        description: '人生の指針となる名著。主人公コペル君の成長を通して、人としての生き方を考えさせられる。',
        difficulty_level: 'beginner' as const,
        reading_time_hours: null,
        page_count: 318,
        price: 1045,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '8',
        title: 'Think clearly',
        author: 'ロルフ・ドベリ',
        genre_tags: ['哲学', '思考法', '自己啓発'],
        amazon_link: 'https://amazon.co.jp/dp/4763137395',
        summary_link: null,
        cover_image_url: null,
        description: 'より良い人生を送るための52の思考法。シンプルで実践的な人生の指針。',
        difficulty_level: 'intermediate' as const,
        reading_time_hours: null,
        page_count: 288,
        price: 1760,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '9',
        title: '1分で話せ',
        author: '伊藤羊一',
        genre_tags: ['ビジネス', 'コミュニケーション'],
        amazon_link: 'https://amazon.co.jp/dp/4797395230',
        summary_link: null,
        cover_image_url: null,
        description: '相手に伝わる話し方の技術。1分で要点を伝える方法を具体的に解説。',
        difficulty_level: 'beginner' as const,
        reading_time_hours: null,
        page_count: 240,
        price: 1540,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '10',
        title: 'マンガでわかる心理学',
        author: 'ポーポー・ポロダクション',
        genre_tags: ['心理学', '入門書'],
        amazon_link: 'https://amazon.co.jp/dp/4797344010',
        summary_link: null,
        cover_image_url: null,
        description: '心理学の基本をマンガで楽しく学べる入門書。日常生活に活かせる心理学の知識が満載。',
        difficulty_level: 'beginner' as const,
        reading_time_hours: null,
        page_count: 192,
        price: 1430,
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