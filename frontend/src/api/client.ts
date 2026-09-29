import type { Recipe, Category } from '../types';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';

class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
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
  categories: {
    getAll: () => fetchJson<Category[]>('/api/kategorie'),

    /** Wgranie grafiki w tle banera rozdziału (tylko zalogowana administratorka). */
    uploadImage: async (categoryId: string, file: File, token: string): Promise<Category> => {
      const body = new FormData();
      body.append('image', file);
      const res = await fetch(`${BACKEND_URL}/api/kategorie/${categoryId}/obraz`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new ApiError(res.status, data?.detail ?? 'Nie udało się wgrać grafiki');
      }
      return res.json();
    },

    /** Usunięcie grafiki – baner wraca do zdjęcia przepisu lub ikony. */
    removeImage: async (categoryId: string, token: string): Promise<Category> => {
      const res = await fetch(`${BACKEND_URL}/api/kategorie/${categoryId}/obraz`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new ApiError(res.status, 'Nie udało się usunąć grafiki');
      return res.json();
    },
  },
  recipes: {
    // Metoda obsługująca filtry i sortowanie
    getAll: (categorySlug?: string | null, searchQuery?: string, diet?: string, sort?: string) => {
      const params = new URLSearchParams();
      if (categorySlug) params.append('category_slug', categorySlug);
      if (searchQuery) params.append('q', searchQuery);
      if (diet && diet !== 'dowolna') params.append('diet', diet);
      if (sort) params.append('sort', sort);

      const queryString = params.toString();
      const url = queryString ? `/api/przepisy?${queryString}` : '/api/przepisy';

      return fetchJson<Recipe[]>(url);
    },

    getById: (id: string) => fetchJson<Recipe>(`/api/przepisy/${id}`),

    getSimilar: (id: string) => fetchJson<Recipe[]>(`/api/przepisy/${id}/podobne`),

    addComment: (recipeId: string, data: { author_name: string; content: string; rating: number }) => {
      return fetch(`${BACKEND_URL}/api/przepisy/${recipeId}/komentarze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(async res => {
        if (!res.ok) throw new Error('Nie udało się dodać komentarza');
        return res.json();
      });
    },

    // BRAKUJĄCA METODA, KTÓRA POWODOWAŁA BŁĄD BUILDOWANIA
    deleteComment: (commentId: string, token: string) => {
      return fetch(`${BACKEND_URL}/api/komentarze/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      }).then(async res => {
        if (!res.ok) throw new Error('Nie udało się usunąć komentarza');
        return res.json();
      });
    },

    create: (data: FormData, token: string) => {
      return fetch(`${BACKEND_URL}/api/przepisy`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: data,
      }).then(async res => {
        if (!res.ok) throw new Error('Nie udało się utworzyć przepisu');
        return res.json();
      });
    }
  },
  utils: {
    getImageUrl: (path: string | null): string => {
      if (!path) return 'https://placehold.co/800x600/121831/9EBBFF?text=Brak+zdj%C4%99cia';
      return `${BACKEND_URL}${path}`;
    }
  }
};
