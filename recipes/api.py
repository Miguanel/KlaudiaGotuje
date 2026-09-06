from ninja import NinjaAPI, Form, File
from ninja.files import UploadedFile
from typing import List, Optional
import json
from django.shortcuts import get_object_or_404
from .models import Recipe, Category, Tag, Comment, RecipeStep, Ingredient
from .schemas import RecipeSchema, CategorySchema, TagSchema, CommentSchema, CommentCreateSchema, RecipeCreateSchema
from django.db.models import Q
from ninja.security import HttpBearer
from rest_framework_simplejwt.tokens import AccessToken
from django.db.models import Count


api = NinjaAPI(
    title="Baza Przepisów API",
    description="API obsługujące dane kulinarne dla frontendu",
    version="1.0.0",
    docs_url="/docs"
)


class JWTAuth(HttpBearer):
    def authenticate(self, request, token):
        try:
            validated_token = AccessToken(token)
            return validated_token['user_id']
        except Exception:
            return None


@api.get("/tagi", response=List[TagSchema])
def list_tags(request):
    return Tag.objects.all()


@api.get("/kategorie", response=List[CategorySchema])
def list_categories(request):
    return Category.objects.all()


@api.get("/przepisy", response=List[RecipeSchema])
def list_recipes(
        request,
        category_slug: Optional[str] = None,
        q: Optional[str] = None,
        tag_slug: Optional[str] = None,
        diet: Optional[str] = None,
        sort: Optional[str] = 'date'
):
    qs = Recipe.objects.select_related('category').prefetch_related('ingredients', 'steps', 'tags', 'comments').all()

    if category_slug:
        qs = qs.filter(category__slug=category_slug)
    if tag_slug:
        qs = qs.filter(tags__slug=tag_slug)
    if diet and diet != 'dowolna':
        qs = qs.filter(diet=diet)

    if q:
        qs = qs.filter(
            Q(name__icontains=q) |
            Q(description__icontains=q) |
            Q(ingredients__name__icontains=q)
        ).distinct()

    # Sortowanie wzorem Ani Gotuje
    if sort == 'popular':
        # Sortujemy po liczbie komentarzy malejąco, a następnie po dacie
        qs = qs.annotate(comm_count=Count('comments')).order_by('-comm_count', '-created_at')
    else:
        qs = qs.order_by('-created_at')

    return qs


@api.get("/przepisy/{recipe_id}", response=RecipeSchema)
def get_recipe(request, recipe_id: str):
    qs = Recipe.objects.select_related('category').prefetch_related('ingredients', 'steps', 'tags')
    return get_object_or_404(qs, id=recipe_id)


@api.post("/przepisy/{recipe_id}/komentarze", response=CommentSchema)
def add_comment(request, recipe_id: str, payload: CommentCreateSchema):
    recipe = get_object_or_404(Recipe, id=recipe_id)
    comment = Comment.objects.create(
        recipe=recipe,
        author_name=payload.author_name,
        content=payload.content,
        rating=payload.rating
    )
    return comment


# ZAKTUALIZOWANY Endpoint dodawania przepisu z obsługą plików
@api.post("/przepisy", response=RecipeSchema, auth=JWTAuth())
def create_recipe(
        request,
        payload_data: str = Form(...),
        main_image: UploadedFile = File(None)
):
    # Parsowanie danych tekstowych
    data = json.loads(payload_data)
    payload = RecipeCreateSchema(**data)

    category = None
    if payload.category_id:
        category = get_object_or_404(Category, id=payload.category_id)

    # Tworzenie przepisu
    recipe = Recipe.objects.create(
        name=payload.name,
        description=payload.description,
        prep_time=payload.prep_time,
        category=category
    )

    # Zapis głównego zdjęcia
    if main_image:
        recipe.main_image.save(main_image.name, main_image)

    # Zapis tagów
    if payload.tag_ids:
        tags = Tag.objects.filter(id__in=payload.tag_ids)
        recipe.tags.set(tags)

    # Zapis składników
    for ing in payload.ingredients:
        Ingredient.objects.create(
            recipe=recipe,
            name=ing.name,
            quantity=ing.quantity,
            unit=ing.unit
        )

    # Zapis kroków i ich zdjęć
    for idx, step_data in enumerate(payload.steps):
        step = RecipeStep.objects.create(
            recipe=recipe,
            step_number=step_data.step_number,
            instruction=step_data.instruction
        )

        # Powiązane składniki w kroku
        if hasattr(step_data, 'ingredient_ids') and step_data.ingredient_ids:
            ingrs = Ingredient.objects.filter(id__in=step_data.ingredient_ids, recipe=recipe)
            step.ingredients.set(ingrs)

        # Sprawdzenie czy w request.FILES znajduje się plik dla danego kroku
        step_image_key = f"step_image_{idx}"
        if step_image_key in request.FILES:
            step_file = request.FILES[step_image_key]
            step.image.save(step_file.name, step_file)

    return recipe


@api.get("/przepisy/{recipe_id}/podobne", response=List[RecipeSchema])
def get_similar_recipes(request, recipe_id: str):
    recipe = get_object_or_404(Recipe, id=recipe_id)
    tag_ids = recipe.tags.values_list('id', flat=True)

    # Jeśli przepis nie ma tagów, nie zwracamy rekomendacji
    if not tag_ids:
        return []

    # Szukamy przepisów ze wspólnymi tagami, wykluczamy obecny,
    # sortujemy malejąco po liczbie wspólnych tagów i ograniczamy do 3 wyników
    qs = Recipe.objects.select_related('category').prefetch_related('ingredients', 'steps', 'tags')
    similar = qs.filter(tags__id__in=tag_ids) \
                  .exclude(id=recipe_id) \
                  .annotate(same_tags=Count('tags')) \
                  .order_by('-same_tags', '-created_at')[:3]

    return similar

@api.delete("/komentarze/{comment_id}", auth=JWTAuth())
def delete_comment(request, comment_id: str):
    comment = get_object_or_404(Comment, id=comment_id)
    comment.delete()
    return {"success": True}