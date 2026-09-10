import { useState, useRef, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useRecipes } from '../hooks/useRecipes';
import { useCategories } from '../hooks/useCategories';
import { useTags } from '../hooks/useTags';
import { useDebounce } from '../hooks/useDebounce';
import { apiClient } from '../api/client';
import { RecipeGridSkeleton } from '../components/ui/Skeletons';
import { MdAutoFixHigh, MdWorkspacePremium, MdStar, MdChatBubble, MdPhotoCamera } from 'react-icons/md';
import { RiDiamondFill, RiSparklingFill } from 'react-icons/ri';
import { FaCrown, FaGem } from 'react-icons/fa';

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

  if (error) return <div className="p-10 text-center text-[#E60026] font-medium">Błąd: {error}</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 text-[#FDFBF7]">
      {/* OKRUSZKI (BREADCRUMBS) */}
      <nav className="flex items-center text-[15px] text-gray-300 font-medium mb-6 bg-[#0D1321] border border-[#540B0E] px-4 py-2.5 rounded-xl shadow-sm w-fit">
        <button onClick={() => setSearchParams({})} className="text-[#1F51FF] hover:text-[#FDFBF7] transition-all flex items-center gap-1.5 font-bold">
          <MdAutoFixHigh className="text-[#1F51FF]" /> Przepisy
        </button>
        {nazwaAktywnejKategorii && (
          <>
            <span className="mx-2 text-gray-500 font-bold">›</span>
            <span className="text-[#D4AF37] font-bold">{nazwaAktywnejKategorii}</span>
          </>
        )}
        {nazwaAktywnegoTagu && (
          <>
            <span className="mx-2 text-gray-500 font-bold">›</span>
            <span className="text-[#FDFBF7] font-bold">#{nazwaAktywnegoTagu}</span>
          </>
        )}
      </nav>

      {/* NAGŁÓWEK I WYSZUKIWARKA */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6 border-b border-[#540B0E] pb-8">
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-black text-[#FDFBF7] tracking-tight mb-2 flex items-center gap-2">
            <FaCrown className="text-[#D4AF37]" style={{ filter: 'drop-shadow(0 0 8px rgba(212,175,35,0.6))' }} />
            <span className="text-gold">Odkryj przepisy</span>
            <RiDiamondFill className="text-[#D4AF37] ml-1" />
          </h1>
          <p className="text-[#FDFBF7] text-sm md:text-base mb-6 font-medium flex items-center gap-1.5">
            Co pysznego dzisiaj wyczarujemy? <FaGem className="text-[#D4AF37] inline" />
          </p>

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
              className="block w-full pl-10 pr-3 py-2.5 border border-[#540B0E] rounded-xl leading-5 bg-[#0D1321] text-[#FDFBF7] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1F51FF] focus:border-[#1F51FF] transition-all shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* PASEK SORTOWANIA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-[#0D1321] p-4 rounded-2xl border border-[#540B0E] shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-xs font-black text-gray-300 uppercase tracking-wider">Sortuj:</span>
          <button
            onClick={() => ustawParametr('sort', 'date')}
            className={`text-sm font-bold transition-colors flex items-center gap-1.5 ${aktualneSortowanie === 'date' ? 'text-[#FDFBF7]' : 'text-gray-400 hover:text-[#1F51FF]'}`}
          >
            <span className={`w-2 h-2 rounded-full ${aktualneSortowanie === 'date' ? 'bg-[#D4AF37] shadow-[0_0_8px_#D4AF37]' : 'bg-[#540B0E]'}`}></span>
            Najnowsze <MdWorkspacePremium className="text-[#D4AF37] inline" />
          </button>
          <button
            onClick={() => ustawParametr('sort', 'popular')}
            className={`text-sm font-bold transition-colors flex items-center gap-1.5 ${aktualneSortowanie === 'popular' ? 'text-[#FDFBF7]' : 'text-gray-400 hover:text-[#1F51FF]'}`}
          >
            <span className={`w-2 h-2 rounded-full ${aktualneSortowanie === 'popular' ? 'bg-[#D4AF37] shadow-[0_0_8px_#D4AF37]' : 'bg-[#540B0E]'}`}></span>
            Bestsellery <RiDiamondFill className="text-[#D4AF37] inline text-xs" />
          </button>
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
            className="absolute left-0 z-10 hidden md:flex items-center justify-center w-8 h-8 bg-[#0D1321] border border-[#540B0E] rounded-full text-gray-300 hover:text-[#1F51FF] transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
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
                      className="absolute top-2 right-2 z-20 w-7 h-7 bg-[#0D1321]/90 backdrop-blur rounded-full flex items-center justify-center text-xs shadow hover:scale-110 transition-transform border border-[#540B0E]"
                    >
                      {isFav ? <FaGem className="text-[#D4AF37]" /> : <FaGem className="text-gray-500" />}
                    </button>
                    <img
                      src={apiClient.utils.getImageUrl(recipe.main_image_url)}
                      alt={recipe.name}
                      className="w-full h-full object-cover rounded-2xl shadow-sm border border-[#540B0E] group-hover/item:border-[#1F51FF] transition-all pointer-events-none"
                    />
                  </div>
                  <span className="font-bold text-xs text-[#FDFBF7] line-clamp-2 group-hover/item:text-[#1F51FF] transition-colors">
                    {recipe.name}
                  </span>
                </Link>
              );
            })}
          </div>

          <button
            className="absolute right-0 z-10 hidden md:flex items-center justify-center w-8 h-8 bg-[#0D1321] border border-[#540B0E] rounded-full text-gray-300 hover:text-[#1F51FF] transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
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
            className={`inline-block px-5 py-2.5 mr-2 mb-2 rounded-xl shadow-sm font-black text-sm uppercase transition-all ${
              !aktywnaKategoria ? 'bg-[#E60026] text-[#FDFBF7] shadow-chili scale-105' : 'bg-[#0D1321] text-gray-300 border border-[#540B0E] hover:text-[#1F51FF]'
            }`}
          >
            Wszystkie
          </button>

          {categories.map(cat => (
            <button
              key={`cat-${cat.id}`}
              onClick={() => ustawParametr('category', cat.slug)}
              className={`inline-block px-5 py-2.5 mr-2 mb-2 rounded-xl shadow-sm font-black text-sm uppercase transition-all ${
                aktywnaKategoria === cat.slug
                  ? 'bg-[#E60026] text-[#FDFBF7] shadow-chili scale-105'
                  : 'bg-[#0D1321] text-gray-300 border border-[#540B0E] hover:text-[#1F51FF]'
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
            <span className="text-xs font-black text-gray-400 uppercase tracking-wider mr-2">Tagi:</span>
            <button
              onClick={() => ustawParametr('tag', null)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                !aktywnyTag ? 'bg-[#1F51FF] text-[#FDFBF7] shadow-neon' : 'bg-[#0D1321] text-gray-300 border border-[#540B0E] hover:text-[#1F51FF]'
              }`}
            >
              Dowolne
            </button>
            {tags.map(tag => (
              <button
                key={`tag-pill-${tag.id}`}
                onClick={() => ustawParametr('tag', tag.slug)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  aktywnyTag === tag.slug
                    ? 'bg-[#1F51FF] text-[#FDFBF7] shadow-neon'
                    : 'bg-[#0D1321] text-gray-300 border border-[#540B0E] hover:text-[#1F51FF]'
                }`}
              >
                #{tag.name}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* SIATKA PRZEPISÓW */}
      {loading ? (
        <RecipeGridSkeleton />
      ) : recipes.length === 0 ? (
        <div className="bg-[#0D1321] p-12 text-center rounded-3xl border border-[#540B0E] shadow-neon">
          <p className="text-[#FDFBF7] text-lg font-bold flex items-center justify-center gap-2">
            Brak przepisów spełniających wybrane kryteria. <RiSparklingFill className="text-[#1F51FF]" />
          </p>
          <button onClick={() => setSearchParams({})} className="mt-4 text-[#1F51FF] font-black hover:underline flex items-center justify-center gap-1.5 mx-auto">
            <MdAutoFixHigh /> Wyczyść filtry
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
                className="group block bg-[#0D1321] rounded-[2rem] overflow-hidden border border-[#540B0E] hover:border-[#1F51FF] transition-all duration-300 relative flex flex-col justify-between hover:shadow-neon hover:-translate-y-1"
              >
                <div>
                  <button
                    onClick={(e) => toggleFavorite(recipe.id, e)}
                    className="absolute top-4 right-4 z-20 w-10 h-10 bg-[#0D1321]/90 backdrop-blur rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform border border-[#540B0E]"
                    title="Polub przepis"
                  >
                    {isFav ? <FaCrown className="text-[#D4AF37] text-base" /> : <FaGem className="text-gray-400 text-sm" />}
                  </button>

                  <div className="aspect-[4/3] bg-[#1A0D16] overflow-hidden relative">
                    {recipe.category && (
                      <span className="absolute top-4 left-4 bg-[#1F51FF]/90 backdrop-blur text-xs font-black px-3 py-1.5 rounded-xl text-[#FDFBF7] z-10 shadow-neon">
                        {recipe.category.name}
                      </span>
                    )}
                    <img
                      src={apiClient.utils.getImageUrl(recipe.main_image_url)}
                      alt={recipe.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out opacity-90 group-hover:opacity-100"
                    />
                  </div>

                  <div className="p-6 pb-4">
                    <h2 className="text-xl font-black text-[#FDFBF7] group-hover:text-[#1F51FF] transition-colors line-clamp-2">
                      {recipe.name}
                    </h2>
                  </div>
                </div>

                {/* DOLNY PASEK STATYSTYK */}
                <div className="px-6 py-4 bg-[#1A0D16]/60 border-t border-[#540B0E] flex items-center justify-between text-xs font-bold text-gray-300 mt-2">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5" title="Liczba komentarzy">
                      <MdChatBubble className="text-[#1F51FF]" /> {recipe.comments_count}
                    </span>
                    <span className="flex items-center gap-1.5" title="Liczba zdjęć">
                      <MdPhotoCamera className="text-[#1F51FF]" /> {recipe.photos_count}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[#D4AF37] font-black" style={{ filter: 'drop-shadow(0 0 6px rgba(212,175,35,0.6))' }}>
                    <MdStar className="text-base text-[#D4AF37]" />
                    <span className="text-gold">{recipe.average_rating !== null ? recipe.average_rating.toFixed(2) : 'Brak'}</span>
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