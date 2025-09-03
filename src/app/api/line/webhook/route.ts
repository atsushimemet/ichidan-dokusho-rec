import { NextRequest, NextResponse } from 'next/server';

// 最もシンプルなWebhook実装（テスト用）
export async function POST(request: NextRequest) {
  try {
    console.log('=== LINE Webhook Called ===');
    console.log('Headers:', Object.fromEntries(request.headers.entries()));
    
    const body = await request.text();
    console.log('Body length:', body.length);
    console.log('Body preview:', body.substring(0, 200));
    
    // 環境変数チェック
    console.log('Environment check:', {
      hasAccessToken: !!process.env.LINE_CHANNEL_ACCESS_TOKEN,
      hasSecret: !!process.env.LINE_CHANNEL_SECRET,
      accessTokenLength: process.env.LINE_CHANNEL_ACCESS_TOKEN?.length || 0,
      secretLength: process.env.LINE_CHANNEL_SECRET?.length || 0,
      nodeEnv: process.env.NODE_ENV,
      skipVerification: process.env.SKIP_LINE_SIGNATURE_VERIFICATION
    });

    // 署名検証を完全にスキップ
    console.log('Skipping signature verification for testing');

    let data;
    try {
      data = JSON.parse(body);
      console.log('Parsed data:', JSON.stringify(data, null, 2));
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const events = data.events || [];
    console.log('Events to process:', events.length);

    // 最もシンプルなイベント処理
    for (const event of events) {
      console.log('Processing event:', event.type);
      
      try {
        if (event.type === 'follow') {
          console.log('Follow event detected, but skipping complex processing for now');
        } else if (event.type === 'message') {
          console.log('Message event detected, but skipping complex processing for now');
        }
      } catch (eventError) {
        console.error('Error processing event:', eventError);
        // イベント処理エラーでもWebhookは成功として返す
      }
    }

    console.log('=== Webhook processing completed successfully ===');
    return NextResponse.json({ message: 'OK' });

  } catch (error) {
    console.error('=== Webhook Error ===');
    console.error('Error:', error);
    console.error('Stack:', error instanceof Error ? error.stack : 'No stack');
    
    // エラーが発生してもLINEには200を返す（重要）
    return NextResponse.json({ 
      message: 'OK',
      error: 'Logged for debugging',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}

// GET method for endpoint testing
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'LINE Webhook Endpoint Active',
    timestamp: new Date().toISOString(),
    config: {
      hasAccessToken: !!process.env.LINE_CHANNEL_ACCESS_TOKEN,
      hasSecret: !!process.env.LINE_CHANNEL_SECRET,
      accessTokenLength: process.env.LINE_CHANNEL_ACCESS_TOKEN?.length || 0,
      secretLength: process.env.LINE_CHANNEL_SECRET?.length || 0,
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
      nodeEnv: process.env.NODE_ENV
    }
  });
}