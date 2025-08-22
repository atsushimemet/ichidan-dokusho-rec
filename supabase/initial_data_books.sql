-- 一段読書システム 書籍初期データ投入SQL

-- 書籍の初期データ
INSERT INTO books (title, author, genre_tags, amazon_link, summary_link, description, page_count, price) VALUES
-- ビジネス・起業家関連
('かもめが翔んだ日', '江副浩正', ARRAY['起業家', 'リクルート', '江副浩正'], 'https://amzn.to/3Jv4OwB', NULL, 'リクルート創業者による起業の記録', 320, 1540),
('ネット興亡記 敗れざる者たち', '日本経済新聞出版', ARRAY['起業家', '歴史', 'IT', '藤田晋', '堀江貴文', '宇野康秀', '三木谷浩史', '山田進太郎', '熊谷正寿', 'サイバーエージェント', 'ライブドア', '楽天', 'メルカリ', 'GMO'], 'https://amzn.asia/d/7cTcwLq', NULL, '日本のIT起業家たちの興亡史', 400, 1980),
('渋谷ではたらく社長の告白', '幻冬舎文庫', ARRAY['起業家', '藤田晋', 'サイバーエージェント'], 'https://amzn.to/4me8ilL', NULL, 'サイバーエージェント創業者の経営哲学', 280, 880),
('問題児　三木谷浩史の育ち方', '幻冬舎文庫', ARRAY['起業家', '三木谷浩史', '楽天'], 'https://amzn.to/46Wh6rS', NULL, '楽天創業者の成長記録', 240, 880),
('一勝九敗', '柳井正', ARRAY['起業家', '柳井正', 'ファーストリテイリング'], 'https://amzn.to/3ULJHc9', NULL, 'ユニクロ創業者の経営哲学', 320, 880),
('憂鬱でなければ、仕事じゃない', '見城徹', ARRAY['ビジネス書', '見城徹'], 'https://amzn.to/45MgmEp', NULL, '幻冬舎社長の仕事論', 280, 880),
('絶望しきって死ぬために、今を熱狂して生きろ', '見城徹', ARRAY['ビジネス書', '見城徹'], 'https://amzn.to/45NzkdR', NULL, '人生を熱狂的に生きる方法', 240, 880),
('起業家', '幻冬舎文庫', ARRAY['起業家', 'サイバーエージェント', 'ライブドア'], 'https://amzn.to/4owdJ0S', NULL, '起業家たちの物語', 300, 880),
('多動力', '堀江貴文', ARRAY['起業家', '堀江貴文', 'ライブドア'], 'https://amzn.to/4fTxxHX', NULL, '複数の事業を同時に進める方法', 280, 880),

-- 自己啓発・心理学
('置かれた場所で咲きなさい', '幻冬舎文庫', ARRAY['哲学', 'セルフケア'], 'https://amzn.to/4lrknCS', NULL, '人生の哲学とセルフケア', 240, 880),
('嫌われる勇気', '岸見一郎', ARRAY['心理学', '自己啓発', 'アドラー心理学'], 'https://amzn.to/4mDw3U7', NULL, 'アドラー心理学の入門書', 296, 1650),
('完訳 7つの習慣', 'スティーブン・R・コヴィー', ARRAY['自己啓発', '習慣'], 'https://amzn.to/3Jvcejr', NULL, '成功のための7つの習慣', 560, 2420),
('人を動かす　改訂文庫版', 'デール・カーネギー', ARRAY['自己啓発', 'コミュニケーション', 'ビジネス'], 'https://amzn.to/4lo6ENe', NULL, '人間関係の古典的名著', 320, 1540),
('ゼロ　なにもない自分に小さなイチを足していく', '堀江貴文', ARRAY['起業家', '堀江貴文', '自己啓発'], 'https://amzn.to/46PIkQP', NULL, 'ゼロから始める人生論', 240, 1540),

-- エンターテイメント
('Okiraku 3', '草彅剛', ARRAY['草彅剛', 'アイドル'], 'https://amzn.to/3JdYgT2', NULL, 'SMAP草彅剛のエッセイ', 200, 1540),

