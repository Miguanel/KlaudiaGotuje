from rest_framework import serializers
from .models import Category, Recipe, Tag, Ingredient, RecipeStep

class CategorySerializer(serializers.ModelSerializer):
    # Serializacja kategorii nadrzędnej
    parent_category = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'parent_category']

    def get_parent_category(self, obj):
        if obj.parent_category:
            return {
                'name': obj.parent_category.name,
                'slug': obj.parent_category.slug
            }
        return None

# Pamiętaj o aktualizacji RecipeSerializer, aby korzystał z 'name', 'category', 'prep_time', 'main_image' itd.