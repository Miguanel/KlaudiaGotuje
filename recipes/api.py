from ninja import NinjaAPI
from typing import List, Optional
from django.shortcuts import get_object_or_404
from .models import Recipe, Category
from .schemas import RecipeSchema, CategorySchema
from django.db.models import Q


api = NinjaAPI(
    title="Baza Przepisów API",
    description="API obsługujące dane kulinarne dla frontendu",
    version="1.0.0",
    docs_url="/docs"
)


@api.get("/kategorie", response=List[CategorySchema])
def list_categories(request):
    return Category.objects.all()


@api.get("/przepisy", response=List[RecipeSchema])
def list_recipes(request, category_slug: Optional[str] = None, q: Optional[str] = None, tag_slug: Optional[str] = None):
    # Używamy angielskich nazw relacji
    qs = Recipe.objects.select_related('category').prefetch_related('ingredients', 'steps', 'tags').all()

    if category_slug:
        qs = qs.filter(category__slug=category_slug)

    if tag_slug:
        qs = qs.filter(tags__slug=tag_slug)

    if q:
        qs = qs.filter(
            Q(name__icontains=q) |
            Q(description__icontains=q) |
            Q(ingredients__name__icontains=q)
        ).distinct()

    return qs


@api.get("/przepisy/{recipe_id}", response=RecipeSchema)
def get_recipe(request, recipe_id: str):
    qs = Recipe.objects.select_related('category').prefetch_related('ingredients', 'steps', 'tags')
    return get_object_or_404(qs, id=recipe_id)