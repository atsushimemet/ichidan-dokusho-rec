import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/lib/quiz-db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const lineUserId = searchParams.get('lineUserId');

    if (!userId && !lineUserId) {
      return NextResponse.json(
        { error: 'ユーザーIDまたはLINEユーザーIDは必須です' },
        { status: 400 }
      );
    }

    let user;
    if (lineUserId) {
      user = await UserService.findByLineUserId(lineUserId);
    } else {
      // userIdで検索する場合の実装（必要に応じて追加）
      return NextResponse.json(
        { error: 'ユーザーID検索は未実装です' },
        { status: 501 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });

  } catch (error) {
    console.error('Error fetching user settings:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, lineUserId, settings } = body;

    if (!userId && !lineUserId) {
      return NextResponse.json(
        { error: 'ユーザーIDまたはLINEユーザーIDは必須です' },
        { status: 400 }
      );
    }

    // 現在のユーザーを取得
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

    // 設定を更新
    const updatedUser = await UserService.update(user.id, {
      notification_enabled: settings.notificationEnabled,
      notification_time: settings.notificationTime,
      display_name: settings.displayName
    });

    if (!updatedUser) {
      return NextResponse.json(
        { error: '設定の更新に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      user: updatedUser,
      message: '設定を更新しました' 
    });

  } catch (error) {
    console.error('Error updating user settings:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}