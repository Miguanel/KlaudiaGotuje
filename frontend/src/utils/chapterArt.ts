import { apiClient } from '../api/client';
import type { Recipe } from '../types';
import type { Chapter } from '../hooks/useCategories';

/*
 * Grafiki w banerach rozdziałów na stronie głównej.
 *
 * Kolejność wyboru:
 *  0. grafika wgrana przez administratorkę na stronie (przycisk „Zmień tło” na banerze),
 *  1. grafika domyślna z folderu src/assets/rozdzialy/ – nazwa pliku = nazwa rozdziału
 *     bez polskich znaków, np. "mieso-i-ryby.jpg", "skladniki-wiodace.jpg" (jpg / jpeg / png / webp),
 *  2. zdjęcie najnowszego przepisu z tego rozdziału (działa od razu, bez dodatkowych plików),
 *  3. brak zdjęcia → baner pokazuje samą ozdobną ikonę rozdziału.
 */
const files = import.meta.glob('../assets/rozdzialy/*.{jpg,jpeg,png,webp}', {
  eager: true,
  import: 'default',
}) as Record<string, string>;

const bySlug: Record<string, string> = {};
for (const [path, url] of Object.entries(files)) {
  const name = path.split('/').pop()!.replace(/\.[^.]+$/, '').toLowerCase();
  bySlug[name] = url;
}

/** „Składniki wiodące” → "skladniki-wiodace" (niezależnie od tego, jak baza wygenerowała slug). */
function nameKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/ł/g, 'l')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Grafika domyślna rozdziału z src/assets/rozdzialy/ (albo null). */
export function chapterDefaultImage(chapter: Chapter): string | null {
  return bySlug[chapter.slug] ?? bySlug[nameKey(chapter.name)] ?? null;
}

export function chapterImage(chapter: Chapter, recipes: Recipe[]): string | null {
  if (chapter.image_url) return apiClient.utils.getImageUrl(chapter.image_url);
  const asset = chapterDefaultImage(chapter);
  if (asset) return asset;

  const ids = new Set([chapter.id, ...chapter.children.map(c => c.id)]);
  const recipe = recipes.find(r =>
    r.main_image_url &&
    r.category &&
    (ids.has(r.category.id) || (r.category.parent_category && ids.has(r.category.parent_category.id))),
  );
  return recipe ? apiClient.utils.getImageUrl(recipe.main_image_url) : null;
}
