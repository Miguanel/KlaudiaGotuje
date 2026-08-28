import { useParams, Link } from 'react-router-dom';
// POPRAWKA: Importujemy useRecipeDetail z pliku useRecipes
import { useRecipeDetail } from '../hooks/useRecipes';
import { apiClient } from '../api/client';

export default function RecipeDetail() {
  const { id } = useParams();
  // POPRAWKA: Używamy prawidłowej nazwy hooka
  const { recipe, loading, error } = useRecipeDetail(id);

  if (loading) return <div className="p-10 text-center">Ładowanie przepisu...</div>;
  if (error || !recipe) return <div className="p-10 text-center text-red-500">Błąd: {error || 'Nie znaleziono przepisu'}</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">

      {/* NAWIGACJA OKRUSZKOWA (BREADCRUMBS) NA STRONIE PRZEPISU */}
      <nav className="flex items-center text-[15px] text-gray-600 font-medium mb-6 bg-white border border-gray-200 px-4 py-2.5 rounded-md shadow-sm w-fit">
        <Link to="/" className="text-[#006600] hover:underline">
          Przepisy
        </Link>

        {/* Renderowanie nadrzędnej kategorii (jeśli istnieje) */}
        {recipe.category?.parent_category && (
          <>
            <span className="mx-2 text-gray-500 font-bold">›</span>
            <Link
              to={`/?category=${recipe.category.parent_category.slug}`}
              className="text-[#006600] hover:underline"
            >
              {recipe.category.parent_category.name}
            </Link>
          </>
        )}

        {/* Renderowanie głównej kategorii przypisanej do przepisu */}
        {recipe.category && (
          <>
            <span className="mx-2 text-gray-500 font-bold">›</span>
            <Link
              to={`/?category=${recipe.category.slug}`}
              className="text-[#006600] hover:underline"
            >
              {recipe.category.name}
            </Link>
          </>
        )}
      </nav>

      {/* TYTUŁ I GŁÓWNE ZDJĘCIE PRZEPISU */}
      <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6">
        {recipe.name}
      </h1>

      <div className="rounded-2xl overflow-hidden mb-8 shadow-md">
        <img
          src={apiClient.utils.getImageUrl(recipe.main_image_url)}
          alt={recipe.name}
          className="w-full h-auto object-cover max-h-[500px]"
        />
      </div>

      {/* DALSZA CZĘŚĆ PRZEPISU */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-fit">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Informacje</h2>
          <p className="text-gray-600 mb-2">
            <strong>Czas przygotowania:</strong> {recipe.prep_time} min
          </p>
        </div>
        <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Sposób przygotowania</h2>
          {/* Tu w przyszłości wyrenderujesz recipe.steps */}
        </div>
      </div>

    </div>
  );
}