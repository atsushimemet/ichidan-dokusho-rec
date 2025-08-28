import { Archive } from '@/types';

// モックデータ - 実際のプロダクションではAPIまたはデータベースから取得
export const mockArchives: Archive[] = [
  {
    id: '1',
    title: '村上春樹の文学世界を探る',
    link: 'https://example.com/articles/haruki-murakami-analysis',
    description: '現代日本文学の巨匠・村上春樹の作品に見られる幻想的リアリズムと現代社会への洞察について深く掘り下げた記事です。',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    title: '江戸時代の読書文化',
    link: 'https://example.com/articles/edo-reading-culture',
    description: '江戸時代における庶民の読書習慣と貸本屋の発展について、当時の資料を基に詳細に解説しています。',
    created_at: '2024-01-20T14:30:00Z',
    updated_at: '2024-01-20T14:30:00Z',
  },
  {
    id: '3',
    title: '科学書の読み方・選び方',
    link: 'https://example.com/articles/how-to-read-science-books',
    description: '専門的な科学書を効率的に読むためのテクニックと、レベル別おすすめ書籍の紹介をまとめた実践的ガイドです。',
    created_at: '2024-02-01T09:15:00Z',
    updated_at: '2024-02-01T09:15:00Z',
  },
  {
    id: '4',
    title: 'デジタル時代の読書論',
    link: 'https://example.com/articles/reading-in-digital-age',
    description: '電子書籍とスマートフォンが普及した現代において、読書体験がどう変化しているかを考察した論考です。',
    created_at: '2024-02-10T16:45:00Z',
    updated_at: '2024-02-10T16:45:00Z',
  },
  {
    id: '5',
    title: '古典文学入門ガイド',
    link: 'https://example.com/articles/classical-literature-guide',
    description: '源氏物語から枕草子まで、日本古典文学の魅力と現代での読み方について、初心者にも分かりやすく解説しています。',
    created_at: '2024-02-15T11:20:00Z',
    updated_at: '2024-02-15T11:20:00Z',
  },
  {
    id: '6',
    title: '翻訳文学の楽しみ方',
    link: 'https://example.com/articles/enjoying-translated-literature',
    description: '海外文学を日本語で楽しむ際のポイントと、優れた翻訳者たちの仕事について詳しく紹介した記事です。',
    created_at: '2024-02-20T13:10:00Z',
    updated_at: '2024-02-20T13:10:00Z',
  },
  {
    id: '7',
    title: 'ビジネス書の効果的な読書法',
    link: 'https://example.com/articles/business-book-reading-methods',
    description: 'ビジネス書から最大限の学びを得るための読書戦略と、実践的なノート術について解説しています。',
    created_at: '2024-02-25T08:30:00Z',
    updated_at: '2024-02-25T08:30:00Z',
  },
  {
    id: '8',
    title: '子どもの読書習慣を育てる',
    link: 'https://example.com/articles/cultivating-childrens-reading-habits',
    description: '幼児期から小学生まで、年齢に応じた読書指導の方法と、家庭でできる読書環境づくりのコツを紹介します。',
    created_at: '2024-03-01T15:00:00Z',
    updated_at: '2024-03-01T15:00:00Z',
  }
];

// アーカイブ検索機能（将来的にAPIに置き換え）
export const searchArchives = async (
  query?: string,
  page: number = 1,
  limit: number = 20
): Promise<{ archives: Archive[]; total: number; hasMore: boolean }> => {
  // 実際のAPIコールをシミュレート
  await new Promise(resolve => setTimeout(resolve, 300));
  
  let filteredArchives = [...mockArchives];
  
  // クエリがある場合はフィルタリング
  if (query && query.trim()) {
    const searchTerm = query.toLowerCase();
    filteredArchives = filteredArchives.filter(archive =>
      archive.title.toLowerCase().includes(searchTerm) ||
      archive.description.toLowerCase().includes(searchTerm)
    );
  }
  
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedArchives = filteredArchives.slice(startIndex, endIndex);
  
  return {
    archives: paginatedArchives,
    total: filteredArchives.length,
    hasMore: endIndex < filteredArchives.length
  };
};