import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('Checking database tables...');

    // テーブル存在確認
    const tables = ['users', 'memos', 'quizzes', 'attempts', 'notification_logs'];
    const results: any = {};

    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });

        results[table] = {
          exists: !error,
          count: count || 0,
          error: error?.message || null
        };
      } catch (err) {
        results[table] = {
          exists: false,
          count: 0,
          error: String(err)
        };
      }
    }

    return NextResponse.json({
      tables: results,
      supabaseConfig: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...',
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json(
      { 
        error: 'デバッグAPIエラー',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}