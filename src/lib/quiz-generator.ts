import kuromoji from 'kuromoji';
import { QuizGenerationResult, QuizType, MemoAnalysis } from '@/types';

// 形態素解析器のインスタンス
let tokenizer: kuromoji.Tokenizer<kuromoji.IpadicFeatures> | null = null;

// 形態素解析器の初期化
export async function initializeTokenizer(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (tokenizer) {
      resolve();
      return;
    }

    kuromoji.builder({ dicPath: '/dict' }).build((err, _tokenizer) => {
      if (err) {
        reject(err);
        return;
      }
      tokenizer = _tokenizer;
      resolve();
    });
  });
}

// 助詞・助動詞・記号を除外する
function isContentWord(feature: string): boolean {
  const excludeCategories = ['助詞', '助動詞', '記号', '補助記号'];
  return !excludeCategories.some(category => feature.includes(category));
}

// メモテキストを分析する
export function analyzeMemo(text: string): MemoAnalysis {
  if (!tokenizer) {
    throw new Error('Tokenizer not initialized. Call initializeTokenizer() first.');
  }

  // 文に分割（句点で区切る）
  const sentences = text.split(/[。！？]/).filter(s => s.trim().length > 0);
  
  // 形態素解析
  const tokens = tokenizer.tokenize(text);
  
  // 名詞を抽出
  const nounMap = new Map<string, { count: number; positions: number[] }>();
  
  tokens.forEach((token, index) => {
    if (token.part_of_speech.startsWith('名詞') && 
        isContentWord(token.part_of_speech) && 
        token.surface_form.length > 1) {
      
      const surface = token.surface_form;
      if (nounMap.has(surface)) {
        const existing = nounMap.get(surface)!;
        existing.count++;
        existing.positions.push(index);
      } else {
        nounMap.set(surface, { count: 1, positions: [index] });
      }
    }
  });

  // 名詞を配列に変換
  const nouns = Array.from(nounMap.entries()).map(([word, data]) => ({
    word,
    count: data.count,
    position: data.positions
  }));

  // 最長の名詞を取得
  const longestNoun = nouns.reduce((longest, current) => 
    current.word.length > longest.word.length ? current : longest
  ).word || '';

  // 頻出名詞を取得（出現回数でソート）
  const frequentNouns = nouns
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map(noun => noun.word);

  return {
    sentences,
    nouns,
    longestNoun,
    frequentNouns
  };
}

// 穴埋め問題を生成
function generateClozeQuiz(text: string, analysis: MemoAnalysis): QuizGenerationResult {
  try {
    // 最長名詞または頻出名詞を選択
    const targetWord = analysis.longestNoun || analysis.frequentNouns[0];
    
    if (!targetWord) {
      return {
        success: false,
        error: '適切な名詞が見つかりませんでした',
        quiz: {} as any
      };
    }

    // テキスト内の対象語を「____」に置換
    const stem = text.replace(new RegExp(targetWord, 'g'), '____');
    
    if (stem === text) {
      return {
        success: false,
        error: '置換対象が見つかりませんでした',
        quiz: {} as any
      };
    }

    return {
      success: true,
      quiz: {
        memo_id: '',
        user_id: '',
        type: 'cloze' as QuizType,
        stem,
        answer: targetWord,
        choices: null,
        scheduled_at: new Date().toISOString(),
        status: 'today'
      }
    };
  } catch (error) {
    return {
      success: false,
      error: `穴埋め問題の生成に失敗しました: ${error}`,
      quiz: {} as any
    };
  }
}

