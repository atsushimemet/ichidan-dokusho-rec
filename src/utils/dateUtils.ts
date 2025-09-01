/**
 * 週の開始日（月曜日）を計算する関数
 * 日本時間基準で、月末・月初の週は次月の最初の完全な週として扱う
 * 
 * @param date 基準日（省略時は現在日）
 * @returns 週の開始日（月曜日）のISO文字列（YYYY-MM-DD形式）
 */
export function getWeekStartDate(date: Date = new Date()): string {
  // 日本時間に変換
  const jstDate = new Date(date.getTime() + (9 * 60 * 60 * 1000));
  const dayOfWeek = jstDate.getDay();
  const currentMonth = jstDate.getMonth();
  
  // 通常の週計算（月曜日基準）
  const monday = new Date(jstDate);
  const daysToSubtract = (dayOfWeek + 6) % 7; // 月曜日=0, 火曜日=1, ..., 日曜日=6
  monday.setDate(jstDate.getDate() - daysToSubtract);
  
  // 月末・月初の特別処理
  // 土曜日・日曜日が月の最初の2日間にある場合、次の月曜日を週開始とする
  if ((dayOfWeek === 0 || dayOfWeek === 6) && jstDate.getDate() <= 2) {
    // 次の月曜日を探す
    const nextMonday = new Date(jstDate);
    const daysToAdd = dayOfWeek === 0 ? 1 : 2; // 日曜日なら+1日、土曜日なら+2日
    nextMonday.setDate(jstDate.getDate() + daysToAdd);
    return nextMonday.toISOString().split('T')[0];
  }
  
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
 * 
 * @param registrationDate 書籍の登録日
 * @returns その書籍が属するべき週の開始日（月曜日）
 */
export function getWeekStartDateForRegistration(registrationDate: Date = new Date()): string {
  return getWeekStartDate(registrationDate);
}