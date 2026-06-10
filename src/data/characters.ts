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
  detail?: string;      // 상세페이지 이미지 (link 폴더)
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
  { id: 'WI-011', name: 'Mongsille', category: 'Neutral', year: 2025, creator: 'Hanzhang', placeholder: false, thumbnail: '/characters/Mongsille_Hanzhang_2025.png', url: 'https://www.instagram.com/mongsilee_2025?igsh=MXBlaG54ejIwMDVvdw==' },
  { id: 'WI-012', name: 'Haoyu', category: 'Neutral', year: 2025, creator: 'Puffa', placeholder: false, thumbnail: '/characters/haoyu_puffa_2025.jpg' },
  { id: 'WI-013', name: 'Bloop',   category: 'Neutral', year: 2026, creator: 'Dongho',     placeholder: false, thumbnail: '/characters/Bloop_Dongho_2026.png',    detail: '/characters/link/link_Bloop_Dongho_2026.png' },
  { id: 'WI-014', name: 'Mossibi', category: 'Neutral', year: 2026, creator: 'leeyoonseo', placeholder: false, thumbnail: '/characters/Mossibi_leeyoonseo_2026.png', detail: '/characters/link/link_Mossibi_leeyoonseo_2026.png' },
  { id: 'WI-015', name: 'Jitter',  category: 'Neutral', year: 2026, creator: 'Bum',      placeholder: false, thumbnail: '/characters/Jitter_bum_2026.png',     detail: '/characters/link/link_Jitter_bum_2026.png' },
  { id: 'WI-016', name: 'Moa',     category: 'Neutral', year: 2026, creator: 'Seonghun', placeholder: false, thumbnail: '/characters/Moa_Seonghun_2026.png',   detail: '/characters/link/link_Moa_Seonghun_2026.png' },
  { id: 'WI-017', name: 'NORUT',   category: 'Neutral', year: 2026, creator: 'Ara',      placeholder: false, thumbnail: '/characters/NORUT_ara_2026.png',      detail: '/characters/link/link_NORUT_ara_2026.png' },
  { id: 'WI-018', name: 'Enzo',    category: 'Neutral', year: 2026, creator: 'Ilpoong',  placeholder: false, thumbnail: '/characters/enzo_Ilpoong_2026.png',   detail: '/characters/link/link_enzo_Ilpoong_2026.png' },
  { id: 'WI-019', name: 'Ruri',    category: 'Neutral', year: 2026, creator: 'Wltn',     placeholder: false, thumbnail: '/characters/ruri_wltn_2026.jpg',      detail: '/characters/link/link_ruri_wltn_2026.jpg' },
  { id: 'WI-020', name: 'Zigmi',   category: 'Neutral', year: 2026, creator: 'Sujeong',  placeholder: false, thumbnail: '/characters/zigmi_sujeong_2026.png',  detail: '/characters/link/link_zigmi_sujeong_2026.png' },
  { id: 'WI-021', name: 'Piorid',  category: 'Neutral', year: 2026, creator: 'Naseon',   placeholder: false, thumbnail: '/characters/Piorid_Naseon_2026.png' },
  { id: 'WI-022', name: 'RUEL',    category: 'Neutral', year: 2026, creator: 'Jiman',    placeholder: false, thumbnail: '/characters/RUEL_Jiman_2026.png' },
  { id: 'WI-023', name: 'Rua',     category: 'Neutral', year: 2026, creator: 'Seohyun',  placeholder: false, thumbnail: '/characters/Rua_Seohyun_2026.png' },
];
