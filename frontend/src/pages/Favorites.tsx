import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../api/client';
import type { Recipe } from '../types';
import { FaStar, FaCrown, FaGem } from 'react-icons/fa';

export default function Favorites() {
  const [favoriteRecipes, setFavoriteRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedIds: string[] = JSON.parse(localStorage.getItem('favorite_recipes') || '[]');

    if (savedIds.length === 0) {
      setLoading(false);
      return;
    }

    Promise.all(savedIds.map(id => apiClient.recipes.getById(id).catch(() => null)))
      .then(results => {
        setFavoriteRecipes(results.filter((r): r is Recipe => r !== null));
        setLoading(false);
      })
      .catch(err => {
        console.error("Błąd ładowania ulubionych przepisów:", err);
        setLoading(false);
      });
  }, []);

  const removeFromFavorites = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const savedIds: string[] = JSON.parse(localStorage.getItem('favorite_recipes') || '[]');
    const updatedIds = savedIds.filter(favId => favId !== id);
    localStorage.setItem('favorite_recipes', JSON.stringify(updatedIds));
    setFavoriteRecipes(prev => prev.filter(recipe => recipe.id !== id));
  };

  if (loading) return <div className="p-10 text-center text-[#1F51FF] font-bold text-glow">Ładowanie ulubionych... ✨</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 text-[#FDFBF7]">
      <h1 className="text-3xl md:text-4xl font-black text-[#FDFBF7] tracking-tight mb-2 text-glow flex items-center gap-2">
        <span className="text-gold">Twoje ulubione przepisy</span> <FaGem className="text-[#D4AF37]" />
      </h1>
      <p className="text-gray-300 text-sm md:text-base mb-8">
        Zapisane potrawy, do których możesz w każdej chwili wrócić. 💎
      </p>

      {favoriteRecipes.length === 0 ? (
        <div className="bg-[#0D1321] p-12 text-center rounded-3xl border border-[#540B0E] shadow-neon">
          <p className="text-gray-300 text-lg mb-4">Nie masz jeszcze żadnych ulubionych przepisów.</p>
          <Link
            to="/"
            className="inline-block bg-[#E60026] text-[#FDFBF7] font-black px-6 py-3 rounded-xl hover:bg-red-700 transition-all shadow-chili"
          >
            Przeglądaj przepisy ✨
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {favoriteRecipes.map(recipe => (
            <Link
              to={`/przepis/${recipe.id}`}
              key={`fav-${recipe.id}`}
              className="group block bg-[#0D1321] rounded-[2rem] overflow-hidden border border-[#540B0E] hover:border-[#1F51FF] transition-all duration-300 relative flex flex-col justify-between hover:shadow-neon hover:-translate-y-1"
            >
              <div>
                <button
                  onClick={(e) => removeFromFavorites(recipe.id, e)}
                  className="absolute top-4 right-4 z-20 w-10 h-10 bg-[#0D1321]/90 backdrop-blur rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform border border-[#540B0E]"
                  title="Usuń z ulubionych"
                >
                  <FaCrown className="text-[#D4AF37] text-lg" />
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

                <div className="p-6 pb-2">
                  <h2 className="text-xl font-black text-[#FDFBF7] group-hover:text-[#1F51FF] transition-colors line-clamp-2">
                    {recipe.name}
                  </h2>
                </div>
              </div>

              <div className="px-6 py-4 bg-[#1A0D16]/60 border-t border-[#540B0E] flex items-center justify-between text-xs font-bold text-gray-300 mt-2">
                <span className="flex items-center gap-1.5">
                  <FaStar className="text-[#D4AF37]" /> {recipe.prep_time} min
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}