-- SF・科学
('クリプトノミコン１　チューリング', 'ハヤカワ文庫SF', ARRAY['SF', '数学', '暗号'], 'https://amzn.to/4mFu4P6', NULL, '暗号と数学をテーマにしたSF小説', 400, 880),
('無能より邪悪であれ　ピーター・ティール', 'ピーターティール', ARRAY['起業家', 'ピーターティール'], 'https://amzn.to/3Hw2ULK', NULL, 'PayPal創業者の思想', 320, 1980),
('ゼロ・トゥ・ワン　君はゼロから何を生み出せるか', 'ピーターティール', ARRAY['起業家', 'ピーターティール', '事業開発'], 'https://amzn.to/47yqJwS', NULL, 'スタートアップの本質', 280, 1980),

-- ファッション・ライフスタイル
('The Squarzi Archive: The Vintage Collection', 'イタリアファッションアイコン', ARRAY['ファッション', 'ヴィンテージ'], 'https://amzn.to/3Hw5IID', NULL, 'ヴィンテージファッションのアーカイブ', 300, 5000),
('アパレル興亡', 'アパレル業界', ARRAY['ファッション', '歴史'], 'https://amzn.to/41DrTDy', NULL, 'アパレル業界の歴史', 280, 1980),

-- 社会問題・労働
('アマゾンの倉庫で絶望し、ウーバーの車で発狂した', '労働問題', ARRAY['労働'], 'https://amzn.to/45Obsqw', NULL, '現代の労働問題を描いたルポルタージュ', 240, 1540),
('「AV女優」の社会学', '社会学', ARRAY['社会問題'], 'https://amzn.to/4mf8cdR', NULL, '社会学的視点からの研究', 320, 1980),
('デリヘルドライバー', '労働問題', ARRAY['労働'], 'https://amzn.to/41ztomg', NULL, '現代の労働実態', 240, 1540),

-- 教育・子育て
('ケーキの切れない非行少年たち', '子育て', ARRAY['子育て'], 'https://amzn.to/45irGrO', NULL, '非行少年の背景と教育', 240, 880),

-- 経営・マネジメント
('インテル戦略転換', '経営', ARRAY['経営'], 'https://amzn.to/3UWdbDZ', NULL, 'インテルの経営戦略', 320, 1980),

-- 映画・エンタメ
('坂元裕二オリジナルシナリオブック', '映画', ARRAY['映画'], 'https://amzn.to/4n0tADF', 'https://youtu.be/P6HSCFibupE?si=ox6kFhR2xHhlJ_yf', '映画のシナリオブック', 200, 3000),

-- リーダーシップ・マネジメント
('ファシリテーションの教科書', 'リーダーシップ', ARRAY['ファシリテーション', 'リーダーシップ', 'マネージャー'], 'https://amzn.to/41H3ZqO', 'https://youtu.be/0YmFfOS8fQE?si=uOS0nco7vslIdrlt', 'ファシリテーション技術の教科書', 280, 1980),

-- 経済・投資
('ヤバい経済学', '経済学', ARRAY['経済'], 'https://amzn.to/4mmGPyA', 'https://youtu.be/JJyAR5TqwzQ?si=qsXzS1-z39wn5gD8', '経済学の面白い解説', 320, 880),
('わが投資術', '投資', ARRAY['投資'], 'https://amzn.to/3JcBife', 'https://youtu.be/UrCuJid_asg?si=PuUpBCdNI1qzvkf4', '投資の実践的ノウハウ', 280, 1540),

