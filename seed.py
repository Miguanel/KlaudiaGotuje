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

    print("Tworzenie tagów...")
    tag_wege = Tag.objects.create(name="Wege")
    tag_szybkie = Tag.objects.create(name="Szybkie")
    tag_tradycyjne = Tag.objects.create(name="Tradycyjne")
    tag_slodkie = Tag.objects.create(name="Na słodko")
    tag_fit = Tag.objects.create(name="Fit")

    print("Generowanie 20 przepisów...")

    recipes_data = [
        {
            "name": "Klasyczna jajecznica na maśle",
            "category": cat_sniadania,
            "tags": [tag_wege, tag_szybkie],
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
                "Delikatnie mieszaj szpatułką. Gdy jajka będą w 80% ścięte, zdejmij z ognia, dodaj resztę masła i sól."
            ]
        },
        {
            "name": "Owsianka z malinami i miodem",
            "category": cat_sniadania,
            "tags": [tag_wege, tag_slodkie, tag_fit],
            "description": "Rozgrzewająca, zdrowa owsianka pełna błonnika i witamin.",
            "prep_time": 15,
            "ingredients": [
                {"name": "Płatki owsiane", "quantity": 50, "unit": "g"},
                {"name": "Mleko", "quantity": 200, "unit": "ml"},
                {"name": "Maliny", "quantity": 100, "unit": "g"},
                {"name": "Miód", "quantity": 1, "unit": "łyżka"}
            ],
            "steps": [
                "Zalej płatki owsiane mlekiem w rondelku.",
                "Gotuj na małym ogniu przez około 10 minut, regularnie mieszając.",
                "Przełóż do miseczki, polej miodem i posyp świeżymi malinami."
            ]
        },
        {
            "name": "Puszyste placuszki bananowe",
            "category": cat_sniadania,
            "tags": [tag_wege, tag_slodkie],
            "description": "Szybkie placki bez dodatku białego cukru, naturalnie słodkie od bananów.",
            "prep_time": 20,
            "ingredients": [
                {"name": "Dojrzałe banany", "quantity": 2, "unit": "szt."},
                {"name": "Jajka", "quantity": 2, "unit": "szt."},
                {"name": "Mąka pszenna", "quantity": 100, "unit": "g"},
                {"name": "Olej do smażenia", "quantity": 2, "unit": "łyżki"}
            ],
            "steps": [
                "Rozgnieć banany widelcem w misce na gładką masę.",
                "Dodaj jajka oraz mąkę, a następnie dokładnie wymieszaj widelcem lub trzepaczką.",
                "Smaż małe placuszki na rozgrzanym oleju z obu stron na złoty kolor."
            ]
        },
        {
            "name": "Tosty francuskie z cynamonem",
            "category": cat_sniadania,
            "tags": [tag_slodkie, tag_szybkie],
            "description": "Chrupiące z zewnątrz i miękkie w środku pieczywo w słodkiej, jajecznej pierzynce.",
            "prep_time": 15,
            "ingredients": [
                {"name": "Chleb tostowy", "quantity": 4, "unit": "skibki"},
                {"name": "Jajko", "quantity": 1, "unit": "szt."},
                {"name": "Mleko", "quantity": 50, "unit": "ml"},
                {"name": "Cynamon", "quantity": 1, "unit": "łyżeczka"}
            ],
            "steps": [
                "W głębokim talerzu wymieszaj jajko, mleko oraz cynamon.",
                "Mocz każdą kromkę chleba w miksturze z obu stron.",
                "Smaż na rozgrzanej maślanej patelni na złocisty kolor."
            ]
        },
        {
            "name": "Szakszuka z pomidorami i fetą",
            "category": cat_sniadania,
            "tags": [tag_wege],
            "description": "Bliskowschodnie danie z jajek ściętych w aromatycznym sosie pomidorowym.",
            "prep_time": 25,
            "ingredients": [
                {"name": "Jajka", "quantity": 3, "unit": "szt."},
                {"name": "Krojone pomidory z puszki", "quantity": 400, "unit": "g"},
                {"name": "Czosnek", "quantity": 2, "unit": "ząbki"},
                {"name": "Ser feta", "quantity": 50, "unit": "g"}
            ],
            "steps": [
                "Na patelni podsmaż posiekany czosnek, wlej pomidory z puszki i duś przez 10 minut.",
                "Zrób w sosie małe wgłębienia i wbij w nie ostrożnie jajka.",
                "Przykryj patelnię pokrywką i gotuj, aż białka się ścięta. Posyp pokruszoną fetą."
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
            "name": "Zupa krem z pieczonych pomidorów",
            "category": cat_zupy,
            "tags": [tag_wege],
            "description": "Aromatyczna zupa ze słodkich pomidorów pieczonych z czosnkiem.",
            "prep_time": 45,
            "ingredients": [
                {"name": "Pomidory", "quantity": 1000, "unit": "g"},
                {"name": "Czosnek", "quantity": 1, "unit": "główka"},
                {"name": "Oliwa z oliwek", "quantity": 4, "unit": "łyżki"}
            ],
            "steps": [
                "Pomidory przekrój na pół i ułóż na blasze razem z naciętą główką czosnku.",
                "Skrop oliwą i piecz w 200°C przez 40 minut.",
                "Zblenduj upieczone składniki na gładki krem."
            ]
        },
        {
            "name": "Aromatyczna zupa grzybowa",
            "category": cat_zupy,
            "tags": [tag_tradycyjne, tag_wege],
            "description": "Głęboka w smaku zupa ze świeżych lub suszonych grzybów leśnych.",
            "prep_time": 60,
            "ingredients": [
                {"name": "Grzyby leśne", "quantity": 400, "unit": "g"},
                {"name": "Ziemniaki", "quantity": 4, "unit": "szt."},
                {"name": "Śmietana 30%", "quantity": 100, "unit": "ml"}
            ],
            "steps": [
                "Oczyszczone grzyby pokrój i podsmaż na maśle z cebulą.",
                "Zalej bulionem, dodaj pokrojone w kostkę ziemniaki i gotuj do miękkości.",
                "Zabiel zupę śmietaną na koniec gotowania."
            ]
        },
        {
            "name": "Kremowa zupa brokułowa",
            "category": cat_zupy,
            "tags": [tag_wege, tag_fit],
            "description": "Lekka, zielona zupa krem podawana z chrupiącymi grzankami.",
            "prep_time": 30,
            "ingredients": [
                {"name": "Brokuł", "quantity": 1, "unit": "szt."},
                {"name": "Ziemniak", "quantity": 2, "unit": "szt."},
                {"name": "Śmietanka 18%", "quantity": 80, "unit": "ml"}
            ],
            "steps": [
                "Podziel brokuł na różyczki i ugotuj razem z obranymi ziemniakami w osolonej wodzie.",
                "Gdy warzywa zmiękną, zblenduj je na gładki krem, dodając śmietankę.",
                "Dopraw solą, pieprzem i odrobiną gałki muszkatołowej."
            ]
        },
        {
            "name": "Sycąca zupa gulaszowa",
            "category": cat_zupy,
            "tags": [tag_tradycyjne],
            "description": "Gęsta, mięsna zupa pełna warzyw i papryki z dodatkiem słodkiej i ostrej papryki.",
            "prep_time": 90,
            "ingredients": [
                {"name": "Łopatka wieprzowa", "quantity": 500, "unit": "g"},
                {"name": "Papryka czerwona", "quantity": 2, "unit": "szt."},
                {"name": "Ziemniaki", "quantity": 3, "unit": "szt."}
            ],
            "steps": [
                "Mięso pokrój w kostkę i obsmaż w garnku na złoty kolor.",
                "Dodaj pokrojoną paprykę, cebulę i zalej bulionem. Duś przez godzinę.",
                "Dodaj pokrojone ziemniaki i gotuj, aż zmiękną."
            ]
        },
        {
            "name": "Kotlet schabowy z ziemniakami",
            "category": cat_dania,
            "tags": [tag_tradycyjne],
            "description": "Klasyczny polski obiad – chrupiący schabowy i młode ziemniaki z koperkiem.",
            "prep_time": 40,
            "ingredients": [
                {"name": "Schab wieprzowy", "quantity": 400, "unit": "g"},
                {"name": "Bułka tarta", "quantity": 100, "unit": "g"},
                {"name": "Jajko", "quantity": 2, "unit": "szt."}
            ],
            "steps": [
                "Rozbij mięso tłuczkiem, oprósz solą i pieprzem.",
                "Otocz w mące, roztrzepanym jajku i bułce tartej.",
                "Smaż na rozgrzanym smalcu lub oleju z obu stron."
            ]
        },
        {
            "name": "Spaghetti Bolognese",
            "category": cat_dania,
            "tags": [tag_szybkie],
            "description": "Włoski klasyk z mięsnym sosem pomidorowym i ziołami.",
            "prep_time": 50,
            "ingredients": [
                {"name": "Makaron spaghetti", "quantity": 400, "unit": "g"},
                {"name": "Mięso mielone wołowe", "quantity": 500, "unit": "g"},
                {"name": "Passata pomidorowa", "quantity": 700, "unit": "ml"}
            ],
            "steps": [
                "Podsmaż mięso mielone na patelni, dodaj czosnek i passatę pomidorową.",
                "Duś sos na wolnym ogniu przez ok. 35-40 minut.",
                "Wymieszaj sos z ugotowanym al dente makaronem."
            ]
        },
        {
            "name": "Kurczak curry z ryżem",
            "category": cat_dania,
            "tags": [tag_szybkie],
            "description": "Szybkie, aromatyczne danie z mleczkiem kokosowym i kurczakiem.",
            "prep_time": 30,
            "ingredients": [
                {"name": "Pierś z kurczaka", "quantity": 500, "unit": "g"},
                {"name": "Mleczko kokosowe", "quantity": 400, "unit": "ml"},
                {"name": "Pasta curry", "quantity": 2, "unit": "łyżki"}
            ],
            "steps": [
                "Pokrój kurczaka w kostkę i podsmaż na patelni.",
                "Dodaj pastę curry, a następnie wlej mleczko kokosowe.",
                "Gotuj całość przez 15 minut i podawaj z ugotowanym ryżem."
            ]
        },
        {
            "name": "Domowe pierogi ruskie",
            "category": cat_dania,
            "tags": [tag_tradycyjne, tag_wege],
            "description": "Delikatne ciasto wypełnione farszem z twarogu, ziemniaków i smażonej cebulki.",
            "prep_time": 120,
            "ingredients": [
                {"name": "Mąka pszenna", "quantity": 500, "unit": "g"},
                {"name": "Twaróg", "quantity": 400, "unit": "g"},
                {"name": "Ziemniaki", "quantity": 400, "unit": "g"}
            ],
            "steps": [
                "Zagniecione z mąki i ciepłej wody ciasto rozwałkuj i wykrawaj kółka.",
                "Wymieszaj ugotowane ziemniaki z twaróg i podsmażoną cebulką na farsz.",
                "Lep pierogi i wrzucaj do wrzącej, osolonej wody na 3 minuty po wypłynięciu."
            ]
        },
        {
            "name": "Łosoś pieczony z cytryną i ziołami",
            "category": cat_dania,
            "tags": [tag_fit, tag_szybkie],
            "description": "Zdrowe i niezwykle soczyste danie rybne gotowe w kwadrans.",
            "prep_time": 25,
            "ingredients": [
                {"name": "Filet z łososia", "quantity": 400, "unit": "g"},
                {"name": "Cytryna", "quantity": 1, "unit": "szt."},
                {"name": "Świeży koper", "quantity": 1, "unit": "pęczek"}
            ],
            "steps": [
                "Ułóż filety z łososia na blaszce wyłożonej papierem do pieczenia.",
                "Skrop rybę sokiem z cytryny, posyp solą, pieprzem i posiekanym koprem.",
                "Piecz w 180°C przez około 15-18 minut."
            ]
        },
        {
            "name": "Domowa szarlotka z kruszonką",
            "category": cat_desery,
            "tags": [tag_slodkie, tag_tradycyjne],
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
            "name": "Puszysty sernik wiedeński",
            "category": cat_desery,
            "tags": [tag_slodkie],
            "description": "Kremowy, tradycyjny sernik bez spodu, rozpuszczający się w ustach.",
            "prep_time": 100,
            "ingredients": [
                {"name": "Twaróg sernikowy", "quantity": 1000, "unit": "g"},
                {"name": "Jajka", "quantity": 6, "unit": "szt."},
                {"name": "Cukier puder", "quantity": 200, "unit": "g"}
            ],
            "steps": [
                "Ubij białka na sztywną pianę.",
                "Zmiksuj twaróg z żółtkami i cukrem pudrem, połącz delikatnie z pianą.",
                "Piecz w 160°C przez ok. 70 minut."
            ]
        },
        {
            "name": "Naleśniki z twarogiem na słodko",
            "category": cat_desery,
            "tags": [tag_slodkie, tag_szybkie],
            "description": "Cieniutkie naleśniki nadziewane słodką masą twarogową.",
            "prep_time": 30,
            "ingredients": [
                {"name": "Mąka", "quantity": 250, "unit": "g"},
                {"name": "Mleko", "quantity": 300, "unit": "ml"},
                {"name": "Twaróg półtłusty", "quantity": 300, "unit": "g"}
            ],
            "steps": [
                "Wymieszaj składniki na ciasto naleśnikowe i smaż cienkie placki.",
                "Rozgnieć twaróg z cukrem waniliowym i odrobiną śmietany.",
                "Farsz nakładaj na naleśniki, zwijaj w rulony i podsmaż lekko na maśle."
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
        },
        {
            "name": "Orzeźwiające smoothie truskawkowe",
            "category": cat_napoje,
            "tags": [tag_fit, tag_szybkie, tag_wege],
            "description": "Szybki koktajl ze świeżych truskawek i jogurtu naturalnego.",
            "prep_time": 5,
            "ingredients": [
                {"name": "Truskawki", "quantity": 300, "unit": "g"},
                {"name": "Jogurt naturalny", "quantity": 200, "unit": "ml"},
                {"name": "Miód", "quantity": 1, "unit": "łyżka"}
            ],
            "steps": [
                "Oczyść truskawki z szypułek i wrzuć do blendera.",
                "Dodaj jogurt naturalny oraz miód.",
                "Zblenduj na gładką, jednolitą masę i przelej do szklanek."
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