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

    print("Tworzenie kategorii...")
    cat_sniadania = Category.objects.create(name="Śniadania")
    cat_obiady = Category.objects.create(name="Obiady")
    cat_desery = Category.objects.create(name="Desery")
    cat_napoje = Category.objects.create(name="Napoje")

    # Podkategorie
    cat_zupy = Category.objects.create(name="Zupy", parent_category=cat_obiady)
    cat_dania = Category.objects.create(name="Dania główne", parent_category=cat_obiady)

    print("Tworzenie tagów (zgodnych z nowym filtrem)...")
    tag_makarony = Tag.objects.create(name="Makarony")
    tag_drozdzowe = Tag.objects.create(name="Drożdżowe")
    tag_przetwory = Tag.objects.create(name="Przetwory")
    tag_fit = Tag.objects.create(name="Fit / Lekka")
    tag_szybkie = Tag.objects.create(name="Szybkie")
    tag_tradycyjne = Tag.objects.create(name="Tradycyjne")

    print("Generowanie przepisów dopasowanych do nowych tagów...")

    recipes_data = [
        # --- MAKARONY ---
        {
            "name": "Spaghetti Carbonara z boczkiem",
            "category": cat_dania,
            "tags": [tag_makarony, tag_tradycyjne],
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
            "category": cat_dania,
            "tags": [tag_makarony, tag_szybkie],
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
            "category": cat_dania,
            "tags": [tag_makarony, tag_fit],
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
            "category": cat_dania,
            "tags": [tag_drozdzowe, tag_tradycyjne],
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
            "category": cat_desery,
            "tags": [tag_drozdzowe],
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
        {
            "name": "Puszyste drożdżówki z jagodami",
            "category": cat_desery,
            "tags": [tag_drozdzowe],
            "description": "Letni klasyk – puszyste ciasto drożdżowe wypełnione po brzegi słodkimi jagodami.",
            "prep_time": 90,
            "ingredients": [
                {"name": "Ciasto drożdżowe", "quantity": 1, "unit": "porcja"},
                {"name": "Świeże jagody", "quantity": 300, "unit": "g"},
                {"name": "Cukier puder", "quantity": 50, "unit": "g"}
            ],
            "steps": [
                "Z przygotowanego ciasta drożdżowego formuj krążki z wgłębieniem w środku.",
                "W środek nałóż sowitą porcję jagód wymieszanych z odrobiną mąki.",
                "Piecz w 180°C na złoty kolor, a po ostudzeniu oprósz cukrem pudrem."
            ]
        },

        # --- PRZETWORY ---
        {
            "name": "Domowa konfitura truskawkowa",
            "category": cat_desery,
            "tags": [tag_przetwory, tag_tradycyjne],
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
            "name": "Tradycyjne ogórki kiszone",
            "category": cat_dania,
            "tags": [tag_przetwory, tag_tradycyjne],
            "description": "Chrupiące, idealnie ukiszone ogórki z czosnkiem, chrzanem i koprem.",
            "prep_time": 40,
            "ingredients": [
                {"name": "Ogórki gruntowe", "quantity": 3000, "unit": "g"},
                {"name": "Czosnek", "quantity": 1, "unit": "główka"},
                {"name": "Korzeń chrzanu", "quantity": 1, "unit": "szt."},
                {"name": "Koper z baldachiem", "quantity": 4, "unit": "szt."},
                {"name": "Sól kamienna", "quantity": 3, "unit": "łyżki"}
            ],
            "steps": [
                "Umyj ogórki i ciasno ułóż w czystym słoiku, przekładając czosnkiem, chrzanem i koprem.",
                "Przygotuj solankę: rozpuść 1 łyżkę soli na 1 litr ciepłej wody.",
                "Zalej ogórki gorącą solanką, tak aby były całkowicie przykryte, i odstaw w ciemne miejsce."
            ]
        },
        {
            "name": "Domowy dżem malinowy",
            "category": cat_desery,
            "tags": [tag_przetwory],
            "description": "Słodko-kwaśny dżem z malin doskonały do naleśników i herbaty.",
            "prep_time": 60,
            "ingredients": [
                {"name": "Maliny", "quantity": 1500, "unit": "g"},
                {"name": "Cukier", "quantity": 600, "unit": "g"}
            ],
            "steps": [
                "Przełóż maliny do garnka i podgrzewaj, aż puszczą sok.",
                "Dodaj cukier i gotuj na średnim ogniu przez około 45 minut, aż dżem zgęstnieje.",
                "Przelej do słoików i pasteryzuj przez 10 minut."
            ]
        },

        # --- FIT / LEKKA ---
        {
            "name": "Lekka sałatka z kurczakiem i awokado",
            "category": cat_dania,
            "tags": [tag_fit, tag_szybkie],
            "description": "Orzeźwiająca, pełna białka i zdrowych tłuszczów sałatka obiadowa.",
            "prep_time": 20,
            "ingredients": [
                {"name": "Mix sałat", "quantity": 150, "unit": "g"},
                {"name": "Pierś z kurczaka", "quantity": 250, "unit": "g"},
                {"name": "Awokado", "quantity": 1, "unit": "szt."},
                {"name": "Pomidorki koktajlowe", "quantity": 200, "unit": "g"}
            ],
            "steps": [
                "Ugrilluj lub podsmaż pokrojoną pierś z kurczaka doprawioną ulubionymi ziołami.",
                "Na talerzu ułóż mix sałat, pokrojone awokado oraz połówki pomidorków.",
                "Dodaj ciepłego kurczaka i skrop całość oliwą z oliwek oraz sokiem z cytryny."
            ]
        },
        {
            "name": "Fit koktajl szpinakowy z bananem",
            "category": cat_napoje,
            "tags": [tag_fit, tag_szybkie],
            "description": "Błyskawiczny, witaminowy zastrzyk energii na bazie świeżego szpinaku.",
            "prep_time": 5,
            "ingredients": [
                {"name": "Szpinak baby", "quantity": 50, "unit": "g"},
                {"name": "Dojrzały banan", "quantity": 1, "unit": "szt."},
                {"name": "Jogurt naturalny", "quantity": 200, "unit": "ml"},
                {"name": "Sok z pomarańczy", "quantity": 100, "unit": "ml"}
            ],
            "steps": [
                "Wrzuć wszystkie składniki do blendera.",
                "Zblenduj na idealnie gładką masę bez grudek.",
                "Przelej do wysokiej szklanki i podawaj od razu."
            ]
        },
        {
            "name": "Kremowa owsianka z masłem orzechowym",
            "category": cat_sniadania,
            "tags": [tag_fit, tag_szybkie],
            "description": "Sycące śniadanie bogate w białko i błonnik, idealne przed treningiem.",
            "prep_time": 10,
            "ingredients": [
                {"name": "Płatki owsiane", "quantity": 50, "unit": "g"},
                {"name": "Mleko migdałowe", "quantity": 200, "unit": "ml"},
                {"name": "Masło orzechowe", "quantity": 1, "unit": "łyżka"},
                {"name": "Banan", "quantity": 1, "unit": "szt."}
            ],
            "steps": [
                "Ugotuj płatki owsiane na mleku migdałowym przez około 5 minut.",
                "Po ugotowaniu wmieszaj łyżkę masła orzechowego, aby powstała kremowa konsystencja.",
                "Udekoruj plasterkami banana na wierzchu."
            ]
        },

        # --- SZYBKIE I TRADYCYJNE (Dodatkowe wypełnienie do 15-20 przepisów) ---
        {
            "name": "Klasyczna jajecznica na maśle",
            "category": cat_sniadania,
            "tags": [tag_szybkie, tag_tradycyjne],
            "description": "Prosty, ale idealny przepis na kremową jajecznicę. Doskonały start każdego dnia.",
            "prep_time": 10,
            "ingredients": [
                {"name": "Jajka", "quantity": 3, "unit": "szt."},
                {"name": "Masło", "quantity": 20, "unit": "g"},
                {"name": "Sól", "quantity": 1, "unit": "szczypta"}
            ],
            "steps": [
                "Rozgrzej patelnię na średnim ogniu i rozpuść połowę masła.",
                "Wbij jajka bezpośrednio na patelnię, poczekaj 15 sekund aż białko zacznie się ścinać.",
                "Delikatnie mieszaj szpatułką. Gdy jajka będą w 80% ścięte, zdejmij z ognia i dopraw."
            ]
        },
        {
            "name": "Tradycyjny Rosół domowy",
            "category": cat_zupy,
            "tags": [tag_tradycyjne],
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
            "category": cat_dania,
            "tags": [tag_tradycyjne],
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
            "category": cat_desery,
            "tags": [tag_tradycyjne],
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
            "category": cat_napoje,
            "tags": [tag_szybkie, tag_fit],
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

    print(f"Sukces! Baza została zasilona zestawem {len(recipes_data)} przepisów.")


if __name__ == "__main__":
    run_seed()