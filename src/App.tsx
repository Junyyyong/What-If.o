import { useState, useMemo, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { characters as staticCharacters } from './data/characters';
import { fonts } from './data/fonts';
import { interactions } from './data/interactions';
import type { Character } from './data/characters';
import { GOOGLE_SHEET_URL } from './config';

const VALID_CATEGORIES: Character['category'][] = ['Hero', 'Villain', 'Support', 'Neutral'];

function parseSheetCSV(csv: string): Character[] {
  const lines = csv.trim().split('\n').slice(1);
  return lines.map((line, i) => {
    const cols: string[] = [];
    let cur = '', inQ = false;
    for (const ch of line) {
      if (ch === '"') { inQ = !inQ; }
      else if (ch === ',' && !inQ) { cols.push(cur.trim()); cur = ''; }
      else { cur += ch; }
    }
    cols.push(cur.trim());
    const [id, name, rawCat, year, creator, placeholder, pinned, thumbnail, sheet, url] = cols;
    const category = VALID_CATEGORIES.includes(rawCat as Character['category'])
      ? (rawCat as Character['category'])
      : 'Neutral';
    return {
      id: id || `WI-S${i}`,
      name,
      category,
      year: parseInt(year) || 2025,
      creator: creator || '',
      placeholder: placeholder === 'true',
      pinned: pinned === 'true',
      thumbnail: thumbnail || undefined,
      sheet: sheet || undefined,
      url: url || undefined,
    };
  }).filter(c => c.name);
}

function useCharacters(): Character[] {
  const pinned = staticCharacters.filter(c => c.pinned);
  const initial = GOOGLE_SHEET_URL ? pinned : staticCharacters;
  const [chars, setChars] = useState<Character[]>(initial);
  useEffect(() => {
    if (!GOOGLE_SHEET_URL) return;
    const pinnedNames = new Set(pinned.map(c => c.name));
    fetch(GOOGLE_SHEET_URL)
      .then(r => r.text())
      .then(csv => {
        const sheetChars = parseSheetCSV(csv).filter(c => !pinnedNames.has(c.name));
        setChars([...pinned, ...sheetChars]);
      })
      .catch(() => {});
  }, []);
  return chars;
}

type Page = 'archive' | 'preview' | 'interaction' | 'font' | 'about' | 'contact';
type Sort  = 'alphabetical' | 'chronological';

// ─── 해시 라우팅 ───────────────────────────────────────────────────────────────
// archive ↔ /list (사용자 화면명이 List라서 URL도 list로 통일)
// preview ↔ /character
const PAGE_TO_URL: Record<Page, string> = {
  archive: 'list', preview: 'character', interaction: 'interaction',
  font: 'font', about: 'about', contact: 'contact',
};
const URL_TO_PAGE: Record<string, Page> = {
  '': 'archive', list: 'archive', character: 'preview',
  interaction: 'interaction', font: 'font', about: 'about', contact: 'contact',
};

function parseHash(): { page: Page; sub: string } {
  const h = window.location.hash.replace(/^#\/?/, '');
  const [p, sub] = h.split('/');
  return { page: URL_TO_PAGE[p?.toLowerCase()] || 'archive', sub: sub || '' };
}

function buildHash(page: Page, sub?: string): string {
  if (page === 'archive' && !sub) return '#/';
  const urlPage = PAGE_TO_URL[page];
  return sub ? `#/${urlPage}/${sub}` : `#/${urlPage}`;
}

function isClickable(c: Character) {
  return !!(c.detail || c.sheet || c.url);
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────
function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
  return (
    <motion.div
      className="lb-backdrop"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      onClick={onClose}
    >
      <motion.img
        src={src} className="lb-img"
        initial={{ scale: 0.97 }} animate={{ scale: 1 }} exit={{ scale: 0.97 }}
        transition={{ duration: 0.15 }}
        onClick={e => e.stopPropagation()}
      />
      <button className="lb-close" onClick={onClose}>✕</button>
    </motion.div>
  );
}

// ─── Fade ─────────────────────────────────────────────────────────────────────
function Fade({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.1 }}
    >
      {children}
    </motion.div>
  );
}

