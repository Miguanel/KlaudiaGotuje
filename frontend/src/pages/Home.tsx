import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { useRecipes } from '../hooks/useRecipes';
import { useCategories, updateCachedCategory, type Chapter } from '../hooks/useCategories';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import { useFavorites } from '../hooks/useFavorites';
import { RecipeGridSkeleton } from '../components/ui/Skeletons';
import RecipeCard from '../components/RecipeCard';
import { chapterIcon } from '../utils/chapterIcons';
import { chapterImage } from '../utils/chapterArt';
import { przepisy } from '../utils/plural';
import { FaCrown, FaChevronRight, FaTimes, FaSearch, FaHeart, FaCamera, FaTrashAlt, FaSpinner } from 'react-icons/fa';
import { GiCutDiamond, GiCrown, GiSparkles } from 'react-icons/gi';
import type { Category, Recipe } from '../types';

type Sort = 'date' | 'popular';

/** Ile podrozdziałów widać w banerze rozdziału, zanim pojawi się „+N więcej”. */
const VISIBLE_SUBS = 5;

/**
 * Szybkie skróty pod logo (pasek jak na projekcie klientki).
 * Nazwy podrozdziałów z recipes/structure.py – brakujące są po prostu pomijane.
 */
const FEATURED = [
  'Domowy chleb', 'Szybkie (do 20 minut)', 'Air fryer (Frytkownica beztłuszczowa)', 'Obiady', 'Desery',
  'Fit', 'Zupy', 'Ciasta i ciasteczka', 'Na zimno', 'Tanie gotowanie', 'Boże Narodzenie', 'Koktajle', 'Pierogi',
];

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const categorySlug = searchParams.get('category');
  const query = searchParams.get('q') ?? '';
  const sort: Sort = searchParams.get('sort') === 'popular' ? 'popular' : 'date';

  const { recipes, loading, error } = useRecipes(categorySlug, query, 'dowolna', sort);
  const { categories, chapters, findBySlug } = useCategories();
  const { isFavorite, toggle } = useFavorites();

  // Ustalenie, gdzie jesteśmy: rozdział i (opcjonalnie) podrozdział
  const activeCategory = findBySlug(categorySlug);
  const activeChapter = activeCategory
    ? chapters.find(ch => ch.id === (activeCategory.parent_category?.id ?? activeCategory.id)) ?? null
    : null;
  const activeSub = activeCategory?.parent_category ? activeCategory : null;

  const isStart = !categorySlug && !query;

  const setParam = (key: string, value: string | null, scroll = false) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value); else params.delete(key);
    setSearchParams(params, scroll ? { state: { scrollToRecipes: true } } : undefined);
  };

  // „Najnowsze” / „Najpopularniejsze” – płynne przewinięcie do listy przepisów
  useEffect(() => {
    if (!(location.state as { scrollToRecipes?: boolean } | null)?.scrollToRecipes) return;
    const id = requestAnimationFrame(() => {
      document.getElementById('lista-przepisow')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    return () => cancelAnimationFrame(id);
  }, [location.key, location.state]);

  const featured = useMemo(
    () => FEATURED.map(name => categories.find(c => c.name === name)).filter((c): c is Category => !!c),
    [categories],
  );

  const sectionTitle = query
    ? <>Wyniki dla „<span className="text-gold">{query}</span>”</>
    : activeCategory
      ? activeCategory.name
      : sort === 'popular' ? 'Najpopularniejsze przepisy' : 'Najnowsze przepisy';

  return (
    <div className="max-w-6xl mx-auto px-4 pb-8">

      {/* WYSZUKIWARKA NA TELEFONIE */}
      <MobileSearch initial={query} onSearch={(q) => setSearchParams(q ? { q } : {})} />

      {/* ===== STRONA STARTOWA (wg projektu klientki) ===== */}
      {isStart && (
        <>
          <BrandHero />

          <QuickLinks featured={featured} onSort={(s) => setParam('sort', s === 'date' ? null : s, true)} />

          <section id="rozdzialy-sekcja" className="mt-6 sm:mt-8 space-y-4 sm:space-y-5 scroll-mt-36" aria-label="Rozdziały przepisów">
            {chapters.map(ch => (
              <ChapterBanner key={ch.id} chapter={ch} image={chapterImage(ch, recipes)} />
            ))}
          </section>
        </>
      )}

      {/* ===== WIDOK ROZDZIAŁU ===== */}
      {activeChapter && (
        <section className="pt-6 sm:pt-10">
          <nav aria-label="Ścieżka" className="flex flex-wrap items-center gap-1.5 text-sm text-muted mb-5">
            <Link to="/" className="hover:text-cream">Przepisy</Link>
            <FaChevronRight className="text-[10px]" />
            {activeSub ? (
              <>
                <Link to={`/?category=${activeChapter.slug}`} className="hover:text-cream">{activeChapter.name}</Link>
                <FaChevronRight className="text-[10px]" />
                <span className="text-cream font-semibold">{activeSub.name}</span>
              </>
            ) : (
              <span className="text-cream font-semibold">{activeChapter.name}</span>
            )}
          </nav>

          <div className="flex items-center gap-4 mb-6">
            <ShieldBadge chapter={activeChapter} />
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-widest text-gold">Rozdział</p>
              <h1 className="font-display uppercase text-2xl sm:text-4xl font-bold tracking-wide text-gold-shine leading-tight">{activeChapter.name}</h1>
              <Flourish className="mt-1" />
            </div>
          </div>

          {activeChapter.children.length > 0 && (
            <div className="-mx-4 px-4 overflow-x-auto no-scrollbar">
              <div className="flex sm:flex-wrap gap-2 pb-1 w-max sm:w-auto">
                <Chip to={`/?category=${activeChapter.slug}`} active={!activeSub}>Wszystkie</Chip>
                {activeChapter.children.map((sub, i) => (
                  <Chip key={sub.id} to={`/?category=${sub.slug}`} active={activeSub?.id === sub.id} navy={i % 2 === 0}>{sub.name}</Chip>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* ===== LISTA PRZEPISÓW ===== */}
      <section id="lista-przepisow" className={`scroll-mt-32 ${isStart ? 'mt-12 sm:mt-14' : 'mt-8'}`} aria-live="polite">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div className="min-w-0">
            <h2 className="flex items-center gap-3 font-display uppercase font-bold text-2xl sm:text-3xl tracking-wide text-gold-shine">
              <GiCrown className="text-gold shrink-0 text-3xl drop-shadow-[0_0_8px_rgba(212,175,55,0.6)]" aria-hidden="true" />
              <span className="min-w-0">{sectionTitle}</span>
            </h2>
            {!loading && !error && (
              <div className="flex items-center gap-3 mt-1">
                <p className="text-sm text-muted whitespace-nowrap">{przepisy(recipes.length)}</p>
                <span className="h-px w-32 sm:w-48 bg-gradient-to-r from-gold/70 to-transparent" aria-hidden="true" />
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {query && (
              <button onClick={() => setParam('q', null)} className="flex items-center gap-1.5 text-sm text-muted hover:text-cream">
                <FaTimes /> Wyczyść
              </button>
            )}
            <div role="tablist" aria-label="Sortowanie" className="inline-flex p-1 rounded-full bg-panel border border-gold/50 text-sm font-semibold">
              {([['date', 'Najnowsze'], ['popular', 'Popularne']] as const).map(([value, label]) => (
                <button
                  key={value}
                  role="tab"
                  aria-selected={sort === value}
                  onClick={() => setParam('sort', value === 'date' ? null : value, true)}
                  className={`flex items-center gap-2 px-4 h-9 rounded-full border transition ${
                    sort === value ? 'text-cream bg-gradient-to-b from-[#6E1519] to-burgundy border-gold/70' : 'text-muted border-transparent hover:text-cream'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full transition ${sort === value ? 'bg-gold shadow-[0_0_8px_#D4AF37]' : 'bg-line'}`} aria-hidden="true" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error ? (
          <p className="py-16 text-center text-cream font-semibold">Nie udało się wczytać przepisów: {error}</p>
        ) : loading ? (
          <RecipeGridSkeleton />
        ) : recipes.length === 0 ? (
          <div className="py-16 text-center bg-card border border-gold/30 rounded-2xl">
            <FaCrown className="text-gold text-3xl mx-auto mb-3" />
            <p className="text-lg font-semibold">Brak przepisów w tym miejscu.</p>
            <p className="text-muted text-sm mt-1 mb-5">Spróbuj innego rozdziału albo wyszukaj po składniku.</p>
            <Link to="/" className="inline-flex items-center h-11 px-6 rounded-full bg-chili text-white font-bold text-sm hover:brightness-110">
              Wszystkie przepisy
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {recipes.map((recipe: Recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} isFavorite={isFavorite(recipe.id)} onToggleFavorite={toggle} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Elementy strony startowej                                          */
/* ------------------------------------------------------------------ */

/** Duże logo „Diamentowe Smaki / Engibadwoman” z koroną – jak na grafice klientki. */
function BrandHero() {
  return (
    <section className="relative pt-8 sm:pt-12 pb-2 text-center">
      {/* poświata i ozdobne diamenty */}
      <div className="absolute left-1/2 top-6 -translate-x-1/2 w-[34rem] max-w-full h-48 rounded-full bg-cobalt/15 blur-3xl pointer-events-none" aria-hidden="true" />
      <GiCutDiamond className="hidden sm:block absolute left-[6%] top-16 text-4xl text-cream/70 rotate-[-18deg] drop-shadow-[0_0_12px_rgba(159,187,255,0.7)] animate-twinkle" aria-hidden="true" />
      <GiSparkles className="hidden sm:block absolute left-[14%] top-8 text-xl text-gold/80 animate-twinkle [animation-delay:1.2s]" aria-hidden="true" />
      <FaHeart className="hidden sm:block absolute right-[8%] top-20 text-3xl text-gold/80 rotate-12 drop-shadow-[0_0_10px_rgba(212,175,55,0.6)]" aria-hidden="true" />
      <GiSparkles className="hidden sm:block absolute right-[16%] top-6 text-2xl text-cream/70 animate-twinkle [animation-delay:.6s]" aria-hidden="true" />

      <div className="relative">
        <GiCrown className="mx-auto text-gold text-4xl sm:text-5xl drop-shadow-[0_0_14px_rgba(212,175,55,0.75)]" aria-hidden="true" />
        <h1 className="font-brand font-bold leading-none text-[2.6rem] sm:text-6xl lg:text-7xl text-gold-shine drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)]">
          Diamentowe Smaki
        </h1>
        <p className="font-script text-gold text-4xl sm:text-5xl lg:text-6xl -mt-1 sm:-mt-2 drop-shadow-[0_0_10px_rgba(212,175,55,0.35)]">
          Engibadwoman
        </p>
        <Flourish className="justify-center mt-2" wide />
      </div>
    </section>
  );
}

/** Pasek skrótów w złotej ramce: ostatnio dodane, klasyki i wybrane podrozdziały. */
function QuickLinks({ featured, onSort }: { featured: Category[]; onSort: (s: Sort) => void }) {
  const [expanded, setExpanded] = useState(false);
  const VISIBLE = 2;
  const shown = expanded ? featured : featured.slice(0, VISIBLE);
  const hidden = featured.length - VISIBLE;

  return (
    <nav aria-label="Szybkie skróty" className="mt-6 sm:mt-8 frame-gold rounded-2xl p-3 sm:p-4">
      <ul className="-mx-3 px-3 py-1 sm:mx-0 sm:px-0 flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar sm:flex-wrap sm:justify-center">
        <li className="shrink-0">
          <button onClick={() => onSort('date')} className="pill pill-burgundy whitespace-nowrap">
            <GiCutDiamond className="text-gold text-base" aria-hidden="true" /> Ostatnio dodane
          </button>
        </li>
        <li className="shrink-0">
          <button onClick={() => onSort('popular')} className="pill pill-navy whitespace-nowrap">
            <GiCutDiamond className="text-gold text-base" aria-hidden="true" /> Popularne klasyki
          </button>
        </li>
        {shown.map((c, i) => (
          <li key={c.id} className="shrink-0">
            <Link to={`/?category=${c.slug}`} className={`pill whitespace-nowrap ${i % 2 === 0 ? 'pill-burgundy' : 'pill-navy'}`}>{c.name}</Link>
          </li>
        ))}
        {hidden > 0 && (
          <li className="shrink-0">
            <MoreButton expanded={expanded} count={hidden} onClick={() => setExpanded(e => !e)} />
          </li>
        )}
      </ul>
    </nav>
  );
}

/** Baner rozdziału: tarcza z ikoną, złoty tytuł, podrozdziały i grafika po prawej. */
function ChapterBanner({ chapter, image }: { chapter: Chapter; image: string | null }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = chapterIcon(chapter.name);
  const subs = expanded ? chapter.children : chapter.children.slice(0, VISIBLE_SUBS);
  const hidden = chapter.children.length - VISIBLE_SUBS;

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-gold/70 bg-velvet shadow-banner">
      {/* grafika po prawej, rozmyta w lewo */}
      {image ? (
        <img
          src={image}
          alt=""
          loading="lazy"
          className="absolute inset-y-0 right-0 h-full w-[75%] sm:w-[55%] object-cover opacity-45 sm:opacity-90 mask-fade-left transition-transform duration-[1.2s] group-hover:scale-105"
        />
      ) : (
        <Icon className="absolute -right-6 sm:right-6 top-1/2 -translate-y-1/2 text-[9rem] sm:text-[12rem] text-gold/10 rotate-12 pointer-events-none" aria-hidden="true" />
      )}
      {/* burgundowy pas pod tytułem */}
      <div className="absolute inset-x-0 top-0 h-28 sm:h-32 mask-fade-bottom bg-[linear-gradient(90deg,rgba(84,11,14,0.95)_0%,rgba(84,11,14,0.7)_35%,rgba(84,11,14,0)_70%)] pointer-events-none" aria-hidden="true" />
      {/* wewnętrzna, cienka ramka */}
      <div className="absolute inset-1.5 rounded-xl border border-gold/20 pointer-events-none" aria-hidden="true" />

      <div className="relative z-10 p-4 sm:p-6 sm:pr-8">
        <div className="flex items-center gap-3 sm:gap-5">
          <ShieldBadge chapter={chapter} Icon={Icon} />
          <div className="min-w-0">
            <Link
              to={`/?category=${chapter.slug}`}
              className="block font-display font-bold uppercase tracking-wide text-xl sm:text-3xl leading-tight text-gold-shine hover:brightness-125 transition"
            >
              {chapter.name}
            </Link>
            <Flourish className="mt-1" />
          </div>
        </div>

        {chapter.children.length > 0 && (
          <ul className="mt-4 sm:mt-5 flex flex-wrap items-center gap-2 sm:gap-3 sm:max-w-[80%]">
            {subs.map((sub, i) => (
              <li key={sub.id}>
                <Link to={`/?category=${sub.slug}`} className={`pill ${i % 2 === 0 ? 'pill-burgundy' : 'pill-navy'}`}>
                  {sub.name}
                </Link>
              </li>
            ))}
            {hidden > 0 && (
              <li>
                <MoreButton expanded={expanded} count={hidden} onClick={() => setExpanded(e => !e)} />
              </li>
            )}
          </ul>
        )}
      </div>

      <AdminImageControls chapter={chapter} />
    </article>
  );
}

/**
 * Widoczne tylko po zalogowaniu: wgranie / zmiana / usunięcie grafiki w tle banera.
 * Grafika zapisuje się na serwerze (pole Category.image) i od razu pojawia się na stronie.
 */
function AdminImageControls({ chapter }: { chapter: Chapter }) {
  const { isAuthenticated, token } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAuthenticated || !token) return null;

  const run = async (action: () => Promise<Parameters<typeof updateCachedCategory>[0]>) => {
    setBusy(true);
    setError(null);
    try {
      updateCachedCategory(await action());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Coś poszło nie tak');
    } finally {
      setBusy(false);
    }
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) run(() => apiClient.categories.uploadImage(chapter.id, file, token));
  };

  const btn = 'inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-semibold bg-ink/85 backdrop-blur border border-gold/50 text-cream hover:border-gold hover:text-gold transition disabled:opacity-60';

  return (
    <div className="relative z-20 flex flex-col items-start gap-1.5 px-4 pb-4 -mt-1 sm:absolute sm:top-3 sm:right-3 sm:items-end sm:p-0 sm:mt-0">
      <div className="flex gap-1.5">
        <button type="button" className={btn} disabled={busy} onClick={() => inputRef.current?.click()} title="Wgraj grafikę w tle tego rozdziału">
          {busy ? <FaSpinner className="animate-spin" /> : <FaCamera className="text-gold" />}
          {chapter.image_url ? 'Zmień tło' : 'Dodaj tło'}
        </button>
        {chapter.image_url && (
          <button
            type="button"
            className={btn}
            disabled={busy}
            onClick={() => { if (window.confirm(`Usunąć grafikę z rozdziału „${chapter.name}”?`)) run(() => apiClient.categories.removeImage(chapter.id, token)); }}
            title="Usuń grafikę"
            aria-label="Usuń grafikę"
          >
            <FaTrashAlt className="text-chili" />
          </button>
        )}
      </div>
      {error && <p role="alert" className="max-w-56 sm:text-right text-xs font-semibold text-cream bg-chili/90 rounded-lg px-2.5 py-1">{error}</p>}
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onFile} />
    </div>
  );
}

/** Burgundowa tarcza w złotej ramce z koroną – ikona rozdziału. */
function ShieldBadge({ chapter, Icon }: { chapter: Chapter; Icon?: ReturnType<typeof chapterIcon> }) {
  const I = Icon ?? chapterIcon(chapter.name);
  return (
    <span className="relative shrink-0 pt-3" aria-hidden="true">
      <GiCrown className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/3 text-gold text-xl sm:text-2xl z-10 drop-shadow-[0_0_6px_rgba(212,175,55,0.7)]" />
      <span className="shield block w-14 h-16 sm:w-[4.5rem] sm:h-20 bg-gradient-to-b from-[#F3E3A3] via-gold to-gold-deep p-[2px]">
        <span className="shield flex items-center justify-center w-full h-full bg-gradient-to-b from-[#7A151A] to-[#3A0609]">
          <I className="text-gold text-3xl sm:text-4xl -mt-1.5 drop-shadow-[0_0_6px_rgba(212,175,55,0.5)]" />
        </span>
      </span>
    </span>
  );
}

/** Złoty ornament z serduszkiem pod tytułami. */
function Flourish({ className = '', wide = false }: { className?: string; wide?: boolean }) {
  const line = wide ? 'w-20 sm:w-32' : 'w-12 sm:w-24';
  return (
    <span className={`flex items-center gap-2 ${className}`} aria-hidden="true">
      <span className={`h-px ${line} bg-gradient-to-r from-transparent to-gold`} />
      <FaHeart className="text-gold text-[10px]" />
      <span className={`h-px ${line} bg-gradient-to-l from-transparent to-gold`} />
    </span>
  );
}

function MoreButton({ expanded, count, onClick }: { expanded: boolean; count: number; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={expanded}
      className="inline-flex items-center gap-1.5 h-9 px-2 text-sm sm:text-base text-gold hover:text-cream transition-colors"
    >
      {expanded ? 'Zwiń' : `+${count} więcej`}
      <FaChevronRight className={`text-xs transition-transform duration-300 ${expanded ? '-rotate-90' : ''}`} />
    </button>
  );
}

/* ------------------------------------------------------------------ */

function Chip({ to, active, navy = false, children }: { to: string; active: boolean; navy?: boolean; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      aria-current={active ? 'page' : undefined}
      className={`whitespace-nowrap ${active ? 'pill pill-active' : `pill ${navy ? 'pill-navy' : 'pill-burgundy'}`}`}
    >
      {children}
    </Link>
  );
}

function MobileSearch({ initial, onSearch }: { initial: string; onSearch: (q: string) => void }) {
  return (
    <form
      key={initial}
      role="search"
      className="md:hidden relative mt-4"
      onSubmit={(e) => {
        e.preventDefault();
        const q = String(new FormData(e.currentTarget).get('q') ?? '').trim();
        onSearch(q);
      }}
    >
      <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted text-sm pointer-events-none" />
      <input
        name="q"
        type="search"
        defaultValue={initial}
        placeholder="Szukaj przepisu lub składnika…"
        aria-label="Szukaj przepisu"
        className="w-full h-11 pl-10 pr-4 rounded-full bg-card border border-gold/40 text-sm placeholder:text-muted focus:outline-none focus:border-gold/70"
      />
    </form>
  );
}
