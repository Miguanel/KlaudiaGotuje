// Nowy plik: src/hooks/useCategories.ts
import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import type { Category } from '../types';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    apiClient.categories.getAll()
      .then(data => {
        if (isMounted) {
          setCategories(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          console.error("Błąd pobierania kategorii:", err);
          setLoading(false);
        }
      });

    return () => { isMounted = false; };
  }, []);

  return { categories, loading };
}