// ─── Archive ──────────────────────────────────────────────────────────────────
function ArchivePage({ openChar, search, characters }: {
  openChar: (c: Character) => void; search: string; characters: Character[];
}) {
  const [sort, setSort] = useState<Sort>('alphabetical');

  const list = useMemo(() => {
    let arr = [...characters];
    if (search) arr = arr.filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.creator.toLowerCase().includes(search.toLowerCase())
    );
    if (sort === 'alphabetical') {
      arr.sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return a.name.localeCompare(b.name);
      });
    } else {
      arr.sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return b.year - a.year;
      });
    }
    return arr;
  }, [sort, search, characters]);

  return (
    <Fade>
      <div className="content-header">
        <button className={`sort-btn${sort === 'alphabetical' ? ' on' : ''}`} onClick={() => setSort('alphabetical')}>
          A–Z
        </button>
        <span>List</span>
        <button className={`sort-btn${sort === 'chronological' ? ' on' : ''}`} onClick={() => setSort('chronological')}>
          Year
        </button>
      </div>
      <div className="archive-cols">
        {list.map(char => {
          const clickable = isClickable(char);
          return (
            <div key={char.id} className={`arc-entry${clickable ? ' clickable' : ''}`}
              onClick={() => clickable && openChar(char)}>
              <span className={char.placeholder ? 'strike' : ''}>{char.name}</span>
              <span className="arc-creator">{char.creator}</span>
              <span className="arc-year">{char.year}</span>
            </div>
          );
        })}
      </div>
    </Fade>
  );
}

