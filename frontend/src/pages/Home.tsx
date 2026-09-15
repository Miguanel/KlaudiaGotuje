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
import { FaCrown, FaGem, FaChevronDown } from 'react-icons/fa';

// Słownik grupujący tagi na podstawie seed.py
const TAG_GROUPS_DEF: Record<string, string[]> = {
  "Kategorie dań": ["Śniadania", "Obiady", "Kolacje", "Przystawki", "Zupy", "Dania główne", "Desery", "Lunchbox", "Przekąski", "Dania jednogarnkowe", "Sosy i dipy"],
  "Diety i preferencje": ["Fit", "Lekka", "Bez glutenu", "Wysokobiałkowe", "Zamienniki słodyczy fit", "Zamienniki słodyczy z dobrym składem", "Niskokaloryczne (Low Calorie)", "Bez cukru", "Keto / Low Carb", "Zdrowe tłuszcze"],
  "Mięso i ryby": ["Z mięsem", "Dania drobiowe (Kurczak/Indyk)", "Wołowina & Wieprzowina", "Ryby", "Bez mięsa"],
  "Mączna magia i tradycja": ["Mączna Magia, Domowa Piekarnia & Tradycja", "Chleby / pieczywo", "Domowy chleb", "Drożdżowe", "Makarony", "Kluski", "Pierogi", "Naleśniki", "Gofry", "Pączki, oponki", "Rogale i rogaliki", "Bez pieczenia", "Ciasta i ciasteczka", "Wypieki na zakwasie", "Tarty na słodko i słono", "Cieszyńskie ciasteczka"],
  "Sezonowe i okazje": ["Sezonowe", "Wiosna", "Lato", "Jesień", "Zima", "Jesieniara", "Halloween", "Tłusty czwartek", "Wielkanoc", "Boże Narodzenie", "Imprezy", "Grill przystawki", "Walentynki", "Sylwester", "Klimatyczne wieczory"],
  "Składniki wiodące": ["Na słodko", "Na słono", "Ostre / Pikantne", "Cukinia", "Dynia", "Ziemniaki", "Jabłka", "Cynamon", "Jajka", "Owsianki", "Sałatki", "Owoce leśne", "Czekolada", "Twaróg / Nabiał", "Warzywa korzeniowe", "Grzyby"],
  "Spiżarnia i napoje": ["Spiżarnia", "Domowe weki", "Nalewki", "Napoje", "Koktajle", "Koktajle białkowe", "Rozgrzewające napary", "Kawy i herbaty smakowe"],
  "Sprzęt i czas": ["Czas, Sprzęt & Technika", "Szybkie (do 20 minut)", "Na zimno", "Air fryer (Frytkownica beztłuszczowa)", "Tradycyjne", "Tanie gotowanie", "Z kilku składników", "Z piekarnika", "Przetwory"]
};

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
  const [expandedTagGroup, setExpandedTagGroup] = useState<string | null>(null);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('favorite_recipes') || '[]');
    setFavorites(saved);
  }, []);

  // Inteligentne rozwijanie grupy po załadowaniu strony
  useEffect(() => {
    if (aktywnyTag && tags.length > 0 && !expandedTagGroup) {
      const activeTagObj = tags.find(t => t.slug === aktywnyTag);
      if (activeTagObj) {
        let foundGroup = "Pozostałe";
        for (const [groupName, tagList] of Object.entries(TAG_GROUPS_DEF)) {
          if (tagList.includes(activeTagObj.name)) {
            foundGroup = groupName;
            break;
          }
        }
        setExpandedTagGroup(foundGroup);
      }
    }
  }, [aktywnyTag, tags, expandedTagGroup]);

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

  // Mapowanie dynamicznych tagów z backendu na strukturę grup z fallbackiem
  const groupedTags = Object.keys(TAG_GROUPS_DEF).reduce((acc, key) => {
    acc[key] = [];
    return acc;
  }, {} as Record<string, typeof tags>);
  groupedTags["Pozostałe"] = [];

  tags.forEach(tag => {
    let assigned = false;
    for (const [groupName, tagNames] of Object.entries(TAG_GROUPS_DEF)) {
      if (tagNames.includes(tag.name)) {
        groupedTags[groupName].push(tag);
        assigned = true;
        break;
      }
    }
    if (!assigned) {
      groupedTags["Pozostałe"].push(tag);
    }
  });

  // Gwarancja porządku alfabetycznego
  Object.keys(groupedTags).forEach(key => {
    groupedTags[key].sort((a, b) => a.name.localeCompare(b.name, 'pl'));
  });

  if (error) return <div className="p-4 sm:p-10 text-center text-[#E60026] font-medium break-words">Błąd: {error}</div>;

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-6 sm:py-12 text-[#FDFBF7] overflow-x-hidden">

      {/* OKRUSZKI (BREADCRUMBS) */}
      <nav className="flex flex-wrap items-center gap-y-2 gap-x-1 sm:gap-x-2 text-xs sm:text-[15px] text-gray-300 font-medium mb-6 bg-[#0D1321] border border-[#540B0E] px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl shadow-sm w-full sm:w-fit break-words">
        <button onClick={() => setSearchParams({})} className="text-[#1F51FF] hover:text-[#FDFBF7] transition-all flex items-center gap-1 sm:gap-1.5 font-bold whitespace-nowrap">
          <MdAutoFixHigh className="text-[#1F51FF] flex-shrink-0" /> Przepisy
        </button>
        {nazwaAktywnejKategorii && (
          <>
            <span className="text-gray-500 font-black flex-shrink-0">›</span>
            <span className="text-[#D4AF37] font-bold break-words">{nazwaAktywnejKategorii}</span>
          </>
        )}
        {nazwaAktywnegoTagu && (
          <>
            <span className="text-gray-500 font-black flex-shrink-0">›</span>
            <span className="text-[#FDFBF7] font-bold break-words">#{nazwaAktywnegoTagu}</span>
          </>
        )}
      </nav>

      {/* NAGŁÓWEK I WYSZUKIWARKA */}
      <div className="flex flex-col mb-6 sm:mb-8 gap-4 sm:gap-6 border-b border-[#540B0E] pb-6 sm:pb-8">
        <div className="w-full">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#FDFBF7] tracking-tight mb-2 flex items-center flex-wrap gap-2">
            <FaCrown className="text-[#D4AF37] flex-shrink-0" style={{ filter: 'drop-shadow(0 0 8px rgba(212,175,35,0.6))' }} />
            <span className="text-gold break-words">Odkryj przepisy</span>
            <RiDiamondFill className="text-[#D4AF37] ml-1 flex-shrink-0" />
          </h1>
          <p className="text-[#FDFBF7] text-xs sm:text-sm md:text-base mb-4 sm:mb-6 font-medium flex items-center flex-wrap gap-1.5">
            Co pysznego dzisiaj wyczarujemy? <FaGem className="text-[#D4AF37] inline flex-shrink-0" />
          </p>

          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Szukaj przepisu lub składnika..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-9 sm:pl-10 pr-3 py-2 sm:py-2.5 border border-[#540B0E] rounded-xl text-xs sm:text-sm leading-5 bg-[#0D1321] text-[#FDFBF7] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1F51FF] focus:border-[#1F51FF] transition-all shadow-sm truncate"
            />
          </div>
        </div>
      </div>

      {/* PASEK SORTOWANIA */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8 bg-[#0D1321] p-3 sm:p-4 rounded-2xl border border-[#540B0E] shadow-sm">
        <div className="flex flex-wrap items-center gap-3 w-full">
          <span className="text-[10px] sm:text-xs font-black text-gray-300 uppercase tracking-wider flex-shrink-0 w-full sm:w-auto">Sortuj:</span>
          <button
            onClick={() => ustawParametr('sort', 'date')}
            className={`text-xs sm:text-sm font-bold transition-colors flex items-center gap-1 sm:gap-1.5 ${aktualneSortowanie === 'date' ? 'text-[#FDFBF7]' : 'text-gray-400 hover:text-[#1F51FF]'}`}
          >
            <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full flex-shrink-0 ${aktualneSortowanie === 'date' ? 'bg-[#D4AF37] shadow-[0_0_8px_#D4AF37]' : 'bg-[#540B0E]'}`}></span>
            Najnowsze <MdWorkspacePremium className="text-[#D4AF37] inline flex-shrink-0" />
          </button>
          <button
            onClick={() => ustawParametr('sort', 'popular')}
            className={`text-xs sm:text-sm font-bold transition-colors flex items-center gap-1 sm:gap-1.5 ${aktualneSortowanie === 'popular' ? 'text-[#FDFBF7]' : 'text-gray-400 hover:text-[#1F51FF]'}`}
          >
            <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full flex-shrink-0 ${aktualneSortowanie === 'popular' ? 'bg-[#D4AF37] shadow-[0_0_8px_#D4AF37]' : 'bg-[#540B0E]'}`}></span>
            Bestsellery <RiDiamondFill className="text-[#D4AF37] inline text-[10px] sm:text-xs flex-shrink-0" />
          </button>
        </div>
      </div>

      {/* FILTRY KATEGORII GŁÓWNYCH */}
      <section className="mb-6 sm:mb-8">
        <div className="flex flex-wrap justify-start sm:justify-start md:justify-center gap-2 py-2">
          <button
            onClick={() => ustawParametr('category', null)}
            className={`inline-block px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-xl shadow-sm font-black text-[10px] sm:text-sm uppercase transition-all duration-300 flex-shrink-0 ${
              !aktywnaKategoria ? 'bg-[#E60026] text-[#FDFBF7] shadow-chili sm:scale-105' : 'bg-[#0D1321] text-gray-300 border border-[#540B0E] hover:text-[#1F51FF]'
            }`}
          >
            Wszystkie
          </button>

          {categories.map(cat => (
            <button
              key={`cat-${cat.id}`}
              onClick={() => ustawParametr('category', cat.slug)}
              className={`inline-block px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-xl shadow-sm font-black text-[10px] sm:text-sm uppercase transition-all duration-300 flex-shrink-0 ${
                aktywnaKategoria === cat.slug
                  ? 'bg-[#E60026] text-[#FDFBF7] shadow-chili sm:scale-105'
                  : 'bg-[#0D1321] text-gray-300 border border-[#540B0E] hover:text-[#1F51FF]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      {/* PANEL Z KATEGORIAMI TAGÓW (Z FACHOWĄ ANIMACJĄ I NAPRAWIONYM BŁĘDEM KLIKANIA) */}
      {tags.length > 0 && (
        <section className="mb-6 bg-[#0D1321] p-3 sm:p-4 rounded-2xl border border-[#540B0E] relative">
          <div className="flex flex-col">

            {/* PRZYCISKI GRUP */}
            <div className="flex flex-wrap items-center gap-2 w-full z-10 relative bg-[#0D1321]">
              <span className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-wider mr-1 sm:mr-2">Grupy tagów:</span>

              <button
                onClick={() => { ustawParametr('tag', null); setExpandedTagGroup(null); }}
                className={`px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold transition-all duration-300 flex-shrink-0 ${
                  !aktywnyTag ? 'bg-[#1F51FF] text-[#FDFBF7] shadow-neon scale-105 border border-[#1F51FF]' : 'bg-[#1A0D16] text-gray-300 border border-[#540B0E] hover:border-[#1F51FF]'
                }`}
              >
                Dowolne (wszystkie)
              </button>

              {Object.entries(groupedTags).map(([groupName, groupTags]) => {
                if (groupTags.length === 0) return null;
                const isGroupExpanded = expandedTagGroup === groupName;
                const hasActiveTag = groupTags.some(t => t.slug === aktywnyTag);

                // --- ROZWIĄZANIE BŁĘDU Z DWOMA ZŁOTYMI KATEGORIAMI ---
                let btnStyles = 'bg-[#1A0D16] text-gray-300 border border-[#540B0E] hover:border-[#D4AF37]';

                if (hasActiveTag) {
                  // Priorytet 1: Grupa MA aktywny filtr -> Pełne złote tło
                  btnStyles = 'bg-[#D4AF37] text-[#0D1321] border-[#D4AF37] shadow-[0_0_8px_rgba(212,175,35,0.4)] scale-105';
                } else if (isGroupExpanded) {
                  // Priorytet 2: Grupa jest ROZWINIĘTA (ale bez aktywnego filtra) -> Złota ramka i tekst, ciemne tło
                  btnStyles = 'bg-[#1A0D16] text-[#D4AF37] border-[#D4AF37] shadow-[0_0_8px_rgba(212,175,35,0.2)]';
                }

                return (
                  <button
                    key={`group-btn-${groupName}`}
                    onClick={() => setExpandedTagGroup(isGroupExpanded ? null : groupName)}
                    className={`flex items-center gap-1.5 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full border text-[10px] sm:text-xs font-bold transition-all duration-300 flex-shrink-0 ${btnStyles}`}
                  >
                    {groupName}
                    <FaChevronDown className={`transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isGroupExpanded ? 'rotate-180' : ''}`} />
                  </button>
                );
              })}
            </div>

            {/* PŁYNNIE ANIMOWANE KONTENERY TAGÓW */}
            <div className="w-full">
              {Object.entries(groupedTags).map(([groupName, groupTags]) => {
                if (groupTags.length === 0) return null;
                const isGroupExpanded = expandedTagGroup === groupName;

                return (
                  <div
                    key={`group-panel-${groupName}`}
                    className={`grid transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                      isGroupExpanded
                        ? 'grid-rows-[1fr] opacity-100 translate-y-0'
                        : 'grid-rows-[0fr] opacity-0 -translate-y-2 pointer-events-none'
                    }`}
                  >
                    {/* Wymóg techniczny dla Tailwind grid-rows: min-h-0 pozwala elementowi skurczyć się do 0px */}
                    <div className="overflow-hidden min-h-0">
                      {/* pt-3 zastępuje margin, by nie było skoku wysokości podczas zamykania */}
                      <div className="pt-3">
                        <div className="p-3 sm:p-4 bg-[#1A0D16] border border-[#540B0E] rounded-xl flex flex-wrap gap-2 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
                          {groupTags.map(tag => (
                            <button
                              key={`tag-pill-${tag.id}`}
                              onClick={() => ustawParametr('tag', tag.slug)}
                              className={`px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold transition-all duration-300 break-words flex-shrink-0 ${
                                aktywnyTag === tag.slug
                                  ? 'bg-[#1F51FF] text-[#FDFBF7] shadow-neon scale-105'
                                  : 'bg-[#0D1321] text-gray-300 border border-[#540B0E] hover:border-[#1F51FF] hover:text-[#1F51FF]'
                              }`}
                            >
                              #{tag.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </section>
      )}

      {/* KARUZELA PRZEPISÓW */}
      {!loading && recipes.length > 0 && (
        <section
          className="relative py-2 sm:py-4 flex items-center my-4 sm:my-6 group"
          style={{
            WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 12px, #000 calc(100% - 12px), transparent)',
            maskImage: 'linear-gradient(90deg, transparent, #000 12px, #000 calc(100% - 12px), transparent)'
          }}
        >
          <button
            className="absolute left-0 z-10 hidden md:flex items-center justify-center w-8 h-8 bg-[#0D1321] border border-[#540B0E] rounded-full text-gray-300 hover:text-[#1F51FF] transition-all duration-300 opacity-0 group-hover:opacity-100 cursor-pointer shadow-md hover:scale-110"
            onClick={() => scroll('left')}
          >
            ❮
          </button>

          <div
            className="flex flex-nowrap gap-3 sm:gap-4 overflow-x-auto overflow-y-hidden w-full scroll-smooth snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] select-none cursor-grab active:cursor-grabbing pb-2"
            ref={carouselRef}
          >
            {recipes.map(recipe => {
              const isFav = favorites.includes(recipe.id);
              return (
                <Link to={`/przepis/${recipe.id}`} className="flex-none w-[100px] sm:w-[120px] flex flex-col text-center snap-start group/item pointer-events-auto relative" key={`carousel-${recipe.id}`}>
                  <div className="relative w-full aspect-square mb-1.5 sm:mb-2">
                    <button
                      onClick={(e) => toggleFavorite(recipe.id, e)}
                      className="absolute top-1 right-1 sm:top-2 sm:right-2 z-20 w-6 h-6 sm:w-7 sm:h-7 bg-[#0D1321]/90 backdrop-blur rounded-full flex items-center justify-center text-[10px] sm:text-xs shadow hover:scale-110 transition-transform duration-300 border border-[#540B0E]"
                    >
                      {isFav ? <FaGem className="text-[#D4AF37]" /> : <FaGem className="text-gray-500" />}
                    </button>
                    <img
                      src={apiClient.utils.getImageUrl(recipe.main_image_url)}
                      alt={recipe.name}
                      className="w-full h-full object-cover rounded-xl sm:rounded-2xl shadow-sm border border-[#540B0E] group-hover/item:border-[#1F51FF] transition-all duration-300 pointer-events-none text-[8px] text-center text-gray-500 break-words"
                    />
                  </div>
                  <span className="font-bold text-[10px] sm:text-xs text-[#FDFBF7] line-clamp-2 group-hover/item:text-[#1F51FF] transition-colors duration-300 px-1">
                    {recipe.name}
                  </span>
                </Link>
              );
            })}
          </div>

          <button
            className="absolute right-0 z-10 hidden md:flex items-center justify-center w-8 h-8 bg-[#0D1321] border border-[#540B0E] rounded-full text-gray-300 hover:text-[#1F51FF] transition-all duration-300 opacity-0 group-hover:opacity-100 cursor-pointer shadow-md hover:scale-110"
            onClick={() => scroll('right')}
          >
            ❯
          </button>
        </section>
      )}

      {/* SIATKA PRZEPISÓW */}
      {loading ? (
        <RecipeGridSkeleton />
      ) : recipes.length === 0 ? (
        <div className="bg-[#0D1321] p-6 sm:p-12 text-center rounded-2xl sm:rounded-3xl border border-[#540B0E] shadow-neon transition-all duration-500">
          <p className="text-[#FDFBF7] text-sm sm:text-lg font-bold flex flex-wrap items-center justify-center gap-2">
            Brak przepisów spełniających wybrane kryteria. <RiSparklingFill className="text-[#1F51FF] flex-shrink-0" />
          </p>
          <button onClick={() => setSearchParams({})} className="mt-4 text-[#1F51FF] font-black text-xs sm:text-base hover:underline flex items-center justify-center gap-1.5 mx-auto transition-transform hover:scale-105">
            <MdAutoFixHigh /> Wyczyść filtry
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8 w-full">
          {recipes.map(recipe => {
            const isFav = favorites.includes(recipe.id);
            return (
              <Link
                to={`/przepis/${recipe.id}`}
                key={`grid-${recipe.id}`}
                className="group block bg-[#0D1321] rounded-2xl sm:rounded-[2rem] overflow-hidden border border-[#540B0E] hover:border-[#1F51FF] transition-all duration-300 relative flex flex-col justify-between hover:shadow-neon hover:-translate-y-1 w-full"
              >
                <div className="w-full">
                  <button
                    onClick={(e) => toggleFavorite(recipe.id, e)}
                    className="absolute top-2 right-2 sm:top-4 sm:right-4 z-20 w-8 h-8 sm:w-10 sm:h-10 bg-[#0D1321]/90 backdrop-blur rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform duration-300 border border-[#540B0E]"
                    title="Polub przepis"
                  >
                    {isFav ? <FaCrown className="text-[#D4AF37] text-sm sm:text-base" /> : <FaGem className="text-gray-400 text-xs sm:text-sm" />}
                  </button>

                  <div className="aspect-[4/3] w-full bg-[#1A0D16] overflow-hidden relative">
                    {recipe.category && (
                      <span className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-[#1F51FF]/90 backdrop-blur text-[10px] sm:text-xs font-black px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl text-[#FDFBF7] z-10 shadow-neon max-w-[70%] truncate">
                        {recipe.category.name}
                      </span>
                    )}
                    <img
                      src={apiClient.utils.getImageUrl(recipe.main_image_url)}
                      alt={recipe.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out opacity-90 group-hover:opacity-100 text-xs text-center text-gray-500 break-words flex items-center justify-center"
                    />
                  </div>

                  <div className="p-4 sm:p-6 pb-2 sm:pb-4 w-full">
                    <h2 className="text-lg sm:text-xl font-black text-[#FDFBF7] group-hover:text-[#1F51FF] transition-colors duration-300 line-clamp-2 break-words">
                      {recipe.name}
                    </h2>
                  </div>
                </div>

                {/* DOLNY PASEK STATYSTYK */}
                <div className="px-4 py-3 sm:px-6 sm:py-4 bg-[#1A0D16]/60 border-t border-[#540B0E] flex flex-wrap items-center justify-between gap-2 text-[10px] sm:text-xs font-bold text-gray-300 mt-auto w-full transition-colors duration-300 group-hover:bg-[#1A0D16]">
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                    <span className="flex items-center gap-1 sm:gap-1.5" title="Liczba komentarzy">
                      <MdChatBubble className="text-[#1F51FF] flex-shrink-0" /> {recipe.comments_count}
                    </span>
                    <span className="flex items-center gap-1 sm:gap-1.5" title="Liczba zdjęć">
                      <MdPhotoCamera className="text-[#1F51FF] flex-shrink-0" /> {recipe.photos_count}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[#D4AF37] font-black flex-shrink-0 transition-transform duration-300 group-hover:scale-105" style={{ filter: 'drop-shadow(0 0 6px rgba(212,175,35,0.6))' }}>
                    <MdStar className="text-sm sm:text-base text-[#D4AF37] flex-shrink-0" />
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