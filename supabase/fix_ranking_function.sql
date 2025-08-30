-- 重複チェック関数の改良版（無限ループ回避）

CREATE OR REPLACE FUNCTION check_and_handle_duplicates(
  p_amazon_link TEXT,
  p_week_start_date DATE
) RETURNS VOID AS $$
DECLARE
  latest_record_id UUID;
  duplicate_count INTEGER;
BEGIN
  -- まず重複があるかチェック
  SELECT COUNT(*) INTO duplicate_count
  FROM ranking_books 
  WHERE amazon_link = p_amazon_link 
    AND week_start_date = p_week_start_date;
  
  -- 重複がない場合は何もしない
  IF duplicate_count <= 1 THEN
    RETURN;
  END IF;
  
  -- 重複がある場合のみ処理を実行
  -- 最新レコードのIDを取得
  SELECT id INTO latest_record_id
  FROM ranking_books 
  WHERE amazon_link = p_amazon_link 
    AND week_start_date = p_week_start_date
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF latest_record_id IS NOT NULL THEN
    -- トリガーを一時的に無効化して更新
    -- （updated_atを更新せずにis_visibleのみ変更）
    UPDATE ranking_books 
    SET is_visible = false
    WHERE amazon_link = p_amazon_link 
      AND week_start_date = p_week_start_date
      AND id != latest_record_id;
    
    -- 最新レコードを表示にする
    UPDATE ranking_books 
    SET is_visible = true
    WHERE id = latest_record_id;
  END IF;
END;
$$ LANGUAGE plpgsql;