// ─── Preview ──────────────────────────────────────────────────────────────────
function PreviewPage({ openChar, search, characters }: {
  openChar: (c: Character) => void; search: string; characters: Character[];
}) {
  const list = useMemo(() => {
    let arr = [...characters];
    if (search) arr = arr.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
    return arr.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [search, characters]);

  return (
    <Fade>
      <div className="content-header">
        <span className="sort-btn on">A–Z</span>
        <span>Character</span>
        <span />
      </div>
      <div className="preview-grid">
        {list.map(char => {
          const clickable = isClickable(char);
          const src = char.thumbnail ?? char.sheet;
          return (
            <div key={char.id} className={`prev-card${clickable ? ' clickable' : ''}`}
              onClick={() => clickable && openChar(char)}>
              {src
                ? <img src={src} className="prev-img" alt={char.name} />
                : <div className="prev-img prev-ph" />}
              <div className={`prev-label${char.placeholder ? ' strike' : ''}`}>
                {char.creator}, 〈{char.name}〉, {char.year}.
              </div>
            </div>
          );
        })}
      </div>
    </Fade>
  );
}

const AX_BASE_W = 1600;
const AX_BASE_H = Math.round(AX_BASE_W * 9 / 16);

// ─── Character Detail ───────────────────────────────────────────────────────
function detailsOf(c: Character): string[] {
  if (!c.detail) return [];
  return Array.isArray(c.detail) ? c.detail : [c.detail];
}
function CharacterDetailPage({ char, onClose }: { char: Character; onClose: () => void }) {
  const pages = detailsOf(char);
  const [idx, setIdx] = useState(0);
  const hasNext = idx < pages.length - 1;
  const hasPrev = idx > 0;
  const go = (next: number) => {
    setIdx(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  return (
    <Fade>
      <div className="content-header">
        <button className="sort-btn on cd-back" onClick={onClose}>← back</button>
        <span>
          {char.creator}, 〈{char.name}〉, {char.year}
          {pages.length > 1 && <> · {idx + 1} / {pages.length}</>}
        </span>
        <span />
      </div>
      <div className="char-detail-wrap">
        {pages[idx] && <img src={pages[idx]} className="char-detail-img" alt={char.name} />}
      </div>
      {(hasPrev || hasNext) && (
        <div className="cd-nav">
          {hasPrev
            ? <button className="cd-arrow" onClick={() => go(idx - 1)}>←</button>
            : <span />}
          {hasNext
            ? <button className="cd-arrow" onClick={() => go(idx + 1)}>→</button>
            : <span />}
        </div>
      )}
    </Fade>
  );
}

// ─── Interaction ──────────────────────────────────────────────────────────────
function InteractionPage({ activeId, setActiveId }: {
  activeId: string; setActiveId: (id: string) => void;
}) {
  const embedRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const ax = interactions.find(i => i.id === 'AX')!;
  // 대소문자 무시하고 id 매칭
  const activeItem = interactions.find(i => i.id.toLowerCase() === activeId.toLowerCase());

  useEffect(() => {
    const update = () => {
      if (embedRef.current) {
        setScale(embedRef.current.offsetWidth / AX_BASE_W);
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return (
    <Fade>
      <div className="content-header">
        <span className="sort-btn on">A–Z</span>
        <span>Interaction</span>
        <span />
      </div>

      {/* AX 기본 임베드 — 비율 유지 스케일 */}
      <div className="ix-embed" ref={embedRef}>
        <iframe
          src={ax.path}
          title="AX"
          style={{
            width: AX_BASE_W,
            height: AX_BASE_H,
            border: 'none',
            transformOrigin: 'top left',
            transform: `scale(${scale})`,
          }}
        />
      </div>

      {/* 7단 그리드 목록 */}
      <div className="archive-cols">
        {interactions.map(item => (
          <div key={item.id} className="arc-entry clickable"
            onClick={() => setActiveId(item.id)}>
            <span>{item.title}</span>
            <span className="arc-year">{item.year}</span>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {activeItem && (
          <motion.div className="ix-backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}>
            <iframe src={activeItem.path} className="ix-frame" title={activeItem.title} />
            <button className="ix-close" onClick={() => setActiveId('')}>✕</button>
          </motion.div>
        )}
      </AnimatePresence>
    </Fade>
  );
}

// ─── Font ─────────────────────────────────────────────────────────────────────
function FontPage() {
  return (
    <Fade>
      <div className="content-header">
        <span className="sort-btn on">A–Z</span>
        <span>Font</span>
        <span />
      </div>
      <div className="font-list">
        {fonts.map(f => (
          <div key={f.id} className="font-item">
            <div
              className="font-preview-text"
              contentEditable
              suppressContentEditableWarning
              spellCheck={false}
              style={{ fontFamily: `'${f.name}', sans-serif` }}
            >
              {f.preview}
            </div>
            <div className="font-row">
              <span className="font-name">{f.name}</span>
              <span className="font-dim">{f.styles} style{f.styles > 1 ? 's' : ''} · {f.fileSize}</span>
              <span className="font-desc">{f.description}</span>
              <span className={`font-badge${f.price === 'free' ? ' free' : ''}`}>
                {f.price === 'free' ? 'Free' : `$${f.price}`}
              </span>
              {f.file
                ? <a className="font-dl" href={f.file} download>{f.price === 'free' ? 'Download' : 'Purchase'}</a>
                : <span className="font-dl font-dl-soon">{f.price === 'free' ? 'Soon' : 'Purchase'}</span>}
            </div>
          </div>
        ))}
      </div>
    </Fade>
  );
}

// ─── About ────────────────────────────────────────────────────────────────────
function AboutPage({ count }: { count: number }) {
  return (
    <Fade>
      <div className="content-header"><span /><span>About</span><span /></div>
      <div className="text-body">
        <p>What If.o is an independent archive documenting original characters created by multiple designers. Each entry represents a unique character with its own design history, narrative context, and visual identity.</p>
        <p>The archive is organised alphabetically and updated each semester as new characters are introduced. All works are owned by their respective creators.</p>
        <p>The What If.o Font collection comprises typefaces developed alongside the character archive.</p>
        <p>Founded 2025. Currently cataloguing {count} characters.</p>
      </div>
    </Fade>
  );
}

// ─── Contact ──────────────────────────────────────────────────────────────────
function ContactPage() {
  return (
    <Fade>
      <div className="content-header"><span /><span>Contact</span><span /></div>
      <div className="text-body">
        <p>For inquiries regarding the archive, font licensing, submissions, or collaborations, please reach out by email.</p>
        <p>
          Jun-Yong Lee<br />
          Graduate School of Techno Design, Kookmin University<br />
          Convergence Design
        </p>
        <p>
          +82 10 8249-3865<br />
          <a href="mailto:wnsdydtml@gmail.com" className="text-link">wnsdydtml@gmail.com</a>
        </p>
        <p className="contact-note">To submit a character: send your site URL or thumbnail along with character name, category, and year.</p>
      </div>
    </Fade>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  // 초기 상태는 현재 해시에서 파싱
  const initial = parseHash();
  const [page, setPage]                 = useState<Page>(initial.page);
  const [interactionId, setInteractionId] = useState<string>(initial.page === 'interaction' ? initial.sub : '');
  const [characterId, setCharacterId]   = useState<string>(initial.page === 'preview' ? initial.sub : '');
  const [search, setSearch]             = useState('');
  const [lbSrc, setLbSrc]               = useState<string | null>(null);
  const characters = useCharacters();

  // 현재 상세보기 캐릭터
  const activeChar = characters.find(c => c.name.toLowerCase() === characterId.toLowerCase());

  // URL 해시 ← 상태 (페이지 또는 sub 변경 시 URL 업데이트)
  useEffect(() => {
    let sub = '';
    if (page === 'interaction') sub = interactionId;
    else if (page === 'preview') sub = characterId;
    const newHash = buildHash(page, sub);
    if (newHash === '#/' && window.location.hash === '') return;
    if (window.location.hash !== newHash) {
      window.location.hash = newHash;
    }
  }, [page, interactionId, characterId]);

  // URL 해시 → 상태 (뒤로 가기/직접 입력 대응)
  useEffect(() => {
    const onHashChange = () => {
      const { page: p, sub } = parseHash();
      setPage(p);
      setInteractionId(p === 'interaction' ? sub : '');
      setCharacterId(p === 'preview' ? sub : '');
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // 페이지 전환 시 sub 자동 초기화
  useEffect(() => {
    if (page !== 'interaction' && interactionId) setInteractionId('');
    if (page !== 'preview'     && characterId)   setCharacterId('');
  }, [page]);

  // 캐릭터 클릭 — 상세 이미지 우선, 없으면 sheet → lightbox, url → 외부 링크
  const openChar = (c: Character) => {
    if (c.detail) { setPage('preview'); setCharacterId(c.name); }
    else if (c.sheet) setLbSrc(c.sheet);
    else if (c.url)   window.open(c.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="app">

      {/* Row 1: What If.o ————————————————————— Search */}
      <div className="nav-row nav-row-title">
        <button className="site-title" onClick={() => setPage('archive')}>What If.o</button>
        <input className="search-input" placeholder="Search" value={search}
          onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Row 2: List (=Archive) */}
      <div className="nav-row">
        <button className={`nav-btn${page === 'archive' ? ' active' : ''}`} onClick={() => setPage('archive')}>List</button>
      </div>

      {/* Row 3: Character (=Preview) */}
      <div className="nav-row">
        <button className={`nav-btn${page === 'preview' ? ' active' : ''}`} onClick={() => setPage('preview')}>Character</button>
      </div>

      {/* Row 4: Interaction */}
      <div className="nav-row">
        <button className={`nav-btn${page === 'interaction' ? ' active' : ''}`} onClick={() => setPage('interaction')}>Interaction</button>
      </div>

      {/* Row 5: Font */}
      <div className="nav-row">
        <button className={`nav-btn${page === 'font' ? ' active' : ''}`} onClick={() => setPage('font')}>Font</button>
      </div>

      {/* Row 6: About */}
      <div className="nav-row">
        <button className={`nav-btn${page === 'about' ? ' active' : ''}`} onClick={() => setPage('about')}>About</button>
      </div>

      {/* Row 7: Contact */}
      <div className="nav-row nav-row-last">
        <button className={`nav-btn${page === 'contact' ? ' active' : ''}`} onClick={() => setPage('contact')}>Contact</button>
      </div>

      {/* Content */}
      <main className="main">
        <AnimatePresence mode="wait">
          {page === 'archive'     && <ArchivePage     key="archive"     openChar={openChar} search={search} characters={characters} />}
          {page === 'preview' && (activeChar?.detail
            ? <CharacterDetailPage key={`detail-${activeChar.name}`} char={activeChar} onClose={() => setCharacterId('')} />
            : <PreviewPage     key="preview"     openChar={openChar} search={search} characters={characters} />)}
          {page === 'interaction' && <InteractionPage key="interaction" activeId={interactionId} setActiveId={setInteractionId} />}
          {page === 'font'        && <FontPage        key="font" />}
          {page === 'about'       && <AboutPage       key="about" count={characters.length} />}
          {page === 'contact'     && <ContactPage     key="contact" />}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {lbSrc && <Lightbox src={lbSrc} onClose={() => setLbSrc(null)} />}
      </AnimatePresence>
    </div>
  );
}
