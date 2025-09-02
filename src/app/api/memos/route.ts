import { NextRequest, NextResponse } from 'next/server';
import { MemoService, QuizService } from '@/lib/quiz-db';
import { generateQuizFromMemo } from '@/lib/quiz-generator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, text, userId, sourceBookId } = body;

    // バリデーション
    if (!title || !text || !userId) {
      return NextResponse.json(
        { error: 'タイトル、テキスト、ユーザーIDは必須です' },
        { status: 400 }
      );
    }

    // メモを作成
    const memo = await MemoService.create({
      user_id: userId,
      title,
      text,
      source_book_id: sourceBookId || null
    });

    if (!memo) {
      return NextResponse.json(
        { error: 'メモの作成に失敗しました' },
        { status: 500 }
      );
    }

    // クイズを自動生成
    try {
      const quizResult = await generateQuizFromMemo(text, memo.id, userId);
      
      if (quizResult.success) {
        const quiz = await QuizService.create(quizResult.quiz);
        
        return NextResponse.json({
          memo,
          quiz,
          message: 'メモとクイズが作成されました'
        });
      } else {
        // クイズ生成に失敗してもメモは作成済みなので成功として返す
        return NextResponse.json({
          memo,
          quiz: null,
          message: 'メモを作成しました（クイズ生成は失敗）',
          quizError: quizResult.error
        });
      }
    } catch (quizError) {
      console.error('Quiz generation error:', quizError);
      return NextResponse.json({
        memo,
        quiz: null,
        message: 'メモを作成しました（クイズ生成中にエラー）',
        quizError: String(quizError)
      });
    }

  } catch (error) {
    console.error('Error creating memo:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!userId) {
      return NextResponse.json(
        { error: 'ユーザーIDは必須です' },
        { status: 400 }
      );
    }

    const memos = await MemoService.findByUserId(userId, limit);
    
    return NextResponse.json({ memos });

  } catch (error) {
    console.error('Error fetching memos:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}