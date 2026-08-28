from django.contrib import admin
from unfold.admin import ModelAdmin, TabularInline, StackedInline
from .models import Recipe, Ingredient, RecipeStep, Category, Tag


@admin.register(Category)
class CategoryAdmin(ModelAdmin):
    list_display = ('name', 'parent_category', 'slug')
    list_filter = ('parent_category',)
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name',)


@admin.register(Tag)
class TagAdmin(ModelAdmin):
    list_display = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}


class IngredientInline(TabularInline):
    model = Ingredient
    extra = 3
    tab = True


class RecipeStepInline(StackedInline):
    model = RecipeStep
    extra = 1
    tab = True


@admin.register(Recipe)
class RecipeAdmin(ModelAdmin):
    inlines = [IngredientInline, RecipeStepInline]

    # Zaktualizowane nazwy zmiennych na zgodne z models.py
    list_display = ('name', 'category', 'prep_time', 'created_at')
    search_fields = ('name', 'description')
    readonly_fields = ('created_at', 'updated_at')
    list_filter = ('category',)

    fieldsets = (
        ('Podstawowe informacje', {
            'fields': ('category', 'tags', 'name', 'description', 'main_image')
        }),
        ('Szczegóły przygotowania', {
            'fields': ('prep_time',)
        }),
        ('Informacje systemowe', {
            'classes': ('collapse',),
            'fields': ('created_at', 'updated_at'),
        }),
    )