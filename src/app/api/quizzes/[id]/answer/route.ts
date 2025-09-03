import { NextRequest, NextResponse } from 'next/server';
import { QuizService, AttemptService, UserService } from '@/lib/quiz-db';
import { getNextStatus } from '@/lib/quiz-generator';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('POST /api/quizzes/[id]/answer - Starting request processing');
    
    const body = await request.json();
    const { userAnswer, userId } = body;

    console.log('Request data:', { userAnswer, userId: userId?.substring(0, 10) + '...', quizId: params.id });

    if (!userAnswer || !userId) {
      console.error('Missing required fields:', { userAnswer: !!userAnswer, userId: !!userId });
      return NextResponse.json(
        { error: '回答とユーザーIDは必須です' },
        { status: 400 }
      );
    }

    // クイズを取得
    console.log('Fetching quiz:', params.id);
    const quiz = await QuizService.findById(params.id);
    if (!quiz) {
      console.error('Quiz not found:', params.id);
      return NextResponse.json(
        { error: 'クイズが見つかりません' },
        { status: 404 }
      );
    }

    console.log('Quiz found:', { id: quiz.id, type: quiz.type, answer: quiz.answer });

    // ユーザーを取得（line_user_idから実際のuser.idを取得）
    console.log('Finding user by line_user_id:', userId);
    const user = await UserService.findByLineUserId(userId);
    if (!user) {
      console.error('User not found for line_user_id:', userId);
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      );
    }

    console.log('User found:', { id: user.id, line_user_id: user.line_user_id });

    // 正解判定
    let isCorrect = false;
    if (quiz.type === 'cloze') {
      // 穴埋め問題：完全一致または部分一致
      isCorrect = userAnswer.trim().toLowerCase() === quiz.answer.toLowerCase() ||
                  quiz.answer.toLowerCase().includes(userAnswer.trim().toLowerCase());
    } else if (quiz.type === 'tf') {
      // True/False問題：完全一致
      isCorrect = userAnswer.trim().toLowerCase() === quiz.answer.toLowerCase();
    }

    console.log('Answer evaluation:', { userAnswer, correctAnswer: quiz.answer, isCorrect });

    // 回答を記録（実際のuser.idを使用）
    console.log('Creating attempt record...');
    const attempt = await AttemptService.create({
      quiz_id: quiz.id,
      user_id: user.id, // 実際のUUIDを使用
      user_answer: userAnswer,
      is_correct: isCorrect
    });

    if (!attempt) {
      console.error('Failed to create attempt record');
      return NextResponse.json(
        { error: '回答の記録に失敗しました' },
        { status: 500 }
      );
    }

    console.log('Attempt created successfully:', attempt.id);

    // クイズのステータスを更新
    const nextStatus = getNextStatus(quiz.status);
    let scheduledAt: Date | undefined;

    if (nextStatus === 'day1') {
      scheduledAt = new Date();
      scheduledAt.setDate(scheduledAt.getDate() + 1);
    } else if (nextStatus === 'day7') {
      scheduledAt = new Date();
      scheduledAt.setDate(scheduledAt.getDate() + 7);
    }

    console.log('Updating quiz status:', { currentStatus: quiz.status, nextStatus, scheduledAt });

    const updatedQuiz = await QuizService.updateStatus(quiz.id, nextStatus as any, scheduledAt);

    console.log('Quiz status updated successfully');

    return NextResponse.json({
      attempt,
      quiz: updatedQuiz,
      isCorrect,
      correctAnswer: quiz.answer,
      message: isCorrect ? '正解です！' : '不正解です。'
    });

  } catch (error) {
    console.error('Error submitting answer:', error);
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