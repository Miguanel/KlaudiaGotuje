from ninja import ModelSchema
from typing import List, Optional
from .models import Recipe, Ingredient, RecipeStep, Category, Tag


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
    main_image_url: Optional[str] = None

    class Meta:
        model = Recipe
        fields = ['id', 'name', 'description', 'prep_time', 'created_at']

    @staticmethod
    def resolve_main_image_url(obj):
        if obj.main_image:
            return obj.main_image.url
        return None