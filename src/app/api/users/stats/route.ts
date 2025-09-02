import { NextRequest, NextResponse } from 'next/server';
import { StatsService, AttemptService, UserService } from '@/lib/quiz-db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const lineUserId = searchParams.get('lineUserId');
    const days = parseInt(searchParams.get('days') || '30');

    if (!userId && !lineUserId) {
      return NextResponse.json(
        { error: 'ユーザーIDまたはLINEユーザーIDは必須です' },
        { status: 400 }
      );
    }

    let user;
    if (lineUserId) {
      user = await UserService.findByLineUserId(lineUserId);
    }

    if (!user) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      );
    }

    // 基本統計を取得
    const basicStats = await StatsService.getUserStats(user.id);

    // 期間別統計を取得
    const periodStats = await AttemptService.getStats(user.id, days);

    // 最近の回答履歴を取得
    const recentAttempts = await AttemptService.findByUserId(user.id, 10);

    // 日別の回答統計を計算
    const dailyStats = await calculateDailyStats(user.id, days);

    // 週別の継続率を計算
    const weeklyStats = await calculateWeeklyStats(user.id);

    return NextResponse.json({
      user: {
        id: user.id,
        display_name: user.display_name,
        created_at: user.created_at
      },
      stats: {
        basic: basicStats,
        period: periodStats,
        daily: dailyStats,
        weekly: weeklyStats
      },
      recentAttempts: recentAttempts.map(attempt => ({
        id: attempt.id,
        quiz_id: attempt.quiz_id,
        user_answer: attempt.user_answer,
        is_correct: attempt.is_correct,
        answered_at: attempt.answered_at
      }))
    });

  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}

// 日別統計を計算
async function calculateDailyStats(userId: string, days: number) {
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

  const attempts = await AttemptService.findByUserId(userId, 1000);
  const periodAttempts = attempts.filter(attempt => 
    new Date(attempt.answered_at) >= startDate
  );

  // 日付ごとにグループ化
  const dailyMap = new Map<string, { correct: number; total: number }>();
  
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];
    dailyMap.set(dateStr, { correct: 0, total: 0 });
  }

  periodAttempts.forEach(attempt => {
    const dateStr = attempt.answered_at.split('T')[0];
    const stats = dailyMap.get(dateStr);
    if (stats) {
      stats.total++;
      if (attempt.is_correct) {
        stats.correct++;
      }
    }
  });

  return Array.from(dailyMap.entries()).map(([date, stats]) => ({
    date,
    correct: stats.correct,
    total: stats.total,
    accuracy: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0
  }));
}

// 週別統計を計算
async function calculateWeeklyStats(userId: string) {
  const attempts = await AttemptService.findByUserId(userId, 1000);
  
  // 過去4週間の統計
  const weeks = [];
  const now = new Date();
  
  for (let i = 0; i < 4; i++) {
    const weekStart = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
    const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
    
    const weekAttempts = attempts.filter(attempt => {
      const attemptDate = new Date(attempt.answered_at);
      return attemptDate >= weekStart && attemptDate < weekEnd;
    });

    // 連続回答日数を計算
    const activeDays = new Set(
      weekAttempts.map(attempt => 
        attempt.answered_at.split('T')[0]
      )
    ).size;

    weeks.unshift({
      weekStart: weekStart.toISOString().split('T')[0],
      weekEnd: weekEnd.toISOString().split('T')[0],
      totalAttempts: weekAttempts.length,
      correctAttempts: weekAttempts.filter(a => a.is_correct).length,
      activeDays,
      continuityRate: Math.round((activeDays / 7) * 100)
    });
  }

  return weeks;
}