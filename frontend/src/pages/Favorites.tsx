import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../api/client';
import type { Recipe } from '../types';

export default function Favorites() {
  const [favoriteRecipes, setFavoriteRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Pobieramy zapisane ID ulubionych z localStorage
    const savedIds: string[] = JSON.parse(localStorage.getItem('favorite_recipes') || '[]');

    if (savedIds.length === 0) {
      setLoading(false);
      return;
    }

    // Pobieramy szczegóły przepisów z API dla zapisanych ID
    Promise.all(savedIds.map(id => apiClient.recipes.getById(id).catch(() => null)))
      .then(results => {
        // Filtrujemy null-y, jeśli jakiś przepis został usunięty z bazy
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

  if (loading) return <div className="p-10 text-center text-gray-500">Ładowanie ulubionych...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
        Twoje ulubione przepisy ❤️
      </h1>
      <p className="text-gray-500 text-sm md:text-base mb-8">
        Zapisane potrawy, do których możesz w każdej chwili wrócić.
      </p>

      {favoriteRecipes.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-gray-500 text-lg mb-4">Nie masz jeszcze żadnych ulubionych przepisów.</p>
          <Link
            to="/"
            className="inline-block bg-orange-500 text-white font-bold px-6 py-3 rounded-xl hover:bg-orange-600 transition-colors shadow-sm"
          >
            Przeglądaj przepisy
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {favoriteRecipes.map(recipe => (
            <Link
              to={`/przepis/${recipe.id}`}
              key={`fav-${recipe.id}`}
              className="group block bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 relative"
            >
              {/* Przycisk usuwania z ulubionych */}
              <button
                onClick={(e) => removeFromFavorites(recipe.id, e)}
                className="absolute top-4 right-4 z-20 w-9 h-9 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-red-500 shadow-md hover:bg-white transition-transform hover:scale-110"
                title="Usuń z ulubionych"
              >
                ❤️
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