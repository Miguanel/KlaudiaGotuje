import { useState, useRef, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useRecipes } from '../hooks/useRecipes';
import { useCategories } from '../hooks/useCategories';
import { useTags } from '../hooks/useTags';
import { useDebounce } from '../hooks/useDebounce';
import { apiClient } from '../api/client';
import { RecipeGridSkeleton } from '../components/ui/Skeletons';

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const aktywnaKategoria = searchParams.get('category');
  const aktywnyTag = searchParams.get('tag');
  const wybranadieta = searchParams.get('diet') || 'dowolna';
  const aktualneSortowanie = searchParams.get('sort') || 'date';

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const { recipes, loading, error } = useRecipes(aktywnaKategoria, debouncedSearchTerm, aktywnyTag, wybranadieta, aktualneSortowanie);
  const { categories } = useCategories();
  const { tags } = useTags();

  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('favorite_recipes') || '[]');
    setFavorites(saved);
  }, []);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    let updated: string[];
    if (favorites.includes(id)) {
      updated = favorites.filter(favId => favId !== id);
    } else {
      updated = [...favorites, id];
    }
    setFavorites(updated);
    localStorage.setItem('favorite_recipes', JSON.stringify(updated));
  };

  const ustawParametr = (klucz: string, wartosc: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (wartosc) {
      params.set(klucz, wartosc);
    } else {
      params.delete(klucz);
    }
    setSearchParams(params);
  };

  const carouselRef = useRef<HTMLDivElement>(null);
  const scroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const nazwaAktywnejKategorii = aktywnaKategoria ? categories.find(c => c.slug === aktywnaKategoria)?.name : null;
  const nazwaAktywnegoTagu = aktywnyTag ? tags.find(t => t.slug === aktywnyTag)?.name : null;

  if (error) return <div className="p-10 text-center text-red-500 font-medium">Błąd: {error}</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <nav className="flex items-center text-[15px] text-gray-600 font-medium mb-6 bg-white border border-gray-200 px-4 py-2.5 rounded-md shadow-sm w-fit">
        <button onClick={() => setSearchParams({})} className="text-[#006600] hover:underline">
          Przepisy
        </button>
        {nazwaAktywnejKategorii && (
          <>
            <span className="mx-2 text-gray-500 font-bold">›</span>
            <span className="text-[#006600]">{nazwaAktywnejKategorii}</span>
          </>
        )}
        {nazwaAktywnegoTagu && (
          <>
            <span className="mx-2 text-gray-500 font-bold">›</span>
            <span className="text-orange-600 font-bold">#{nazwaAktywnegoTagu}</span>
          </>
        )}
      </nav>

      {/* NAGŁÓWEK I WYSZUKIWARKA */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6 border-b border-gray-200/60 pb-8">
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
            {nazwaAktywnejKategorii || (nazwaAktywnegoTagu ? `Przepisy: #${nazwaAktywnegoTagu}` : 'Odkryj przepisy')}
          </h1>
          <p className="text-gray-500 text-sm md:text-base mb-6">Co dobrego dzisiaj ugotujemy?</p>

          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Szukaj przepisu lub składnika..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* PASEK SORTOWANIA I DIET (W STYLU ANI GOTUJE) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Sortuj:</span>
          <button
            onClick={() => ustawParametr('sort', 'date')}
            className={`text-sm font-bold transition-colors flex items-center gap-1.5 ${aktualneSortowanie === 'date' ? 'text-gray-950' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <span className={`w-2 h-2 rounded-full ${aktualneSortowanie === 'date' ? 'bg-[#2c5e09]' : 'bg-gray-300'}`}></span>
            Data publikacji
          </button>
          <button
            onClick={() => ustawParametr('sort', 'popular')}
            className={`text-sm font-bold transition-colors flex items-center gap-1.5 ${aktualneSortowanie === 'popular' ? 'text-gray-950' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <span className={`w-2 h-2 rounded-full ${aktualneSortowanie === 'popular' ? 'bg-[#2c5e09]' : 'bg-gray-300'}`}></span>
            Popularność
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Dieta:</span>
          <select
            value={wybranadieta}
            onChange={(e) => ustawParametr('diet', e.target.value)}
            className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-800 outline-none focus:border-[#2c5e09]"
          >
            <option value="dowolna">Dowolna</option>
            <option value="wege">Makarony</option>
            <option value="wegańska">Drożdżowe</option>
            <option value="bezglutenowa">Przetwory</option>
            <option value="fit">Fit / Lekka</option>
          </select>
        </div>
      </div>

      {/* KARUZELA PRZEPISÓW */}
      {!loading && recipes.length > 0 && (
        <section
          className="relative py-4 flex items-center my-6 group"
          style={{
            WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 24px, #000 calc(100% - 24px), transparent)',
            maskImage: 'linear-gradient(90deg, transparent, #000 24px, #000 calc(100% - 24px), transparent)'
          }}
        >
          <button
            className="absolute left-0 z-10 hidden md:flex items-center justify-center w-8 h-8 bg-white/90 rounded-full shadow-md text-gray-600 hover:bg-white hover:text-orange-500 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
            onClick={() => scroll('left')}
          >
            ❮
          </button>

          <div
            className="flex flex-nowrap gap-4 overflow-x-auto overflow-y-hidden w-full scroll-smooth snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] select-none cursor-grab active:cursor-grabbing"
            ref={carouselRef}
          >
            {recipes.map(recipe => {
              const isFav = favorites.includes(recipe.id);
              return (
                <Link to={`/przepis/${recipe.id}`} className="flex-none w-[120px] flex flex-col text-center snap-start group/item pointer-events-auto relative" key={`carousel-${recipe.id}`}>
                  <div className="relative w-full h-[120px] mb-2">
                    <button
                      onClick={(e) => toggleFavorite(recipe.id, e)}
                      className="absolute top-2 right-2 z-20 w-7 h-7 bg-white/80 backdrop-blur rounded-full flex items-center justify-center text-xs shadow hover:scale-110 transition-transform"
                    >
                      {isFav ? '❤️' : '🤍'}
                    </button>
                    <img
                      src={apiClient.utils.getImageUrl(recipe.main_image_url)}
                      alt={recipe.name}
                      className="w-full h-full object-cover rounded-2xl shadow-sm group-hover/item:shadow-md transition-shadow pointer-events-none"
                    />
                  </div>
                  <span className="font-medium text-xs text-gray-800 line-clamp-2 group-hover/item:text-orange-500 transition-colors">
                    {recipe.name}
                  </span>
                </Link>
              );
            })}
          </div>

          <button
            className="absolute right-0 z-10 hidden md:flex items-center justify-center w-8 h-8 bg-white/90 rounded-full shadow-md text-gray-600 hover:bg-white hover:text-orange-500 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
            onClick={() => scroll('right')}
          >
            ❯
          </button>
        </section>
      )}

      {/* FILTRY KATEGORII */}
      <section className="mb-6">
        <div className="flex justify-start md:justify-center md:flex-wrap overflow-x-auto py-2 whitespace-nowrap [&::-webkit-scrollbar]:hidden">
          <button
            onClick={() => ustawParametr('category', null)}
            className={`inline-block px-4 py-2 mr-2 mb-2 rounded-md shadow-sm font-bold text-sm uppercase transition-colors ${
              !aktywnaKategoria ? 'bg-[#2c5e09] text-white ring-2 ring-offset-1 ring-[#3b7f0c]' : 'bg-[#3b7f0c] text-white hover:bg-[#2c5e09]'
            }`}
          >
            Wszystkie kategorie
          </button>

          {categories.map(cat => (
            <button
              key={`cat-${cat.id}`}
              onClick={() => ustawParametr('category', cat.slug)}
              className={`inline-block px-4 py-2 mr-2 mb-2 text-white rounded-md shadow-sm font-bold text-sm uppercase transition-colors ${
                aktywnaKategoria === cat.slug
                  ? 'bg-[#2c5e09] ring-2 ring-offset-1 ring-[#3b7f0c]'
                  : 'bg-[#3b7f0c] hover:bg-[#2c5e09]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      {/* PASEK TAGÓW */}
      {tags.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center justify-start md:justify-center md:flex-wrap overflow-x-auto py-1 whitespace-nowrap [&::-webkit-scrollbar]:hidden gap-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-2">Tagi:</span>
            <button
              onClick={() => ustawParametr('tag', null)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                !aktywnyTag ? 'bg-orange-500 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Wszystkie tagi
            </button>
            {tags.map(tag => (
              <button
                key={`tag-pill-${tag.id}`}
                onClick={() => ustawParametr('tag', tag.slug)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                  aktywnyTag === tag.slug
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                #{tag.name}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* SIATKA PRZEPISÓW ZE STATYSTYKAMI W STYLU ANI GOTUJE */}
      {loading ? (
        <RecipeGridSkeleton />
      ) : recipes.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-gray-500 text-lg">Brak przepisów spełniających wybrane kryteria.</p>
          <button onClick={() => setSearchParams({})} className="mt-4 text-orange-500 font-bold hover:underline">
            Wyczyść filtry
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {recipes.map(recipe => {
            const isFav = favorites.includes(recipe.id);
            return (
              <Link
                to={`/przepis/${recipe.id}`}
                key={`grid-${recipe.id}`}
                className="group block bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 relative flex flex-col justify-between"
              >
                <div>
                  <button
                    onClick={(e) => toggleFavorite(recipe.id, e)}
                    className="absolute top-4 right-4 z-25 w-9 h-9 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                  >
                    {isFav ? '❤️' : '🤍'}
                  </button>

                  <div className="aspect-[4/3] bg-gray-100 overflow-hidden relative">
                    {recipe.category && (
                      <span className="absolute top-4 left-4 bg-white/90 backdrop-blur text-xs font-bold px-3 py-1.5 rounded-lg text-gray-800 z-10 shadow-sm">
                        {recipe.category.name}
                      </span>
                    )}
                    <img
                      src={apiClient.utils.getImageUrl(recipe.main_image_url)}
                      alt={recipe.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                  </div>

                  <div className="p-6 pb-4">
                    <h2 className="text-xl font-bold text-gray-900 group-hover:text-orange-500 transition-colors line-clamp-2">
                      {recipe.name}
                    </h2>
                  </div>
                </div>

                {/* DOLNY PASEK STATYSTYK (KOMENTARZE, ZDJĘCIA, OCENA) */}
                <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-gray-500 mt-2">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5" title="Liczba komentarzy">
                      💬 {recipe.comments_count}
                    </span>
                    <span className="flex items-center gap-1.5" title="Liczba zdjęć">
                      📷 {recipe.photos_count}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-red-700 font-extrabold">
                    <span>★</span>
                    <span>{recipe.average_rating !== null ? recipe.average_rating.toFixed(2) : 'Brak'}</span>
                  </div>
                </div>

              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}