-- サステナビリティ
('レスポンシブル・カンパニーの未来', 'パタゴニア', ARRAY['SDGs'], 'https://amzn.to/41Hy9Kz', 'https://dhbr.diamond.jp/subcategory/%E3%83%AC%E3%82%B9%E3%83%9D%E3%83%B3%E3%82%B7%E3%83%96%E3%83%AB%E3%83%BB%E3%82%AB%E3%83%B3%E3%83%91%E3%83%8B%E3%83%BC%E3%81%AE%E6%9C%AA%E6%9D%A5%E2%94%80%E2%94%80%E3%83%91%E3%82%BF%E3%82%B4%E3%83%8B%E3%82%A2%E3%81%8C50%E5%B9%B4%E3%81%8B%E3%81%91%E3%81%A6%E5%AD%A6%E3%82%93%E3%81%A0%E3%81%93%E3%81%A8', 'パタゴニアのサステナビリティ戦略', 300, 1980),
('レスポンシブル・カンパニー', 'パタゴニア', ARRAY['SDGs'], 'https://amzn.to/4oNMU8O', 'https://note.com/nishi19/n/n9874065108a3', '企業の社会的責任', 280, 1980),

-- 小説・文学
('もう明日が待っている', '文春e-book', ARRAY['小説'], 'https://amzn.to/4165Oxr', 'https://youtu.be/wEIyuqVcixo?si=LnMckut_0Hx6Iv0r', '現代小説', 240, 880),
('西の魔女が死んだ', '新潮文庫', ARRAY['小説'], 'https://amzn.to/4fA4Mzx', 'https://youtu.be/iAuw_De_qrE?si=uphLdePchpa58NjF', '児童文学', 200, 880),

-- 思考・問題解決
('思考の整理学', 'ちくま文庫', ARRAY['思考法', '問題解決'], 'https://amzn.to/46Up58M', 'https://youtu.be/5w5EIc9crAE?si=tY4DGXKxBmWRW71i', '思考を整理する方法', 240, 880),
('世界が変わる「視点」の見つけ方', '集英社新書', ARRAY['デザイン', '問題解決'], 'https://amzn.to/4mFvdWU', 'https://note.com/date_otoko_2020/n/n08136701b033', 'デザイン思考の入門書', 200, 880),

-- 建築・都市
('ひとの住処―1964-2020―', '新潮新書', ARRAY['建築'], 'https://amzn.to/4mpoh0g', 'https://note.com/torinokimoti/n/n3045a28fe897', '建築と都市の歴史', 240, 880),

-- 技術・エンジニアリング
('実践ソフトウェアエンジニアリング', 'エンジニアリング', ARRAY['エンジニアリング'], 'https://amzn.to/3UWswEu', 'https://zenn.dev/gatechnologies/articles/6bd0b193f6c617', 'ソフトウェアエンジニアリングの実践', 400, 3000),

-- 科学・物理
('学び直し高校物理', '講談社現代新書', ARRAY['物理', 'リスキリング'], 'https://amzn.to/45sLHe4', 'https://gendai.media/articles/-/148227?imp=0', '物理の学び直し', 240, 880),

-- 生活・食事
('コーヒーが冷めないうちに', '食事', ARRAY['食事'], 'https://amzn.to/4fDedOQ', 'https://youtu.be/VYLRogKjuik?si=VkqMJHHo9uRj2HDO', 'コーヒーに関する物語', 200, 880),

-- 文学・小説
('永遠の出口', '集英社文庫', ARRAY['小説'], 'https://amzn.to/411e7L0', 'https://note.com/kiyoboe/n/n9f4805c8a27c', '現代文学', 240, 880),

-- 経済・ノーベル賞
('アニマルスピリット', 'ノーベル賞受賞者', ARRAY['経済', 'ノーベル賞受賞者'], 'https://amzn.to/45qsXxf', 'https://youtu.be/JifUVb7sqDc?si=KF0Iiv16He5uojAJ', '行動経済学の名著', 320, 1980),

-- コミュニケーション
('超一流の会話力', 'きずな出版', ARRAY['コミュニケーション'], 'https://amzn.to/45nu0wk', 'https://youtu.be/wwNog9q-moM?si=OVK54WWbToFikWT5', '会話力向上のノウハウ', 240, 1540),

-- 政治・外交
('ワインと外交', '新潮新書', ARRAY['政治'], 'https://amzn.to/47doU8P', NULL, '外交とワインの関係', 200, 880),

-- 洋書・マネジメント
('Managing Your Boss', 'Harvard Business Review', ARRAY['洋書', 'マネージャー'], 'https://amzn.to/45yCwc7', 'https://smrmkt.hatenablog.jp/entry/2016/05/06/171450', '上司との関係構築', 150, 2000),

