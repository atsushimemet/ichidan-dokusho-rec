import { NextRequest, NextResponse } from 'next/server';
import { verifyQuizToken } from '@/lib/line-utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, quizId } = body;

    if (!token || !quizId) {
      return NextResponse.json(
        { error: 'トークンとクイズIDは必須です' },
        { status: 400 }
      );
    }

    // トークンを検証
    const tokenData = verifyQuizToken(token);
    
    if (!tokenData) {
      return NextResponse.json(
        { error: 'トークンが無効または期限切れです' },
        { status: 401 }
      );
    }

    // クイズIDが一致するかチェック
    if (tokenData.quizId !== quizId) {
      return NextResponse.json(
        { error: 'トークンとクイズIDが一致しません' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      userId: tokenData.userId,
      quizId: tokenData.quizId,
      message: 'トークンが有効です'
    });

  } catch (error) {
    console.error('Error verifying token:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}