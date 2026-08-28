import uuid
from django.db import models
from django.utils.text import slugify


class Category(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True, verbose_name="Nazwa kategorii")
    # Slug to wersja URL-friendly (np. "Szybkie obiady" -> "szybkie-obiady")
    slug = models.SlugField(max_length=100, unique=True, blank=True, verbose_name="Slug (URL)")

    # NOWE POLE: Relacja do samej siebie pozwalająca na tworzenie podkategorii
    parent_category = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='subcategories',
        verbose_name="Kategoria nadrzędna"
    )

    class Meta:
        verbose_name = "Kategoria"
        verbose_name_plural = "Kategorie"
        ordering = ['name']

    def save(self, *args, **kwargs):
        # Automatyczne generowanie sluga z nazwy, jeśli jest pusty
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        # Wyświetlanie w adminie np: "Przetwory > Z grzybów"
        if self.parent_category:
            return f"{self.parent_category.name} > {self.name}"
        return self.name


class Tag(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=50, unique=True, verbose_name="Nazwa taga (np. Wege)")
    slug = models.SlugField(max_length=50, unique=True, blank=True)

    class Meta:
        verbose_name = "Tag"
        verbose_name_plural = "Tagi"
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"#{self.name}"


class Recipe(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tags = models.ManyToManyField(Tag, blank=True, related_name='recipes', verbose_name="Tagi")

    # Relacja. SET_NULL gwarantuje, że usunięcie kategorii nie usunie przepisu!
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='recipes',
        verbose_name="Kategoria główna"
    )

    name = models.CharField(max_length=200, verbose_name="Nazwa przepisu")
    description = models.TextField(verbose_name="Opis / Wstęp")
    prep_time = models.PositiveIntegerField(help_text="Czas w minutach", verbose_name="Czas przygotowania")
    main_image = models.ImageField(upload_to='przepisy/glowne/', null=True, blank=True,
                                   verbose_name="Zdjęcie główne")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Przepis"
        verbose_name_plural = "Przepisy"
        ordering = ['-created_at']

    def __str__(self):
        return self.name


class Ingredient(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name='ingredients')
    name = models.CharField(max_length=100, verbose_name="Nazwa produktu (np. Mąka pszenna)")
    quantity = models.DecimalField(max_digits=6, decimal_places=2, verbose_name="Ilość")
    unit = models.CharField(max_length=50, verbose_name="Jednostka (np. g, ml, łyżka)")

    class Meta:
        verbose_name = "Składnik"
        verbose_name_plural = "Składniki"

    def __str__(self):
        return f"{self.name} - {self.quantity} {self.unit}"


class RecipeStep(models.Model):
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name='steps')
    step_number = models.PositiveIntegerField(verbose_name="Numer kroku")
    instruction = models.TextField(verbose_name="Instrukcja")
    image = models.ImageField(upload_to='przepisy/kroki/', null=True, blank=True, verbose_name="Zdjęcie poglądowe")

    class Meta:
        verbose_name = "Krok przygotowania"
        verbose_name_plural = "Kroki przygotowania"
        ordering = ['step_number']

    def __str__(self):
        return f"Krok {self.step_number}"