// True/False問題を生成
function generateTrueFalseQuiz(text: string, analysis: MemoAnalysis): QuizGenerationResult {
  try {
    if (analysis.sentences.length === 0) {
      return {
        success: false,
        error: '適切な文が見つかりませんでした',
        quiz: {} as any
      };
    }

    // ランダムに一文を選択
    const randomSentence = analysis.sentences[Math.floor(Math.random() * analysis.sentences.length)];
    
    // 偽文を作成する方法をランダムに選択
    const methods = ['negation', 'number', 'noun'];
    const method = methods[Math.floor(Math.random() * methods.length)];
    
    let falseSentence = randomSentence;
    let isTrue = Math.random() > 0.5; // 50%の確率でTrue問題にする
    
    if (!isTrue) {
      switch (method) {
        case 'negation':
          // 否定の付与/除去
          if (randomSentence.includes('ない') || randomSentence.includes('ません')) {
            falseSentence = randomSentence.replace(/(ない|ません)/g, '');
          } else {
            falseSentence = randomSentence.replace(/です$/, 'ではありません');
            falseSentence = falseSentence.replace(/である$/, 'ではない');
          }
          break;
          
        case 'number':
          // 数値を±10%改変
          const numberMatch = randomSentence.match(/\d+/);
          if (numberMatch) {
            const originalNumber = parseInt(numberMatch[0]);
            const variation = Math.floor(originalNumber * 0.1) || 1;
            const newNumber = originalNumber + (Math.random() > 0.5 ? variation : -variation);
            falseSentence = randomSentence.replace(/\d+/, newNumber.toString());
          }
          break;
          
        case 'noun':
          // 固有名詞を同カテゴリで置換（簡単な例）
          const nounReplacements: { [key: string]: string[] } = {
            '日本': ['中国', '韓国', 'アメリカ'],
            '東京': ['大阪', '名古屋', '福岡'],
            '本': ['雑誌', '新聞', '漫画']
          };
          
          for (const [original, replacements] of Object.entries(nounReplacements)) {
            if (randomSentence.includes(original)) {
              const replacement = replacements[Math.floor(Math.random() * replacements.length)];
              falseSentence = randomSentence.replace(original, replacement);
              break;
            }
          }
          break;
      }
    }

    const stem = isTrue ? randomSentence : falseSentence;
    const answer = isTrue ? 'True' : 'False';

    return {
      success: true,
      quiz: {
        memo_id: '',
        user_id: '',
        type: 'tf' as QuizType,
        stem: stem + '\n\nこの文は正しいですか？',
        answer,
        choices: { options: ['True', 'False'] },
        scheduled_at: new Date().toISOString(),
        status: 'today'
      }
    };
  } catch (error) {
    return {
      success: false,
      error: `True/False問題の生成に失敗しました: ${error}`,
      quiz: {} as any
    };
  }
}

// メモからクイズを生成（メイン関数）
export async function generateQuizFromMemo(
  text: string, 
  memoId: string, 
  userId: string,
  preferredType?: QuizType
): Promise<QuizGenerationResult> {
  try {
    // 形態素解析器が初期化されていない場合は初期化
    if (!tokenizer) {
      await initializeTokenizer();
    }

    // メモを分析
    const analysis = analyzeMemo(text);

    // クイズタイプを決定（指定がない場合は交互/確率で選択）
    let quizType: QuizType;
    if (preferredType) {
      quizType = preferredType;
    } else {
      quizType = Math.random() > 0.5 ? 'cloze' : 'tf';
    }

    // クイズを生成
    let result: QuizGenerationResult;
    if (quizType === 'cloze') {
      result = generateClozeQuiz(text, analysis);
    } else {
      result = generateTrueFalseQuiz(text, analysis);
    }

    // 成功した場合はIDを設定
    if (result.success) {
      result.quiz.memo_id = memoId;
      result.quiz.user_id = userId;
    }

    return result;
  } catch (error) {
    return {
      success: false,
      error: `クイズ生成に失敗しました: ${error}`,
      quiz: {} as any
    };
  }
}

// 復習スケジュールを計算
export function calculateSchedule(baseDate: Date = new Date()) {
  return {
    today: new Date(baseDate),
    day1: new Date(baseDate.getTime() + 24 * 60 * 60 * 1000), // 翌日
    day7: new Date(baseDate.getTime() + 7 * 24 * 60 * 60 * 1000) // 7日後
  };
}

// クイズのステータスを更新
export function getNextStatus(currentStatus: string): string {
  switch (currentStatus) {
    case 'today':
      return 'day1';
    case 'day1':
      return 'day7';
    case 'day7':
      return 'done';
    default:
      return 'done';
  }
}