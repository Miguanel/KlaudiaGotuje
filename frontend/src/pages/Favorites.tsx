import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../api/client';
import type { Recipe } from '../types';
import { useFavorites } from '../hooks/useFavorites';
import RecipeCard from '../components/RecipeCard';
import { RecipeGridSkeleton } from '../components/ui/Skeletons';
import { FaHeart } from 'react-icons/fa';
import { przepisy } from '../utils/plural';

export default function Favorites() {
  const { favorites, isFavorite, toggle } = useFavorites();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  // Pobieramy przepisy tylko raz – późniejsze odznaczenie serca po prostu je ukrywa
  useEffect(() => {
    if (favorites.length === 0) {
      setLoading(false);
      return;
    }
    Promise.all(favorites.map(id => apiClient.recipes.getById(id).catch(() => null)))
      .then(results => setRecipes(results.filter((r): r is Recipe => r !== null)))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visible = recipes.filter(r => favorites.includes(r.id));

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
      <p className="font-script text-pink text-3xl">Twoje</p>
      <h1 className="font-display uppercase tracking-wide text-4xl sm:text-5xl text-gold leading-none mb-2">Ulubione przepisy</h1>
      <p className="text-muted mb-8">{loading ? 'Wczytywanie…' : `${przepisy(visible.length)} zapisanych na później`}</p>

      {loading ? (
        <RecipeGridSkeleton />
      ) : visible.length === 0 ? (
        <div className="py-16 text-center bg-card border border-line rounded-2xl">
          <FaHeart className="text-pink text-3xl mx-auto mb-3" />
          <p className="text-lg font-semibold">Nie masz jeszcze ulubionych przepisów.</p>
          <p className="text-muted text-sm mt-1 mb-5">Kliknij serduszko na zdjęciu przepisu, aby go tu zapisać.</p>
          <Link to="/" className="inline-flex items-center h-11 px-6 rounded-full bg-pink text-white font-bold text-sm hover:brightness-110">
            Przeglądaj przepisy
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {visible.map(recipe => (
            <RecipeCard key={recipe.id} recipe={recipe} isFavorite={isFavorite(recipe.id)} onToggleFavorite={toggle} />
          ))}
        </div>
      )}
    </div>
  );
}