-- 健康・ライフスタイル
('脳と身体を最適化せよ！', '健康', ARRAY['健康'], 'https://amzn.to/3J7agG7', 'https://youtu.be/s2tCuMLV8_I?si=JwXpiFBJHciJ_KA8', '脳と身体の最適化', 320, 1980),

-- 技術・プログラミング
('CODE コードから見たコンピュータのからくり', '技術', ARRAY['エンジニアリング'], 'https://amzn.to/46PuCxj', 'https://qiita.com/yusuke_blog1026/items/2e60c90f56537a45f2ad', 'コンピュータの仕組み', 400, 2200),

-- 事業開発・スケール
('マスター・オブ・スケール', '事業開発', ARRAY['事業開発'], 'https://amzn.to/416MTTc', 'https://aty800.com/highest-goal/books/masters-of-scale.html', '事業拡大のルール', 400, 2500),

-- 歴史・人類学
('世界をつくった６つの革命の物語', '朝日文庫', ARRAY['歴史', '人類学'], 'https://amzn.to/45fx3bf', 'https://note.com/asahi_books/n/na3eaaadc539d', '人類の進化史', 400, 880),

-- 思考・問題解決
('入門 考える技術・書く技術', '思考法', ARRAY['思考法', '問題解決'], 'https://amzn.to/4fzXhbO', 'https://youtu.be/mcVAVz0kwmE?si=kdC_B-en8INA7_jK', '思考と文章の技術', 240, 1540),
('新版　考える技術・書く技術', '思考法', ARRAY['思考法', '問題解決'], 'https://amzn.to/3HzDH2Z', 'https://youtu.be/6pj1IxTqG18?si=rF9nhyn8yDnKzWL0', 'ピラミッド原則', 320, 1980),

-- デザイン・UI
('UIデザインの教科書', 'デザイン', ARRAY['デザイン'], 'https://amzn.to/3HsAJNM', 'https://qiita.com/shion01/items/69142086ba04b3baf669', 'UIデザインの基礎', 300, 2500),

-- 技術・HTML
('HTML解体新書', 'エンジニアリング', ARRAY['エンジニアリング'], 'https://amzn.to/3JfklAU', 'https://engineer.crowdworks.jp/entry/html-anatomische-tabell', 'HTMLの詳細解説', 400, 3000),

-- 思考・地頭力
('地頭力を鍛える', '思考法', ARRAY['思考法'], 'https://amzn.to/4lpendO', 'https://youtu.be/-T-ogqcMUl4?si=LtqAk1nWxOFzYBvE', '地頭力の鍛え方', 240, 1540),

-- 小説・推理
('タルト・タタンの夢', '創元推理文庫', ARRAY['小説'], 'https://amzn.to/45JJxrP', 'https://note.com/tetten/n/na7b9a5c15c12', '推理小説', 300, 880),
('ヴァン・ショーをあなたに', '創元推理文庫', ARRAY['小説'], 'https://amzn.to/3Ur5sh2', 'https://note.com/kotemari611/n/n75986289ae5a', '推理小説', 280, 880),

-- 組織・戦略
('失敗の本質', '中公文庫', ARRAY['組織', 'チーム'], 'https://amzn.to/4oywYHj', 'https://youtu.be/och4WBCWjLM?si=fosxEk-BHXcJnjNY', '日本軍の組織論的研究', 400, 880),
('学習する組織', '組織', ARRAY['組織', 'チーム'], 'https://amzn.to/3Jjxwk5', 'https://note.com/chelazabu/n/n53cb52a6def3', '組織学習の理論', 400, 2500),

