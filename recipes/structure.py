"""
Struktura książki przepisów: ROZDZIAŁY (kategorie główne) i ich PODROZDZIAŁY.

Zastępuje dawne tagi – każdy przepis trafia do jednego podrozdziału
(albo, jeśli żaden nie pasuje, bezpośrednio do rozdziału).
Kolejność na stronie jest alfabetyczna, więc tutaj liczy się tylko przynależność.
"""

CHAPTERS = {
    "Kategorie dań": [
        "Śniadania", "Obiady", "Kolacje", "Przystawki", "Zupy", "Dania główne",
        "Desery", "Lunchbox", "Przekąski", "Dania jednogarnkowe", "Sosy i dipy",
    ],
    "Diety i preferencje": [
        "Fit", "Lekka", "Bez glutenu", "Wysokobiałkowe", "Zamienniki słodyczy fit",
        "Zamienniki słodyczy z dobrym składem", "Niskokaloryczne (Low Calorie)",
        "Bez cukru", "Keto / Low Carb", "Zdrowe tłuszcze",
    ],
    "Mięso i ryby": [
        "Z mięsem", "Dania drobiowe (Kurczak/Indyk)", "Wołowina & Wieprzowina", "Ryby", "Bez mięsa",
    ],
    "Mączna magia i tradycja": [
        "Chleby / pieczywo", "Domowy chleb", "Drożdżowe", "Makarony", "Kluski",
        "Pierogi", "Naleśniki", "Gofry", "Pączki, oponki", "Rogale i rogaliki",
        "Bez pieczenia", "Ciasta i ciasteczka", "Wypieki na zakwasie", "Tarty", "Cieszyńskie ciasteczka",
    ],
    "Sezonowe i okazje": [
        "Wiosna", "Lato", "Jesień", "Zima", "Jesieniara", "Halloween",
        "Tłusty czwartek", "Wielkanoc", "Boże Narodzenie", "Imprezy", "Grill przystawki",
        "Walentynki", "Sylwester", "Klimatyczne wieczory",
    ],
    "Składniki wiodące": [
        "Na słodko", "Na słono", "Ostre / Pikantne", "Cukinia", "Dynia", "Ziemniaki",
        "Jabłka", "Cynamon", "Jajka", "Owsianki", "Sałatki", "Owoce leśne",
        "Czekolada", "Twaróg / Nabiał", "Warzywa korzeniowe", "Grzyby",
    ],
    "Spiżarnia i napoje": [
        "Przetwory", "Domowe weki", "Nalewki", "Napoje", "Koktajle", "Koktajle białkowe",
        "Rozgrzewające napary", "Kawy i herbaty smakowe",
    ],
    "Sprzęt i czas": [
        "Szybkie (do 20 minut)", "Na zimno", "Air fryer (Frytkownica beztłuszczowa)",
        "Tradycyjne", "Tanie gotowanie", "Z kilku składników", "Z piekarnika",
    ],
}
