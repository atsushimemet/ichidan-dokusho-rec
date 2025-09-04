import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'temp-user-id';

    console.log('Debug: Checking quizzes for userId:', userId);

    // 1. ユーザー確認
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('line_user_id', userId);

    console.log('User check:', { count: userData?.length || 0, error: userError });

    // 2. 全クイズ確認
    const { data: allQuizzes, error: allError } = await supabase
      .from('quizzes')
      .select('*');

    console.log('All quizzes in database:', { count: allQuizzes?.length || 0, error: allError });

    // 3. 該当ユーザーのクイズ確認
    let userQuizzes = [];
    let userQuizError = null;
    
    if (userData && userData.length > 0) {
      const actualUserId = userData[0].id;
      const { data: userQuizData, error: userQuizErr } = await supabase
        .from('quizzes')
        .select('*')
        .eq('user_id', actualUserId);

      userQuizzes = userQuizData || [];
      userQuizError = userQuizErr;
      
      console.log('User quizzes:', { count: userQuizzes.length, error: userQuizError });
    }

    // 4. メモ確認
    const { data: memoData, error: memoError } = await supabase
      .from('memos')
      .select('*');

    console.log('All memos:', { count: memoData?.length || 0, error: memoError });

    return NextResponse.json({
      debug: {
        userId,
        user: {
          found: userData?.length || 0,
          data: userData?.[0] || null,
          error: userError?.message || null
        },
        allQuizzes: {
          count: allQuizzes?.length || 0,
          data: allQuizzes?.slice(0, 3) || [], // 最初の3件のみ
          error: allError?.message || null
        },
        userQuizzes: {
          count: userQuizzes.length,
          data: userQuizzes.slice(0, 3) || [],
          error: userQuizError?.message || null
        },
        memos: {
          count: memoData?.length || 0,
          data: memoData?.slice(0, 3) || [],
          error: memoError?.message || null
        }
      }
    });

  } catch (error) {
    console.error('Debug quizzes API error:', error);
    return NextResponse.json(
      { 
        error: 'デバッグAPIエラー',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}