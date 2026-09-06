// Słownik gramatur dla 1 szklanki (250 ml) oraz 1 łyżki (15 ml) i łyżeczki (5 ml)
const CONVERSIONS: Record<string, { cup: number; tablespoon: number; teaspoon: number; defaultUnit: string }> = {
  'mąka': { cup: 160, tablespoon: 10, teaspoon: 3, defaultUnit: 'g' },
  'mąka pszenna': { cup: 160, tablespoon: 10, teaspoon: 3, defaultUnit: 'g' },
  'cukier': { cup: 200, tablespoon: 12, teaspoon: 4, defaultUnit: 'g' },
  'cukier puder': { cup: 160, tablespoon: 10, teaspoon: 3, defaultUnit: 'g' },
  'masło': { cup: 220, tablespoon: 14, teaspoon: 5, defaultUnit: 'g' },
  'mleko': { cup: 250, tablespoon: 15, teaspoon: 5, defaultUnit: 'ml' },
  'olej': { cup: 220, tablespoon: 14, teaspoon: 5, defaultUnit: 'ml' },
  'oliwa z oliwek': { cup: 220, tablespoon: 14, teaspoon: 5, defaultUnit: 'ml' },
  'kakao': { cup: 100, tablespoon: 6, teaspoon: 2, defaultUnit: 'g' },
  'płatki owsiane': { cup: 90, tablespoon: 6, teaspoon: 2, defaultUnit: 'g' },
  'ryż': { cup: 200, tablespoon: 12, teaspoon: 4, defaultUnit: 'g' },
  'sól': { cup: 280, tablespoon: 18, teaspoon: 6, defaultUnit: 'g' },
};

export function convertIngredientUnit(name: string, quantity: number, unit: string, targetMode: 'default' | 'grams') {
  if (targetMode === 'default') return { quantity, unit };

  const cleanName = name.toLowerCase().trim();
  const foundKey = Object.keys(CONVERSIONS).find(k => cleanName.includes(k));

  if (!foundKey) return { quantity, unit }; // Jeśli nie znamy składnika, zostawiamy jak jest

  const conv = CONVERSIONS[foundKey];
  const cleanUnit = unit.toLowerCase().trim();

  if (cleanUnit.includes('szklank') || cleanUnit === 'szklanka' || cleanUnit === 'szklanki') {
    return { quantity: quantity * conv.cup, unit: conv.defaultUnit };
  }
  if (cleanUnit.includes('łyżk') && !cleanUnit.includes('łyżeczk')) {
    return { quantity: quantity * conv.tablespoon, unit: conv.defaultUnit };
  }
  if (cleanUnit.includes('łyżeczk')) {
    return { quantity: quantity * conv.teaspoon, unit: conv.defaultUnit };
  }

  return { quantity, unit };
}