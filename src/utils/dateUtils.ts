/**
 * 週の開始日（月曜日）を計算する関数
 * 日曜日は翌週の開始週として扱う
 * 
 * @param date 基準日（省略時は現在日）
 * @returns 週の開始日（月曜日）のISO文字列（YYYY-MM-DD形式）
 */
export function getWeekStartDate(date: Date = new Date()): string {
  const targetDate = new Date(date);
  const dayOfWeek = targetDate.getDay();
  
  if (dayOfWeek === 0) {
    // 日曜日の場合は翌日（月曜日）を週の開始日とする
    targetDate.setDate(targetDate.getDate() + 1);
  } else {
    // 月曜日〜土曜日の場合は、その週の月曜日を計算
    const daysToSubtract = dayOfWeek - 1;
    targetDate.setDate(targetDate.getDate() - daysToSubtract);
  }
  
  return targetDate.toISOString().split('T')[0];
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
 * 
 * @param registrationDate 書籍の登録日
 * @returns その書籍が属するべき週の開始日（月曜日）
 */
export function getWeekStartDateForRegistration(registrationDate: Date = new Date()): string {
  return getWeekStartDate(registrationDate);
}