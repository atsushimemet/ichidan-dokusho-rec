import { NextRequest, NextResponse } from 'next/server';
import { QuizService, NotificationLogService, UserService } from '@/lib/quiz-db';
import { createQuizNotificationMessage, sendPushNotification } from '@/lib/line-utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { quizId, userId, force = false } = body;

    // APIキーでの認証（CRON等からの呼び出し用）
    const apiKey = request.headers.get('x-api-key');
    if (apiKey !== process.env.NOTIFICATION_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // クイズ情報を取得
    const quiz = await QuizService.findById(quizId);
    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    // ユーザー情報を取得
    const user = await UserService.findByLineUserId(userId);
    if (!user || !user.line_user_id) {
      return NextResponse.json({ error: 'User not found or not linked to LINE' }, { status: 404 });
    }

    // 通知が有効かチェック
    if (!user.notification_enabled && !force) {
      return NextResponse.json({ message: 'Notifications disabled for user' });
    }

    // 既に通知済みかチェック（強制送信でない場合）
    if (!force) {
      const existingLogs = await NotificationLogService.findByQuizId(quizId);
      const alreadySent = existingLogs.some(log => 
        log.user_id === userId && 
        log.status === 'sent' && 
        log.retry_count === 0
      );
      
      if (alreadySent) {
        return NextResponse.json({ message: 'Already notified' });
      }
    }

    // 通知メッセージを作成
    const message = createQuizNotificationMessage(quizId, user.line_user_id, quiz.type);

    // 通知を送信
    const success = await sendPushNotification(user.line_user_id, message);

    // 通知ログを記録
    const logData = {
      quiz_id: quizId,
      user_id: userId,
      channel: 'line' as const,
      status: success ? 'sent' as const : 'failed' as const,
      retry_count: 0,
      error_message: success ? null : 'Push notification failed'
    };

    await NotificationLogService.create(logData);

    if (success) {
      return NextResponse.json({ 
        message: 'Notification sent successfully',
        quizId,
        userId 
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to send notification' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error sending notification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// 一括通知エンドポイント
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { status, beforeDate } = body;

    // APIキーでの認証
    const apiKey = request.headers.get('x-api-key');
    if (apiKey !== process.env.NOTIFICATION_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 対象のクイズを取得
    const targetDate = beforeDate ? new Date(beforeDate) : new Date();
    const quizzes = await QuizService.findScheduledQuizzes(status, targetDate);

    const results = {
      total: quizzes.length,
      successful: 0,
      failed: 0,
      errors: [] as string[]
    };

    // 各クイズに対して通知を送信
    for (const quiz of quizzes) {
      try {
        const user = await UserService.findByLineUserId(quiz.user_id);
        if (!user || !user.line_user_id || !user.notification_enabled) {
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
          results.errors.push(`Failed to notify user ${quiz.user_id} for quiz ${quiz.id}`);
        }

      } catch (error) {
        results.failed++;
        results.errors.push(`Error processing quiz ${quiz.id}: ${error}`);
      }
    }

    return NextResponse.json({
      message: 'Bulk notification completed',
      results
    });

  } catch (error) {
    console.error('Error in bulk notification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}