from ninja import NinjaAPI, Form, File
from ninja.files import UploadedFile
from typing import List, Optional
import json
import os
import uuid
from django.shortcuts import get_object_or_404
from .models import Recipe, Category, Comment, RecipeStep, Ingredient, SiteImage
from .schemas import RecipeSchema, CategorySchema, CommentSchema, CommentCreateSchema, RecipeCreateSchema, SiteImageSchema
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


@api.get("/kategorie", response=List[CategorySchema])
def list_categories(request):
    # Rozdziały i podrozdziały (frontend buduje z nich drzewo po polu parent_category)
    return Category.objects.select_related('parent_category').all()


ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_IMAGE_SIZE = 8 * 1024 * 1024  # 8 MB


# Miejsca na stronie, w których administratorka może podmienić grafikę
SITE_IMAGE_KEYS = {
    "tlo-strony",      # tło całej strony
    "tlo-logo",        # tło za dużym logo na stronie głównej
    "tlo-skrotow",     # tło złotej ramki ze skrótami
    "tlo-przepisow",   # tło sekcji „Najnowsze przepisy”
    "o-mnie",          # zdjęcie na stronie „O mnie”
}


def unique_name(filename: str) -> str:
    """Nowa nazwa pliku przy każdej podmianie – przeglądarka nie pokaże starej grafiki z pamięci podręcznej."""
    ext = os.path.splitext(filename)[1].lower() or '.jpg'
    return f"{uuid.uuid4().hex[:12]}{ext}"


def image_error(image):
    """Zwraca komunikat błędu albo None, jeśli plik jest poprawny."""
    if image.content_type not in ALLOWED_IMAGE_TYPES:
        return "Dozwolone formaty: JPG, PNG, WEBP."
    if image.size > MAX_IMAGE_SIZE:
        return "Plik jest za duży (maks. 8 MB)."
    return None


@api.get("/grafiki", response=List[SiteImageSchema])
def list_site_images(request):
    return SiteImage.objects.all()


@api.post("/grafiki/{key}", response={200: SiteImageSchema, 400: dict}, auth=JWTAuth())
def upload_site_image(request, key: str, image: UploadedFile = File(...)):
    """Wgranie / podmiana grafiki w jednym z miejsc strony (SITE_IMAGE_KEYS)."""
    if key not in SITE_IMAGE_KEYS:
        return 400, {"detail": "Nieznane miejsce na grafikę."}
    if (err := image_error(image)):
        return 400, {"detail": err}
    obj = SiteImage.objects.filter(key=key).first()
    if obj and obj.image:
        obj.image.delete(save=False)  # usuń poprzedni plik z dysku
    obj = obj or SiteImage(key=key)
    obj.image.save(unique_name(image.name), image, save=True)
    return 200, obj


@api.delete("/grafiki/{key}", response={204: None}, auth=JWTAuth())
def delete_site_image(request, key: str):
    obj = SiteImage.objects.filter(key=key).first()
    if obj:
        obj.image.delete(save=False)
        obj.delete()
    return 204, None


@api.post("/przepisy/{recipe_id}/zdjecie", response={200: RecipeSchema, 400: dict}, auth=JWTAuth())
def upload_recipe_image(request, recipe_id: str, image: UploadedFile = File(...)):
    """Podmiana zdjęcia głównego przepisu prosto ze strony przepisu."""
    qs = Recipe.objects.select_related('category', 'category__parent_category') \
        .prefetch_related('ingredients', 'steps', 'comments')
    recipe = get_object_or_404(qs, id=recipe_id)
    if (err := image_error(image)):
        return 400, {"detail": err}
    if recipe.main_image:
        recipe.main_image.delete(save=False)
    recipe.main_image.save(unique_name(image.name), image, save=True)
    return 200, recipe


@api.post("/kategorie/{category_id}/obraz", response={200: CategorySchema, 400: dict}, auth=JWTAuth())
def upload_category_image(request, category_id: str, image: UploadedFile = File(...)):
    """Administratorka wgrywa grafikę w tle banera rozdziału (strona główna)."""
    category = get_object_or_404(Category.objects.select_related('parent_category'), id=category_id)
    if (err := image_error(image)):
        return 400, {"detail": err}
    if category.image:
        category.image.delete(save=False)  # usuń poprzednią grafikę z dysku
    category.image.save(unique_name(image.name), image, save=True)
    return 200, category


@api.delete("/kategorie/{category_id}/obraz", response=CategorySchema, auth=JWTAuth())
def delete_category_image(request, category_id: str):
    """Usunięcie grafiki – baner wraca do zdjęcia z przepisu albo ozdobnej ikony."""
    category = get_object_or_404(Category.objects.select_related('parent_category'), id=category_id)
    if category.image:
        category.image.delete(save=True)
    return category


@api.get("/przepisy", response=List[RecipeSchema])
def list_recipes(
        request,
        category_slug: Optional[str] = None,
        q: Optional[str] = None,
        diet: Optional[str] = None,
        sort: Optional[str] = 'date'
):
    qs = Recipe.objects.select_related('category', 'category__parent_category') \
        .prefetch_related('ingredients', 'steps', 'comments').all()

    if category_slug:
        # Rozdział pokazuje także przepisy ze wszystkich swoich podrozdziałów
        qs = qs.filter(Q(category__slug=category_slug) | Q(category__parent_category__slug=category_slug))
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
    qs = Recipe.objects.select_related('category', 'category__parent_category') \
        .prefetch_related('ingredients', 'steps', 'comments')
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
    """Podobne przepisy: najpierw z tego samego podrozdziału, potem z tego samego rozdziału."""
    recipe = get_object_or_404(Recipe.objects.select_related('category'), id=recipe_id)
    if not recipe.category:
        return []

    chapter_id = recipe.category.parent_category_id or recipe.category_id
    qs = Recipe.objects.select_related('category', 'category__parent_category') \
        .prefetch_related('ingredients', 'steps', 'comments') \
        .exclude(id=recipe.id)

    same_sub = list(qs.filter(category_id=recipe.category_id).order_by('-created_at')[:3])
    if len(same_sub) < 3:
        same_chapter = qs.filter(Q(category_id=chapter_id) | Q(category__parent_category_id=chapter_id)) \
            .exclude(id__in=[r.id for r in same_sub]) \
            .order_by('-created_at')[:3 - len(same_sub)]
        same_sub += list(same_chapter)
    return same_sub

@api.delete("/komentarze/{comment_id}", auth=JWTAuth())
def delete_comment(request, comment_id: str):
    comment = get_object_or_404(Comment, id=comment_id)
    comment.delete()
    return {"success": True}
