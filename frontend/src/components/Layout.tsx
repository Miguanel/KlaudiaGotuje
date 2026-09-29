import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCategories } from '../hooks/useCategories';
import ChapterAccordion from './ChapterAccordion';
import ImageEditor from './ImageEditor';
import { useSiteImages } from '../hooks/useSiteImages';
import {
  FaCrown, FaHeart, FaShoppingBasket, FaPlus, FaSignOutAlt, FaSearch, FaChevronDown, FaBars, FaTimes,
  FaInstagram, FaTiktok, FaEnvelope,
} from 'react-icons/fa';

export function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <Link to="/" onClick={onClick} className="flex items-center gap-2 min-w-0 shrink-0" aria-label="Diamentowe Smaki – strona główna">
      <FaCrown className="text-gold text-2xl sm:text-3xl shrink-0 drop-shadow-[0_0_8px_rgba(244,199,82,0.55)]" />
      <span className="flex flex-col leading-none">
        <span className="font-brand font-bold text-lg sm:text-2xl tracking-wide text-gold-shine whitespace-nowrap">Diamentowe Smaki</span>
        <span className="font-script text-gold text-base sm:text-lg leading-tight">by Engibadwoman</span>
      </span>
    </Link>
  );
}

function SearchBox({ onDone, autoFocus = false }: { onDone?: () => void; autoFocus?: boolean }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [term, setTerm] = useState(params.get('q') ?? '');

  useEffect(() => { setTerm(params.get('q') ?? ''); }, [params]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = term.trim();
    navigate(q ? `/?q=${encodeURIComponent(q)}` : '/');
    onDone?.();
  };

  return (
    <form onSubmit={submit} role="search" className="relative w-full">
      <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted text-sm pointer-events-none" />
      <input
        type="search"
        value={term}
        autoFocus={autoFocus}
        onChange={(e) => setTerm(e.target.value)}
        placeholder="Szukaj przepisu lub składnika…"
        aria-label="Szukaj przepisu"
        className="w-full h-11 pl-10 pr-24 rounded-full bg-card border border-burgundy text-sm text-cream placeholder:text-muted focus:outline-none focus:border-gold/60 focus:ring-2 focus:ring-burgundy/60 transition"
      />
      <button type="submit" className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 px-4 rounded-full bg-chili text-white text-xs font-bold uppercase tracking-wide hover:brightness-110 transition">
        Szukaj
      </button>
    </form>
  );
}

