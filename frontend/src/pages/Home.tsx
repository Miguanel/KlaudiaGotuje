import { useState, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useRecipes } from '../hooks/useRecipes';
import { useCategories } from '../hooks/useCategories';
import { useDebounce } from '../hooks/useDebounce';
import { apiClient } from '../api/client';
import { RecipeGridSkeleton } from '../components/ui/Skeletons'; // upewnij się, że ten plik istnieje!

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const aktywnaKategoria = searchParams.get('category'); // Zmiana z 'kategoria' na 'category'

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const { recipes, loading, error } = useRecipes(aktywnaKategoria, debouncedSearchTerm);
  const { categories } = useCategories();

  const carouselRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const ustawKategorie = (slug: string | null) => {
    if (slug) {
      setSearchParams({ category: slug });
    } else {
      setSearchParams({});
    }
  };

  const nazwaAktywnejKategorii = aktywnaKategoria
    ? categories.find(c => c.slug === aktywnaKategoria)?.name
    : null;

  if (error) return <div className="p-10 text-center text-red-500 font-medium">Błąd: {error}</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <nav className="flex items-center text-[15px] text-gray-600 font-medium mb-6 bg-white border border-gray-200 px-4 py-2.5 rounded-md shadow-sm w-fit">
        <button onClick={() => ustawKategorie(null)} className="text-[#006600] hover:underline">
          Przepisy
        </button>
        {nazwaAktywnejKategorii && (
          <>
            <span className="mx-2 text-gray-500 font-bold">›</span>
            <span className="text-[#006600] hover:underline cursor-pointer">
              {nazwaAktywnejKategorii}
            </span>
          </>
        )}
      </nav>

      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6 border-b border-gray-200/60 pb-8">
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
            {nazwaAktywnejKategorii || 'Odkryj przepisy'}
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

      {/* KARUZELA PRZEPISÓW (Z obsługą przeciągania myszką i dotykiem) */}
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
            onMouseDown={(e) => {
              const slider = carouselRef.current;
              if (!slider) return;
              let isDown = true;
              let startX = e.pageX - slider.offsetLeft;
              let scrollLeft = slider.scrollLeft;

              const onMouseMove = (moveEvent: MouseEvent) => {
                if (!isDown) return;
                moveEvent.preventDefault();
                const x = moveEvent.pageX - slider.offsetLeft;
                const walk = (x - startX) * 1.5; // Prędkość przewijania (możesz dostosować)
                slider.scrollLeft = scrollLeft - walk;
              };

              const onMouseUp = () => {
                isDown = false;
                window.removeEventListener('mousemove', onMouseMove);
                window.removeEventListener('mouseup', onMouseUp);
              };

              window.addEventListener('mousemove', onMouseMove);
              window.addEventListener('mouseup', onMouseUp);
            }}
          >
            {recipes.map(recipe => (
              <Link
                to={`/przepis/${recipe.id}`}
                className="flex-none w-[120px] flex flex-col text-center snap-start group/item pointer-events-auto"
                key={`carousel-${recipe.id}`}
                // Zabezpieczenie przed przypadkowym kliknięciem w link podczas przeciągania karuzeli
                onClick={(e) => {
                  // Jeśli użytkownik przesuwał mysz (był drag), możemy ewentualnie zablokować kliknięcie,
                  // ale przy lekkim kliknięciu link zadziała poprawnie.
                }}
              >
                <img
                  src={apiClient.utils.getImageUrl(recipe.main_image_url)}
                  alt={recipe.name}
                  className="w-full h-[120px] object-cover rounded-2xl shadow-sm mb-2 group-hover/item:shadow-md transition-shadow pointer-events-none"
                />
                <span className="font-medium text-xs text-gray-800 line-clamp-2 group-hover/item:text-orange-500 transition-colors">
                  {recipe.name}
                </span>
              </Link>
            ))}
          </div>

          <button
            className="absolute right-0 z-10 hidden md:flex items-center justify-center w-8 h-8 bg-white/90 rounded-full shadow-md text-gray-600 hover:bg-white hover:text-orange-500 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
            onClick={() => scroll('right')}
          >
            ❯
          </button>
        </section>
      )}

      <section className="mb-10">
        <div className="flex justify-start md:justify-center md:flex-wrap overflow-x-auto py-2 whitespace-nowrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
          <button
            onClick={() => ustawKategorie(null)}
            className="inline-block px-4 py-2 mr-2 mb-2 bg-[#3b7f0c] text-white rounded-md shadow-sm font-bold text-sm uppercase hover:bg-[#2c5e09] transition-colors"
          >
            Wszystkie
          </button>

          {categories.map(cat => (
            <button
              key={`tag-${cat.id}`}
              onClick={() => ustawKategorie(cat.slug)}
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

      {loading ? (
        <RecipeGridSkeleton />
      ) : recipes.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-gray-500 text-lg">Brak przepisów w tej kategorii.</p>
          <button onClick={() => ustawKategorie(null)} className="mt-4 text-orange-500 font-bold hover:underline">
            Wróć do wszystkich przepisów
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {recipes.map(recipe => (
            <Link
              to={`/przepis/${recipe.id}`}
              key={`grid-${recipe.id}`}
              className="group block bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300"
            >
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
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-500 transition-colors">
                  {recipe.name}
                </h2>
                <div className="flex items-center text-sm font-medium text-gray-500">
                  <svg className="w-4 h-4 mr-1.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {recipe.prep_time} min
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}