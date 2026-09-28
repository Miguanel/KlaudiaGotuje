import { useState, useEffect, useMemo } from 'react';
import { apiClient } from '../api/client';
import type { Category } from '../types';

/** Rozdział (kategoria główna) wraz z listą podrozdziałów. */
export interface Chapter extends Category {
  children: Category[];
}

// Wspólna pamięć podręczna – nagłówek i strona główna nie pobierają kategorii dwa razy.
let cache: Category[] | null = null;
let pending: Promise<Category[]> | null = null;

function loadCategories(): Promise<Category[]> {
  if (cache) return Promise.resolve(cache);
  if (!pending) {
    pending = apiClient.categories.getAll()
      .then(data => {
        cache = Array.isArray(data) ? data : [];
        return cache;
      })
      .catch(err => {
        pending = null;
        throw err;
      });
  }
  return pending;
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>(cache ?? []);
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    let isMounted = true;
    loadCategories()
      .then(data => { if (isMounted) { setCategories(data); setLoading(false); } })
      .catch(err => {
        console.error('Błąd pobierania kategorii:', err);
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, []);

  // Drzewo: rozdziały → podrozdziały (alfabetycznie, po polsku)
  const chapters = useMemo<Chapter[]>(() => {
    const byPl = (a: Category, b: Category) => a.name.localeCompare(b.name, 'pl');
    const roots = categories.filter(c => !c.parent_category).sort(byPl);
    return roots.map(root => ({
      ...root,
      children: categories.filter(c => c.parent_category?.id === root.id).sort(byPl),
    }));
  }, [categories]);

  const findBySlug = (slug: string | null | undefined) =>
    slug ? categories.find(c => c.slug === slug) ?? null : null;

  return { categories, chapters, findBySlug, loading };
}
