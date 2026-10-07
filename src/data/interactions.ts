export interface Interaction {
  id: string;
  title: string;
  path: string;
  year: number;
}

export const interactions: Interaction[] = [
  { id: 'AX',                 title: 'AX',                 path: '/interaction/AX/index.html',                             year: 2025 },
  { id: '50th',               title: '50th',               path: '/interaction/50th/index.html',                           year: 2025 },
  { id: 'audioreactive',      title: 'AUDIOREACTIVE',      path: '/interaction/audioreactive/dist/index.html',             year: 2025 },
  { id: 'cPock',              title: 'cPock',              path: '/interaction/cPock/dist/index.html',                     year: 2026 },
  { id: 'emojition',          title: 'EMOJITION',          path: '/interaction/emojition/index.html',                     year: 2024 },
  { id: 'growth',             title: 'Growth',             path: '/interaction/Growth/index.html',                        year: 2026 },
  { id: 'hcmv',               title: 'HCMV',               path: '/interaction/hcmv/dist/index.html',                     year: 2024 },
  { id: 'openresearchstudio', title: 'OPENRESEARCHSTUDIO', path: '/interaction/openresearchstudio/dist/index.html',        year: 2026 },
  { id: 'noisetype',          title: 'NOISE TYPE',         path: '/interaction/NoiseType/index.html',                     year: 2026 },
  { id: 'tedg',               title: 'TEDG',               path: '/interaction/TEDG/TEDG.html',                           year: 2025 },
  { id: 'tapeetepee',          title: 'TapeeTepee',         path: '/interaction/TapeeTepee/TapeeTepee.html',               year: 2026 },
];
