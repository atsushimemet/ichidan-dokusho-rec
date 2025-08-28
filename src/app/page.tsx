import Link from "next/link";
import ParticleBackground from "@/components/ParticleBackground";
import ScrollAnimatedSection from "@/components/ScrollAnimatedSection";
import CountUpNumber from "@/components/CountUpNumber";
import FloatingElements from "@/components/FloatingElements";
import BookSlider from "@/components/BookSlider";
import StoreSlider from "@/components/StoreSlider";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 py-4 md:py-12 lg:py-24 overflow-hidden">
        {/* パーティクル背景 */}
        <ParticleBackground />
        
        {/* フローティング要素 */}
        <FloatingElements />
        
        <div className="max-w-6xl mx-auto text-center space-y-8 md:space-y-12 lg:space-y-16 relative z-10">
          {/* メインタイトル */}
          <div className="space-y-4 md:space-y-6 lg:space-y-8 fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-ios-gray-800 leading-tight">
              あなたにぴったりの
              <span className="holographic-text block">一冊を見つけよう</span>
            </h1>
            <p className="text-lg md:text-2xl lg:text-3xl text-ios-gray-600 max-w-4xl mx-auto leading-relaxed">
              たった2つの質問に答えるだけで、あなたの嗜好に合った最適な書籍をレコメンドします
            </p>
          </div>

          {/* CTAボタン */}
          <div className="scale-in">
            <Link
              href="/questions"
              className="btn-primary text-lg md:text-xl px-12 md:px-16 py-4 md:py-5 inline-block shadow-2xl hover:shadow-3xl transition-all duration-300 pulse-glow hover-lift shimmer"
            >
              📚 質問に答えて本を探す
            </Link>
          </div>
        </div>
      </section>

      {/* Book Slider Section */}
      <ScrollAnimatedSection animationType="fade-in">
        <BookSlider 
          title="おすすめの書籍"
          subtitle="あなたの成長をサポートする厳選された書籍をご紹介します"
          count={8}
        />
      </ScrollAnimatedSection>

      {/* Store Slider Section */}
      <ScrollAnimatedSection animationType="fade-in">
        <StoreSlider 
          title="素敵な本屋さん"
          subtitle="心地よい読書体験ができる本屋さんを見つけませんか"
          count={8}
        />
      </ScrollAnimatedSection>

      {/* Features Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <ScrollAnimatedSection animationType="slide-up" className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-ios-gray-800 mb-6">
              シンプルなステップで理想の一冊へ
            </h2>
            <p className="text-xl text-ios-gray-600 max-w-3xl mx-auto">
              複雑な設定は一切不要。簡単な質問に答えるだけで、AIがあなたに最適な書籍を推薦します。
            </p>
          </ScrollAnimatedSection>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ScrollAnimatedSection animationType="slide-in-left" delay={0}>
              <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-ios-blue/5 to-ios-blue/10 hover-lift">
                <div className="text-6xl mb-6 bounce-gentle">🎯</div>
                <h3 className="text-2xl font-bold text-ios-gray-800 mb-4">目的を選ぶ</h3>
                <p className="text-ios-gray-600 leading-relaxed">
                  知識を広げたい、スキルアップしたい、自己成長したいなど、あなたの読書目的を教えてください。
                </p>
              </div>
            </ScrollAnimatedSection>
            
            <ScrollAnimatedSection animationType="slide-up" delay={200}>
              <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-ios-purple/5 to-ios-purple/10 hover-lift">
                <div className="text-6xl mb-6 bounce-gentle" style={{animationDelay: '0.5s'}}>📚</div>
                <h3 className="text-2xl font-bold text-ios-gray-800 mb-4">ジャンルを選ぶ</h3>
                <p className="text-ios-gray-600 leading-relaxed">
                  自己啓発、ビジネス、心理学、哲学など、興味のあるジャンルを自由に選択できます。
                </p>
              </div>
            </ScrollAnimatedSection>
            
            <ScrollAnimatedSection animationType="slide-in-right" delay={400}>
              <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-ios-green/5 to-ios-green/10 hover-lift">
                <div className="text-6xl mb-6 bounce-gentle" style={{animationDelay: '1s'}}>✨</div>
                <h3 className="text-2xl font-bold text-ios-gray-800 mb-4">推薦を受け取る</h3>
                <p className="text-ios-gray-600 leading-relaxed">
                  AIがあなたの回答を分析し、最適な書籍をマッチングスコアとともに推薦します。
                </p>
              </div>
            </ScrollAnimatedSection>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 px-6 bg-gradient-to-br from-ios-blue/5 via-white to-ios-purple/5">
        <div className="max-w-6xl mx-auto text-center">
          <ScrollAnimatedSection animationType="slide-up" className="mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-ios-gray-800">
              信頼される数字
            </h2>
          </ScrollAnimatedSection>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <ScrollAnimatedSection animationType="scale-in" delay={0}>
              <div className="card-ios p-8 text-center hover-lift">
                <CountUpNumber target={1000} suffix="+" className="text-4xl font-bold text-ios-blue mb-2" />
                <div className="text-lg text-ios-gray-600">厳選書籍</div>
                <div className="text-sm text-ios-gray-500 mt-2">各分野の専門家が推薦</div>
              </div>
            </ScrollAnimatedSection>
            
            <ScrollAnimatedSection animationType="scale-in" delay={200}>
              <div className="card-ios p-8 text-center hover-lift">
                <CountUpNumber target={95} suffix="%" className="text-4xl font-bold text-ios-green mb-2" />
                <div className="text-lg text-ios-gray-600">満足度</div>
                <div className="text-sm text-ios-gray-500 mt-2">ユーザー調査に基づく予定</div>
              </div>
            </ScrollAnimatedSection>
            
            <ScrollAnimatedSection animationType="scale-in" delay={400}>
              <div className="card-ios p-8 text-center hover-lift">
                <CountUpNumber target={30} suffix="秒" className="text-4xl font-bold text-ios-purple mb-2" />
                <div className="text-lg text-ios-gray-600">平均回答時間</div>
                <div className="text-sm text-ios-gray-500 mt-2">簡単・スピーディー</div>
              </div>
            </ScrollAnimatedSection>
            
            <ScrollAnimatedSection animationType="scale-in" delay={600}>
              <div className="card-ios p-8 text-center hover-lift">
                <div className="text-4xl font-bold text-ios-orange mb-2">24/7</div>
                <div className="text-lg text-ios-gray-600">いつでも利用</div>
                <div className="text-sm text-ios-gray-500 mt-2">年中無休で利用可能</div>
              </div>
            </ScrollAnimatedSection>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-gradient-to-r from-ios-blue to-ios-purple text-white relative overflow-hidden">
        {/* 背景のアニメーション要素 */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-20 left-10 w-20 h-20 bg-white rounded-full animate-float"></div>
          <div className="absolute bottom-20 right-10 w-16 h-16 bg-white rounded-full animate-float" style={{animationDelay: '-1s'}}></div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
          <ScrollAnimatedSection animationType="slide-up">
            <h2 className="text-4xl md:text-5xl font-bold leading-tight text-white drop-shadow-lg">
              あなたの次の一冊を
              <span className="block text-white font-extrabold text-shadow-strong">今すぐ見つけませんか？</span>
            </h2>
          </ScrollAnimatedSection>
          
          <ScrollAnimatedSection animationType="fade-in" delay={200}>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              たった1分で、あなたの人生を変える一冊に出会えるかもしれません。
            </p>
          </ScrollAnimatedSection>
          
          <ScrollAnimatedSection animationType="scale-in" delay={400}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/questions"
                className="inline-block bg-white text-ios-blue text-xl font-bold px-12 py-4 rounded-full hover:bg-gray-50 transition-all duration-300 shadow-2xl hover-lift pulse-glow"
              >
                → 今すぐ始める
              </Link>
              <Link
                href="/search"
                className="inline-block bg-transparent border-2 border-white text-white text-xl font-bold px-12 py-4 rounded-full hover:bg-white hover:text-ios-blue transition-all duration-300 hover-lift"
              >
                🔍 書籍を検索
              </Link>
              <Link
                href="/stores"
                className="inline-block bg-transparent border-2 border-white text-white text-xl font-bold px-12 py-4 rounded-full hover:bg-white hover:text-ios-blue transition-all duration-300 hover-lift"
              >
                📚 本屋さん検索
              </Link>
            </div>
          </ScrollAnimatedSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-ios-gray-800 text-white">
        <div className="max-w-6xl mx-auto text-center">
          <ScrollAnimatedSection animationType="fade-in">
            <div className="text-3xl font-bold mb-4 bounce-gentle">📚 一段読書</div>
            <p className="text-ios-gray-300 mb-6">
              あなたにぴったりの一冊を見つける、AIパーソナライズド書籍レコメンデーションサービス
            </p>
            <div className="text-sm text-ios-gray-400">
              © 2024 一段読書. All rights reserved.
            </div>
          </ScrollAnimatedSection>
        </div>
      </footer>
    </main>
  );
}
