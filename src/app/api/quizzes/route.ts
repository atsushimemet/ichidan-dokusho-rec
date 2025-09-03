import { NextRequest, NextResponse } from 'next/server';
import { QuizService } from '@/lib/quiz-db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status') as any;
    const today = searchParams.get('today') === 'true';

    if (!userId) {
      return NextResponse.json(
        { error: 'ユーザーIDは必須です' },
        { status: 400 }
      );
    }

    let quizzes;
    if (today) {
      quizzes = await QuizService.findTodayQuizzes(userId);
    } else {
      quizzes = await QuizService.findByUserId(userId, status);
    }
    
    return NextResponse.json({ quizzes });

  } catch (error) {
    console.error('Error fetching quizzes:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}