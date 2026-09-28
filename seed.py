import os
import django

# Inicjalizacja środowiska Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from recipes.models import Category, Recipe, Ingredient, RecipeStep
from recipes.structure import CHAPTERS

def run_seed():
    print("Czyszczenie starej bazy danych...")
    Recipe.objects.all().delete()
    Category.objects.all().delete()

    print("Tworzenie rozdziałów i podrozdziałów...")
    # sub["Nazwa podrozdziału"] -> obiekt Category (podrozdział); chapter["Nazwa rozdziału"] -> rozdział
    chapter = {}
    sub = {}
    for chapter_name, sub_names in CHAPTERS.items():
        parent = Category.objects.create(name=chapter_name)
        chapter[chapter_name] = parent
        for sub_name in sub_names:
            sub[sub_name] = Category.objects.create(name=sub_name, parent_category=parent)

    print("Generowanie przepisów w podrozdziałach...")

    recipes_data = [
        # --- MAKARONY ---
        {
            "name": "Spaghetti Carbonara z boczkiem",
            "category": sub["Obiady"],
            "description": "Klasyczne włoskie spaghetti z chrupiącym boczkiem, żółtkami i serem Pecorino.",
            "prep_time": 25,
            "ingredients": [
                {"name": "Makaron spaghetti", "quantity": 400, "unit": "g"},
                {"name": "Boczek wędzony", "quantity": 200, "unit": "g"},
                {"name": "Żółtka jaj", "quantity": 4, "unit": "szt."},
                {"name": "Ser Pecorino", "quantity": 80, "unit": "g"}
            ],
            "steps": [
                "Ugotuj makaron al dente w osolonej wodzie.",
                "Pokrój boczek w kostkę i podsmaż na chrupko na suchej patelni.",
                "W misce wymieszaj żółtka z startym serem i dużą ilością pieprzu.",
                "Połącz gorący makaron z boczkiem, zdejmij z ognia, dodaj masę jajeczną i energicznie wymieszaj."
            ]
        },
        {
            "name": "Domowe tagliatelle w sosie pomidorowym",
            "category": sub["Makarony"],
            "description": "Świeży makaron wstążki w lekkim sosie z pomidorów i świeżej bazylii.",
            "prep_time": 20,
            "ingredients": [
                {"name": "Tagliatelle", "quantity": 400, "unit": "g"},
                {"name": "Pomidory z puszki", "quantity": 500, "unit": "g"},
                {"name": "Czosnek", "quantity": 2, "unit": "ząbki"},
                {"name": "Świeża bazylia", "quantity": 1, "unit": "pęczek"}
            ],
            "steps": [
                "Ugotuj makaron zgodnie z instrukcją na opakowaniu.",
                "Na oliwie podsmaż posiekany czosnek, dodaj pomidory i duś przez 10 minut.",
                "Wymieszaj sos z makaronem i posyp obficie świeżą bazylią."
            ]
        },
        {
            "name": "Makaron z sosem szpinakowym i fetą",
            "category": sub["Obiady"],
            "description": "Kremowy, zielony sos ze szpinaku i czosnku z dodatkiem słonej fety.",
            "prep_time": 25,
            "ingredients": [
                {"name": "Makaron penne", "quantity": 400, "unit": "g"},
                {"name": "Szpinak świeży", "quantity": 250, "unit": "g"},
                {"name": "Ser feta", "quantity": 100, "unit": "g"},
                {"name": "Czosnek", "quantity": 3, "unit": "ząbki"}
            ],
            "steps": [
                "Ugotuj makaron w osolonej wodzie.",
                "Na patelni podsmaż czosnek, wrzuć szpinak i smaż, aż zmięknie.",
                "Dodaj pokruszoną fetę, wymieszaj, a następnie połącz z ugotowanym makaronem."
            ]
        },

        # --- DROŻDŻOWE ---
        {
            "name": "Domowa pizza na puszystym cieście drożdżowym",
            "category": sub["Drożdżowe"],
            "description": "Prawdziwa domowa pizza z ciągnącym się sosem pomidorowym i serem.",
            "prep_time": 90,
            "ingredients": [
                {"name": "Mąka pszenna", "quantity": 500, "unit": "g"},
                {"name": "Drożdże świeże", "quantity": 25, "unit": "g"},
                {"name": "Ciepła woda", "quantity": 300, "unit": "ml"},
                {"name": "Sos pomidorowy", "quantity": 150, "unit": "g"},
                {"name": "Mozzarella", "quantity": 200, "unit": "g"}
            ],
            "steps": [
                "Rozpuść drożdże w ciepłej wodzie z odrobiną cukru.",
                "Wymieszaj z mąką i solą, zagnieć gładkie ciasto drożdżowe i odstaw do wyrośnięcia na godzinę.",
                "Rozwałkuj ciasto, posmaruj sosem pomidorowym, posyp mozzarellą.",
                "Piecz w piekarniku nagrzanym do 220°C przez około 12-15 minut."
            ]
        },
        {
            "name": "Słodkie bułeczki drożdżowe z kruszonką",
            "category": sub["Drożdżowe"],
            "description": "Mięciutkie, pachnące maślanym aromatem bułeczki z chrupiącą kruszonką.",
            "prep_time": 120,
            "ingredients": [
                {"name": "Mąka pszenna", "quantity": 600, "unit": "g"},
                {"name": "Drożdże", "quantity": 30, "unit": "g"},
                {"name": "Mleko ciepłe", "quantity": 250, "unit": "ml"},
                {"name": "Cukier", "quantity": 100, "unit": "g"},
                {"name": "Masło", "quantity": 100, "unit": "g"}
            ],
            "steps": [
                "Przygotuj rozczyn z drożdży, odrobiny mleka i cukru.",
                "Zagnieć ciasto ze wszystkimi składnikami i pozostaw do podwojenia objętości.",
                "Uformuj małe bułeczki, posyp przygotowaną wcześniej kruszonką z masła i mąki.",
                "Piecz w 180°C przez 25 minut."
            ]
        },

        # --- PRZETWORY ---
        {
            "name": "Domowa konfitura truskawkowa",
            "category": sub["Przetwory"],
            "description": "Gęsta, aromatyczna konfitura z całymi owocami truskawek na zimowe wieczory.",
            "prep_time": 180,
            "ingredients": [
                {"name": "Truskawki", "quantity": 2000, "unit": "g"},
                {"name": "Cukier", "quantity": 1000, "unit": "g"},
                {"name": "Sok z cytryny", "quantity": 2, "unit": "łyżki"}
            ],
            "steps": [
                "Oczyść truskawki, zasyp cukrem i odstaw na kilka godzin, aby puściły sok.",
                "Gotuj na małym ogniu przez około 2-3 godziny, regularnie zbierając pianę.",
                "Gorącą konfiturę przełóż do wyparzonych słoików i mocno zakręć."
            ]
        },
        {
            "name": "Tradycyjny Rosół domowy",
            "category": sub["Zupy"],
            "description": "Królowa polskich zup. Niedzielny klasyk na drobiowym mięsie.",
            "prep_time": 180,
            "ingredients": [
                {"name": "Kura zagrodowa", "quantity": 1, "unit": "szt."},
                {"name": "Marchew", "quantity": 4, "unit": "szt."},
                {"name": "Pietruszka", "quantity": 2, "unit": "szt."},
                {"name": "Cebula opalana", "quantity": 1, "unit": "szt."}
            ],
            "steps": [
                "Mięso zalej zimną wodą, zagotuj i zbierz powstałe szumowiny.",
                "Dodaj opaloną cebulę, obrane warzywa oraz przyprawy.",
                "Gotuj na minimalnym ogniu przez co najmniej 3 godziny."
            ]
        },
        {
            "name": "Kotlet schabowy z ziemniakami",
            "category": sub["Wołowina & Wieprzowina"],
            "description": "Klasyczny polski obiad – chrupiący schabowy i ziemniaki z koperkiem.",
            "prep_time": 40,
            "ingredients": [
                {"name": "Schab wieprzowy", "quantity": 400, "unit": "g"},
                {"name": "Bułka tarta", "quantity": 100, "unit": "g"},
                {"name": "Jajko", "quantity": 2, "unit": "szt."}
            ],
            "steps": [
                "Rozbij mięso tłuczkiem, oprósz solą i pieprzem.",
                "Otocz w mące, roztrzepanym jajku i bułce tartej.",
                "Smaż na rozgrzanym smalcu lub oleju z obu stron na złoty kolor."
            ]
        },
        {
            "name": "Domowa szarlotka z kruszonką",
            "category": sub["Ciasta i ciasteczka"],
            "description": "Kultowe ciasto z mnóstwem jabłek i chrupiącą maślaną kruszonką.",
            "prep_time": 90,
            "ingredients": [
                {"name": "Jabłka", "quantity": 1500, "unit": "g"},
                {"name": "Mąka pszenna", "quantity": 500, "unit": "g"},
                {"name": "Masło", "quantity": 250, "unit": "g"}
            ],
            "steps": [
                "Zagnieć kruche ciasto z mąki, masła i cukru, podziel na dwie części.",
                "Jabłka obierz, zetrzyj na tarce i wymieszaj z cynamonem.",
                "Wyłóż spód blachy ciastem, daj jabłka i zetrzyj resztę ciasta góry. Piecz 50 min w 180°C."
            ]
        },
        {
            "name": "Domowa lemoniada cytrynowa",
            "category": sub["Napoje"],
            "description": "Orzeźwiający, chłodzący napój pełen witaminy C z miętą.",
            "prep_time": 10,
            "ingredients": [
                {"name": "Cytryny", "quantity": 4, "unit": "szt."},
                {"name": "Świeża mięta", "quantity": 1, "unit": "pęczek"},
                {"name": "Woda gazowana", "quantity": 1000, "unit": "ml"}
            ],
            "steps": [
                "Wyciskaj sok z cytryn do dzbanka.",
                "Dodaj listki mięty, plasterki cytryny oraz miód lub cukier do smaku.",
                "Zalej schłodzoną wodą gazowaną i wrzuć kostki lodu."
            ]
        }
    ]

    for item in recipes_data:
        recipe = Recipe.objects.create(
            name=item["name"],
            category=item["category"],
            description=item["description"],
            prep_time=item["prep_time"]
        )

        # Tworzenie składników
        for ing in item["ingredients"]:
            Ingredient.objects.create(
                recipe=recipe,
                name=ing["name"],
                quantity=ing["quantity"],
                unit=ing["unit"]
            )

        # Tworzenie kroków
        for index, step_text in enumerate(item["steps"]):
            RecipeStep.objects.create(
                recipe=recipe,
                step_number=index + 1,
                instruction=step_text
            )

    print(f"Sukces! Baza została zasilona zestawem {len(recipes_data)} przepisów, ułożonych w rozdziałach i podrozdziałach.")

if __name__ == "__main__":
    run_seed()