import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { characters } from './data/characters';
import { fonts } from './data/fonts';
import type { Character } from './data/characters';

type Page = 'archive' | 'preview' | 'font' | 'about' | 'contact';

const NAV_ITEMS: { label: string; page: Page }[] = [
  { label: 'Archive', page: 'archive' },
  { label: 'Preview', page: 'preview' },
  { label: 'Font', page: 'font' },
  { label: 'About', page: 'about' },
  { label: 'Contact', page: 'contact' },
];

// ─── Character click handler ──────────────────────────────────────────────────
// sheet 있으면 라이트박스, url 있으면 새 탭, 둘 다 없으면 무반응
function handleCharacterClick(char: Character, openLightbox: (src: string) => void) {
  if (char.sheet) {
    openLightbox(char.sheet);
  } else if (char.url) {
    window.open(char.url, '_blank', 'noopener,noreferrer');
  }
}

// ─── Thumbnail ────────────────────────────────────────────────────────────────
function Thumb({ char, className }: { char: Character; className: string }) {
  const src = char.thumbnail ?? char.sheet;
  if (src) {
    return <img src={src} alt={char.name} className={className} />;
  }
  return <div className={`${className} thumb-placeholder`} />;
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────
function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
  return (
    <motion.div
      className="lightbox-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onClick={onClose}
    >
      <motion.img
        src={src}
        className="lightbox-image"
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        transition={{ duration: 0.18 }}
        onClick={(e) => e.stopPropagation()}
      />
      <button className="lightbox-close" onClick={onClose}>✕</button>
    </motion.div>
  );
}

