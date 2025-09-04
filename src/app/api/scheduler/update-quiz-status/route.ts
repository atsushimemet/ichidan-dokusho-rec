import { NextRequest, NextResponse } from 'next/server';
import { QuizService } from '@/lib/quiz-db';
import { calculateSchedule } from '@/lib/quiz-generator';

export async function POST(request: NextRequest) {
  try {
    // APIキーでの認証（CRON等からの呼び出し用）
    const apiKey = request.headers.get('x-api-key');
    if (apiKey !== process.env.SCHEDULER_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const results = {
      todayToDay1: 0,
      day1ToDay7: 0,
      day7ToDone: 0,
      errors: [] as string[]
    };

    // 1. 今日のクイズ（回答済み）を翌日復習に更新
    try {
      const todayQuizzes = await QuizService.findScheduledQuizzes('today', now);
      for (const quiz of todayQuizzes) {
        const schedule = calculateSchedule(new Date(quiz.created_at));
        const updatedQuiz = await QuizService.updateStatus(quiz.id, 'day1', schedule.day1);
        if (updatedQuiz) {
          results.todayToDay1++;
        }
      }
    } catch (error) {
      results.errors.push(`Error updating today quizzes: ${error}`);
    }

    // 2. 翌日復習のクイズ（スケジュール時刻が過ぎたもの）を1週間後復習に更新
    try {
      const day1Quizzes = await QuizService.findScheduledQuizzes('day1', now);
      for (const quiz of day1Quizzes) {
        const schedule = calculateSchedule(new Date(quiz.created_at));
        const updatedQuiz = await QuizService.updateStatus(quiz.id, 'day7', schedule.day7);
        if (updatedQuiz) {
          results.day1ToDay7++;
        }
      }
    } catch (error) {
      results.errors.push(`Error updating day1 quizzes: ${error}`);
    }

    // 3. 1週間後復習のクイズ（スケジュール時刻が過ぎたもの）を完了に更新
    try {
      const day7Quizzes = await QuizService.findScheduledQuizzes('day7', now);
      for (const quiz of day7Quizzes) {
        const updatedQuiz = await QuizService.updateStatus(quiz.id, 'done');
        if (updatedQuiz) {
          results.day7ToDone++;
        }
      }
    } catch (error) {
      results.errors.push(`Error updating day7 quizzes: ${error}`);
    }

    return NextResponse.json({
      message: 'Quiz status update completed',
      timestamp: now.toISOString(),
      results
    });

  } catch (error) {
    console.error('Error in quiz status update:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// 手動実行用のGETエンドポイント
export async function GET(request: NextRequest) {
  // 開発・テスト用の手動実行
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (!isDevelopment) {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  // POSTと同じ処理を実行
  const fakeRequest = new Request(request.url, {
    method: 'POST',
    headers: {
      'x-api-key': process.env.SCHEDULER_API_KEY || ''
    }
  });

  return POST(fakeRequest as NextRequest);
}