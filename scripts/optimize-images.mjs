/**
 * 이미지 자동 최적화 스크립트
 *
 * 동작:
 *  - public/characters/  안의 PNG/JPG/JPEG를 같은 이름의 WebP로 변환
 *  - 캐릭터 썸네일 원본은 thumbs/ 하위에 400px 너비 축소 WebP도 생성
 *  - public/characters/link/ 안의 PNG/JPG/JPEG도 동일하게 WebP 변환
 *  - 이미 .webp가 있고 더 최신이면 skip (idempotent)
 *  - PNG/JPG 원본은 건드리지 않음 (필요하면 사용자가 삭제)
 *
 * 사용:
 *   npm run optimize:images   직접 실행
 *   npm run dev               (predev 훅에서 자동 실행)
 *   npm run build             (prebuild 훅에서 자동 실행)
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const ROOT       = path.resolve(__dirname, '..');

const CHAR_DIR   = path.join(ROOT, 'public', 'characters');
const LINK_DIR   = path.join(CHAR_DIR, 'link');
const THUMB_DIR  = path.join(CHAR_DIR, 'thumbs');

const SRC_EXT    = new Set(['.png', '.jpg', '.jpeg']);
const QUALITY    = 85;
const THUMB_W    = 400;
const THUMB_Q    = 80;
const DETAIL_W   = 1200;  // 상세 이미지 최대 가로폭 (화면 표시 너비와 동일) — 디코딩 부담 감소
const DETAIL_Q   = 82;

let processed = 0;
let skipped   = 0;

async function exists(p) {
  try { await fs.access(p); return true; } catch { return false; }
}

async function mtime(p) {
  try { return (await fs.stat(p)).mtimeMs; } catch { return 0; }
}

async function convert(srcPath, dstPath, opts = {}) {
  const { resizeWidth, quality = QUALITY } = opts;
  const srcMtime = await mtime(srcPath);
  const dstMtime = await mtime(dstPath);
  if (dstMtime >= srcMtime) { skipped++; return; }
  let img = sharp(srcPath);
  if (resizeWidth) img = img.resize({ width: resizeWidth, withoutEnlargement: true });
  await img.webp({ quality, effort: 4 }).toFile(dstPath);
  const rel = path.relative(ROOT, dstPath);
  console.log(`  ✓ ${rel}${resizeWidth ? ` (w=${resizeWidth})` : ''}`);
  processed++;
}

async function processDir(dir, { generateThumb }) {
  if (!(await exists(dir))) return;
  const entries = await fs.readdir(dir);
  for (const name of entries) {
    const full = path.join(dir, name);
    const ext  = path.extname(name).toLowerCase();
    const base = name.slice(0, -ext.length);
    if (!SRC_EXT.has(ext)) continue;
    const stat = await fs.stat(full);
    if (!stat.isFile()) continue;
    // 원본 WebP (상세 이미지는 1200px로 캡)
    await convert(full, path.join(dir, `${base}.webp`),
      generateThumb ? {} : { resizeWidth: DETAIL_W, quality: DETAIL_Q });
    // 그리드용 작은 썸네일 (캐릭터 폴더만)
    if (generateThumb) {
      await fs.mkdir(THUMB_DIR, { recursive: true });
      await convert(full, path.join(THUMB_DIR, `${base}.webp`), {
        resizeWidth: THUMB_W,
        quality: THUMB_Q,
      });
    }
  }
}

console.log('🖼  optimize-images');
await processDir(CHAR_DIR, { generateThumb: true });
await processDir(LINK_DIR, { generateThumb: false });
console.log(`   완료 — 변환 ${processed} · 스킵 ${skipped}`);
