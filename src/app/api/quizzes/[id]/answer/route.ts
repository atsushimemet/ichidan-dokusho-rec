import { NextRequest, NextResponse } from 'next/server';
import { QuizService, AttemptService } from '@/lib/quiz-db';
import { getNextStatus } from '@/lib/quiz-generator';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { userAnswer, userId } = body;

    if (!userAnswer || !userId) {
      return NextResponse.json(
        { error: '回答とユーザーIDは必須です' },
        { status: 400 }
      );
    }

    // クイズを取得
    const quiz = await QuizService.findById(params.id);
    if (!quiz) {
      return NextResponse.json(
        { error: 'クイズが見つかりません' },
        { status: 404 }
      );
    }

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

    // 回答を記録
    const attempt = await AttemptService.create({
      quiz_id: quiz.id,
      user_id: userId,
      user_answer: userAnswer,
      is_correct: isCorrect
    });

    if (!attempt) {
      return NextResponse.json(
        { error: '回答の記録に失敗しました' },
        { status: 500 }
      );
    }

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

    const updatedQuiz = await QuizService.updateStatus(quiz.id, nextStatus as any, scheduledAt);

    return NextResponse.json({
      attempt,
      quiz: updatedQuiz,
      isCorrect,
      correctAnswer: quiz.answer,
      message: isCorrect ? '正解です！' : '不正解です。'
    });

  } catch (error) {
    console.error('Error submitting answer:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}