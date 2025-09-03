import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// 最もシンプルなWebhook実装
export async function POST(request: NextRequest) {
  console.log('=== LINE Webhook POST Called ===');
  
  try {
    const body = await request.text();
    console.log('Request body received, length:', body.length);
    
    // 常に200 OKを返す
    return NextResponse.json({ 
      message: 'OK',
      timestamp: new Date().toISOString(),
      status: 'success'
    });
    
  } catch (error) {
    console.error('Webhook error:', error);
    
    // エラーが発生しても200を返す（LINEプラットフォーム要件）
    return NextResponse.json({ 
      message: 'OK',
      error: 'logged',
      timestamp: new Date().toISOString()
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
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL
    }
  });
}