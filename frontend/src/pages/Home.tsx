import { Link, useSearchParams } from 'react-router-dom';
import { useRecipes } from '../hooks/useRecipes';
import { useCategories } from '../hooks/useCategories';
import { useFavorites } from '../hooks/useFavorites';
import { RecipeGridSkeleton } from '../components/ui/Skeletons';
import RecipeCard from '../components/RecipeCard';
import { chapterIcon } from '../utils/chapterIcons';
import { przepisy } from '../utils/plural';
import { FaCrown, FaChevronRight, FaTimes, FaSearch } from 'react-icons/fa';
import profileImg from '../assets/engibadwoman.jpg';

type Sort = 'date' | 'popular';

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categorySlug = searchParams.get('category');
  const query = searchParams.get('q') ?? '';
  const sort: Sort = searchParams.get('sort') === 'popular' ? 'popular' : 'date';

  const { recipes, loading, error } = useRecipes(categorySlug, query, 'dowolna', sort);
  const { chapters, findBySlug } = useCategories();
  const { isFavorite, toggle } = useFavorites();

  // Ustalenie, gdzie jesteśmy: rozdział i (opcjonalnie) podrozdział
  const activeCategory = findBySlug(categorySlug);
  const activeChapter = activeCategory
    ? chapters.find(ch => ch.id === (activeCategory.parent_category?.id ?? activeCategory.id)) ?? null
    : null;
  const activeSub = activeCategory?.parent_category ? activeCategory : null;

  const isStart = !categorySlug && !query;

  const setParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value); else params.delete(key);
    setSearchParams(params);
  };

  const sectionTitle = query
    ? <>Wyniki dla „<span className="text-chaber-soft">{query}</span>”</>
    : activeCategory
      ? activeCategory.name
      : sort === 'popular' ? 'Najpopularniejsze przepisy' : 'Najnowsze przepisy';

  return (
    <div className="max-w-6xl mx-auto px-4 pb-8">

      {/* WYSZUKIWARKA NA TELEFONIE */}
      <MobileSearch initial={query} onSearch={(q) => setSearchParams(q ? { q } : {})} />

      {/* ===== STRONA STARTOWA ===== */}
      {isStart && (
        <>
          <Hero />

          <section id="rozdzialy-sekcja" className="mt-12 sm:mt-16 scroll-mt-36" aria-labelledby="rozdzialy">
            <div className="flex items-end justify-between gap-4 mb-6">
              <h2 id="rozdzialy" className="font-display uppercase text-3xl sm:text-4xl tracking-wide">
                <span className="text-cream">Rozdziały</span> <span className="font-script normal-case text-chaber text-3xl sm:text-4xl">przepisów</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {chapters.map(ch => {
                const Icon = chapterIcon(ch.name);
                return (
                  <div key={ch.id} className="group relative bg-card border border-line rounded-2xl p-5 hover:border-chaber hover:shadow-neon transition-all">
                    <Link to={`/?category=${ch.slug}`} className="flex items-center gap-3 mb-3">
                      <span className="w-11 h-11 shrink-0 rounded-xl bg-chaber/15 border border-chaber/40 flex items-center justify-center">
                        <Icon className="text-chaber text-2xl" />
                      </span>
                      <span className="font-display uppercase tracking-wide text-lg leading-tight text-gold group-hover:text-chaber-soft transition-colors">
                        {ch.name}
                      </span>
                    </Link>
                    <ul className="flex flex-wrap gap-1.5">
                      {ch.children.slice(0, 5).map(sub => (
                        <li key={sub.id}>
                          <Link to={`/?category=${sub.slug}`} className="inline-block px-2.5 py-1 rounded-full text-xs text-muted bg-ink/60 border border-line hover:text-cream hover:border-chaber transition">
                            {sub.name}
                          </Link>
                        </li>
                      ))}
                      {ch.children.length > 5 && (
                        <li>
                          <Link to={`/?category=${ch.slug}`} className="inline-block px-2.5 py-1 text-xs font-semibold text-chaber-soft hover:text-chaber">
                            +{ch.children.length - 5} więcej
                          </Link>
                        </li>
                      )}
                    </ul>
                  </div>
                );
              })}
            </div>
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
            {(() => {
              const Icon = chapterIcon(activeChapter.name);
              return (
                <span className="w-14 h-14 shrink-0 rounded-2xl bg-chaber/15 border border-chaber/40 flex items-center justify-center">
                  <Icon className="text-chaber text-3xl" />
                </span>
              );
            })()}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-chaber-soft">Rozdział</p>
              <h1 className="font-display uppercase text-3xl sm:text-5xl tracking-wide text-gold leading-none">{activeChapter.name}</h1>
            </div>
          </div>

          {activeChapter.children.length > 0 && (
            <div className="-mx-4 px-4 overflow-x-auto no-scrollbar">
              <div className="flex sm:flex-wrap gap-2 pb-1 w-max sm:w-auto">
                <Chip to={`/?category=${activeChapter.slug}`} active={!activeSub}>Wszystkie</Chip>
                {activeChapter.children.map(sub => (
                  <Chip key={sub.id} to={`/?category=${sub.slug}`} active={activeSub?.id === sub.id}>{sub.name}</Chip>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* ===== LISTA PRZEPISÓW ===== */}
      <section className={isStart ? 'mt-14 sm:mt-16' : 'mt-8'} aria-live="polite">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 border-b border-line pb-4">
          <div>
            <h2 className="font-display uppercase text-2xl sm:text-3xl tracking-wide text-cream">{sectionTitle}</h2>
            {!loading && !error && (
              <p className="text-sm text-muted mt-1">{przepisy(recipes.length)}</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {query && (
              <button onClick={() => setParam('q', null)} className="flex items-center gap-1.5 text-sm text-muted hover:text-cream">
                <FaTimes /> Wyczyść
              </button>
            )}
            <div role="tablist" aria-label="Sortowanie" className="inline-flex p-1 rounded-full bg-card border border-line text-sm font-semibold">
              {([['date', 'Najnowsze'], ['popular', 'Popularne']] as const).map(([value, label]) => (
                <button
                  key={value}
                  role="tab"
                  aria-selected={sort === value}
                  onClick={() => setParam('sort', value === 'date' ? null : value)}
                  className={`px-4 h-9 rounded-full transition ${sort === value ? 'bg-chaber text-white' : 'text-muted hover:text-cream'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error ? (
          <p className="py-16 text-center text-chaber-soft font-semibold">Nie udało się wczytać przepisów: {error}</p>
        ) : loading ? (
          <RecipeGridSkeleton />
        ) : recipes.length === 0 ? (
          <div className="py-16 text-center bg-card border border-line rounded-2xl">
            <FaCrown className="text-gold text-3xl mx-auto mb-3" />
            <p className="text-lg font-semibold">Brak przepisów w tym miejscu.</p>
            <p className="text-muted text-sm mt-1 mb-5">Spróbuj innego rozdziału albo wyszukaj po składniku.</p>
            <Link to="/" className="inline-flex items-center h-11 px-6 rounded-full bg-chaber text-white font-bold text-sm hover:brightness-110">
              Wszystkie przepisy
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {recipes.map(recipe => (
              <RecipeCard key={recipe.id} recipe={recipe} isFavorite={isFavorite(recipe.id)} onToggleFavorite={toggle} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Chip({ to, active, children }: { to: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      aria-current={active ? 'page' : undefined}
      className={`whitespace-nowrap px-4 h-9 inline-flex items-center rounded-full text-sm font-semibold border transition ${
        active ? 'bg-chaber border-chaber text-white shadow-neon' : 'bg-card border-line text-muted hover:text-cream hover:border-chaber'
      }`}
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
        className="w-full h-11 pl-10 pr-4 rounded-full bg-card border border-line text-sm placeholder:text-muted focus:outline-none focus:border-chaber"
      />
    </form>
  );
}

function Hero() {
  return (
    <section className="relative mt-4 sm:mt-8 overflow-hidden rounded-3xl border border-line bg-panel">
      {/* dekoracyjna poświata */}
      <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-chaber/25 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 left-10 w-72 h-72 rounded-full bg-gold/10 blur-3xl pointer-events-none" />

      <div className="relative grid md:grid-cols-[1.4fr_1fr] items-center gap-8 p-6 sm:p-10 lg:p-14">
        <div>
          <p className="font-script text-chaber text-3xl sm:text-4xl mb-1">Witaj w</p>
          <h1 className="font-display uppercase leading-[0.95] tracking-wide text-5xl sm:text-6xl lg:text-7xl">
            <span className="text-gold block">Królewskiej</span>
            <span className="text-cream block">kuchni</span>
          </h1>
          <p className="mt-5 text-base sm:text-lg text-muted max-w-md leading-relaxed">
            Rozpieszczaj swoje zmysły i twórz magię we własnej kuchni. Poznaj ekskluzywne przepisy zrodzone z czystej pasji do jedzenia – podane z elegancją, na jaką zasługujesz każdego dnia!
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href="#rozdzialy-sekcja" className="inline-flex items-center h-12 px-6 rounded-full bg-chaber text-white font-bold hover:brightness-110 transition shadow-neon">
              Przeglądaj rozdziały
            </a>
            <Link to="/o-mnie" className="inline-flex items-center h-12 px-6 rounded-full border border-gold/60 text-gold font-bold hover:bg-gold/10 transition">
              Poznaj mnie
            </Link>
          </div>
        </div>

        <div className="hidden md:flex justify-center">
          <div className="relative w-64 h-64 lg:w-80 lg:h-80">
            <FaCrown className="absolute -top-9 left-1/2 -translate-x-1/2 text-gold text-5xl z-10 drop-shadow-[0_0_14px_rgba(244,199,82,0.7)]" />
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-chaber via-chaber/40 to-gold p-[3px] shadow-neon">
              <img src={profileImg} alt="Engibadwoman" className="w-full h-full rounded-full object-cover bg-ink" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
