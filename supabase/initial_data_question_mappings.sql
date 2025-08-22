-- 一段読書システム 質問マッピング初期データ投入SQL

-- 質問マッピングの初期データ
INSERT INTO question_mappings (question_id, question_type, option_value, mapped_tags, weight) VALUES
-- 質問1: 読書の目的
('purpose', 'single', 'knowledge', ARRAY['教養', '歴史', '哲学', '科学', '社会問題', '人類学'], 1.0),
('purpose', 'single', 'skill', ARRAY['ビジネス', 'スキルアップ', 'プレゼンテーション', 'データ分析', '統計'], 1.0),
('purpose', 'single', 'growth', ARRAY['自己啓発', '成功法則', '習慣', '人生論', 'アドラー心理学', '心理学'], 1.0),
('purpose', 'single', 'relaxation', ARRAY['小説', 'マンガ', 'エンタメ', '文学'], 1.0),

-- 質問2: ジャンル選択（複数選択可）
('genre', 'multiple', '自己啓発', ARRAY['自己啓発', '成功法則', '習慣'], 1.0),
('genre', 'multiple', 'ビジネス', ARRAY['ビジネス', 'スキルアップ', 'プレゼンテーション'], 1.0),
('genre', 'multiple', '心理学', ARRAY['心理学', 'アドラー心理学', 'コミュニケーション'], 1.0),
('genre', 'multiple', '哲学', ARRAY['哲学', '人生論', '思考法'], 1.0),
('genre', 'multiple', '歴史', ARRAY['歴史', '社会問題', '人類学'], 1.0),
('genre', 'multiple', '科学', ARRAY['科学', 'データ分析', '統計'], 1.0),
('genre', 'multiple', '健康', ARRAY['健康', 'ライフスタイル'], 1.0),
('genre', 'multiple', '小説', ARRAY['小説', '文学', 'エンタメ'], 1.0);
