"""
Zamiana tagów na podrozdziały.

1. Tworzy podrozdziały (Category z parent_category) w istniejących rozdziałach.
2. Każdy przepis przenosi do podrozdziału odpowiadającego pierwszemu pasującemu tagowi
   z jego rozdziału. Gdy żaden tag nie pasuje – przepis zostaje w rozdziale.
Struktura jest tu "zamrożona" (kopia recipes/structure.py z chwili tworzenia migracji).
"""
from django.db import migrations
from django.utils.text import slugify

CHAPTERS = {
    'Kategorie dań': ['Śniadania', 'Obiady', 'Kolacje', 'Przystawki', 'Zupy', 'Dania główne', 'Desery', 'Lunchbox', 'Przekąski', 'Dania jednogarnkowe', 'Sosy i dipy'],
    'Diety i preferencje': ['Fit', 'Lekka', 'Bez glutenu', 'Wysokobiałkowe', 'Zamienniki słodyczy fit', 'Zamienniki słodyczy z dobrym składem', 'Niskokaloryczne (Low Calorie)', 'Bez cukru', 'Keto / Low Carb', 'Zdrowe tłuszcze'],
    'Mięso i ryby': ['Z mięsem', 'Dania drobiowe (Kurczak/Indyk)', 'Wołowina & Wieprzowina', 'Ryby', 'Bez mięsa'],
    'Mączna magia i tradycja': ['Chleby / pieczywo', 'Domowy chleb', 'Drożdżowe', 'Makarony', 'Kluski', 'Pierogi', 'Naleśniki', 'Gofry', 'Pączki, oponki', 'Rogale i rogaliki', 'Bez pieczenia', 'Ciasta i ciasteczka', 'Wypieki na zakwasie', 'Tarty', 'Cieszyńskie ciasteczka'],
    'Sezonowe i okazje': ['Wiosna', 'Lato', 'Jesień', 'Zima', 'Jesieniara', 'Halloween', 'Tłusty czwartek', 'Wielkanoc', 'Boże Narodzenie', 'Imprezy', 'Grill przystawki', 'Walentynki', 'Sylwester', 'Klimatyczne wieczory'],
    'Składniki wiodące': ['Na słodko', 'Na słono', 'Ostre / Pikantne', 'Cukinia', 'Dynia', 'Ziemniaki', 'Jabłka', 'Cynamon', 'Jajka', 'Owsianki', 'Sałatki', 'Owoce leśne', 'Czekolada', 'Twaróg / Nabiał', 'Warzywa korzeniowe', 'Grzyby'],
    'Spiżarnia i napoje': ['Przetwory', 'Domowe weki', 'Nalewki', 'Napoje', 'Koktajle', 'Koktajle białkowe', 'Rozgrzewające napary', 'Kawy i herbaty smakowe'],
    'Sprzęt i czas': ['Szybkie (do 20 minut)', 'Na zimno', 'Air fryer (Frytkownica beztłuszczowa)', 'Tradycyjne', 'Tanie gotowanie', 'Z kilku składników', 'Z piekarnika'],
}

_PL = str.maketrans({"ł": "l", "Ł": "L"})


def _unique_slug(Category, name):
    base = slugify(name.translate(_PL)) or "kategoria"
    slug, i = base, 2
    while Category.objects.filter(slug=slug).exists():
        slug, i = f"{base}-{i}", i + 1
    return slug


def forwards(apps, schema_editor):
    Category = apps.get_model("recipes", "Category")
    Recipe = apps.get_model("recipes", "Recipe")

    def get_or_create(name, parent=None):
        cat = Category.objects.filter(name=name).first()
        if cat is None:
            cat = Category.objects.create(name=name, slug=_unique_slug(Category, name), parent_category=parent)
        elif parent is not None and cat.parent_category_id is None and cat.id != parent.id:
            cat.parent_category = parent
            cat.save(update_fields=["parent_category"])
        return cat

    # nazwa podrozdziału -> (podrozdział, id rozdziału)
    subs = {}
    for chapter_name, sub_names in CHAPTERS.items():
        chapter = get_or_create(chapter_name)
        for sub_name in sub_names:
            subs[sub_name] = (get_or_create(sub_name, chapter), chapter.id)

    for recipe in Recipe.objects.select_related("category").prefetch_related("tags"):
        tag_names = [t.name for t in recipe.tags.all()]
        if not tag_names:
            continue
        chapter_id = None
        if recipe.category_id:
            chapter_id = recipe.category.parent_category_id or recipe.category_id
            if recipe.category.parent_category_id:
                continue  # już jest w podrozdziale
        # najpierw tag z tego samego rozdziału, a gdy przepis nie ma rozdziału – pierwszy pasujący
        target = next((subs[n][0] for n in tag_names if n in subs and (chapter_id is None or subs[n][1] == chapter_id)), None)
        if target is not None:
            recipe.category = target
            recipe.save(update_fields=["category"])


class Migration(migrations.Migration):

    dependencies = [
        ("recipes", "0004_recipe_diet"),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
