export interface Character {
  id: string;
  name: string;
  category: 'Hero' | 'Villain' | 'Support' | 'Neutral';
  year: number;
  creator: string;
  placeholder: boolean;
  pinned?: boolean;     // pinned = 아카이브 맨 위에 고정
  thumbnail?: string;   // preview 그리드 이미지
  sheet?: string;       // 라이트박스 풀이미지
  url?: string;         // 외부 창작자 링크
}

export const characters: Character[] = [
  {
    id: 'WI-000',
    name: 'Po',
    category: 'Neutral',
    year: 2023,
    creator: 'Yong',
    placeholder: false,
    pinned: true,
    thumbnail: '/characters/Po_Yong_2023.png',
    url: 'https://www.behance.net/gallery/210641289/Portfoilo',
  },
  { id: 'WI-001', name: 'Dolin',    category: 'Neutral', year: 2025, creator: 'Jin',    placeholder: false, thumbnail: '/characters/Dolin_Jin_2025.png' },
  { id: 'WI-002', name: 'Dust',     category: 'Neutral', year: 2025, creator: 'Eun',    placeholder: false, thumbnail: '/characters/Dust_Eun_2025.png' },
  { id: 'WI-003', name: 'Gomnigiri',category: 'Neutral', year: 2025, creator: 'Min',    placeholder: false, thumbnail: '/characters/Gomnigiri_Min_2025.png' },
  { id: 'WI-004', name: 'Hongbi',   category: 'Neutral', year: 2025, creator: 'Hye',    placeholder: false, thumbnail: '/characters/Hongbi_Hye_2025.png' },
  { id: 'WI-005', name: 'Lulumi',   category: 'Neutral', year: 2025, creator: 'Mi',     placeholder: false, thumbnail: '/characters/Lulumi_Mi_2025.png' },
  { id: 'WI-006', name: 'Marmelo',  category: 'Neutral', year: 2025, creator: 'lyn',    placeholder: false, thumbnail: '/characters/Marmelo-lyn_2025.png' },
  { id: 'WI-007', name: 'Nubi',     category: 'Neutral', year: 2025, creator: 'Yejin',  placeholder: false, thumbnail: '/characters/Nubi_Yejin_2025.png' },
  { id: 'WI-008', name: 'Puddin',   category: 'Neutral', year: 2025, creator: 'Naseon', placeholder: false, thumbnail: '/characters/Puddin_Naseon_2025.png' },
  { id: 'WI-009', name: 'Starry',   category: 'Neutral', year: 2025, creator: 'Chu',    placeholder: false, thumbnail: '/characters/Starry_Chu_2025.png' },
  { id: 'WI-010', name: 'Woo-Tang', category: 'Neutral', year: 2025, creator: 'Sung',   placeholder: false, thumbnail: '/characters/Woo-Tang_Sung_2025.png' },
];
