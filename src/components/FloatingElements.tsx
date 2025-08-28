'use client';

export default function FloatingElements() {
  const bookEmojis = ['📚', '📖', '📝', '✨', '🌟', '💡'];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* 左上の本のアイコン */}
      <div className="absolute top-20 left-10 text-4xl floating-book opacity-20">
        📚
      </div>
      
      {/* 右上の星 */}
      <div className="absolute top-32 right-16 text-3xl floating-book opacity-30" style={{ animationDelay: '-0.5s' }}>
        ✨
      </div>
      
      {/* 左下の電球 */}
      <div className="absolute bottom-40 left-20 text-3xl floating-book opacity-25" style={{ animationDelay: '-1.5s' }}>
        💡
      </div>
      
      {/* 右下の本 */}
      <div className="absolute bottom-32 right-12 text-4xl floating-book opacity-20" style={{ animationDelay: '-2s' }}>
        📖
      </div>
      
      {/* 中央上の星 */}
      <div className="absolute top-16 left-1/2 transform -translate-x-1/2 text-2xl floating-book opacity-30" style={{ animationDelay: '-1s' }}>
        🌟
      </div>
      
      {/* 回転する要素 */}
      <div className="absolute top-1/4 right-1/4 w-12 h-12 opacity-10">
        <div className="w-full h-full border-2 border-ios-blue rounded-full animate-rotate-slow"></div>
      </div>
      
      <div className="absolute bottom-1/4 left-1/4 w-8 h-8 opacity-15" style={{ animationDelay: '-10s' }}>
        <div className="w-full h-full border-2 border-ios-purple rounded-full animate-rotate-slow"></div>
      </div>
    </div>
  );
}