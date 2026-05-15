export interface Character {
  id: string;
  name: string;
  category: 'Hero' | 'Villain' | 'Support' | 'Neutral';
  year: number;
  creator: string;
  // 본인 캐릭터: image + sheet 사용 (로컬 or 외부 이미지 URL)
  // 외부 창작자: url 사용 (새 탭으로 이동)
  thumbnail?: string;  // 아카이브/프리뷰 썸네일 (외부 URL or 로컬 경로)
  sheet?: string;      // 풀사이즈 캐릭터 시트 이미지 (라이트박스용)
  url?: string;        // 외부 창작자 사이트 링크
}

export const characters: Character[] = [
  // ── 본인 캐릭터 예시 (sheet 있음 → 라이트박스) ──────────────────
  {
    id: 'WI-001', name: 'Aegis',   category: 'Hero',    year: 2025, creator: 'You',
    thumbnail: undefined, sheet: undefined,
    // 실제 사용 시: thumbnail: '/characters/aegis/thumb.jpg', sheet: '/characters/aegis/sheet.jpg'
  },
  {
    id: 'WI-002', name: 'Aether',  category: 'Neutral', year: 2025, creator: 'You',
  },
  {
    id: 'WI-003', name: 'Arc',     category: 'Hero',    year: 2025, creator: 'You',
  },

  // ── 외부 창작자 예시 (url 있음 → 새 탭) ──────────────────────────
  {
    id: 'WI-004', name: 'Aurora',  category: 'Support', year: 2025, creator: 'Alice',
    thumbnail: 'https://picsum.photos/seed/aurora/400/600',
    url: 'https://example.com/aurora',
  },
  {
    id: 'WI-005', name: 'Axis',    category: 'Villain', year: 2025, creator: 'Bob',
    thumbnail: 'https://picsum.photos/seed/axis/400/600',
    url: 'https://example.com/axis',
  },
  {
    id: 'WI-006', name: 'Blaze',   category: 'Hero',    year: 2025, creator: 'Carol',
    thumbnail: 'https://picsum.photos/seed/blaze/400/600',
    url: 'https://example.com/blaze',
  },
  {
    id: 'WI-007', name: 'Bolt',    category: 'Neutral', year: 2025, creator: 'David',
    thumbnail: 'https://picsum.photos/seed/bolt/400/600',
    url: 'https://example.com/bolt',
  },
  {
    id: 'WI-008', name: 'Brom',    category: 'Villain', year: 2025, creator: 'Eve',
    thumbnail: 'https://picsum.photos/seed/brom/400/600',
    url: 'https://example.com/brom',
  },
  {
    id: 'WI-009', name: 'Cipher',  category: 'Villain', year: 2025, creator: 'Frank',
    thumbnail: 'https://picsum.photos/seed/cipher/400/600',
    url: 'https://example.com/cipher',
  },
  {
    id: 'WI-010', name: 'Crest',   category: 'Hero',    year: 2025, creator: 'Grace',
    thumbnail: 'https://picsum.photos/seed/crest/400/600',
    url: 'https://example.com/crest',
  },
  {
    id: 'WI-011', name: 'Cyan',    category: 'Support', year: 2025, creator: 'Hank',
    thumbnail: 'https://picsum.photos/seed/cyan/400/600',
    url: 'https://example.com/cyan',
  },
  {
    id: 'WI-012', name: 'Dawn',    category: 'Support', year: 2025, creator: 'Iris',
    thumbnail: 'https://picsum.photos/seed/dawn/400/600',
    url: 'https://example.com/dawn',
  },
  {
    id: 'WI-013', name: 'Delta',   category: 'Neutral', year: 2025, creator: 'Jack',
    thumbnail: 'https://picsum.photos/seed/delta/400/600',
    url: 'https://example.com/delta',
  },
  {
    id: 'WI-014', name: 'Dusk',    category: 'Villain', year: 2025, creator: 'Kate',
    thumbnail: 'https://picsum.photos/seed/dusk/400/600',
    url: 'https://example.com/dusk',
  },
  {
    id: 'WI-015', name: 'Echo',    category: 'Support', year: 2025, creator: 'Leo',
    thumbnail: 'https://picsum.photos/seed/echo/400/600',
    url: 'https://example.com/echo',
  },
  {
    id: 'WI-016', name: 'Edge',    category: 'Hero',    year: 2025, creator: 'Mia',
    thumbnail: 'https://picsum.photos/seed/edge/400/600',
    url: 'https://example.com/edge',
  },
  {
    id: 'WI-017', name: 'Ember',   category: 'Neutral', year: 2025, creator: 'Noah',
    thumbnail: 'https://picsum.photos/seed/ember/400/600',
    url: 'https://example.com/ember',
  },
  {
    id: 'WI-018', name: 'Frost',   category: 'Hero',    year: 2025, creator: 'Olivia',
    thumbnail: 'https://picsum.photos/seed/frost/400/600',
    url: 'https://example.com/frost',
  },
  {
    id: 'WI-019', name: 'Flux',    category: 'Neutral', year: 2025, creator: 'Paul',
    thumbnail: 'https://picsum.photos/seed/flux/400/600',
    url: 'https://example.com/flux',
  },
  {
    id: 'WI-020', name: 'Gale',    category: 'Support', year: 2025, creator: 'Quinn',
    thumbnail: 'https://picsum.photos/seed/gale/400/600',
    url: 'https://example.com/gale',
  },
];
