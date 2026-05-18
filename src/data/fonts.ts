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
    id: 'dolin',
    name: 'Dolin',
    description: '',
    price: 'free',
    preview: 'DOLIN',
    styles: 1,
    fileSize: '24 KB',
    file: '/fonts/Dolin.otf',
  },
  {
    id: 'dust',
    name: 'Dust',
    description: '',
    price: 'free',
    preview: 'DUST',
    styles: 1,
    fileSize: '62 KB',
    file: '/fonts/Dust.otf',
  },
  {
    id: 'gomnigiri',
    name: 'Gomnigiri',
    description: '',
    price: 'free',
    preview: 'GOMNIGIRI',
    styles: 1,
    fileSize: '38 KB',
    file: '/fonts/Gomnigiri.ttf',
  },
  {
    id: 'hongbi',
    name: 'Hongbi',
    description: '',
    price: 'free',
    preview: 'HONGBI',
    styles: 1,
    fileSize: '34 KB',
    file: '/fonts/Hongbi.otf',
  },
  {
    id: 'lulumi',
    name: 'Lulumi',
    description: '',
    price: 'free',
    preview: 'LULUMI',
    styles: 1,
    fileSize: '11 KB',
    file: '/fonts/Lulumi.ttf',
  },
  {
    id: 'mar',
    name: 'Mar',
    description: '',
    price: 'free',
    preview: 'MAR',
    styles: 1,
    fileSize: '28 KB',
    file: '/fonts/Mar.otf',
  },
  {
    id: 'marmelo',
    name: 'Marmelo',
    description: '',
    price: 'free',
    preview: 'MARMELO',
    styles: 1,
    fileSize: '31 KB',
    file: '/fonts/Marmelo.otf',
  },
  {
    id: 'melo',
    name: 'Melo',
    description: '',
    price: 'free',
    preview: 'MELO',
    styles: 1,
    fileSize: '20 KB',
    file: '/fonts/Melo.otf',
  },
  {
    id: 'nubi',
    name: 'Nubi',
    description: '',
    price: 'free',
    preview: 'NUBI',
    styles: 1,
    fileSize: '48 KB',
    file: '/fonts/Nubi.otf',
  },
  {
    id: 'pudding',
    name: 'Pudding',
    description: '',
    price: 'free',
    preview: 'PUDDING',
    styles: 1,
    fileSize: '25 KB',
    file: '/fonts/Pudding.otf',
  },
  {
    id: 'po-emoji',
    name: 'PoEmoji',
    description: 'An emoji typeface created alongside the What If.o character archive. Based on the visual language of Po.',
    price: 'free',
    preview: 'POEMOJI',
    styles: 1,
    fileSize: '296 KB',
    file: '/fonts/POEMOJI.ttf',
  },
];