export default function Layout() {
  const { isAuthenticated, logout } = useAuth();
  const { chapters } = useCategories();
  const site = useSiteImages();
  const pageBg = site.url('tlo-strony');
  const navigate = useNavigate();
  const location = useLocation();

  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const megaRef = useRef<HTMLDivElement>(null);

  // Zamykanie menu przy zmianie strony
  useEffect(() => {
    setMegaOpen(false);
    setMobileOpen(false);
  }, [location.pathname, location.search]);

  // Zamykanie mega-menu kliknięciem poza nim lub klawiszem Esc
  useEffect(() => {
    if (!megaOpen) return;
    const onClick = (e: MouseEvent) => {
      if (megaRef.current && !megaRef.current.contains(e.target as Node)) setMegaOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMegaOpen(false); };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [megaOpen]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const activeCategory = new URLSearchParams(location.search).get('category');
  const navLinkCls = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 h-full px-1 border-b-2 transition-colors ${
      isActive ? 'border-gold text-cream' : 'border-transparent text-muted hover:text-cream'
    }`;

  return (
    <div
      className="min-h-screen flex flex-col bg-royal text-cream overflow-x-hidden"
      style={pageBg ? {
        // własne tło strony przyciemnione granatem, żeby tekst był czytelny
        backgroundImage: `linear-gradient(rgba(7, 11, 28, 0.72), rgba(7, 11, 28, 0.86)), url("${pageBg}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      } : undefined}
    >
      <ImageEditor
        label="Tło całej strony"
        buttonLabel="Edytuj tło strony"
        currentUrl={pageBg}
        hint="poziome, min. 1920 × 1080 px, ciemne"
        onUpload={(f, t) => site.upload('tlo-strony', f, t)}
        onRemove={(t) => site.remove('tlo-strony', t)}
        className="fixed bottom-4 left-4 z-40 !h-10 !px-4"
      />
      <header className="sticky top-0 z-50 bg-panel/95 backdrop-blur-md border-b border-line">
        {/* GÓRNY PASEK: logo · wyszukiwarka · skróty */}
        <div className="max-w-6xl mx-auto px-4 h-16 sm:h-[72px] flex items-center gap-4">
          <Logo />

          <div className="hidden md:block flex-1 max-w-md mx-auto">
            <SearchBox />
          </div>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <Link to="/ulubione" className="hidden md:flex items-center gap-2 px-3 h-10 rounded-full text-sm font-semibold text-muted hover:text-cream hover:bg-card transition" title="Ulubione">
              <FaHeart className="text-chili" /> <span className="hidden lg:inline">Ulubione</span>
            </Link>
            <Link to="/zakupy" className="hidden md:flex items-center gap-2 px-3 h-10 rounded-full text-sm font-semibold text-muted hover:text-cream hover:bg-card transition" title="Lista zakupów">
              <FaShoppingBasket className="text-cobalt drop-shadow-[0_0_6px_rgba(31,81,255,0.8)]" /> <span className="hidden lg:inline">Zakupy</span>
            </Link>
            {isAuthenticated && (
              <>
                <Link to="/dodaj-przepis" className="hidden md:flex items-center gap-2 px-4 h-10 rounded-full bg-chili text-white text-sm font-bold hover:brightness-110 transition shadow-chili">
                  <FaPlus /> Dodaj
                </Link>
                <button onClick={handleLogout} className="hidden md:flex items-center justify-center w-10 h-10 rounded-full text-muted hover:text-cream hover:bg-card transition" title="Wyloguj">
                  <FaSignOutAlt />
                </button>
              </>
            )}
            <button
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-full text-cream hover:bg-card transition"
              onClick={() => setMobileOpen(o => !o)}
              aria-label={mobileOpen ? 'Zamknij menu' : 'Otwórz menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
            </button>
          </div>
        </div>

        {/* DOLNY PASEK NAWIGACJI (desktop) */}
        <div ref={megaRef} className="hidden md:block border-t border-line/60">
          <nav className="max-w-6xl mx-auto px-4 h-12 flex items-stretch gap-7 text-sm font-semibold">
            <button
              onClick={() => setMegaOpen(o => !o)}
              aria-expanded={megaOpen}
              className={`flex items-center gap-2 border-b-2 transition-colors ${megaOpen ? 'border-gold text-cream' : 'border-transparent text-cream hover:text-gold'}`}
            >
              <FaCrown className="text-gold" /> Przepisy
              <FaChevronDown className={`text-xs transition-transform duration-300 ${megaOpen ? 'rotate-180' : ''}`} />
            </button>
            <NavLink to="/" end state={{ scrollToRecipes: true }} className={({ isActive }) => navLinkCls({ isActive: isActive && !location.search })}>Najnowsze</NavLink>
            <NavLink to="/?sort=popular" state={{ scrollToRecipes: true }} className={() => navLinkCls({ isActive: location.search.includes('sort=popular') && !activeCategory })}>Najpopularniejsze</NavLink>
            <NavLink to="/ulubione" className={navLinkCls}>Ulubione</NavLink>
            <NavLink to="/zakupy" className={navLinkCls}>Lista zakupów</NavLink>
            <NavLink to="/o-mnie" className={navLinkCls}>O mnie</NavLink>
          </nav>

          {/* MEGA-MENU: wszystkie rozdziały i podrozdziały w jednym miejscu */}
          <div
            className={`absolute left-0 right-0 top-full bg-panel border-b border-line shadow-2xl shadow-black/60 transition-all duration-300 origin-top ${
              megaOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
            }`}
          >
            <div className="max-w-6xl mx-auto px-4 py-6 max-h-[70vh] overflow-y-auto">
              <p className="text-xs font-bold uppercase tracking-widest text-muted mb-4">Wybierz rozdział, aby zobaczyć podrozdziały</p>
              <ChapterAccordion chapters={chapters} activeSlug={activeCategory} twoColumns />
            </div>
          </div>
        </div>

        {/* MENU MOBILNE */}
        {mobileOpen && (
          <div className="md:hidden absolute top-full inset-x-0 bg-panel border-b border-line shadow-2xl shadow-black/70 max-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="px-4 py-4 space-y-5">
              <SearchBox onDone={() => setMobileOpen(false)} />

              <div className="grid grid-cols-3 gap-2 text-xs font-semibold">
                <Link to="/ulubione" className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-card border border-line">
                  <FaHeart className="text-chili text-lg" /> Ulubione
                </Link>
                <Link to="/zakupy" className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-card border border-line">
                  <FaShoppingBasket className="text-cobalt text-lg drop-shadow-[0_0_6px_rgba(31,81,255,0.8)]" /> Zakupy
                </Link>
                <Link to="/o-mnie" className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-card border border-line">
                  <FaCrown className="text-gold text-lg" /> O mnie
                </Link>
              </div>

              <div>
                <p className="label-pill mb-3">Rozdziały</p>
                <ChapterAccordion chapters={chapters} activeSlug={activeCategory} />
              </div>

              {isAuthenticated && (
                <div className="flex gap-2">
                  <Link to="/dodaj-przepis" className="flex-1 flex items-center justify-center gap-2 h-11 rounded-full bg-chili text-white font-bold text-sm">
                    <FaPlus /> Dodaj przepis
                  </Link>
                  <button onClick={handleLogout} className="flex items-center justify-center gap-2 h-11 px-4 rounded-full border border-line text-muted text-sm font-semibold">
                    <FaSignOutAlt /> Wyloguj
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-grow w-full">
        <Outlet />
      </main>

      <footer className="bg-panel border-t border-line mt-16">
        <div className="max-w-6xl mx-auto px-4 py-10 grid gap-10 md:grid-cols-[1.2fr_2fr_1fr]">
          <div className="space-y-3">
            <Logo />
            <p className="text-sm text-muted leading-relaxed max-w-xs">
              Królewskie przepisy na co dzień – lekko, sycąco i z charakterem.
            </p>
          </div>

          <div>
            <h4 className="font-display uppercase tracking-wide text-gold mb-3">Rozdziały</h4>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              {chapters.map(ch => (
                <li key={ch.id}>
                  <Link to={`/?category=${ch.slug}`} className="text-muted hover:text-gold transition-colors">{ch.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display uppercase tracking-wide text-gold mb-3">Obserwuj</h4>
            <div className="flex gap-3 mb-4">
              <a href="https://www.instagram.com/engibadwoman" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-10 h-10 rounded-full bg-card border border-line flex items-center justify-center hover:border-gold/60 hover:text-gold transition"><FaInstagram /></a>
              <a href="https://www.tiktok.com/@engibadwoman" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="w-10 h-10 rounded-full bg-card border border-line flex items-center justify-center hover:border-gold/60 hover:text-gold transition"><FaTiktok /></a>
              <a href="mailto:engibadwoman@gmail.com" aria-label="E-mail" className="w-10 h-10 rounded-full bg-card border border-line flex items-center justify-center hover:border-gold/60 hover:text-gold transition"><FaEnvelope /></a>
            </div>
            {!isAuthenticated && (
              <Link to="/login" className="text-xs text-muted/70 hover:text-muted transition-colors">Panel administratora</Link>
            )}
          </div>
        </div>
        <div className="border-t border-line/60 py-5 text-center text-xs text-muted">
          © {new Date().getFullYear()} Diamentowe Smaki · Engibadwoman. Wszystkie prawa zastrzeżone.
        </div>
      </footer>
    </div>
  );
}
