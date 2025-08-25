import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * ページ数から読みやすさレベルを判定する
 * @param pageCount ページ数
 * @returns 読みやすさレベルとその説明
 */
export function getReadabilityLevel(pageCount: number): {
  level: 'easy' | 'moderate' | 'challenging';
  label: string;
  description: string;
  color: string;
} {
  if (pageCount <= 300) {
    return {
      level: 'easy',
      label: '読みやすい',
      description: '気軽に読める分量',
      color: 'text-ios-green'
    };
  } else if (pageCount <= 600) {
    return {
      level: 'moderate',
      label: '少し頑張る',
      description: 'じっくり読むのに適した分量',
      color: 'text-ios-orange'
    };
  } else {
    return {
      level: 'challenging',
      label: '本格的に読む',
      description: '深く学ぶのに適した分量',
      color: 'text-ios-red'
    };
  }
}

/**
 * ASINからAmazonの表紙画像URLを生成する
 * @param asin Amazon商品のASIN
 * @returns 表紙画像URL
 */
export function buildCoverImageUrl(asin: string): string {
  if (!asin || asin.trim() === '') {
    return '';
  }
  return `https://images-na.ssl-images-amazon.com/images/P/${asin.trim()}.SX150.MZZZZZZZ.jpg`;
}

/**
 * Amazon表紙画像URLからASINを抽出する
 * @param coverImageUrl Amazon表紙画像URL
 * @returns ASIN（抽出できない場合は空文字）
 */
export function extractAsinFromCoverUrl(coverImageUrl: string): string {
  if (!coverImageUrl) {
    return '';
  }
  
  // Amazon画像URLのパターンにマッチするかチェック
  const match = coverImageUrl.match(/\/images\/P\/([A-Z0-9]{10})\.SX150\.MZZZZZZZ\.jpg$/);
  return match ? match[1] : '';
}