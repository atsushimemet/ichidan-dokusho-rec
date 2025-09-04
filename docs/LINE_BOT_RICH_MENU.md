# LINE Bot Rich Menu設定

## Rich Menuデザイン案

```
┌─────────────────────────────────────────┐
│ 📝 メモ作成  │ 🧠 今日のクイズ │ 📊 統計    │
├─────────────────────────────────────────┤
│    ⚙️ 設定    │    ❓ ヘルプ    │
└─────────────────────────────────────────┘
```

## Rich Menu設定JSON

```json
{
  "size": {
    "width": 2500,
    "height": 1686
  },
  "selected": true,
  "name": "読書メモ&クイズメニュー",
  "chatBarText": "メニュー",
  "areas": [
    {
      "bounds": {
        "x": 0,
        "y": 0,
        "width": 833,
        "height": 843
      },
      "action": {
        "type": "uri",
        "uri": "https://your-domain.com/memos"
      }
    },
    {
      "bounds": {
        "x": 833,
        "y": 0,
        "width": 834,
        "height": 843
      },
      "action": {
        "type": "uri",
        "uri": "https://your-domain.com/quiz/today"
      }
    },
    {
      "bounds": {
        "x": 1667,
        "y": 0,
        "width": 833,
        "height": 843
      },
      "action": {
        "type": "uri",
        "uri": "https://your-domain.com/stats"
      }
    },
    {
      "bounds": {
        "x": 0,
        "y": 843,
        "width": 1250,
        "height": 843
      },
      "action": {
        "type": "text",
        "text": "設定"
      }
    },
    {
      "bounds": {
        "x": 1250,
        "y": 843,
        "width": 1250,
        "height": 843
      },
      "action": {
        "type": "text",
        "text": "ヘルプ"
      }
    }
  ]
}
```

## Rich Menu画像作成

2500×1686pxの画像を作成し、以下の配置：

```
┌─────────────────────────────────────────┐ 2500px
│ 📝 メモ作成  │ 🧠 今日のクイズ │ 📊 統計    │ 843px
│   (833px)   │   (834px)     │  (833px)  │
├─────────────────────────────────────────┤
│    ⚙️ 設定    │    ❓ ヘルプ    │          │ 843px
│   (1250px)   │   (1250px)    │          │
└─────────────────────────────────────────┘
                1686px
```