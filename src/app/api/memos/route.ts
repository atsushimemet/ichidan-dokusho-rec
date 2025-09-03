import { NextRequest, NextResponse } from 'next/server';
import { MemoService, QuizService, UserService } from '@/lib/quiz-db';
import { generateQuizFromMemo } from '@/lib/quiz-generator';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/memos - Starting request processing');
    
    const body = await request.json();
    console.log('Request body:', { ...body, text: body.text?.substring(0, 100) + '...' });
    
    const { title, text, userId, sourceBookId } = body;

    // バリデーション
    if (!title || !text || !userId) {
      console.error('Validation failed:', { title: !!title, text: !!text, userId: !!userId });
      return NextResponse.json(
        { error: 'タイトル、テキスト、ユーザーIDは必須です' },
        { status: 400 }
      );
    }

    console.log('Creating memo...');
    
    // まず、usersテーブルにユーザーが存在するか確認/作成
    let user = await UserService.findByLineUserId(userId);
    if (!user) {
      console.log('User not found, creating new user...');
      user = await UserService.create({
        line_user_id: userId,
        display_name: `User_${userId.substring(0, 8)}`,
        notification_enabled: true
      });
      
      if (!user) {
        console.error('Failed to create user');
        return NextResponse.json(
          { error: 'ユーザーの作成に失敗しました' },
          { status: 500 }
        );
      }
    }

    // メモを作成
    const memo = await MemoService.create({
      user_id: user.id, // user.idを使用
      title,
      text,
      source_book_id: sourceBookId || null
    });

    if (!memo) {
      console.error('Failed to create memo');
      return NextResponse.json(
        { error: 'メモの作成に失敗しました' },
        { status: 500 }
      );
    }

    console.log('Memo created successfully:', memo.id);

    // クイズを自動生成
    try {
      console.log('Generating quiz...');
      const quizResult = await generateQuizFromMemo(text, memo.id, user.id);
      
      if (quizResult.success) {
        console.log('Quiz generation successful, saving to database...');
        const quiz = await QuizService.create(quizResult.quiz);
        
        if (quiz) {
          console.log('Quiz saved successfully:', quiz.id);
          return NextResponse.json({
            memo,
            quiz,
            message: 'メモとクイズが作成されました'
          });
        } else {
          console.error('Failed to save quiz to database');
          return NextResponse.json({
            memo,
            quiz: null,
            message: 'メモを作成しました（クイズの保存に失敗）'
          });
        }
      } else {
        console.error('Quiz generation failed:', quizResult.error);
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