// GA4 Analytics Utilities

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

/**
 * Amazonリンククリックイベントのパラメータ
 */
export interface AmazonLinkClickParams {
  book_title: string;
  book_author: string;
  book_id: string;
  amazon_url: string;
  source_page: 'results' | 'search';
  click_position?: number;
  recommendation_score?: number;
}

/**
 * GA4にAmazonリンククリックイベントを送信
 * @param params イベントパラメータ
 */
export const trackAmazonLinkClick = (params: AmazonLinkClickParams): void => {
  try {
    // GA4が利用可能かチェック
    if (typeof window === 'undefined' || !window.gtag) {
      console.warn('GA4 is not available');
      return;
    }

    // イベントパラメータを構築
    const eventParams = {
      page_location: window.location.href,
      page_title: document.title,
      book_title: params.book_title,
      book_author: params.book_author,
      book_id: params.book_id,
      amazon_url: params.amazon_url,
      source_page: params.source_page,
      ...(params.click_position !== undefined && { click_position: params.click_position }),
      ...(params.recommendation_score !== undefined && { recommendation_score: params.recommendation_score }),
    };

    // GA4イベントを送信
    window.gtag('event', 'amazon_link_click', eventParams);

    // デバッグログ
    console.log('GA4 Event Sent:', {
      event: 'amazon_link_click',
      parameters: eventParams
    });

  } catch (error) {
    console.error('Failed to track Amazon link click:', error);
  }
};

/**
 * カスタムイベントを送信する汎用関数
 * @param eventName イベント名
 * @param parameters イベントパラメータ
 */
export const trackCustomEvent = (eventName: string, parameters: Record<string, any>): void => {
  try {
    if (typeof window === 'undefined' || !window.gtag) {
      console.warn('GA4 is not available');
      return;
    }

    window.gtag('event', eventName, {
      page_location: window.location.href,
      page_title: document.title,
      ...parameters
    });

    console.log('GA4 Custom Event Sent:', {
      event: eventName,
      parameters
    });

  } catch (error) {
    console.error('Failed to track custom event:', error);
  }
};

/**
 * ページビューを送信
 * @param pageTitle ページタイトル
 * @param pagePath ページパス
 */
export const trackPageView = (pageTitle: string, pagePath: string): void => {
  try {
    if (typeof window === 'undefined' || !window.gtag) {
      console.warn('GA4 is not available');
      return;
    }

    window.gtag('config', 'G-8YPNZ4VYKX', {
      page_title: pageTitle,
      page_location: window.location.href,
      page_path: pagePath
    });

    console.log('GA4 Page View Sent:', {
      page_title: pageTitle,
      page_path: pagePath
    });

  } catch (error) {
    console.error('Failed to track page view:', error);
  }
};

/**
 * GA4の初期化状態をチェック
 */
export const isGA4Available = (): boolean => {
  return typeof window !== 'undefined' && 
         typeof window.gtag === 'function' && 
         Array.isArray(window.dataLayer);
};

/**
 * デバッグ用：現在のdataLayerの内容を表示
 */
export const debugDataLayer = (): void => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    console.log('Current dataLayer:', window.dataLayer);
  } else {
    console.log('dataLayer is not available');
  }
};