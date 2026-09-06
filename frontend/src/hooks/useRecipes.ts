import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import type { Recipe } from '../types';




export function useRecipes(categorySlug?: string | null, searchQuery?: string, tagSlug?: string | null, diet?: string, sort?: string) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    apiClient.recipes.getAll(categorySlug, searchQuery, tagSlug, diet, sort)
      .then(data => {
        if (isMounted) {
          setRecipes(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Wystąpił nieznany błąd');
          setLoading(false);
        }
      });

    return () => { isMounted = false; };
  }, [categorySlug, searchQuery, tagSlug, diet, sort]);

  return { recipes, loading, error };
}

export function useRecipeDetail(id: string | undefined) {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let isMounted = true;
    setLoading(true);

    apiClient.recipes.getById(id)
      .then(data => {
        if (isMounted) {
          setRecipe(data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          console.error(`Błąd pobierania przepisu ${id}:`, err);
          setError(err instanceof Error ? err.message : 'Wystąpił nieznany błąd');
          setLoading(false);
        }
      });

    return () => { isMounted = false; };
  }, [id]);

  return { recipe, loading, error };
}

export function useSimilarRecipes(id: string | undefined) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!id) return;
    let isMounted = true;
    setLoading(true);

    apiClient.recipes.getSimilar(id)
      .then(data => {
        if (isMounted) {
          setRecipes(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          console.error(`Błąd pobierania podobnych przepisów dla ${id}:`, err);
          setLoading(false);
        }
      });

    return () => { isMounted = false; };
  }, [id]);

  return { recipes, loading };
}