-- デバッグ用関数

-- ENUMタイプの値を取得する関数
CREATE OR REPLACE FUNCTION get_enum_values()
RETURNS TABLE(type_name text, enum_value text) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.typname::text as type_name,
    e.enumlabel::text as enum_value
  FROM pg_type t 
  JOIN pg_enum e ON t.oid = e.enumtypid 
  WHERE t.typname IN ('quiz_type', 'quiz_status', 'notification_channel', 'notification_status')
  ORDER BY t.typname, e.enumlabel;
END;
$$ LANGUAGE plpgsql;

-- テーブル存在確認用関数
CREATE OR REPLACE FUNCTION check_table_exists(table_name text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = $1
  );
END;
$$ LANGUAGE plpgsql;