-- アジャイル・プロジェクト管理
('みんなでアジャイル', 'アジャイル', ARRAY['プロダクト開発', 'プロセス'], 'https://amzn.to/4lu578d', 'https://dev.classmethod.jp/articles/review-agile-for-everybody/', 'アジャイル開発の実践', 300, 2200),
('LeanとDevOpsの科学', 'DevOps', ARRAY['プロダクト開発', '組織', 'プロセス'], 'https://amzn.to/3Jf2aLx', 'https://youtu.be/F0HP0q2xYyA?si=rfrp3-Coy9tt0xkd', 'DevOpsと組織変革', 400, 3000),
('プロジェクトマネジメント知識体系ガイド', 'PMI', ARRAY['マネージャー', 'プロセス'], 'https://amzn.to/3Jd5syS', 'https://youtu.be/cTmVyayN6xg?si=NpXwkUXEsgYVcM8o', 'PMBOKガイド', 600, 4000),
('アジャイルな見積りと計画づくり', 'アジャイル', ARRAY['プロダクト開発', '計画'], 'https://amzn.to/45y1UP4', 'https://youtu.be/O9Q08yRU9PE?si=i5Il76iAP6MPZiqV', 'アジャイル見積り', 300, 2200),

-- 小説・文学賞
('カフネ', '小説', ARRAY['小説', '本屋大賞'], 'https://amzn.to/4mIDU2Q', 'https://youtu.be/NW0cQV0s-i8?si=sZkXsaoNcULuYkRe', '本屋大賞受賞作', 300, 880),
('成瀬は天下を取りにいく', '新潮文庫', ARRAY['小説', '本屋大賞'], 'https://amzn.to/4oUabpJ', 'https://youtu.be/z8tW5S9RAes?si=OnzukvuAm6Gc3ghi', '本屋大賞受賞作', 280, 880),
('汝、星のごとく', '講談社文庫', ARRAY['小説', '本屋大賞'], 'https://amzn.to/46RQh86', 'https://youtu.be/HV07iN7qE6Y?si=wSjKFX-VRqUy2Wqf', '本屋大賞受賞作', 320, 880),
('同志少女よ、敵を撃て', 'ハヤカワ文庫JA', ARRAY['小説', '本屋大賞'], 'https://amzn.to/3Hs3NVK', 'https://youtu.be/_9-Q0St2X1k?si=wMjf16umLw4uvlaj', '本屋大賞受賞作', 400, 880),

-- 小説・現代文学
('52ヘルツのクジラたち', '中公文庫', ARRAY['小説'], 'https://amzn.to/4165Oxr', 'https://youtu.be/d9YiEnITij0?si=ox18i0t65S9SnmxW', '現代小説', 280, 880),
('流浪の月', '創元文芸文庫', ARRAY['小説'], 'https://amzn.to/4mkzKOU', 'https://youtu.be/iLFiNWLpC4w?si=HNZdMW19uBsN5WO-', '現代文学', 300, 880),

-- 投資・マネー
('本当の自由を手に入れる お金の大学', '投資', ARRAY['投資'], 'https://amzn.to/417JmUK', 'https://youtu.be/aEpmIGxnZZE?si=XchbLi4k3lMQRYb9', 'お金の自由を手に入れる方法', 300, 1540),

