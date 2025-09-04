import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// 署名検証を完全に無効化したWebhook（テスト専用）
export async function POST(request: NextRequest) {
  console.log('=== Simple Webhook Called ===');
  
  try {
    // リクエストボディを読み取るだけ
    const body = await request.text();
    console.log('Body length:', body.length);
    
    // 何も処理せずに200を返す
    return new Response(JSON.stringify({ message: 'OK' }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
  } catch (error) {
    console.error('Simple webhook error:', error);
    
    // エラーでも200を返す
    return new Response(JSON.stringify({ message: 'OK' }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

export async function GET(request: NextRequest) {
  return new Response(JSON.stringify({
    status: 'Simple Webhook Active',
    timestamp: new Date().toISOString()
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}