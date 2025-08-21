import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* メインタイトル */}
          <div className="space-y-4 fade-in">
            <h1 className="text-4xl md:text-6xl font-bold text-ios-gray-800 leading-tight">
              あなたにぴったりの
              <span className="holographic-text block">一冊を見つけよう</span>
            </h1>
            <p className="text-xl md:text-2xl text-ios-gray-600 max-w-2xl mx-auto">
              3つの質問に答えるだけで、あなたの嗜好に合った最適な書籍をレコメンドします
            </p>
          </div>

          {/* 説明カード */}
          <div className="glass rounded-3xl p-8 max-w-2xl mx-auto slide-up">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="space-y-2">
                <div className="text-3xl">📚</div>
                <h3 className="font-semibold text-ios-gray-800">簡単3質問</h3>
                <p className="text-sm text-ios-gray-600">わずか3つの質問に答えるだけ</p>
              </div>
              <div className="space-y-2">
                <div className="text-3xl">🎯</div>
                <h3 className="font-semibold text-ios-gray-800">精密レコメンド</h3>
                <p className="text-sm text-ios-gray-600">あなたの嗜好に合わせた厳選</p>
              </div>
              <div className="space-y-2">
                <div className="text-3xl">⚡</div>
                <h3 className="font-semibold text-ios-gray-800">即座に結果</h3>
                <p className="text-sm text-ios-gray-600">すぐに最適な本が見つかる</p>
              </div>
            </div>
          </div>

          {/* CTAボタン */}
          <div className="scale-in">
            <Link
              href="/questions"
              className="btn-primary text-lg px-12 py-4 inline-block"
            >
              質問に答えて本を探す
            </Link>
          </div>

          {/* 統計情報 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mt-16">
            <div className="card-ios p-6 text-center">
              <div className="text-2xl font-bold text-ios-blue">1000+</div>
              <div className="text-sm text-ios-gray-600">厳選書籍</div>
            </div>
            <div className="card-ios p-6 text-center">
              <div className="text-2xl font-bold text-ios-green">95%</div>
              <div className="text-sm text-ios-gray-600">満足度</div>
            </div>
            <div className="card-ios p-6 text-center">
              <div className="text-2xl font-bold text-ios-purple">10秒</div>
              <div className="text-sm text-ios-gray-600">平均回答時間</div>
            </div>
            <div className="card-ios p-6 text-center">
              <div className="text-2xl font-bold text-ios-orange">24/7</div>
              <div className="text-sm text-ios-gray-600">いつでも利用</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}