-- 小説・文学
('羊と鋼の森', '文春文庫', ARRAY['小説'], 'https://amzn.to/418MNKJ', 'https://hyakuhon.com/novel/%E3%80%8E%E7%BE%8A%E3%81%A8%E9%8B%BC%E3%81%AE%E6%A3%AE%E3%80%8F%E3%83%8D%E3%82%BF%E3%83%90%E3%83%AC%E8%A7%A3%E8%AA%AC_%E5%AE%AE%E4%B8%8B%E5%A5%88%E9%83%BD%E3%80%90%E8%91%97%E3%80%91/', '現代小説', 240, 880),
('鹿の王　１', '角川文庫', ARRAY['小説'], 'https://amzn.to/4fL8NBs', 'https://cinemarche.net/anime/shikanoou-sigemi/', 'ファンタジー小説', 400, 880),
('村上海賊の娘（一）', '新潮文庫', ARRAY['小説'], 'https://amzn.to/472ifya', 'https://synopsis-note.com/daughter-of-the-murakami-pirates/', '歴史小説', 400, 880),
('海賊とよばれた男（上）', '講談社文庫', ARRAY['小説'], 'https://amzn.to/4mR81Fw', 'https://cinemarche.net/drama/kaizoku-movie/', '歴史小説', 400, 880),
('舟を編む', '光文社文庫', ARRAY['小説'], 'https://amzn.to/3HGmzbT', 'https://hyakuhon.com/novel/hunewoamu/', '現代小説', 300, 880),
('謎解きはディナーのあとで', '小学館文庫', ARRAY['小説'], 'https://amzn.to/3JjgJxx', 'https://readover5.hatenablog.com/entry/2024/12/28/190227', '推理小説', 300, 880),
('天地明察（特別合本版）', '角川文庫', ARRAY['小説'], 'https://amzn.to/4mnmsRK', 'https://sodehuri.com/top-bottom/', '歴史小説', 600, 1200),
('告白', '双葉文庫', ARRAY['小説'], 'https://amzn.to/45VJV6E', 'https://hyakuhon.com/novel/%E5%BE%B9%E5%BA%95%E3%83%8D%E3%82%BF%E3%83%90%E3%83%AC%E8%A7%A3%E8%AA%AC%EF%BC%81%E3%80%8E%E5%91%8A%E7%99%BD%E3%80%8F%E6%B9%8A%E3%81%8B%E3%81%AA%E3%81%88%E3%80%90%E8%91%97%E3%80%91/', '現代小説', 300, 880),
('ゴールデンスランバー（新潮文庫）', '新潮文庫', ARRAY['小説'], 'https://amzn.to/4mkm7z1', 'https://hyakuhon.com/novel/golden-slumber/', '現代小説', 400, 880),
('一瞬の風になれ　第一部　イチニツイテ', '講談社文庫', ARRAY['小説'], 'https://amzn.to/45mh2Al', 'https://koyoin.com/dk_isshunnokazeninare/', '現代小説', 400, 880),

-- 技術・歴史
('未来をつくった人々', 'Apple', ARRAY['Apple', '歴史'], 'https://amzn.to/3HuVCIc', 'http://www.kana-smart.sakura.ne.jp/New-SMART-12-07-23/mirai0114.html', 'コンピュータの歴史', 400, 2500),

-- スタートアップ・事業開発
('「世界」を変えろ! 急成長するスタートアップの秘訣', '事業開発', ARRAY['事業開発'], 'https://amzn.to/4mH1VXY', 'https://www.idaten.vc/post/%E3%82%B9%E3%82%BF%E3%83%BC%E3%83%88%E3%82%A2%E3%83%83%E3%83%97%E3%81%A8%E6%88%90%E7%86%9F%E4%BC%81%E6%A5%AD%E3%82%92%E5%88%86%E3%81%91%E3%82%8B%E3%80%8C%E3%83%AA%E3%82%BD%E3%83%BC%E3%82%B9%E3%80%8D%E3%81%AB%E3%81%A4%E3%81%84%E3%81%A6%E3%80%9C%E6%99%82%E9%96%93%E3%81%A8%E3%82%A8%E3%83%8D%E3%83%AB%E3%82%AE%E3%83%BC%E3%81%AE%E9%9B%86%E4%B8%AD%E3%80%9C', 'スタートアップの成長戦略', 300, 1980),

-- 起業家・ビジネス
('小澤隆生 凡人の事業論', '小澤隆生', ARRAY['起業家', 'ビジネス書'], 'https://amzn.to/3Jri2up', 'https://note.com/kanatetsu048/n/na7eaac1597ca', '凡人でも成功する事業論', 280, 1540),
('突き抜けるまで問い続けろ', 'ビズリーチ', ARRAY['起業家', 'ビズリーチ', '蛯谷 敏'], 'https://amzn.to/3HwvAV2', 'https://blog.visional.inc/n/ncf851a33f511?gs=b803b9be471e', 'ビズリーチの成長軌跡', 300, 1980),

-- 技術・経営
('爆速経営', 'LINEヤフー', ARRAY['LINEヤフー', '経営'], 'https://amzn.to/4oF5aAW', 'https://blog.shibayu36.org/entry/2014/12/28/182921', 'LINEヤフーの経営手法', 280, 1980);
