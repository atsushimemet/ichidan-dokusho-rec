import { NextRequest, NextResponse } from 'next/server';
import { lineClient } from '@/lib/line-utils';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // LINE Bot設定の確認
    const config = {
      hasAccessToken: !!process.env.LINE_CHANNEL_ACCESS_TOKEN,
      hasSecret: !!process.env.LINE_CHANNEL_SECRET,
      accessTokenLength: process.env.LINE_CHANNEL_ACCESS_TOKEN?.length || 0,
      secretLength: process.env.LINE_CHANNEL_SECRET?.length || 0,
      isDummy: process.env.LINE_CHANNEL_ACCESS_TOKEN === 'dummy-token'
    };

    return NextResponse.json({
      status: 'LINE Bot Configuration Check',
      config,
      webhookUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/line/webhook`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('LINE test API error:', error);
    return NextResponse.json(
      { 
        error: 'テストAPIエラー',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

// テスト用のPush通知送信
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, message } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'ユーザーIDは必須です' },
        { status: 400 }
      );
    }

    // 環境変数チェック
    if (!process.env.LINE_CHANNEL_ACCESS_TOKEN || process.env.LINE_CHANNEL_ACCESS_TOKEN === 'dummy-token') {
      return NextResponse.json(
        { error: 'LINE_CHANNEL_ACCESS_TOKEN が設定されていません' },
        { status: 500 }
      );
    }

    // テストメッセージ送信
    const testMessage = message || {
      type: 'text',
      text: '🧪 これはテストメッセージです。Webhookが正常に動作しています！'
    };

    await lineClient.pushMessage(userId, testMessage);

    return NextResponse.json({
      success: true,
      message: 'テストメッセージを送信しました',
      userId
    });

  } catch (error) {
    console.error('Error sending test message:', error);
    return NextResponse.json(
      { 
        error: 'テストメッセージ送信に失敗しました',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}