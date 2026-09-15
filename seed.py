import os
import django

# Inicjalizacja środowiska Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from recipes.models import Category, Tag, Recipe, Ingredient, RecipeStep

def run_seed():
    print("Czyszczenie starej bazy danych...")
    Recipe.objects.all().delete()
    Category.objects.all().delete()
    Tag.objects.all().delete()

    print("Tworzenie Głównych Folderów (Kategorii)...")
    # Zgodnie z nową architekturą, to są główne katalogi nawigacyjne
    cat_kategorie_dan = Category.objects.create(name="Kategorie dań")
    cat_diety = Category.objects.create(name="Diety i preferencje")
    cat_mieso_ryby = Category.objects.create(name="Mięso i ryby")
    cat_maczna_magia = Category.objects.create(name="Mączna magia i tradycja")
    cat_sezonowe = Category.objects.create(name="Sezonowe i okazje")
    cat_skladniki = Category.objects.create(name="Składniki wiodące")
    cat_spizarnia = Category.objects.create(name="Spiżarnia i napoje")
    cat_sprzet = Category.objects.create(name="Sprzęt i czas")

    print("Tworzenie pełnej listy luźnych tagów...")
    tag_names = [
        # Typy posiłków
        "Śniadania", "Obiady", "Kolacje", "Przystawki", "Zupy", "Dania główne",
        "Desery", "Lunchbox", "Przekąski", "Dania jednogarnkowe", "Sosy i dipy",
        # Diety
        "Fit", "Lekka", "Bez glutenu", "Wysokobiałkowe", "Zamienniki słodyczy fit",
        "Zamienniki słodyczy z dobrym składem", "Niskokaloryczne (Low Calorie)",
        "Bez cukru", "Keto / Low Carb", "Zdrowe tłuszcze",
        # Mięso i ryby (jako tagi doprecyzujące)
        "Z mięsem", "Dania drobiowe (Kurczak/Indyk)", "Wołowina & Wieprzowina", "Ryby", "Bez mięsa",
        # Wypieki
        "Chleby / pieczywo", "Domowy chleb", "Drożdżowe", "Makarony", "Kluski",
        "Pierogi", "Naleśniki", "Gofry", "Pączki, oponki", "Rogale i rogaliki",
        "Bez pieczenia", "Ciasta i ciasteczka", "Wypieki na zakwasie", "Tarty", "Cieszyńskie ciasteczka",
        # Sezony
        "Sezonowe", "Wiosna", "Lato", "Jesień", "Zima", "Jesieniara", "Halloween",
        "Tłusty czwartek", "Wielkanoc", "Boże Narodzenie", "Imprezy", "Grill przystawki",
        "Walentynki", "Sylwester", "Klimatyczne wieczory",
        # Składniki
        "Na słodko", "Na słono", "Ostre / Pikantne", "Cukinia", "Dynia", "Ziemniaki",
        "Jabłka", "Cynamon", "Jajka", "Owsianki", "Sałatki", "Owoce leśne",
        "Czekolada", "Twaróg / Nabiał", "Warzywa korzeniowe", "Grzyby",
        # Inne
        "Domowe weki", "Nalewki", "Napoje", "Koktajle", "Koktajle białkowe",
        "Rozgrzewające napary", "Kawy i herbaty smakowe", "Szybkie (do 20 minut)",
        "Na zimno", "Air fryer (Frytkownica beztłuszczowa)", "Tradycyjne",
        "Tanie gotowanie", "Z kilku składników", "Z piekarnika", "Przetwory"
    ]

    # Dynamiczne utworzenie słownika tagów w bazie
    tags_dict = {}
    for name in tag_names:
        tags_dict[name] = Tag.objects.create(name=name)

    print("Generowanie przepisów dopasowanych do folderów i tagów...")

    recipes_data = [
        # --- MAKARONY ---
        {
            "name": "Spaghetti Carbonara z boczkiem",
            "category": cat_kategorie_dan,
            "tags": [tags_dict["Makarony"], tags_dict["Tradycyjne"], tags_dict["Z mięsem"], tags_dict["Obiady"]],
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
            "category": cat_maczna_magia,
            "tags": [tags_dict["Makarony"], tags_dict["Szybkie (do 20 minut)"], tags_dict["Bez mięsa"], tags_dict["Lekka"]],
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
            "category": cat_kategorie_dan,
            "tags": [tags_dict["Makarony"], tags_dict["Fit"], tags_dict["Lekka"], tags_dict["Bez mięsa"]],
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
            "category": cat_maczna_magia,
            "tags": [tags_dict["Drożdżowe"], tags_dict["Tradycyjne"], tags_dict["Imprezy"], tags_dict["Z piekarnika"]],
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
            "category": cat_maczna_magia,
            "tags": [tags_dict["Drożdżowe"], tags_dict["Ciasta i ciasteczka"], tags_dict["Na słodko"], tags_dict["Desery"]],
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
            "category": cat_spizarnia,
            "tags": [tags_dict["Przetwory"], tags_dict["Domowe weki"], tags_dict["Na słodko"]],
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
            "category": cat_kategorie_dan,
            "tags": [tags_dict["Zupy"], tags_dict["Tradycyjne"], tags_dict["Z mięsem"], tags_dict["Obiady"]],
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
            "category": cat_mieso_ryby,
            "tags": [tags_dict["Dania główne"], tags_dict["Tradycyjne"], tags_dict["Ziemniaki"], tags_dict["Wołowina & Wieprzowina"], tags_dict["Obiady"]],
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
            "category": cat_maczna_magia,
            "tags": [tags_dict["Desery"], tags_dict["Ciasta i ciasteczka"], tags_dict["Jabłka"], tags_dict["Cynamon"]],
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
            "category": cat_spizarnia,
            "tags": [tags_dict["Napoje"], tags_dict["Szybkie (do 20 minut)"], tags_dict["Fit"], tags_dict["Na zimno"]],
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

        # Przypisanie tagów
        recipe.tags.set(item["tags"])

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

    print(f"Sukces! Baza została zasilona zestawem {len(recipes_data)} przepisów, ułożonych w nowych folderach (kategoriach) z dynamicznymi tagami.")

if __name__ == "__main__":
    run_seed()