// Zaktualizowany fragment src/api/client.ts
import type { Recipe, Category } from '../types'; // Dodaj import Category

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchJson<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${BACKEND_URL}${endpoint}`);
  if (!response.ok) {
    throw new ApiError(response.status, `Błąd komunikacji z API: ${response.statusText}`);
  }
  return response.json();
}

export const apiClient = {
  // NOWE: Endpointy kategorii
  categories: {
    getAll: () => fetchJson<Category[]>('/api/kategorie'),
  },
  recipes: {
    getAll: (categorySlug?: string | null, searchQuery?: string) => {
      const params = new URLSearchParams();
      if (categorySlug) params.append('category_slug', categorySlug);
      if (searchQuery) params.append('q', searchQuery);

      const queryString = params.toString();
      const url = queryString ? `/api/przepisy?${queryString}` : '/api/przepisy';

      return fetchJson<Recipe[]>(url);
    },
    getById: (id: string) => fetchJson<Recipe>(`/api/przepisy/${id}`),
  },
  utils: {
    getImageUrl: (path: string | null): string => {
      if (!path) return 'https://placehold.co/1000x400?text=Brak+Zdjecia';
      return `${BACKEND_URL}${path}`;
    }
  }
};