import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { UserService } from '@/lib/quiz-db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('Checking users table...');

    // usersテーブルの全データを取得
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    // テーブル構造を確認
    const { data: tableInfo, error: tableError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'users')
      .eq('table_schema', 'public');

    return NextResponse.json({
      users: {
        count: users?.length || 0,
        data: users || [],
        error: usersError?.message || null
      },
      tableStructure: {
        columns: tableInfo || [],
        error: tableError?.message || null
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Users debug API error:', error);
    return NextResponse.json(
      { 
        error: 'ユーザーデバッグAPIエラー',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

// テスト用のユーザー作成エンドポイント
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lineUserId, testMode = false } = body;

    if (!lineUserId) {
      return NextResponse.json({ error: 'lineUserId is required' }, { status: 400 });
    }

    console.log('Creating test user with LINE ID:', lineUserId);

    // テストユーザーを作成
    const user = await UserService.findOrCreateByLineId(lineUserId, {
      display_name: testMode ? `TestUser_${lineUserId.slice(-6)}` : `User_${lineUserId.slice(-6)}`,
      notification_enabled: true,
      notification_time: '09:00:00'
    });

    if (!user) {
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'User created successfully',
      user,
      testMode
    });

  } catch (error) {
    console.error('User creation error:', error);
    return NextResponse.json(
      { 
        error: 'ユーザー作成エラー',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}