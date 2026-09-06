import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useRecipeDetail, useSimilarRecipes } from '../hooks/useRecipes';
import { apiClient } from '../api/client';
import IngredientsPanel from '../components/IngredientsPanel';
import RecipeSteps from '../components/RecipeSteps';
import CommentsSection from '../components/CommentsSection';

export default function RecipeDetail() {
  const { id } = useParams();
  const { recipe, loading, error } = useRecipeDetail(id);
  const { recipes: similarRecipes } = useSimilarRecipes(id);

  const [isFavorite, setIsFavorite] = useState(false);

  // Zwijanie strony do góry przy zmianie przepisu (gdy klikniemy w podpowiedź na samym dole)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  useEffect(() => {
    if (id) {
      const saved: string[] = JSON.parse(localStorage.getItem('favorite_recipes') || '[]');
      setIsFavorite(saved.includes(id));
    }
  }, [id]);

  const toggleFavorite = () => {
    if (!id) return;
    const saved: string[] = JSON.parse(localStorage.getItem('favorite_recipes') || '[]');
    let updated: string[];
    if (saved.includes(id)) {
      updated = saved.filter(favId => favId !== id);
      setIsFavorite(false);
    } else {
      updated = [...saved, id];
      setIsFavorite(true);
    }
    localStorage.setItem('favorite_recipes', JSON.stringify(updated));
  };

  const handleExportPDF = () => {
    window.print();
  };

  if (loading) return <div className="p-10 text-center font-bold text-gray-500">Ładowanie przepisu...</div>;
  if (error || !recipe) return <div className="p-10 text-center font-bold text-red-500">Błąd: {error || 'Nie znaleziono przepisu'}</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:py-8 print:p-0 print:max-w-none">

      {/* NAWIGACJA OKRUSZKOWA ORAZ PRZYCISKI AKCJĘ */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 print:hidden">
        <nav className="flex flex-wrap items-center gap-y-2 text-[14px] md:text-[15px] text-gray-600 font-medium bg-white border border-gray-200 px-4 py-2.5 rounded-md shadow-sm w-full md:w-fit">
          <Link to="/" className="text-[#006600] hover:underline">
            Przepisy
          </Link>

          {recipe.category?.parent_category && (
            <>
              <span className="mx-2 text-gray-500 font-bold">›</span>
              <Link
                to={`/?category=${recipe.category.parent_category.slug}`}
                className="text-[#006600] hover:underline whitespace-nowrap"
              >
                {recipe.category.parent_category.name}
              </Link>
            </>
          )}

          {recipe.category && (
            <>
              <span className="mx-2 text-gray-500 font-bold">›</span>
              <Link
                to={`/?category=${recipe.category.slug}`}
                className="text-[#006600] hover:underline whitespace-nowrap"
              >
                {recipe.category.name}
              </Link>
            </>
          )}
        </nav>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <button
            onClick={handleExportPDF}
            className="flex justify-center items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-white text-gray-700 border border-gray-200 hover:border-gray-300 shadow-sm transition-all"
            title="Pobierz przepis jako PDF"
          >
            <span>📥</span> Pobierz PDF
          </button>

          <button
            onClick={toggleFavorite}
            className={`flex justify-center items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all ${
              isFavorite
                ? 'bg-red-50 text-red-600 border border-red-200'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'
            }`}
          >
            <span>{isFavorite ? '❤️' : '🤍'}</span>
            {isFavorite ? 'W ulubionych' : 'Dodaj do ulubionych'}
          </button>
        </div>
      </div>

      {/* TYTUŁ I GŁÓWNE ZDJĘCIE PRZEPISU */}
      <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6 print:text-4xl">
        {recipe.name}
      </h1>

      <div className="rounded-2xl overflow-hidden mb-6 md:mb-8 shadow-md print:shadow-none print:mb-4">
        <img
          src={apiClient.utils.getImageUrl(recipe.main_image_url)}
          alt={recipe.name}
          className="w-full h-auto object-cover max-h-[500px] print:max-h-[300px]"
        />
      </div>

      {/* SEKCJA OPISU I TAGÓW */}
      <div className="bg-white p-5 md:p-6 rounded-2xl border border-gray-100 shadow-sm mb-6 md:mb-8 print:border-none print:shadow-none print:p-0 print:mb-4">
        <p className="text-gray-700 text-base md:text-lg leading-relaxed mb-4">{recipe.description}</p>

        {recipe.tags && recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100 print:hidden">
            {recipe.tags.map(tag => (
              <Link
                key={tag.id}
                to={`/?tag=${tag.slug}`}
                className="px-3 py-1 bg-orange-50 text-orange-700 text-xs font-bold rounded-full hover:bg-orange-100 transition-colors"
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* UKŁAD: SKŁADNIKI ORAZ KROKI PRZYGOTOWANIA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start print:block">
        <div className="md:col-span-1 print:mb-6">
          <IngredientsPanel skladniki={recipe.ingredients} bazowePorcje={4} recipeName={recipe.name} />
        </div>
        <div className="md:col-span-2 bg-white p-5 md:p-6 rounded-2xl border border-gray-100 shadow-sm print:border-none print:shadow-none print:p-0">
          <RecipeSteps kroki={recipe.steps} recipeName={recipe.name} wszystkieSkladniki={recipe.ingredients} />
        </div>
      </div>

      {/* KOMENTARZE */}
      <div className="mt-8 print:hidden">
        <CommentsSection
          recipeId={recipe.id}
          initialComments={recipe.comments}
          averageRating={recipe.average_rating}
        />
      </div>

      {/* REKOMENDOWANE PODOBNE PRZEPISY */}
      {similarRecipes && similarRecipes.length > 0 && (
        <div className="mt-16 pt-8 border-t border-gray-200 print:hidden">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Mogą Ci się spodobać</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {similarRecipes.map(similar => (
              <Link key={similar.id} to={`/przepis/${similar.id}`} className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all">
                <div className="h-40 overflow-hidden relative bg-gray-100">
                  <img
                    src={apiClient.utils.getImageUrl(similar.main_image_url)}
                    alt={similar.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {similar.prep_time && (
                    <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-lg">
                      ⏱ {similar.prep_time} min
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 group-hover:text-orange-500 transition-colors line-clamp-2">
                    {similar.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}