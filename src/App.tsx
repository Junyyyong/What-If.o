import { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { characters } from './data/characters';
import { fonts } from './data/fonts';
import type { Character } from './data/characters';

type Page = 'archive' | 'preview' | 'font' | 'about' | 'contact';

const NAV: { label: string; page: Page }[] = [
  { label: 'Archive', page: 'archive' },
  { label: 'Preview', page: 'preview' },
  { label: 'Font',    page: 'font'    },
  { label: 'About',   page: 'about'   },
  { label: 'Contact', page: 'contact' },
];

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

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ page, setPage }: { page: Page; setPage: (p: Page) => void }) {
  return (
    <aside className="sidebar">
      <button className="site-title" onClick={() => setPage('archive')}>
        What If.o
      </button>
      <nav className="sidebar-nav">
        {NAV.map(({ label, page: p }) => (
          <button
            key={p}
            className={`nav-btn${page === p ? ' active' : ''}`}
            onClick={() => setPage(p)}
          >
            {label}
          </button>
        ))}
      </nav>
    </aside>
  );
}

// ─── Fade wrapper ─────────────────────────────────────────────────────────────
function Fade({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      className="fade-wrap"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.12 }}
    >
      {children}
    </motion.div>
  );
}

// ─── Archive ──────────────────────────────────────────────────────────────────
function ArchivePage({ open }: { open: (s: string) => void }) {
  const sorted = useMemo(
    () => [...characters].sort((a, b) => a.name.localeCompare(b.name)),
    []
  );

  return (
    <Fade>
      <div className="archive-header">
        <span>alphabetical</span>
        <span>Archive: directory listing</span>
        <span>{characters.length} characters</span>
      </div>
      <div className="archive-cols">
        {sorted.map(char => {
          const clickable = !!(char.sheet || char.url);
          return (
            <div
              key={char.id}
              className={`arc-entry${clickable ? ' clickable' : ''}`}
              onClick={() => clickable && handleClick(char, open)}
            >
              <span className={char.placeholder ? 'strikethrough' : ''}>
                {char.name}
              </span>
              <span className="arc-meta">{char.year}</span>
            </div>
          );
        })}
      </div>
    </Fade>
  );
}

// ─── Preview ──────────────────────────────────────────────────────────────────
function PreviewPage({ open }: { open: (s: string) => void }) {
  const sorted = useMemo(
    () => [...characters].sort((a, b) => a.name.localeCompare(b.name)),
    []
  );

  return (
    <Fade>
      <div className="archive-header">
        <span>alphabetical</span>
        <span>Preview: directory listing</span>
        <span>{characters.length} characters</span>
      </div>
      <div className="preview-grid">
        {sorted.map(char => {
          const clickable = !!(char.sheet || char.url);
          const src = char.thumbnail ?? char.sheet;
          return (
            <div
              key={char.id}
              className={`prev-card${clickable ? ' clickable' : ''}`}
              onClick={() => clickable && handleClick(char, open)}
            >
              {src
                ? <img src={src} className="prev-img" alt={char.name} />
                : <div className="prev-img prev-placeholder" />
              }
              <div className={`prev-label${char.placeholder ? ' strikethrough' : ''}`}>
                {char.name}
              </div>
            </div>
          );
        })}
      </div>
    </Fade>
  );
}

// ─── Font ─────────────────────────────────────────────────────────────────────
function FontPage() {
  return (
    <Fade>
      <div className="archive-header">
        <span>Font</span>
        <span>typeface listing</span>
        <span>{fonts.length} typefaces</span>
      </div>
      <div className="font-list">
        {fonts.map(f => (
          <div key={f.id} className="font-item">
            <div className="font-preview-text">{f.preview}</div>
            <div className="font-row">
              <span className="font-name">{f.name}</span>
              <span className="font-detail">{f.styles} style{f.styles > 1 ? 's' : ''} · {f.fileSize}</span>
              <span className="font-desc">{f.description}</span>
              <span className={`font-badge${f.price === 'free' ? ' free' : ''}`}>
                {f.price === 'free' ? 'Free' : `$${f.price}`}
              </span>
              <button className="font-dl">
                {f.price === 'free' ? 'Download' : 'Purchase'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </Fade>
  );
}

// ─── About ────────────────────────────────────────────────────────────────────
function AboutPage() {
  return (
    <Fade>
      <div className="archive-header">
        <span>About</span>
        <span></span>
        <span></span>
      </div>
      <div className="text-body">
        <p>What If.o is an independent archive documenting original characters
        created by multiple designers. Each entry represents a unique character
        with its own design history, narrative context, and visual identity.</p>
        <p>The archive is organised alphabetically and updated each semester
        as new characters are introduced. All works are owned by their respective creators.</p>
        <p>The What If.o Font collection comprises typefaces developed alongside
        the character archive.</p>
        <p>Founded 2025. Currently cataloguing {characters.length} characters.</p>
      </div>
    </Fade>
  );
}

// ─── Contact ──────────────────────────────────────────────────────────────────
function ContactPage() {
  return (
    <Fade>
      <div className="archive-header">
        <span>Contact</span>
        <span></span>
        <span></span>
      </div>
      <div className="text-body">
        <p>For inquiries regarding the archive, font licensing, submissions,
        or collaborations, please reach out by email.</p>
        <p><a href="mailto:hello@whatif.o" className="text-link">hello@whatif.o</a></p>
        <p>Response time is typically within 2–3 business days.</p>
        <p className="contact-note">To submit a character: send your site URL or thumbnail
        along with character name, category, and year.</p>
      </div>
    </Fade>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState<Page>('archive');
  const [lbSrc, setLbSrc] = useState<string | null>(null);

  return (
    <div className="app">
      <Sidebar page={page} setPage={setPage} />

      <main className="main">
        <AnimatePresence mode="wait">
          {page === 'archive' && <ArchivePage key="archive" open={setLbSrc} />}
          {page === 'preview' && <PreviewPage key="preview" open={setLbSrc} />}
          {page === 'font'    && <FontPage    key="font" />}
          {page === 'about'   && <AboutPage   key="about" />}
          {page === 'contact' && <ContactPage key="contact" />}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {lbSrc && <Lightbox src={lbSrc} onClose={() => setLbSrc(null)} />}
      </AnimatePresence>
    </div>
  );
}
