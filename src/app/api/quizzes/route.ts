import { NextRequest, NextResponse } from 'next/server';
import { QuizService } from '@/lib/quiz-db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/quizzes - Starting request processing');
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status') as any;
    const today = searchParams.get('today') === 'true';

    console.log('Query params:', { userId, status, today });

    if (!userId) {
      console.error('Missing userId parameter');
      return NextResponse.json(
        { error: 'ユーザーIDは必須です' },
        { status: 400 }
      );
    }

    let quizzes;
    if (today) {
      console.log('Fetching today quizzes...');
      quizzes = await QuizService.findTodayQuizzes(userId);
    } else {
      console.log('Fetching quizzes by status...');
      quizzes = await QuizService.findByUserId(userId, status);
    }
    
    console.log('Quizzes found:', quizzes?.length || 0);
    
    return NextResponse.json({ 
      quizzes: quizzes || [],
      debug: {
        userId,
        today,
        status,
        count: quizzes?.length || 0
      }
    });

  } catch (error) {
    console.error('Error fetching quizzes:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { 
        error: 'サーバーエラーが発生しました',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}