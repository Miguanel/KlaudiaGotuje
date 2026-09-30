import { Link } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaStar, FaRegClock, FaRegComment } from 'react-icons/fa';
import { apiClient } from '../api/client';
import type { Recipe } from '../types';

interface Props {
  recipe: Recipe;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
}

/** Karta przepisu – zdjęcie, rozdział, tytuł i najważniejsze informacje w jednym wierszu. */
export default function RecipeCard({ recipe, isFavorite = false, onToggleFavorite }: Props) {
  // Na karcie pokazujemy najbardziej szczegółowe miejsce: podrozdział (lub rozdział)
  const label = recipe.category?.name ?? null;

  return (
    <Link
      to={`/przepis/${recipe.id}`}
      className="group w-full flex flex-col bg-card rounded-2xl overflow-hidden border border-line shadow-glow hover:shadow-glow-strong hover:border-cobalt/40 transition-all duration-500 ease-out hover:-translate-y-1"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-panel">
        <img
          src={apiClient.utils.getImageUrl(recipe.main_image_url)}
          alt={recipe.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {onToggleFavorite && (
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFavorite(recipe.id); }}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-ink/80 backdrop-blur flex items-center justify-center border border-line hover:border-gold/60 hover:scale-110 transition"
            title={isFavorite ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}
            aria-label={isFavorite ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}
          >
            {isFavorite ? <FaHeart className="text-chili" /> : <FaRegHeart className="text-cream" />}
          </button>
        )}
      </div>

      <div className="flex flex-col flex-1 p-4 sm:p-5">
        {label && (
          <span className="text-[11px] font-bold uppercase tracking-wider text-gold mb-1.5 truncate">
            {label}
          </span>
        )}
        <h3 className="text-base sm:text-lg font-bold leading-snug text-cream group-hover:text-gold transition-colors line-clamp-2">
          {recipe.name}
        </h3>

        <div className="mt-auto pt-4 flex items-center gap-4 text-xs font-semibold text-muted">
          <span className="flex items-center gap-1.5" title="Czas przygotowania">
            <FaRegClock className="text-gold" /> {recipe.prep_time} min
          </span>
          <span className="flex items-center gap-1.5" title="Średnia ocena">
            <FaStar className="text-gold" />
            {recipe.average_rating !== null ? recipe.average_rating.toFixed(1) : '–'}
          </span>
          <span className="flex items-center gap-1.5" title="Komentarze">
            <FaRegComment /> {recipe.comments_count}
          </span>
        </div>
      </div>
    </Link>
  );
}
