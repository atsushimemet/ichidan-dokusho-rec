import { NextRequest, NextResponse } from 'next/server';
import { WebhookEvent, MessageEvent, FollowEvent, UnfollowEvent } from '@line/bot-sdk';
import { 
  verifySignature, 
  lineClient, 
  createWelcomeMessage,
  createSettingsMessage 
} from '@/lib/line-utils';
import { UserService } from '@/lib/quiz-db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-line-signature') || '';

    // 署名検証
    if (!verifySignature(body, signature)) {
      console.error('Invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const data = JSON.parse(body);
    const events: WebhookEvent[] = data.events;

    // 各イベントを処理
    for (const event of events) {
      await handleEvent(event);
    }

    return NextResponse.json({ message: 'OK' });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function handleEvent(event: WebhookEvent) {
  try {
    switch (event.type) {
      case 'follow':
        await handleFollow(event as FollowEvent);
        break;
      case 'unfollow':
        await handleUnfollow(event as UnfollowEvent);
        break;
      case 'message':
        await handleMessage(event as MessageEvent);
        break;
      default:
        console.log('Unhandled event type:', event.type);
    }
  } catch (error) {
    console.error('Error handling event:', error);
  }
}

// 友だち追加イベント
async function handleFollow(event: FollowEvent) {
  const userId = event.source.userId;
  if (!userId) return;

  try {
    // ユーザー情報を取得
    const profile = await lineClient.getProfile(userId);
    
    // データベースにユーザーを作成または更新
    await UserService.findOrCreateByLineId(userId, {
      display_name: profile.displayName,
      avatar_url: profile.pictureUrl,
      notification_enabled: true
    });

    // ウェルカムメッセージを送信
    const welcomeMessages = createWelcomeMessage();
    await lineClient.replyMessage(event.replyToken, welcomeMessages);

    console.log(`New user followed: ${userId} (${profile.displayName})`);
  } catch (error) {
    console.error('Error handling follow event:', error);
  }
}

// 友だち削除イベント
async function handleUnfollow(event: UnfollowEvent) {
  const userId = event.source.userId;
  if (!userId) return;

  try {
    // ユーザーの通知を無効化（削除はしない）
    await UserService.update(userId, { notification_enabled: false });
    console.log(`User unfollowed: ${userId}`);
  } catch (error) {
    console.error('Error handling unfollow event:', error);
  }
}

// メッセージイベント
async function handleMessage(event: MessageEvent) {
  const userId = event.source.userId;
  if (!userId || event.message.type !== 'text') return;

  const messageText = event.message.text.trim();

  try {
    let replyMessage: any;

    switch (messageText) {
      case '設定':
      case 'せってい':
      case 'setting':
        replyMessage = createSettingsMessage(userId);
        break;

      case 'ヘルプ':
      case 'へるぷ':
      case 'help':
        replyMessage = {
          type: 'text',
          text: `📚 読書メモ&クイズシステムの使い方\n\n` +
                `1️⃣ Webサイトでメモを作成\n` +
                `2️⃣ 自動でクイズが生成されます\n` +
                `3️⃣ 翌日・1週間後に復習通知\n` +
                `4️⃣ クイズに答えて記憶を定着\n\n` +
                `📝 メモ作成: ${process.env.NEXT_PUBLIC_BASE_URL}/memos\n` +
                `🧠 今日のクイズ: ${process.env.NEXT_PUBLIC_BASE_URL}/quiz/today\n\n` +
                `その他のコマンド:\n` +
                `「設定」- 通知設定\n` +
                `「統計」- 学習統計\n` +
                `「今日のクイズ」- 今日の問題`
        };
        break;

      case '統計':
      case 'とうけい':
      case 'stats':
        replyMessage = {
          type: 'template',
          altText: '学習統計を確認できます',
          template: {
            type: 'buttons',
            title: '📊 学習統計',
            text: 'あなたの学習進捗を確認しましょう',
            actions: [
              {
                type: 'uri',
                label: '詳細を見る',
                uri: `${process.env.NEXT_PUBLIC_BASE_URL}/stats?userId=${userId}`
              }
            ]
          }
        };
        break;

      case '今日のクイズ':
      case 'きょうのくいず':
      case 'quiz':
        replyMessage = {
          type: 'template',
          altText: '今日のクイズに挑戦しましょう！',
          template: {
            type: 'buttons',
            title: '🧠 今日のクイズ',
            text: '今日の復習クイズに挑戦しましょう！',
            actions: [
              {
                type: 'uri',
                label: 'クイズを開始',
                uri: `${process.env.NEXT_PUBLIC_BASE_URL}/quiz/today`
              }
            ]
          }
        };
        break;

      case 'メモ':
      case 'めも':
      case 'memo':
        replyMessage = {
          type: 'template',
          altText: '読書メモを作成しましょう',
          template: {
            type: 'buttons',
            title: '📝 読書メモ',
            text: '新しいメモを作成すると自動でクイズが生成されます',
            actions: [
              {
                type: 'uri',
                label: 'メモを作成',
                uri: `${process.env.NEXT_PUBLIC_BASE_URL}/memos`
              }
            ]
          }
        };
        break;

      default:
        // デフォルトメッセージ
        replyMessage = {
          type: 'text',
          text: `メッセージありがとうございます！\n\n` +
                `利用可能なコマンド:\n` +
                `📝「メモ」- メモ作成\n` +
                `🧠「今日のクイズ」- クイズ挑戦\n` +
                `📊「統計」- 学習統計\n` +
                `⚙️「設定」- 通知設定\n` +
                `❓「ヘルプ」- 使い方\n\n` +
                `または直接Webサイトにアクセス:\n` +
                `${process.env.NEXT_PUBLIC_BASE_URL}`
        };
    }

    await lineClient.replyMessage(event.replyToken, replyMessage);

  } catch (error) {
    console.error('Error handling message:', error);
    
    // エラー時の返信
    const errorMessage = {
      type: 'text',
      text: '申し訳ございませんが、一時的にエラーが発生しています。しばらくしてから再度お試しください。'
    };
    
    try {
      await lineClient.replyMessage(event.replyToken, errorMessage);
    } catch (replyError) {
      console.error('Error sending error message:', replyError);
    }
  }
}