import { NextRequest, NextResponse } from 'next/server';
import { verifySignature, createWelcomeMessage, lineClient } from '@/lib/line-utils';
import { UserService } from '@/lib/quiz-db';

export const dynamic = 'force-dynamic';

// 最も安全なWebhook実装
export async function POST(request: NextRequest) {
  try {
    // 署名検証（スキップ設定を確認）
    const skipVerification = process.env.SKIP_LINE_SIGNATURE_VERIFICATION === 'true';
    
    if (!skipVerification) {
      const signature = request.headers.get('x-line-signature');
      if (!signature) {
        console.error('Missing x-line-signature header');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const body = await request.clone().text();
      if (!verifySignature(body, signature)) {
        console.error('Invalid signature');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      
      console.log('Signature verification passed');
    } else {
      console.log('Signature verification skipped (SKIP_LINE_SIGNATURE_VERIFICATION=true)');
    }

    // 即座に200を返す（処理は後で）
    const response = NextResponse.json({ 
      message: 'OK',
      timestamp: new Date().toISOString()
    });

    // バックグラウンドで処理（非同期）
    processWebhookAsync(request).catch(error => {
      console.error('Background webhook processing error:', error);
    });

    return response;
    
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// バックグラウンド処理
async function processWebhookAsync(request: NextRequest) {
  try {
    console.log('=== Background Webhook Processing ===');
    console.log('Timestamp:', new Date().toISOString());
    
    // ヘッダー情報
    const headers = Object.fromEntries(request.headers.entries());
    console.log('Headers received:', Object.keys(headers));
    
    // 署名ヘッダー
    const signature = request.headers.get('x-line-signature');
    console.log('Signature:', !!signature);
    
    // 環境変数確認
    console.log('Environment:', {
      hasAccessToken: !!process.env.LINE_CHANNEL_ACCESS_TOKEN,
      hasSecret: !!process.env.LINE_CHANNEL_SECRET,
      skipVerification: process.env.SKIP_LINE_SIGNATURE_VERIFICATION
    });
    
    // ボディ読み取り（クローン版を使用）
    const clonedRequest = request.clone();
    const body = await clonedRequest.text();
    console.log('Body length:', body.length);
    
    if (body.length > 0) {
      try {
        const data = JSON.parse(body);
        console.log('Events:', data.events?.length || 0);
        
        // イベント処理
        for (const event of data.events || []) {
          console.log('Event type:', event.type);
          
          if (event.type === 'follow') {
            console.log('Follow event detected');
            await handleFollowEvent(event);
          } else if (event.type === 'message') {
            console.log('Message event detected');
            await handleMessageEvent(event);
          }
        }
      } catch (parseError) {
        console.error('JSON parse error in background:', parseError);
      }
    }
    
    console.log('=== Background processing completed ===');
    
  } catch (error) {
    console.error('Background processing error:', error);
  }
}

// 友だち追加イベントの処理
async function handleFollowEvent(event: any) {
  try {
    const lineUserId = event.source.userId;
    console.log('Processing follow event for user:', lineUserId);
    
    // ユーザーを作成または取得
    const user = await UserService.findOrCreateUser(lineUserId);
    console.log('User created/found:', { id: user.id, line_user_id: user.line_user_id });
    
    // ウェルカムメッセージを送信
    const welcomeMessages = createWelcomeMessage();
    for (const message of welcomeMessages) {
      await lineClient.replyMessage(event.replyToken, message);
    }
    
    console.log('Welcome message sent to user:', lineUserId);
    
  } catch (error) {
    console.error('Error handling follow event:', error);
  }
}

// メッセージイベントの処理
async function handleMessageEvent(event: any) {
  try {
    const lineUserId = event.source.userId;
    const messageText = event.message.text;
    console.log('Processing message event:', { lineUserId, messageText });
    
    // 基本的なメッセージ処理
    // 今後、クイズ関連のコマンドなどを実装可能
    
  } catch (error) {
    console.error('Error handling message event:', error);
  }
}

export async function GET(request: NextRequest) {
  console.log('=== LINE Webhook GET Called ===');
  
  return NextResponse.json({
    status: 'LINE Webhook Endpoint Active',
    method: 'This endpoint accepts POST requests for LINE webhook events',
    timestamp: new Date().toISOString(),
    url: request.url,
    environment: {
      nodeEnv: process.env.NODE_ENV,
      hasAccessToken: !!process.env.LINE_CHANNEL_ACCESS_TOKEN,
      hasSecret: !!process.env.LINE_CHANNEL_SECRET,
      vercelUrl: process.env.VERCEL_URL,
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
      skipVerification: process.env.SKIP_LINE_SIGNATURE_VERIFICATION
    }
  });
}