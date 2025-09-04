import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// 最小限のWebhook（確実に200を返す）
export async function POST() {
  console.log('Minimal webhook called at:', new Date().toISOString());
  
  return new Response('OK', {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}

export async function GET() {
  return new Response(JSON.stringify({
    status: 'Minimal Webhook Active',
    timestamp: new Date().toISOString()
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}