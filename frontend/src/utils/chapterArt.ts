import { apiClient } from '../api/client';
import type { Recipe } from '../types';
import type { Chapter } from '../hooks/useCategories';

/*
 * Grafiki w banerach rozdziałów na stronie głównej.
 *
 * Kolejność wyboru:
 *  0. grafika wgrana przez administratorkę na stronie (przycisk „Zmień tło” na banerze),
 *  1. własna grafika z folderu src/assets/rozdzialy/ – nazwa pliku = slug rozdziału,
 *     np. "mieso-i-ryby.jpg", "sezonowe-i-okazje.webp" (jpg / jpeg / png / webp),
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

export function chapterImage(chapter: Chapter, recipes: Recipe[]): string | null {
  if (chapter.image_url) return apiClient.utils.getImageUrl(chapter.image_url);
  if (bySlug[chapter.slug]) return bySlug[chapter.slug];

  const ids = new Set([chapter.id, ...chapter.children.map(c => c.id)]);
  const recipe = recipes.find(r =>
    r.main_image_url &&
    r.category &&
    (ids.has(r.category.id) || (r.category.parent_category && ids.has(r.category.parent_category.id))),
  );
  return recipe ? apiClient.utils.getImageUrl(recipe.main_image_url) : null;
}
