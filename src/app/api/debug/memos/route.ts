import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { UserService } from '@/lib/quiz-db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'temp-user-id';

    console.log('Debug: Checking memos for userId:', userId);

    // 1. 全ユーザー確認
    const { data: allUsers, error: userError } = await supabase
      .from('users')
      .select('*');

    console.log('All users in database:', { count: allUsers?.length || 0, error: userError });

    // 2. 指定ユーザー確認
    const user = await UserService.findByLineUserId(userId);
    console.log('User lookup result:', user);

    // 3. 全メモ確認
    const { data: allMemos, error: memoError } = await supabase
      .from('memos')
      .select('*');

    console.log('All memos in database:', { count: allMemos?.length || 0, error: memoError });

    // 4. 該当ユーザーのメモ確認
    let userMemos = [];
    if (user) {
      const { data: userMemoData, error: userMemoError } = await supabase
        .from('memos')
        .select('*')
        .eq('user_id', user.id);

      userMemos = userMemoData || [];
      console.log('User memos:', { count: userMemos.length, error: userMemoError });
    }

    // 5. line_user_idでの直接検索も試行
    const { data: directMemos, error: directError } = await supabase
      .from('memos')
      .select('*')
      .eq('user_id', userId); // 直接line_user_idで検索

    console.log('Direct memo search:', { count: directMemos?.length || 0, error: directError });

    return NextResponse.json({
      debug: {
        searchUserId: userId,
        allUsers: {
          count: allUsers?.length || 0,
          data: allUsers?.map(u => ({ id: u.id, line_user_id: u.line_user_id, display_name: u.display_name })) || [],
          error: userError?.message || null
        },
        foundUser: user ? {
          id: user.id,
          line_user_id: user.line_user_id,
          display_name: user.display_name
        } : null,
        allMemos: {
          count: allMemos?.length || 0,
          data: allMemos?.map(m => ({ 
            id: m.id, 
            user_id: m.user_id, 
            title: m.title,
            created_at: m.created_at 
          })) || [],
          error: memoError?.message || null
        },
        userMemos: {
          count: userMemos.length,
          data: userMemos.map(m => ({ 
            id: m.id, 
            user_id: m.user_id, 
            title: m.title,
            created_at: m.created_at 
          }))
        },
        directSearch: {
          count: directMemos?.length || 0,
          data: directMemos?.slice(0, 3) || [],
          error: directError?.message || null
        }
      }
    });

  } catch (error) {
    console.error('Debug memos API error:', error);
    return NextResponse.json(
      { 
        error: 'デバッグAPIエラー',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}