import Link from "next/link";
import ParticleBackground from "@/components/ParticleBackground";
import ScrollAnimatedSection from "@/components/ScrollAnimatedSection";
import CountUpNumber from "@/components/CountUpNumber";
import FloatingElements from "@/components/FloatingElements";
import BookSlider from "@/components/BookSlider";
import RankingSlider from "@/components/RankingSlider";
import StoreSlider from "@/components/StoreSlider";
import ArchiveSlider from "@/components/ArchiveSlider";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 py-4 md:py-12 lg:py-24">
        {/* ミニマルなバックグラウンド */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-ios-gray-50/30 to-ios-blue/5"></div>
        
        <div className="max-w-4xl mx-auto text-center space-y-8 md:space-y-12 lg:space-y-16 relative z-10">
          {/* メインタイトル */}
          <div className="space-y-6 md:space-y-8 lg:space-y-12">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-light text-ios-gray-800 leading-tight tracking-tight">
                あなたにぴったりの
                <span className="block font-medium text-ios-blue">一冊を見つけよう</span>
              </h1>
              <div className="w-24 h-1 bg-gradient-to-r from-ios-blue to-ios-purple mx-auto rounded-full"></div>
            </div>
            <p className="text-lg md:text-xl lg:text-2xl text-ios-gray-600 max-w-3xl mx-auto leading-relaxed font-light">
              たった2つの質問に答えるだけで、<br className="hidden md:block" />
              あなたの嗜好に合った最適な書籍をレコメンドします
            </p>
          </div>

          {/* CTAボタン */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/questions"
                className="group inline-flex items-center gap-3 bg-ios-blue text-white text-lg md:text-xl px-8 md:px-12 py-4 md:py-5 rounded-full hover:bg-ios-blue/90 transition-all duration-500 ease-out hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <span className="group-hover:translate-x-1 transition-transform duration-300">質問に答えて本を探す</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/memos"
                className="group inline-flex items-center gap-3 bg-green-600 text-white text-lg md:text-xl px-8 md:px-12 py-4 md:py-5 rounded-full hover:bg-green-700 transition-all duration-500 ease-out hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <span className="group-hover:translate-x-1 transition-transform duration-300">📝 読書メモ＆クイズ</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </Link>
            </div>
            <p className="text-sm text-ios-gray-500 font-light">
              本を探す: 約30秒 | メモ作成: 約2分
            </p>
          </div>
        </div>
      </section>

      {/* Ranking Slider Section */}
      <ScrollAnimatedSection animationType="fade-in">
        <RankingSlider 
          title="今週のランキング"
          subtitle="主要書店・オンライン書店で話題の書籍をお届けします"
        />
      </ScrollAnimatedSection>

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

      {/* Archive Slider Section */}
      <ScrollAnimatedSection animationType="fade-in">
        <ArchiveSlider 
          title="Good Archives"
          subtitle="過去の本にまつわる貴重な記事やコンテンツをお楽しみください"
          count={6}
        />
      </ScrollAnimatedSection>

      {/* Features Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <ScrollAnimatedSection animationType="slide-up" className="text-center mb-16">
            <h2 className="font-light text-ios-gray-800 tracking-tight mb-6">
              シンプルなステップで理想の一冊へ
            </h2>
            <p className="text-xl font-light text-ios-gray-600 max-w-3xl mx-auto leading-relaxed">
              複雑な設定は一切不要。簡単な質問に答えるだけで、AIがあなたに最適な書籍を推薦します。
            </p>
          </ScrollAnimatedSection>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ScrollAnimatedSection animationType="slide-in-left" delay={0}>
              <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-ios-blue/5 to-ios-blue/10 hover-lift">
                <div className="text-6xl mb-6 bounce-gentle">🎯</div>
                <h3 className="text-2xl font-light text-ios-gray-800 tracking-tight mb-4">目的を選ぶ</h3>
                <p className="font-light text-ios-gray-600 leading-relaxed">
                  知識を広げたい、スキルアップしたい、自己成長したいなど、あなたの読書目的を教えてください。
                </p>
              </div>
            </ScrollAnimatedSection>
            
            <ScrollAnimatedSection animationType="slide-up" delay={200}>
              <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-ios-purple/5 to-ios-purple/10 hover-lift">
                <div className="text-6xl mb-6 bounce-gentle" style={{animationDelay: '0.5s'}}>📚</div>
                <h3 className="text-2xl font-light text-ios-gray-800 tracking-tight mb-4">ジャンルを選ぶ</h3>
                <p className="font-light text-ios-gray-600 leading-relaxed">
                  自己啓発、ビジネス、心理学、哲学など、興味のあるジャンルを自由に選択できます。
                </p>
              </div>
            </ScrollAnimatedSection>
            
            <ScrollAnimatedSection animationType="slide-in-right" delay={400}>
              <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-ios-green/5 to-ios-green/10 hover-lift">
                <div className="text-6xl mb-6 bounce-gentle" style={{animationDelay: '1s'}}>✨</div>
                <h3 className="text-2xl font-light text-ios-gray-800 tracking-tight mb-4">推薦を受け取る</h3>
                <p className="font-light text-ios-gray-600 leading-relaxed">
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
            <h2 className="font-light text-ios-gray-800 tracking-tight">
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
            <h2 className="text-4xl md:text-5xl font-light leading-tight text-white drop-shadow-lg tracking-tight">
              あなたの次の一冊を
              <span className="block text-white font-medium text-shadow-strong">今すぐ見つけませんか？</span>
            </h2>
          </ScrollAnimatedSection>
          
          <ScrollAnimatedSection animationType="fade-in" delay={200}>
            <p className="text-xl font-light text-white max-w-2xl mx-auto leading-relaxed">
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
              <Link
                href="/archives"
                className="inline-block bg-transparent border-2 border-white text-white text-xl font-bold px-12 py-4 rounded-full hover:bg-white hover:text-ios-blue transition-all duration-300 hover-lift"
              >
                📰 記事を読む
              </Link>
            </div>
          </ScrollAnimatedSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-ios-gray-800 text-white">
        <div className="max-w-6xl mx-auto text-center">
          <ScrollAnimatedSection animationType="fade-in">
            <div className="text-3xl font-light mb-4 bounce-gentle tracking-tight">📚 一段読書</div>
            <p className="text-ios-gray-300 mb-6 font-light leading-relaxed">
              あなたにぴったりの一冊を見つける、AIパーソナライズド書籍レコメンデーションサービス
            </p>
            <div className="text-sm text-ios-gray-400 font-light">
              © 2024 一段読書. All rights reserved.
            </div>
          </ScrollAnimatedSection>
        </div>
      </footer>
    </main>
  );
}