// ─── Nav ──────────────────────────────────────────────────────────────────────
function Nav({ page, setPage }: { page: Page; setPage: (p: Page) => void }) {
  return (
    <nav className="nav">
      <button className="nav-logo" onClick={() => setPage('archive')}>
        What If.o
      </button>
      <ul className="nav-links">
        {NAV_ITEMS.map(({ label, page: p }) => (
          <li key={p}>
            <button
              className={`nav-link${page === p ? ' active' : ''}`}
              onClick={() => setPage(p)}
            >
              {label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

// ─── Page wrapper ─────────────────────────────────────────────────────────────
function Page({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      className="page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
    >
      {children}
    </motion.div>
  );
}

// ─── Archive ──────────────────────────────────────────────────────────────────
function ArchivePage({ openLightbox }: { openLightbox: (src: string) => void }) {
  const sorted = useMemo(
    () => [...characters].sort((a, b) => a.name.localeCompare(b.name)),
    []
  );

  const clickable = (c: Character) => !!(c.sheet || c.url);

  return (
    <Page>
      <div className="page-header">
        <span className="page-header-title">Archive</span>
        <span className="page-header-meta">
          {characters.length} characters — alphabetical order
        </span>
      </div>

      <div className="archive-list">
        {sorted.map((char) => (
          <div
            key={char.id}
            className={`archive-item${clickable(char) ? ' is-link' : ''}`}
            onClick={() => handleCharacterClick(char, openLightbox)}
          >
            <Thumb char={char} className="archive-thumb" />
            <span className="archive-name">{char.name}</span>
            <span className="archive-creator">{char.creator}</span>
            <span className="archive-tag">{char.category}</span>
            <span className="archive-year">{char.year}</span>
            {char.url && <span className="archive-ext-icon">↗</span>}
          </div>
        ))}
      </div>
    </Page>
  );
}

// ─── Preview ──────────────────────────────────────────────────────────────────
function PreviewPage({ openLightbox }: { openLightbox: (src: string) => void }) {
  const sorted = useMemo(
    () => [...characters].sort((a, b) => a.name.localeCompare(b.name)),
    []
  );

  const clickable = (c: Character) => !!(c.sheet || c.url);

  return (
    <Page>
      <div className="page-header">
        <span className="page-header-title">Preview</span>
        <span className="page-header-meta">{characters.length} characters</span>
      </div>

      <div className="preview-grid">
        {sorted.map((char) => (
          <div
            key={char.id}
            className={`preview-card${clickable(char) ? ' is-link' : ''}`}
            onClick={() => handleCharacterClick(char, openLightbox)}
          >
            <Thumb char={char} className="preview-image" />
            <div className="preview-label">
              <span className="preview-name">{char.name}</span>
              <span className="preview-id">{char.id}</span>
            </div>
          </div>
        ))}
      </div>
    </Page>
  );
}

// ─── Font ─────────────────────────────────────────────────────────────────────
function FontPage() {
  return (
    <Page>
      <div className="page-header">
        <span className="page-header-title">Font</span>
        <span className="page-header-meta">{fonts.length} typefaces</span>
      </div>

      <div className="font-list">
        {fonts.map((font) => (
          <div key={font.id} className="font-item">
            <div className="font-preview">{font.preview}</div>

            <div className="font-meta-row">
              <div className="font-meta-left">
                <span className="font-name">{font.name}</span>
                <span className="font-detail">
                  {font.styles} style{font.styles > 1 ? 's' : ''} · {font.fileSize}
                </span>
                <span className="font-desc">{font.description}</span>
              </div>

              <div className="font-meta-right">
                <span className={`font-price-badge${font.price === 'free' ? ' is-free' : ''}`}>
                  {font.price === 'free' ? 'Free' : `$${font.price}`}
                </span>
                <button className="font-btn">
                  {font.price === 'free' ? 'Download' : 'Purchase'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Page>
  );
}

// ─── About ────────────────────────────────────────────────────────────────────
function AboutPage() {
  return (
    <Page>
      <div className="page-header">
        <span className="page-header-title">About</span>
      </div>
      <div className="text-page">
        <p>
          What If? is an independent archive documenting original characters
          created by multiple designers. Each entry represents a unique character
          with its own design history, narrative context, and visual identity.
        </p>
        <p>
          The archive is organised alphabetically and updated each semester
          as new characters are introduced. All works are owned by their
          respective creators.
        </p>
        <p>
          The What If? Font collection comprises typefaces developed alongside
          the character archive — each font informed by the visual language of
          the characters they accompany.
        </p>
        <p>
          Founded in 2025. Currently cataloguing{' '}
          {characters.length} characters across{' '}
          {[...new Set(characters.map((c) => c.category))].length} classifications.
        </p>
      </div>
    </Page>
  );
}

// ─── Contact ──────────────────────────────────────────────────────────────────
function ContactPage() {
  return (
    <Page>
      <div className="page-header">
        <span className="page-header-title">Contact</span>
      </div>
      <div className="text-page">
        <p>
          For inquiries regarding the archive, font licensing, submissions,
          or collaborations, please reach out by email.
        </p>
        <p>
          <a className="text-link" href="mailto:hello@whatif.archive">
            hello@whatif.archive
          </a>
        </p>
        <p>Response time is typically within 2–3 business days.</p>
        <p className="contact-note">
          To submit a character: send your site URL or thumbnail image
          along with character name, category, and year to the address above.
        </p>
      </div>
    </Page>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState<Page>('archive');
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  return (
    <>
      <Nav page={page} setPage={setPage} />

      <AnimatePresence mode="wait">
        {page === 'archive' && (
          <ArchivePage key="archive" openLightbox={setLightboxSrc} />
        )}
        {page === 'preview' && (
          <PreviewPage key="preview" openLightbox={setLightboxSrc} />
        )}
        {page === 'font'    && <FontPage    key="font"    />}
        {page === 'about'   && <AboutPage   key="about"   />}
        {page === 'contact' && <ContactPage key="contact" />}
      </AnimatePresence>

      <AnimatePresence>
        {lightboxSrc && (
          <Lightbox
            src={lightboxSrc}
            onClose={() => setLightboxSrc(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
