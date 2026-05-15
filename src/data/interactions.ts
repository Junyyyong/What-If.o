export interface Interaction {
  id: string;
  title: string;
  path: string;
}

export const interactions: Interaction[] = [
  { id: 'AX',                 title: 'AX',                 path: '/interaction/AX/index.html' },
  { id: '50th',               title: '50th',               path: '/interaction/50th/index.html' },
  { id: 'audioreactive',      title: 'AUDIOREACTIVE',      path: '/interaction/audioreactive/dist/index.html' },
  { id: 'cPock',              title: 'cPock',              path: '/interaction/cPock/dist/index.html' },
  { id: 'emojition',          title: 'EMOJITION',          path: '/interaction/emojition/index.html' },
  { id: 'hcmv',               title: 'HCMV',               path: '/interaction/hcmv/dist/index.html' },
  { id: 'openresearchstudio', title: 'OPENRESEARCHSTUDIO', path: '/interaction/openresearchstudio/dist/index.html' },
];
