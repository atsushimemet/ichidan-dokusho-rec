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
  if (pageCount <= 200) {
    return {
      level: 'easy',
      label: '読みやすい',
      description: '気軽に読める分量',
      color: 'text-ios-green'
    };
  } else if (pageCount <= 400) {
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