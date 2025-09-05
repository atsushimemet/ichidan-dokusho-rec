import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/lib/quiz-db';

export const dynamic = 'force-dynamic';

// Webhook設定状況を確認するGETエンドポイント
export async function GET(request: NextRequest) {
  try {
    console.log('=== LINE Webhook Configuration Check ===');
    
    return NextResponse.json({
      status: 'LINE Webhook Test Endpoint Active',
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasAccessToken: !!process.env.LINE_CHANNEL_ACCESS_TOKEN,
        accessTokenPreview: process.env.LINE_CHANNEL_ACCESS_TOKEN?.substring(0, 10) + '...',
        hasSecret: !!process.env.LINE_CHANNEL_SECRET,
        secretPreview: process.env.LINE_CHANNEL_SECRET?.substring(0, 10) + '...',
        vercelUrl: process.env.VERCEL_URL,
        baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
        skipVerification: process.env.SKIP_LINE_SIGNATURE_VERIFICATION,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...',
        hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      },
      webhookUrl: `${(process.env.NEXT_PUBLIC_BASE_URL || 'https://your-domain.com').replace(/\/$/, '')}/api/line/webhook`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Webhook configuration check error:', error);
    return NextResponse.json({ error: 'Configuration check failed' }, { status: 500 });
  }
}

// 手動でfollowイベントをシミュレートするPOSTエンドポイント
export async function POST(request: NextRequest) {
  try {
    console.log('=== Manual Follow Event Simulation ===');
    
    const body = await request.json();
    const { lineUserId } = body;

    if (!lineUserId) {
      return NextResponse.json({ error: 'lineUserId is required' }, { status: 400 });
    }

    console.log('Simulating follow event for user:', lineUserId);

    // 実際のWebhook処理と同じロジックを実行
    const result = await simulateFollowEvent(lineUserId);

    return NextResponse.json({
      message: 'Follow event simulation completed',
      result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Follow event simulation error:', error);
    return NextResponse.json(
      { 
        error: 'Follow event simulation failed',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

// フォローイベントのシミュレーション
async function simulateFollowEvent(lineUserId: string) {
  try {
    console.log('Starting follow event simulation for:', lineUserId);

    // 1. 既存ユーザーの確認
    console.log('1. Checking existing user...');
    const existingUser = await UserService.findByLineUserId(lineUserId);
    console.log('Existing user result:', existingUser ? 'Found' : 'Not found');

    // 2. ユーザーの作成または取得
    console.log('2. Creating or finding user...');
    const user = await UserService.findOrCreateByLineId(lineUserId, {
      display_name: `TestUser_${lineUserId.slice(-6)}`,
      notification_enabled: true,
      notification_time: '09:00:00'
    });

    if (!user) {
      throw new Error('Failed to create/find user');
    }

    console.log('3. User operation result:', {
      id: user.id,
      line_user_id: user.line_user_id,
      display_name: user.display_name,
      created_at: user.created_at
    });

    // 4. データベースから再確認
    console.log('4. Verifying user in database...');
    const verifyUser = await UserService.findByLineUserId(lineUserId);
    console.log('Verification result:', verifyUser ? 'Success' : 'Failed');

    return {
      success: true,
      wasExisting: !!existingUser,
      user: {
        id: user.id,
        line_user_id: user.line_user_id,
        display_name: user.display_name,
        created_at: user.created_at,
        updated_at: user.updated_at
      },
      verification: {
        userFoundAfterCreation: !!verifyUser,
        verificationId: verifyUser?.id
      }
    };

  } catch (error) {
    console.error('Follow event simulation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    };
  }
}