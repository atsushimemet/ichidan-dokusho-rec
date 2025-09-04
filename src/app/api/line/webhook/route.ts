import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// 徹底的にデバッグするWebhook実装
export async function POST(request: NextRequest) {
  console.log('=== LINE Webhook POST Called ===');
  console.log('Timestamp:', new Date().toISOString());
  
  try {
    // ヘッダー情報をログ出力
    const headers = Object.fromEntries(request.headers.entries());
    console.log('Request headers:', headers);
    
    // 署名ヘッダーの確認
    const signature = request.headers.get('x-line-signature');
    console.log('Signature header:', {
      exists: !!signature,
      value: signature?.substring(0, 20) + '...' || 'NOT_FOUND'
    });
    
    // 環境変数の確認
    console.log('Environment variables:', {
      hasAccessToken: !!process.env.LINE_CHANNEL_ACCESS_TOKEN,
      hasSecret: !!process.env.LINE_CHANNEL_SECRET,
      skipVerification: process.env.SKIP_LINE_SIGNATURE_VERIFICATION,
      nodeEnv: process.env.NODE_ENV
    });
    
    // リクエストボディの読み取り
    const body = await request.text();
    console.log('Request body:', {
      length: body.length,
      preview: body.substring(0, 200)
    });
    
    // JSONパース
    let parsedData;
    try {
      parsedData = JSON.parse(body);
      console.log('Parsed JSON:', {
        hasEvents: !!parsedData.events,
        eventCount: parsedData.events?.length || 0,
        eventTypes: parsedData.events?.map((e: any) => e.type) || []
      });
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      // JSONパースエラーでも200を返す
      return NextResponse.json({ 
        message: 'OK',
        error: 'json_parse_error',
        timestamp: new Date().toISOString()
      });
    }
    
    console.log('=== Webhook processing completed successfully ===');
    
    // 常に200 OKを返す（LINEプラットフォーム要件）
    return NextResponse.json({ 
      message: 'OK',
      timestamp: new Date().toISOString(),
      status: 'success',
      processed: true
    });
    
  } catch (error) {
    console.error('=== Webhook Error ===');
    console.error('Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : 'No stack'
    });
    
    // エラーが発生しても必ず200を返す
    return NextResponse.json({ 
      message: 'OK',
      error: 'logged_for_debugging',
      timestamp: new Date().toISOString(),
      status: 'error_handled'
    });
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
      // デバッグ用：実際の値の一部を表示
      accessTokenPreview: process.env.LINE_CHANNEL_ACCESS_TOKEN ? 
        process.env.LINE_CHANNEL_ACCESS_TOKEN.substring(0, 10) + '...' : 'NOT_SET',
      secretPreview: process.env.LINE_CHANNEL_SECRET ? 
        process.env.LINE_CHANNEL_SECRET.substring(0, 5) + '...' : 'NOT_SET',
      allLineEnvKeys: Object.keys(process.env).filter(key => key.startsWith('LINE_')),
      // 環境変数の型確認
      envTypes: {
        LINE_CHANNEL_ACCESS_TOKEN: typeof process.env.LINE_CHANNEL_ACCESS_TOKEN,
        LINE_CHANNEL_SECRET: typeof process.env.LINE_CHANNEL_SECRET,
        SKIP_LINE_SIGNATURE_VERIFICATION: process.env.SKIP_LINE_SIGNATURE_VERIFICATION
      }
    }
  });
}