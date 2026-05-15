import { useState, useMemo, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { characters as staticCharacters } from './data/characters';
import { fonts } from './data/fonts';
import { interactions } from './data/interactions';
import type { Character } from './data/characters';
import { GOOGLE_SHEET_URL } from './config';

const VALID_CATEGORIES: Character['category'][] = ['Hero', 'Villain', 'Support', 'Neutral'];

function parseSheetCSV(csv: string): Character[] {
  const lines = csv.trim().split('\n').slice(1); // skip header row
  return lines.map((line, i) => {
    // handle quoted fields that may contain commas
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

const CATEGORIES = ['All', 'Hero', 'Villain', 'Support', 'Neutral'] as const;
type Category = typeof CATEGORIES[number];

function handleClick(char: Character, open: (s: string) => void) {
  if (char.sheet) open(char.sheet);
  else if (char.url) window.open(char.url, '_blank', 'noopener,noreferrer');
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
function ArchivePage({ open, search, category, characters }: {
  open: (s: string) => void; search: string; category: Category; characters: Character[];
}) {
  const [sort, setSort] = useState<Sort>('alphabetical');

  const list = useMemo(() => {
    let arr = [...characters];
    if (category !== 'All') arr = arr.filter(c => c.category === category);
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
  }, [sort, search, category, characters]);

  return (
    <Fade>
      <div className="content-header">
        <button className={`sort-btn${sort === 'alphabetical' ? ' on' : ''}`} onClick={() => setSort('alphabetical')}>
          alphabetical
        </button>
        <span>Archive: directory listing</span>
        <button className={`sort-btn${sort === 'chronological' ? ' on' : ''}`} onClick={() => setSort('chronological')}>
          chronological
        </button>
      </div>
      <div className="archive-cols">
        {list.map(char => {
          const clickable = !!(char.sheet || char.url);
          return (
            <div key={char.id} className={`arc-entry${clickable ? ' clickable' : ''}`}
              onClick={() => clickable && handleClick(char, open)}>
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
function PreviewPage({ open, search, category, characters }: {
  open: (s: string) => void; search: string; category: Category; characters: Character[];
}) {
  const list = useMemo(() => {
    let arr = [...characters];
    if (category !== 'All') arr = arr.filter(c => c.category === category);
    if (search) arr = arr.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
    return arr.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [search, category, characters]);

  return (
    <Fade>
      <div className="content-header">
        <span className="sort-btn on">alphabetical</span>
        <span>Preview: directory listing</span>
        <span />
      </div>
      <div className="preview-grid">
        {list.map(char => {
          const clickable = !!(char.sheet || char.url);
          const src = char.thumbnail ?? char.sheet;
          return (
            <div key={char.id} className={`prev-card${clickable ? ' clickable' : ''}`}
              onClick={() => clickable && handleClick(char, open)}>
              {src
                ? <img src={src} className="prev-img" alt={char.name} />
                : <div className="prev-img prev-ph" />}
              <div className={`prev-label${char.placeholder ? ' strike' : ''}`}>{char.name}</div>
            </div>
          );
        })}
      </div>
    </Fade>
  );
}

// ─── Interaction ──────────────────────────────────────────────────────────────
function InteractionPage() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <Fade>
      <div className="content-header">
        <span className="sort-btn on">listing</span>
        <span>Interaction: directory listing</span>
        <span />
      </div>
      <div className="archive-cols" style={{ columns: 3 }}>
        {interactions.map(item => (
          <div key={item.id} className="arc-entry clickable"
            onClick={() => setActive(item.path)}>
            <span>{item.title}</span>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {active && (
          <motion.div className="ix-backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}>
            <iframe src={active} className="ix-frame" title="interaction" />
            <button className="ix-close" onClick={() => setActive(null)}>✕</button>
          </motion.div>
        )}
      </AnimatePresence>
    </Fade>
  );
}

// ─── Font ─────────────────────────────────────────────────────────────────────
function FontPage() {
  const [previewText, setPreviewText] = useState('');

  return (
    <Fade>
      <div className="content-header">
        <span className="sort-btn on">listing</span>
        <span>Font: typeface listing</span>
        <input
          className="font-preview-input"
          placeholder="Type to preview…"
          value={previewText}
          onChange={e => setPreviewText(e.target.value)}
        />
      </div>
      <div className="font-list">
        {fonts.map(f => (
          <div key={f.id} className="font-item">
            <div className={`font-preview-text${f.id === 'po-emoji' ? ' po-emoji' : ''}`}>
              {previewText || f.preview}
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
        <p><a href="mailto:hello@whatif.o" className="text-link">hello@whatif.o</a></p>
        <p>Response time is typically within 2–3 business days.</p>
        <p className="contact-note">To submit a character: send your site URL or thumbnail along with character name, category, and year.</p>
      </div>
    </Fade>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage]         = useState<Page>('archive');
  const [search, setSearch]     = useState('');
  const [category, setCategory] = useState<Category>('All');
  const [lbSrc, setLbSrc]       = useState<string | null>(null);
  const characters = useCharacters();

  return (
    <div className="app">

      {/* Row 1: What If.o ————————————————————— Search */}
      <div className="nav-row">
        <button className="site-title" onClick={() => setPage('archive')}>What If.o</button>
        <input className="search-input" placeholder="Search" value={search}
          onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Row 2: Archive */}
      <div className="nav-row">
        <button className={`nav-btn${page === 'archive' ? ' active' : ''}`} onClick={() => setPage('archive')}>Archive</button>
      </div>

      {/* Row 3: Preview */}
      <div className="nav-row">
        <button className={`nav-btn${page === 'preview' ? ' active' : ''}`} onClick={() => setPage('preview')}>Preview</button>
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

      {/* Row 7: Contact ————————————————— Categories */}
      <div className="nav-row nav-row-last">
        <button className={`nav-btn${page === 'contact' ? ' active' : ''}`} onClick={() => setPage('contact')}>Contact</button>
        <select className="cat-select" value={category}
          onChange={e => setCategory(e.target.value as Category)}>
          {CATEGORIES.map(c => (
            <option key={c} value={c}>{c === 'All' ? 'Categories: All' : c}</option>
          ))}
        </select>
      </div>

      {/* Content */}
      <main className="main">
        <AnimatePresence mode="wait">
          {page === 'archive' && <ArchivePage key="archive" open={setLbSrc} search={search} category={category} characters={characters} />}
          {page === 'preview' && <PreviewPage key="preview" open={setLbSrc} search={search} category={category} characters={characters} />}
          {page === 'interaction' && <InteractionPage key="interaction" />}
          {page === 'font'    && <FontPage    key="font" />}
          {page === 'about'   && <AboutPage   key="about" count={characters.length} />}
          {page === 'contact' && <ContactPage key="contact" />}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {lbSrc && <Lightbox src={lbSrc} onClose={() => setLbSrc(null)} />}
      </AnimatePresence>
    </div>
  );
}
