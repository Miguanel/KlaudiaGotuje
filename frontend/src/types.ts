export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_category?: Category | null;
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
  tags: Tag[];
  prep_time: number;
  created_at: string;
  category: Category | null;
  ingredients: Ingredient[];
  comments: Comment[];
  average_rating: number | null;
  steps: RecipeStep[];
  main_image_url: string | null;
}

export interface Comment {
  id: string;
  author_name: string;
  content: string;
  rating: number;
  created_at: string;
}
