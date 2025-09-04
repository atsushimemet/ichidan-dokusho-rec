import { NextRequest, NextResponse } from 'next/server';
import { verifySignature } from '@/lib/line-utils';

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
        
        // イベント処理をシミュレート
        for (const event of data.events || []) {
          console.log('Event type:', event.type);
          if (event.type === 'follow') {
            console.log('Follow event detected');
          } else if (event.type === 'message') {
            console.log('Message event detected');
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