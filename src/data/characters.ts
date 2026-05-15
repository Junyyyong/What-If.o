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
  // ── 고정 캐릭터 ────────────────────────────────────────────────────
  {
    id: 'WI-000',
    name: 'Po',
    category: 'Neutral',
    year: 2023,
    creator: 'Yong',
    placeholder: false,
    pinned: true,
    thumbnail: '/characters/Po.jpg',
    sheet: '/characters/Po.jpg',
  },

  // ── 본인 캐릭터 (이미지 추가 전) ───────────────────────────────────
  { id: 'WI-001', name: 'Aegis',  category: 'Hero',    year: 2025, creator: 'Yong',  placeholder: true },
  { id: 'WI-002', name: 'Aether', category: 'Neutral', year: 2025, creator: 'Yong',  placeholder: true },
  { id: 'WI-003', name: 'Arc',    category: 'Hero',    year: 2025, creator: 'Yong',  placeholder: true },

  // ── 외부 창작자 ────────────────────────────────────────────────────
  { id: 'WI-004', name: 'Aurora',  category: 'Support', year: 2025, creator: 'Alice',  placeholder: true,
    thumbnail: 'https://picsum.photos/seed/aurora/400/600', url: 'https://example.com/aurora' },
  { id: 'WI-005', name: 'Axis',    category: 'Villain', year: 2025, creator: 'Bob',    placeholder: true,
    thumbnail: 'https://picsum.photos/seed/axis/400/600',   url: 'https://example.com/axis' },
  { id: 'WI-006', name: 'Blaze',   category: 'Hero',    year: 2025, creator: 'Carol',  placeholder: true,
    thumbnail: 'https://picsum.photos/seed/blaze/400/600',  url: 'https://example.com/blaze' },
  { id: 'WI-007', name: 'Bolt',    category: 'Neutral', year: 2025, creator: 'David',  placeholder: true,
    thumbnail: 'https://picsum.photos/seed/bolt/400/600',   url: 'https://example.com/bolt' },
  { id: 'WI-008', name: 'Brom',    category: 'Villain', year: 2025, creator: 'Eve',    placeholder: true,
    thumbnail: 'https://picsum.photos/seed/brom/400/600',   url: 'https://example.com/brom' },
  { id: 'WI-009', name: 'Cipher',  category: 'Villain', year: 2025, creator: 'Frank',  placeholder: true,
    thumbnail: 'https://picsum.photos/seed/cipher/400/600', url: 'https://example.com/cipher' },
  { id: 'WI-010', name: 'Crest',   category: 'Hero',    year: 2025, creator: 'Grace',  placeholder: true,
    thumbnail: 'https://picsum.photos/seed/crest/400/600',  url: 'https://example.com/crest' },
  { id: 'WI-011', name: 'Cyan',    category: 'Support', year: 2025, creator: 'Hank',   placeholder: true,
    thumbnail: 'https://picsum.photos/seed/cyan/400/600',   url: 'https://example.com/cyan' },
  { id: 'WI-012', name: 'Dawn',    category: 'Support', year: 2025, creator: 'Iris',   placeholder: true,
    thumbnail: 'https://picsum.photos/seed/dawn/400/600',   url: 'https://example.com/dawn' },
  { id: 'WI-013', name: 'Delta',   category: 'Neutral', year: 2025, creator: 'Jack',   placeholder: true,
    thumbnail: 'https://picsum.photos/seed/delta/400/600',  url: 'https://example.com/delta' },
  { id: 'WI-014', name: 'Dusk',    category: 'Villain', year: 2025, creator: 'Kate',   placeholder: true,
    thumbnail: 'https://picsum.photos/seed/dusk/400/600',   url: 'https://example.com/dusk' },
  { id: 'WI-015', name: 'Echo',    category: 'Support', year: 2025, creator: 'Leo',    placeholder: true,
    thumbnail: 'https://picsum.photos/seed/echo/400/600',   url: 'https://example.com/echo' },
  { id: 'WI-016', name: 'Edge',    category: 'Hero',    year: 2025, creator: 'Mia',    placeholder: true,
    thumbnail: 'https://picsum.photos/seed/edge/400/600',   url: 'https://example.com/edge' },
  { id: 'WI-017', name: 'Ember',   category: 'Neutral', year: 2025, creator: 'Noah',   placeholder: true,
    thumbnail: 'https://picsum.photos/seed/ember/400/600',  url: 'https://example.com/ember' },
  { id: 'WI-018', name: 'Frost',   category: 'Hero',    year: 2025, creator: 'Olivia', placeholder: true,
    thumbnail: 'https://picsum.photos/seed/frost/400/600',  url: 'https://example.com/frost' },
  { id: 'WI-019', name: 'Flux',    category: 'Neutral', year: 2025, creator: 'Paul',   placeholder: true,
    thumbnail: 'https://picsum.photos/seed/flux/400/600',   url: 'https://example.com/flux' },
  { id: 'WI-020', name: 'Gale',    category: 'Support', year: 2025, creator: 'Quinn',  placeholder: true,
    thumbnail: 'https://picsum.photos/seed/gale/400/600',   url: 'https://example.com/gale' },
];
