-- 店舗テーブルに都道府県と市区町村カラムを追加
ALTER TABLE stores 
ADD COLUMN IF NOT EXISTS prefecture VARCHAR(50),
ADD COLUMN IF NOT EXISTS city VARCHAR(100);

-- 都道府県と市区町村のインデックスを追加（検索パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_stores_prefecture ON stores (prefecture);
CREATE INDEX IF NOT EXISTS idx_stores_city ON stores (city);

-- 既存データに都道府県と市区町村を追加
UPDATE stores SET prefecture = '東京都', city = '港区' WHERE name = '青山ブックセンター本店';
UPDATE stores SET prefecture = '東京都', city = '渋谷区' WHERE name = '蔦屋書店 代官山店';
UPDATE stores SET prefecture = '東京都', city = '渋谷区' WHERE name = 'SHIBUYA TSUTAYA';
UPDATE stores SET prefecture = '東京都', city = '千代田区' WHERE name = '丸善 丸の内本店';
UPDATE stores SET prefecture = '東京都', city = '新宿区' WHERE name = '紀伊國屋書店 新宿本店';

-- 神奈川の書店サンプルデータを追加
INSERT INTO stores (name, prefecture, city, sns_link, google_map_link, description) VALUES
('有隣堂 横浜駅西口店', '神奈川県', '横浜市', 'https://twitter.com/yurindobooks', 'https://maps.google.com/?q=有隣堂横浜駅西口店', '横浜の老舗書店。地域密着型の品揃えが魅力。'),
('TSUTAYA 横浜みなとみらい店', '神奈川県', '横浜市', 'https://twitter.com/tsutaya_mm', 'https://maps.google.com/?q=TSUTAYA横浜みなとみらい店', 'みなとみらいの景色を楽しみながら本が読める。'),
('ブックファースト青葉台店', '神奈川県', '横浜市', 'https://twitter.com/bookfirst_aoba', 'https://maps.google.com/?q=ブックファースト青葉台店', '青葉台駅直結の便利な立地。幅広いジャンルの本を扱う。');