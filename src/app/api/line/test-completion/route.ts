import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/lib/quiz-db';
import { sendPushNotification, createTestCompletionMessage } from '@/lib/line-utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    // APIキーでの認証
    const apiKey = request.headers.get('x-api-key');
    if (apiKey !== process.env.NOTIFICATION_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // ユーザー情報を取得
    const user = await UserService.findByLineUserId(userId);
    if (!user || !user.line_user_id) {
      return NextResponse.json({ error: 'User not found or not linked to LINE' }, { status: 404 });
    }

    // テストメッセージを作成
    const testMessage = createTestCompletionMessage();

    // 通知を送信
    const success = await sendPushNotification(user.line_user_id, testMessage);

    if (success) {
      return NextResponse.json({ 
        message: 'Test completion notification sent successfully',
        userId: user.line_user_id
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to send test notification' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error sending test completion notification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}