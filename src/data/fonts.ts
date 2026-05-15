export interface Font {
  id: string;
  name: string;
  description: string;
  price: number | 'free';
  preview: string;
  styles: number;
  fileSize: string;
}

export const fonts: Font[] = [
  {
    id: 'ax-mono',
    name: 'AX Mono',
    description: 'A monospaced typeface designed for digital archives and data displays. Includes tabular numerals and extended Latin.',
    price: 'free',
    preview: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789',
    styles: 2,
    fileSize: '148 KB',
  },
  {
    id: 'ax-sans',
    name: 'AX Sans',
    description: 'Clean grotesque sans-serif inspired by the character design system. Optimised for small sizes and long-form text.',
    price: 'free',
    preview: 'Characters are stories waiting to be told.',
    styles: 4,
    fileSize: '312 KB',
  },
  {
    id: 'ax-display',
    name: 'AX Display',
    description: 'High-contrast display typeface for titles and headings. Draws from the silhouettes of the archive characters.',
    price: 12,
    preview: 'AX ARCHIVE',
    styles: 2,
    fileSize: '204 KB',
  },
  {
    id: 'ax-script',
    name: 'AX Script',
    description: 'Flowing script based on signature studies collected from character lore documents.',
    price: 18,
    preview: 'The archive lives on.',
    styles: 1,
    fileSize: '176 KB',
  },
  {
    id: 'ax-pixel',
    name: 'AX Pixel',
    description: 'Pixel-perfect bitmap font for retro UI and sprite-based environments. Designed on a 5×7 grid.',
    price: 'free',
    preview: 'AX-001 AEGIS — HERO CLASS',
    styles: 1,
    fileSize: '64 KB',
  },
];
