/**
 * 週の開始日（月曜日）を計算する関数
 * 日本時間基準でISO週計算（月曜日開始、日曜日は前週扱い）
 * 
 * @param date 基準日（省略時は現在日）
 * @returns 週の開始日（月曜日）のISO文字列（YYYY-MM-DD形式）
 */
export function getWeekStartDate(date: Date = new Date()): string {
  // 日本時間での日付文字列を取得
  const jstDateStr = date.toLocaleString('en-CA', {timeZone: 'Asia/Tokyo'}).split(',')[0];
  const jstDate = new Date(jstDateStr + 'T00:00:00');
  const dayOfWeek = jstDate.getDay();
  
  // ISO週計算（月曜日=0, 火曜日=1, ..., 日曜日=6）
  const daysToSubtract = (dayOfWeek + 6) % 7;
  const monday = new Date(jstDate);
  monday.setDate(jstDate.getDate() - daysToSubtract);
  
  return monday.toISOString().split('T')[0];
}

/**
 * 指定した日付が属する週の表示用文字列を取得
 * 
 * @param date 基準日
 * @returns 週の表示文字列（例: "2024-09-02週"）
 */
export function getWeekDisplayString(date: Date = new Date()): string {
  const weekStart = getWeekStartDate(date);
  return `${weekStart}週`;
}

/**
 * 書籍登録日から適切な週開始日を計算する
 * 管理画面での書籍登録時に使用
 * 日曜日に登録した場合は直前の月曜日を返す
 * 
 * @param registrationDate 書籍の登録日
 * @returns その書籍が属するべき週の開始日（月曜日）
 */
export function getWeekStartDateForRegistration(registrationDate: Date = new Date()): string {
  return getWeekStartDate(registrationDate);
}