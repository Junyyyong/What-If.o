export interface Font {
  id: string;
  name: string;
  description: string;
  price: number | 'free';
  preview: string;
  styles: number;
  fileSize: string;
  file?: string;
}

export const fonts: Font[] = [
  {
    id: 'po-emoji',
    name: 'PoEmoji',
    description: 'An emoji typeface created alongside the What If.o character archive. Based on the visual language of Po.',
    price: 'free',
    preview: 'POEMOJI',
    styles: 1,
    fileSize: '—',
    file: '/fonts/POEMOJI.ttf',
  },
];
