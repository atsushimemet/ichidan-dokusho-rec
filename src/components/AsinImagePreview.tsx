'use client';

import { useState, useEffect } from 'react';

interface AsinImagePreviewProps {
  asin: string;
  alt?: string;
  size?: 'S' | 'M' | 'L';
  className?: string;
}

export default function AsinImagePreview({ 
  asin, 
  alt = '書籍カバー', 
  size = 'M',
  className = ''
}: AsinImagePreviewProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!asin) {
      setImageUrl(null);
      setIsLoading(false);
      return;
    }

    // ASIN から Amazon 画像URL を生成
    const url = `https://images-na.ssl-images-amazon.com/images/P/${asin}.01.${size}.jpg`;
    setImageUrl(url);
    setImageError(false);
    setIsLoading(true);
  }, [asin, size]);

  const handleImageLoad = () => {
    setIsLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setImageError(true);
  };

  if (!asin) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg ${className}`}>
        <div className="text-center text-gray-500 p-4">
          <div className="text-2xl mb-2">📚</div>
          <div className="text-sm">ASINを入力してください</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 border border-gray-300 rounded-lg">
          <div className="text-center text-gray-500">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400 mx-auto mb-2"></div>
            <div className="text-sm">読み込み中...</div>
          </div>
        </div>
      )}
      
      {imageError && (
        <div className="flex items-center justify-center bg-red-50 border-2 border-dashed border-red-300 rounded-lg h-full">
          <div className="text-center text-red-500 p-4">
            <div className="text-2xl mb-2">❌</div>
            <div className="text-sm">画像を読み込めません</div>
            <div className="text-xs text-gray-500 mt-1">ASIN: {asin}</div>
          </div>
        </div>
      )}

      {imageUrl && (
        <img
          src={imageUrl}
          alt={alt}
          className={`w-full h-full object-cover rounded-lg ${imageError || isLoading ? 'hidden' : ''}`}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      )}
    </div>
  );
}