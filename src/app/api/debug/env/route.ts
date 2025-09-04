import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // 環境変数の詳細チェック
    const envDebug = {
      // LINE関連
      LINE_CHANNEL_ACCESS_TOKEN: {
        exists: !!process.env.LINE_CHANNEL_ACCESS_TOKEN,
        type: typeof process.env.LINE_CHANNEL_ACCESS_TOKEN,
        length: process.env.LINE_CHANNEL_ACCESS_TOKEN?.length || 0,
        preview: process.env.LINE_CHANNEL_ACCESS_TOKEN ? 
          process.env.LINE_CHANNEL_ACCESS_TOKEN.substring(0, 15) + '...' : 'NOT_SET'
      },
      LINE_CHANNEL_SECRET: {
        exists: !!process.env.LINE_CHANNEL_SECRET,
        type: typeof process.env.LINE_CHANNEL_SECRET,
        length: process.env.LINE_CHANNEL_SECRET?.length || 0,
        preview: process.env.LINE_CHANNEL_SECRET ? 
          process.env.LINE_CHANNEL_SECRET.substring(0, 8) + '...' : 'NOT_SET'
      },
      
      // その他の設定
      SKIP_LINE_SIGNATURE_VERIFICATION: process.env.SKIP_LINE_SIGNATURE_VERIFICATION,
      NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_URL: process.env.VERCEL_URL,
      
      // 全LINE関連環境変数
      allLineKeys: Object.keys(process.env).filter(key => key.startsWith('LINE_')),
      
      // Vercel関連
      vercelKeys: Object.keys(process.env).filter(key => key.startsWith('VERCEL_')),
      
      // 環境変数総数
      totalEnvVars: Object.keys(process.env).length
    };

    return NextResponse.json({
      status: 'Environment Variables Debug',
      timestamp: new Date().toISOString(),
      debug: envDebug
    });

  } catch (error) {
    return NextResponse.json({
      error: 'Debug API error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}