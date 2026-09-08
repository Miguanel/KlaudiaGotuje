import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useRecipeDetail, useSimilarRecipes } from '../hooks/useRecipes';
import { apiClient } from '../api/client';
import IngredientsPanel from '../components/IngredientsPanel';
import RecipeSteps from '../components/RecipeSteps';
import CommentsSection from '../components/CommentsSection';
import { FaHeart, FaRegHeart, FaDownload, FaGem, FaStar, FaClock } from 'react-icons/fa';

export default function RecipeDetail() {
  const { id } = useParams();
  const { recipe, loading, error } = useRecipeDetail(id);
  const { recipes: similarRecipes } = useSimilarRecipes(id);

  const [isFavorite, setIsFavorite] = useState(false);

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

  if (loading) return <div className="p-10 text-center font-black text-[#FF1493] text-glow">Ładowanie przepisu... <FaStar className="inline animate-spin text-amber-400" /></div>;
  if (error || !recipe) return <div className="p-10 text-center font-bold text-red-500">Błąd: {error || 'Nie znaleziono przepisu'}</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:py-8 print:p-0 print:max-w-none text-white">

      {/* NAWIGACJA OKRUSZKOWA ORAZ PRZYCISKI AKCJI */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 print:hidden">
        <nav className="flex flex-wrap items-center gap-y-2 text-[14px] md:text-[15px] text-gray-400 font-bold bg-[#160A22] border border-[#25113A] px-4 py-2.5 rounded-xl shadow-sm w-full md:w-fit">
          <Link to="/" className="text-[#FF1493] hover:text-glow transition-all flex items-center gap-1.5">
            <FaStar className="text-amber-400" /> Przepisy
          </Link>

          {recipe.category?.parent_category && (
            <>
              <span className="mx-2 text-gray-600 font-black">›</span>
              <Link
                to={`/?category=${recipe.category.parent_category.slug}`}
                className="text-white hover:text-[#FF1493] transition-colors whitespace-nowrap"
              >
                {recipe.category.parent_category.name}
              </Link>
            </>
          )}

          {recipe.category && (
            <>
              <span className="mx-2 text-gray-600 font-black">›</span>
              <Link
                to={`/?category=${recipe.category.slug}`}
                className="text-white hover:text-[#FF1493] transition-colors whitespace-nowrap"
              >
                {recipe.category.name}
              </Link>
            </>
          )}
        </nav>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <button
            onClick={handleExportPDF}
            className="flex justify-center items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-[#160A22] text-gray-300 border border-[#25113A] hover:border-[#FF1493] hover:text-[#FF1493] transition-all"
            title="Pobierz przepis jako PDF"
          >
            <FaDownload className="text-slate-300" /> Pobierz PDF
          </button>

          <button
            onClick={toggleFavorite}
            className={`flex justify-center items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm transition-all ${
              isFavorite
                ? 'bg-[#FF1493]/20 text-[#FF1493] border border-[#FF1493] shadow-neon'
                : 'bg-[#160A22] text-gray-300 border border-[#25113A] hover:border-[#FF1493] hover:text-[#FF1493]'
            }`}
          >
            {isFavorite ? <FaHeart className="text-[#FF1493]" /> : <FaRegHeart className="text-gray-400" />}
            {isFavorite ? 'W ulubionych' : 'Dodaj do ulubionych'}
          </button>
        </div>
      </div>

      {/* TYTUŁ I GŁÓWNE ZDJĘCIE PRZEPISU */}
      <h1 className="text-3xl md:text-5xl font-black text-white mb-6 text-glow print:text-4xl flex items-center gap-3">
        <span className="text-gold">{recipe.name}</span>
        <FaGem className="text-[#FF007F] text-glow inline text-3xl" />
      </h1>

      <div className="rounded-[2rem] overflow-hidden mb-6 md:mb-8 shadow-neon border border-[#25113A] print:shadow-none print:border-none print:mb-4">
        <img
          src={apiClient.utils.getImageUrl(recipe.main_image_url)}
          alt={recipe.name}
          className="w-full h-auto object-cover max-h-[500px] opacity-90 hover:opacity-100 hover:scale-105 transition-all duration-700 print:max-h-[300px]"
        />
      </div>

      {/* SEKCJA OPISU I TAGÓW */}
      <div className="bg-[#160A22] p-6 md:p-8 rounded-3xl border border-[#25113A] mb-6 md:mb-8 print:border-none print:p-0 print:mb-4">
        <p className="text-gray-300 text-base md:text-lg leading-relaxed mb-6 font-medium">{recipe.description}</p>

        {recipe.tags && recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-5 border-t border-[#25113A] print:hidden">
            {recipe.tags.map(tag => (
              <Link
                key={tag.id}
                to={`/?tag=${tag.slug}`}
                className="px-4 py-1.5 bg-[#25113A] text-slate-200 border border-slate-700 text-xs font-black rounded-full hover:bg-[#FF1493] hover:text-white transition-all shadow-sm"
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
        <div className="md:col-span-2 bg-[#160A22] p-6 md:p-8 rounded-3xl border border-[#25113A] print:border-none print:p-0">
          <RecipeSteps kroki={recipe.steps} recipeName={recipe.name} wszystkieSkladniki={recipe.ingredients} />
        </div>
      </div>

      {/* KOMENTARZE */}
      <div className="mt-10 print:hidden">
        <CommentsSection
          recipeId={recipe.id}
          initialComments={recipe.comments}
          averageRating={recipe.average_rating}
        />
      </div>

      {/* REKOMENDOWANE PODOBNE PRZEPISY */}
      {similarRecipes && similarRecipes.length > 0 && (
        <div className="mt-16 pt-8 border-t border-[#25113A] print:hidden">
          <h2 className="text-2xl font-black text-white mb-8 text-glow flex items-center gap-2">
            <FaStar className="text-amber-400" /> <span className="text-gold">Mogą Ci się spodobać</span> <FaStar className="text-amber-400" />
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {similarRecipes.map(similar => (
              <Link key={similar.id} to={`/przepis/${similar.id}`} className="group bg-[#160A22] rounded-3xl border border-[#25113A] overflow-hidden hover:border-[#FF1493] hover:shadow-neon transition-all hover:-translate-y-1">
                <div className="h-40 overflow-hidden relative bg-[#0B0510]">
                  <img
                    src={apiClient.utils.getImageUrl(similar.main_image_url)}
                    alt={similar.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                  />
                  {similar.prep_time && (
                    <div className="absolute bottom-3 right-3 bg-[#FF1493]/90 backdrop-blur-sm text-white text-[11px] font-black px-2.5 py-1.5 rounded-xl shadow-neon flex items-center gap-1">
                      <FaClock /> {similar.prep_time} min
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-black text-white group-hover:text-[#FF1493] transition-colors line-clamp-2">
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