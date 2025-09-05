import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/lib/quiz-db';
import { createWelcomeMessage } from '@/lib/line-utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lineUserId } = body;

    // APIキーでの認証
    const apiKey = request.headers.get('x-api-key');
    if (apiKey !== process.env.NOTIFICATION_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!lineUserId) {
      return NextResponse.json({ error: 'lineUserId is required' }, { status: 400 });
    }

    console.log('Testing follow event for user:', lineUserId);
    
    // 既存ユーザーを確認
    const existingUser = await UserService.findByLineUserId(lineUserId);
    console.log('Existing user:', existingUser);

    // ユーザーを作成または取得（実際のWebhook処理と同じ）
    const user = await UserService.findOrCreateByLineId(lineUserId, {
      display_name: `TestUser_${lineUserId.slice(-6)}`,
      notification_enabled: true,
      notification_time: '09:00:00'
    });
    
    if (!user) {
      console.error('Failed to create/find user for:', lineUserId);
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }
    
    console.log('User created/found:', { id: user.id, line_user_id: user.line_user_id });
    
    // ウェルカムメッセージを作成（実際には送信しない）
    const welcomeMessages = createWelcomeMessage();
    
    return NextResponse.json({
      message: 'Test follow event processed successfully',
      user: {
        id: user.id,
        line_user_id: user.line_user_id,
        display_name: user.display_name,
        created_at: user.created_at
      },
      welcomeMessages,
      wasExisting: !!existingUser
    });
    
  } catch (error) {
    console.error('Error in test follow event:', error);
    return NextResponse.json(
      { 
        error: 'Test follow event failed',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}