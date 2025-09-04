import { NextRequest, NextResponse } from 'next/server';
import { QuizService, UserService, NotificationLogService } from '@/lib/quiz-db';
import { createQuizNotificationMessage, sendPushNotification } from '@/lib/line-utils';

export async function POST(request: NextRequest) {
  try {
    // APIキーでの認証（CRON等からの呼び出し用）
    const apiKey = request.headers.get('x-api-key');
    if (apiKey !== process.env.SCHEDULER_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { status = 'day1', timeWindow = 60 } = body; // timeWindow: 分単位

    const now = new Date();
    const windowStart = new Date(now.getTime() - timeWindow * 60 * 1000);
    const windowEnd = new Date(now.getTime() + timeWindow * 60 * 1000);

    const results = {
      total: 0,
      successful: 0,
      failed: 0,
      skipped: 0,
      errors: [] as string[]
    };

    // 指定されたステータスのクイズを取得（スケジュール時刻が現在時刻付近のもの）
    const quizzes = await QuizService.findScheduledQuizzes(status as any);
    
    // 時間窓内のクイズをフィルタリング
    const targetQuizzes = quizzes.filter(quiz => {
      const scheduledTime = new Date(quiz.scheduled_at);
      return scheduledTime >= windowStart && scheduledTime <= windowEnd;
    });

    results.total = targetQuizzes.length;

    for (const quiz of targetQuizzes) {
      try {
        // ユーザー情報を取得
        const user = await UserService.findByLineUserId(quiz.user_id);
        if (!user || !user.line_user_id) {
          results.skipped++;
          continue;
        }

        // 通知が無効の場合はスキップ
        if (!user.notification_enabled) {
          results.skipped++;
          continue;
        }

        // 通知時間をチェック（ユーザーの設定時間と現在時刻を比較）
        const userNotificationTime = user.notification_time || '09:00:00';
        const [hours, minutes] = userNotificationTime.split(':').map(Number);
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        // 通知時間の±30分以内かチェック
        const notificationTimeInMinutes = hours * 60 + minutes;
        const currentTimeInMinutes = currentHour * 60 + currentMinute;
        const timeDiff = Math.abs(currentTimeInMinutes - notificationTimeInMinutes);

        if (timeDiff > 30) {
          results.skipped++;
          continue;
        }

        // 既に通知済みかチェック
        const existingLogs = await NotificationLogService.findByQuizId(quiz.id);
        const alreadySent = existingLogs.some(log => 
          log.user_id === quiz.user_id && 
          log.status === 'sent' &&
          new Date(log.sent_at).toDateString() === now.toDateString()
        );
        
        if (alreadySent) {
          results.skipped++;
          continue;
        }

        // 通知メッセージを作成
        const message = createQuizNotificationMessage(quiz.id, user.line_user_id, quiz.type);

        // 通知を送信
        const success = await sendPushNotification(user.line_user_id, message);

        // 通知ログを記録
        const logData = {
          quiz_id: quiz.id,
          user_id: quiz.user_id,
          channel: 'line' as const,
          status: success ? 'sent' as const : 'failed' as const,
          retry_count: 0,
          error_message: success ? null : 'Push notification failed'
        };

        await NotificationLogService.create(logData);

        if (success) {
          results.successful++;
        } else {
          results.failed++;
          results.errors.push(`Failed to send notification for quiz ${quiz.id}`);
        }

      } catch (error) {
        results.failed++;
        results.errors.push(`Error processing quiz ${quiz.id}: ${error}`);
      }
    }

    return NextResponse.json({
      message: 'Notification sending completed',
      timestamp: now.toISOString(),
      status,
      timeWindow,
      results
    });

  } catch (error) {
    console.error('Error sending notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// 再通知処理
export async function PUT(request: NextRequest) {
  try {
    // APIキーでの認証
    const apiKey = request.headers.get('x-api-key');
    if (apiKey !== process.env.SCHEDULER_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const results = {
      total: 0,
      successful: 0,
      failed: 0,
      maxRetryReached: 0,
      errors: [] as string[]
    };

    // 昨日送信に失敗した通知を取得
    const failedLogs = await NotificationLogService.findByQuizId(''); // 全クイズの失敗ログを取得する実装が必要
    
    // 実際には、failed statusでretry_count < 3の通知ログを取得する必要があります
    // ここでは簡略化して、特定の条件で再通知を実装

    return NextResponse.json({
      message: 'Retry notification completed',
      timestamp: now.toISOString(),
      results
    });

  } catch (error) {
    console.error('Error in retry notification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// 手動実行用のGETエンドポイント
export async function GET(request: NextRequest) {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (!isDevelopment) {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || 'day1';

  const fakeRequest = new Request(request.url, {
    method: 'POST',
    headers: {
      'x-api-key': process.env.SCHEDULER_API_KEY || '',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ status })
  });

  return POST(fakeRequest as NextRequest);
}