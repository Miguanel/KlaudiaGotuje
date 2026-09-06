from ninja import ModelSchema
from typing import List, Optional
from .models import Recipe, Ingredient, RecipeStep, Category, Tag, Comment
from ninja import Schema

class IngredientCreateSchema(Schema):
    name: str
    quantity: float
    unit: str

class RecipeStepCreateSchema(Schema):
    step_number: int
    instruction: str
    ingredient_ids: List[str] = []

class RecipeCreateSchema(Schema):
    name: str
    description: str
    prep_time: int
    category_id: Optional[str] = None
    ingredients: List[IngredientCreateSchema] = []
    steps: List[RecipeStepCreateSchema] = []
    tag_ids: List[str] = []
# Nowy schemat dla komentarza
class CommentSchema(ModelSchema):
    class Meta:
        model = Comment
        fields = ['id', 'author_name', 'content', 'rating', 'created_at']


# Schemat wejściowy do tworzenia komentarza (payload z frontendu)
class CommentCreateSchema(ModelSchema):
    class Meta:
        model = Comment
        fields = ['author_name', 'content', 'rating']

# Uproszczony schemat zapobiegający pętli rekurencji Pydantic
class ParentCategorySchema(ModelSchema):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug']


class CategorySchema(ModelSchema):
    parent_category: Optional[ParentCategorySchema] = None

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug']


class IngredientSchema(ModelSchema):
    class Meta:
        model = Ingredient
        fields = ['id', 'name', 'quantity', 'unit']


class RecipeStepSchema(ModelSchema):
    image_url: Optional[str] = None
    ingredients: List[IngredientSchema] = []

    class Meta:
        model = RecipeStep
        fields = ['id', 'step_number', 'instruction']

    @staticmethod
    def resolve_image_url(obj):
        if obj.image:
            return obj.image.url
        return None


class TagSchema(ModelSchema):
    class Meta:
        model = Tag
        fields = ['id', 'name', 'slug']


class RecipeSchema(ModelSchema):
    category: Optional[CategorySchema] = None
    tags: List[TagSchema]
    ingredients: List[IngredientSchema]
    steps: List[RecipeStepSchema]
    comments: List[CommentSchema] = []
    main_image_url: Optional[str] = None
    average_rating: Optional[float] = None
    diet: str = 'dowolna' # <-- NOWE
    comments_count: int = 0 # <-- NOWE
    photos_count: int = 0 # <-- NOWE

    class Meta:
        model = Recipe
        fields = ['id', 'name', 'description', 'prep_time', 'created_at', 'diet']

    @staticmethod
    def resolve_main_image_url(obj):
        if obj.main_image:
            return obj.main_image.url
        return None

    @staticmethod
    def resolve_average_rating(obj):
        comments = obj.comments.all()
        if not comments:
            return None
        return round(sum(c.rating for c in comments) / len(comments), 2)

    @staticmethod
    def resolve_comments_count(obj):
        return obj.comments.count()

    @staticmethod
    def resolve_photos_count(obj):
        # Liczymy zdjęcie główne (jeśli istnieje) + zdjęcia kroków posiadające plik
        count = 1 if obj.main_image else 0
        count += sum(1 for step in obj.steps.all() if step.image)
        return count