export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_category?: Category | null;
  /** grafika w tle banera rozdziału (wgrywana przez administratorkę) */
  image_url?: string | null;
}

export interface Ingredient {
  id: string;
  name: string;
  quantity: number | string;
  unit: string;
}

export interface RecipeStep {
  id: number;
  step_number: number;
  instruction: string;
  image_url: string | null;
  ingredients?: Ingredient[];
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  prep_time: number;
  created_at: string;
  category: Category | null;
  ingredients: Ingredient[];
  comments: Comment[];
  average_rating: number | null;
  steps: RecipeStep[];
  main_image_url: string | null;
  diet: string;
  comments_count: number;
  photos_count: number;
}

export interface Comment {
  id: string;
  author_name: string;
  content: string;
  rating: number;
  created_at: string;
}
