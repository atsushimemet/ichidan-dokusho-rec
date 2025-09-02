import { NextRequest, NextResponse } from 'next/server';
import { QuizService } from '@/lib/quiz-db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const quiz = await QuizService.findById(params.id);
    
    if (!quiz) {
      return NextResponse.json(
        { error: 'クイズが見つかりません' },
        { status: 404 }
      );
    }

    return NextResponse.json({ quiz });

  } catch (error) {
    console.error('Error fetching quiz:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { status, scheduledAt } = body;

    const quiz = await QuizService.updateStatus(
      params.id, 
      status, 
      scheduledAt ? new Date(scheduledAt) : undefined
    );
    
    if (!quiz) {
      return NextResponse.json(
        { error: 'クイズの更新に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({ quiz });

  } catch (error) {
    console.error('Error updating quiz:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}