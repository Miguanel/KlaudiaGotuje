import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useRecipeDetail, useSimilarRecipes } from '../hooks/useRecipes';
import { useFavorites } from '../hooks/useFavorites';
import { apiClient } from '../api/client';
import IngredientsPanel from '../components/IngredientsPanel';
import RecipeSteps from '../components/RecipeSteps';
import CommentsSection from '../components/CommentsSection';
import RecipeCard from '../components/RecipeCard';
import { RecipeDetailSkeleton } from '../components/ui/Skeletons';
import { FaHeart, FaRegHeart, FaPrint, FaStar, FaRegClock, FaRegComment, FaListOl, FaChevronRight } from 'react-icons/fa';

export default function RecipeDetail() {
  const { id } = useParams();
  const { recipe, loading, error } = useRecipeDetail(id);
  const { recipes: similarRecipes } = useSimilarRecipes(id);
  const { isFavorite, toggle } = useFavorites();

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [id]);

  if (loading) return <RecipeDetailSkeleton />;
  if (error || !recipe) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <p className="text-lg font-semibold text-pink-soft mb-4">{error || 'Nie znaleziono przepisu'}</p>
        <Link to="/" className="inline-flex items-center h-11 px-6 rounded-full bg-pink text-white font-bold">Wróć do przepisów</Link>
      </div>
    );
  }

  const chapter = recipe.category?.parent_category ?? recipe.category ?? null;
  const sub = recipe.category?.parent_category ? recipe.category : null;
  const fav = isFavorite(recipe.id);
  const commentsCount = recipe.comments?.length ?? recipe.comments_count ?? 0;

  const stats = [
    { icon: <FaRegClock />, value: `${recipe.prep_time} min`, label: 'Czas' },
    { icon: <FaStar className="text-gold" />, value: recipe.average_rating !== null ? recipe.average_rating.toFixed(1) : '–', label: 'Ocena' },
    { icon: <FaListOl />, value: String(recipe.steps.length), label: 'Kroki' },
    { icon: <FaRegComment />, value: String(commentsCount), label: 'Opinie' },
  ];

  return (
    <article className="max-w-6xl mx-auto px-4 py-6 sm:py-10 print:p-0">

      {/* ŚCIEŻKA */}
      <nav aria-label="Ścieżka" className="flex flex-wrap items-center gap-1.5 text-sm text-muted mb-6 print:hidden">
        <Link to="/" className="hover:text-cream">Przepisy</Link>
        {chapter && (
          <>
            <FaChevronRight className="text-[10px]" />
            <Link to={`/?category=${chapter.slug}`} className="hover:text-cream">{chapter.name}</Link>
          </>
        )}
        {sub && (
          <>
            <FaChevronRight className="text-[10px]" />
            <Link to={`/?category=${sub.slug}`} className="hover:text-cream">{sub.name}</Link>
          </>
        )}
      </nav>

      {/* NAGŁÓWEK PRZEPISU */}
      <header className="grid md:grid-cols-2 gap-6 md:gap-10 items-start mb-10">
        <div className="relative rounded-3xl overflow-hidden border border-line bg-panel aspect-[4/3] shadow-neon print:shadow-none print:aspect-auto">
          <img
            src={apiClient.utils.getImageUrl(recipe.main_image_url)}
            alt={recipe.name}
            className="w-full h-full object-cover print:max-h-72"
          />
        </div>

        <div className="flex flex-col">
          {recipe.category && (
            <Link to={`/?category=${recipe.category.slug}`} className="self-start label-pill mb-4 print:hidden">
              {recipe.category.name}
            </Link>
          )}

          <h1 className="font-display uppercase tracking-wide leading-[1.02] text-4xl sm:text-5xl text-gold mb-4">
            {recipe.name}
          </h1>

          <p className="text-base sm:text-lg text-cream/90 leading-relaxed mb-6">{recipe.description}</p>

          {/* KAFELKI Z INFORMACJAMI – jak na grafikach z profilu */}
          <dl className="grid grid-cols-4 gap-2 sm:gap-3 mb-6">
            {stats.map(s => (
              <div key={s.label} className="bg-card border border-line rounded-2xl py-3 px-1 text-center">
                <dt className="sr-only">{s.label}</dt>
                <div className="flex justify-center text-pink-soft text-lg mb-1">{s.icon}</div>
                <dd className="font-display text-xl sm:text-2xl leading-none text-cream">{s.value}</dd>
                <div className="text-[10px] sm:text-[11px] uppercase tracking-wider text-muted mt-1" aria-hidden="true">{s.label}</div>
              </div>
            ))}
          </dl>

          <div className="flex flex-wrap gap-3 print:hidden">
            <a href="#przygotowanie" className="inline-flex items-center h-11 px-6 rounded-full bg-pink text-white font-bold hover:brightness-110 transition shadow-neon">
              Przejdź do przepisu
            </a>
            <button
              onClick={() => toggle(recipe.id)}
              aria-pressed={fav}
              className={`inline-flex items-center gap-2 h-11 px-5 rounded-full font-semibold border transition ${
                fav ? 'border-pink text-pink bg-pink/10' : 'border-line text-cream hover:border-pink'
              }`}
            >
              {fav ? <FaHeart /> : <FaRegHeart />} {fav ? 'W ulubionych' : 'Do ulubionych'}
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 h-11 px-5 rounded-full font-semibold border border-line text-cream hover:border-gold hover:text-gold transition"
              title="Wydrukuj lub zapisz jako PDF"
            >
              <FaPrint /> Drukuj / PDF
            </button>
          </div>
        </div>
      </header>

      {/* SKŁADNIKI + PRZYGOTOWANIE */}
      <div id="przygotowanie" className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6 lg:gap-8 items-start scroll-mt-36 print:block">
        <IngredientsPanel skladniki={recipe.ingredients} bazowePorcje={4} recipeName={recipe.name} />
        <div className="bg-card border border-line rounded-3xl p-5 sm:p-8 print:border-none print:p-0 print:mt-6">
          <RecipeSteps kroki={recipe.steps} recipeName={recipe.name} wszystkieSkladniki={recipe.ingredients} />
        </div>
      </div>

      {/* OPINIE */}
      <div className="print:hidden">
        <CommentsSection
          recipeId={recipe.id}
          initialComments={recipe.comments ?? []}
          averageRating={recipe.average_rating}
        />
      </div>

      {/* PODOBNE PRZEPISY */}
      {similarRecipes.length > 0 && (
        <section className="mt-14 print:hidden">
          <h2 className="font-display uppercase text-2xl sm:text-3xl tracking-wide mb-6">
            <span className="text-cream">Może Ci</span> <span className="font-script normal-case text-pink text-3xl">zasmakować</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {similarRecipes.map(r => (
              <RecipeCard key={r.id} recipe={r} isFavorite={isFavorite(r.id)} onToggleFavorite={toggle} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
