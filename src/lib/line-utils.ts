import { Client, ClientConfig, WebhookEvent, MessageEvent, FollowEvent } from '@line/bot-sdk';
import CryptoJS from 'crypto-js';

// LINE Bot設定
const config: ClientConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
  channelSecret: process.env.LINE_CHANNEL_SECRET || '',
};

export const lineClient = new Client(config);

// 署名検証
export function verifySignature(body: string, signature: string): boolean {
  if (!config.channelSecret) {
    console.error('LINE_CHANNEL_SECRET is not set');
    return false;
  }

  const hash = CryptoJS.HmacSHA256(body, config.channelSecret).toString(CryptoJS.enc.Base64);
  return hash === signature;
}

// 短期トークンを生成（クイズリンク用）
export function generateQuizToken(quizId: string, userId: string): string {
  const payload = {
    quizId,
    userId,
    timestamp: Date.now(),
    expires: Date.now() + (24 * 60 * 60 * 1000) // 24時間後
  };

  const secret = process.env.QUIZ_TOKEN_SECRET || 'default-secret';
  return CryptoJS.AES.encrypt(JSON.stringify(payload), secret).toString();
}

// 短期トークンを検証・デコード
export function verifyQuizToken(token: string): { quizId: string; userId: string } | null {
  try {
    const secret = process.env.QUIZ_TOKEN_SECRET || 'default-secret';
    const decrypted = CryptoJS.AES.decrypt(token, secret).toString(CryptoJS.enc.Utf8);
    const payload = JSON.parse(decrypted);

    // 有効期限チェック
    if (Date.now() > payload.expires) {
      return null;
    }

    return {
      quizId: payload.quizId,
      userId: payload.userId
    };
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

// クイズ通知メッセージを作成
export function createQuizNotificationMessage(quizId: string, userId: string, quizType: 'cloze' | 'tf') {
  const token = generateQuizToken(quizId, userId);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://your-domain.com';
  const quizUrl = `${baseUrl}/quiz/${quizId}?token=${token}`;

  const typeText = quizType === 'cloze' ? '穴埋め問題' : 'True/False問題';

  return {
    type: 'template',
    altText: `📚 復習クイズの時間です！${typeText}が待っています。`,
    template: {
      type: 'buttons',
      thumbnailImageUrl: `${baseUrl}/quiz-notification-image.jpg`, // 通知用画像
      imageAspectRatio: 'rectangle',
      imageSize: 'cover',
      imageBackgroundColor: '#4F46E5',
      title: '📚 復習クイズの時間です！',
      text: `${typeText}が1問準備されています。\n継続的な学習で記憶を定着させましょう！`,
      actions: [
        {
          type: 'uri',
          label: 'クイズに挑戦する',
          uri: quizUrl
        },
        {
          type: 'uri',
          label: 'メモを確認する',
          uri: `${baseUrl}/memos`
        }
      ]
    }
  };
}

// 友だち追加時のウェルカムメッセージ
export function createWelcomeMessage() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://your-domain.com';
  
  return [
    {
      type: 'text',
      text: '📚 読書メモ&クイズシステムへようこそ！\n\nこのシステムでは：\n✅ 読書メモを作成\n✅ 自動でクイズを生成\n✅ 復習通知を受信\n\nで効果的な学習をサポートします！'
    },
    {
      type: 'template',
      altText: 'さっそく始めてみましょう！',
      template: {
        type: 'buttons',
        title: 'さっそく始めてみましょう！',
        text: 'メモを作成すると自動でクイズが生成され、復習通知が届きます。',
        actions: [
          {
            type: 'uri',
            label: 'メモを作成する',
            uri: `${baseUrl}/memos`
          },
          {
            type: 'uri',
            label: '今日のクイズを見る',
            uri: `${baseUrl}/quiz/today`
          }
        ]
      }
    }
  ];
}

// 通知設定メッセージ
export function createSettingsMessage(userId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://your-domain.com';
  
  return {
    type: 'template',
    altText: '通知設定を変更できます',
    template: {
      type: 'buttons',
      title: '⚙️ 設定',
      text: '通知時間や頻度をカスタマイズできます。',
      actions: [
        {
          type: 'uri',
          label: '設定を変更する',
          uri: `${baseUrl}/settings?userId=${userId}`
        },
        {
          type: 'uri',
          label: '学習統計を見る',
          uri: `${baseUrl}/stats?userId=${userId}`
        }
      ]
    }
  };
}

// Push通知を送信
export async function sendPushNotification(userId: string, message: any): Promise<boolean> {
  try {
    await lineClient.pushMessage(userId, message);
    return true;
  } catch (error) {
    console.error('Failed to send push notification:', error);
    return false;
  }
}

// 複数のユーザーに一括通知
export async function sendBulkNotification(userIds: string[], message: any): Promise<{
  successful: string[];
  failed: string[];
}> {
  const successful: string[] = [];
  const failed: string[] = [];

  for (const userId of userIds) {
    const success = await sendPushNotification(userId, message);
    if (success) {
      successful.push(userId);
    } else {
      failed.push(userId);
    }
  }

  return { successful, failed };
}

// Rich Menu設定（オプション）
export function createRichMenu() {
  return {
    size: {
      width: 2500,
      height: 1686
    },
    selected: true,
    name: "読書メモ&クイズメニュー",
    chatBarText: "メニュー",
    areas: [
      {
        bounds: {
          x: 0,
          y: 0,
          width: 833,
          height: 843
        },
        action: {
          type: "uri",
          uri: `${process.env.NEXT_PUBLIC_BASE_URL}/memos`
        }
      },
      {
        bounds: {
          x: 833,
          y: 0,
          width: 834,
          height: 843
        },
        action: {
          type: "uri",
          uri: `${process.env.NEXT_PUBLIC_BASE_URL}/quiz/today`
        }
      },
      {
        bounds: {
          x: 1667,
          y: 0,
          width: 833,
          height: 843
        },
        action: {
          type: "uri",
          uri: `${process.env.NEXT_PUBLIC_BASE_URL}/stats`
        }
      },
      {
        bounds: {
          x: 0,
          y: 843,
          width: 1250,
          height: 843
        },
        action: {
          type: "text",
          text: "設定"
        }
      },
      {
        bounds: {
          x: 1250,
          y: 843,
          width: 1250,
          height: 843
        },
        action: {
          type: "text",
          text: "ヘルプ"
        }
      }
    ]
  };
}