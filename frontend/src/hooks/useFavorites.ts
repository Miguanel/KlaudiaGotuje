import { useState, useCallback } from 'react';

const KEY = 'favorite_recipes';

function read(): string[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Ulubione przepisy zapisywane w localStorage (wspólne dla całej strony). */
export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(read);

  const toggle = useCallback((id: string) => {
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* brak dostępu do storage */ }
      return next;
    });
  }, []);

  const isFavorite = useCallback((id: string) => favorites.includes(id), [favorites]);

  return { favorites, toggle, isFavorite };
}
