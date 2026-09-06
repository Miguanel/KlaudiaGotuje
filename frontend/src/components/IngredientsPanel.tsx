import { useState } from 'react';
import type { Ingredient } from '../types';
import { convertIngredientUnit } from '../utils/unitConverter';

interface Props {
  skladniki: Ingredient[];
  bazowePorcje?: number;
  recipeName?: string;
}

export default function IngredientsPanel({ skladniki, bazowePorcje = 4, recipeName = 'Przepis' }: Props) {
  const [porcje, setPorcje] = useState<number>(bazowePorcje);
  const [zaznaczone, setZaznaczone] = useState<Set<string>>(new Set());
  const [addedToShopping, setAddedToShopping] = useState(false);
  const [weightMode, setWeightMode] = useState<'default' | 'grams'>('default');

  const obliczIlosc = (iloscStr: string | number, name: string, unit: string) => {
    const num = Number(iloscStr);
    if (isNaN(num)) return { quantity: iloscStr, unit };

    const przeliczonaPorcja = (num / bazowePorcje) * porcje;
    const converted = convertIngredientUnit(name, przeliczonaPorcja, unit, weightMode);

    const finalQty = Number.isInteger(converted.quantity) ? converted.quantity : Number(converted.quantity).toFixed(1);
    return { quantity: finalQty, unit: converted.unit };
  };

  const toggleSkładnik = (id: string) => {
    setZaznaczone(prev => {
      const nowe = new Set(prev);
      if (nowe.has(id)) nowe.delete(id);
      else nowe.add(id);
      return nowe;
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const addToShoppingList = () => {
    const currentList = JSON.parse(localStorage.getItem('shopping_list') || '[]');

    const newItems = skladniki.map(skladnik => {
      const calc = obliczIlosc(skladnik.quantity, skladnik.name, skladnik.unit);
      return {
        id: `${Date.now()}-${skladnik.id}`,
        name: skladnik.name,
        quantity: calc.quantity,
        unit: calc.unit,
        checked: false,
        recipeName: recipeName
      };
    });

    localStorage.setItem('shopping_list', JSON.stringify([...currentList, ...newItems]));
    setAddedToShopping(true);
    setTimeout(() => setAddedToShopping(false), 2500);
  };

  return (
    <div className="sticky top-24 bg-white p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-sm print:border-none print:shadow-none print:p-0">

      <div className="flex flex-wrap justify-between items-center gap-3 mb-5 print:hidden">
        <h3 className="text-xl font-bold text-gray-900">Składniki</h3>
        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-orange-500 transition-colors"
          title="Wydrukuj przepis"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Drukuj
        </button>
      </div>

      {/* PRZEŁĄCZNIK MIAR */}
      <div className="flex bg-gray-100 p-1 rounded-xl mb-4 print:hidden">
        <button
          onClick={() => setWeightMode('default')}
          className={`flex-1 py-1.5 px-1 text-[11px] sm:text-xs font-bold rounded-lg transition-all ${
            weightMode === 'default' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          Miary domowe
        </button>
        <button
          onClick={() => setWeightMode('grams')}
          className={`flex-1 py-1.5 px-1 text-[11px] sm:text-xs font-bold rounded-lg transition-all ${
            weightMode === 'grams' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          ⚖️ Na gramy
        </button>
      </div>

      <div className="flex flex-wrap justify-between items-center gap-3 bg-gray-50 p-3 rounded-xl mb-4 print:hidden">
        <span className="text-sm font-medium text-gray-600">Liczba porcji:</span>
        <div className="flex items-center gap-3 bg-white px-3 py-1 rounded-lg border border-gray-200 shadow-sm">
          <button
            onClick={() => setPorcje(p => Math.max(1, p - 1))}
            className="w-6 h-6 flex items-center justify-center font-bold text-gray-400 hover:text-gray-900 transition"
          >-</button>
          <span className="font-bold text-gray-900 min-w-[20px] text-center">{porcje}</span>
          <button
            onClick={() => setPorcje(p => p + 1)}
            className="w-6 h-6 flex items-center justify-center font-bold text-gray-400 hover:text-gray-900 transition"
          >+</button>
        </div>
      </div>

      <button
        onClick={addToShoppingList}
        className={`w-full mb-6 py-2.5 px-4 rounded-xl text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-2 print:hidden ${
          addedToShopping
            ? 'bg-green-600 text-white'
            : 'bg-orange-500 hover:bg-orange-600 text-white'
        }`}
      >
        <span>🛒</span>
        {addedToShopping ? 'Dodano do listy!' : 'Dodaj składniki do zakupów'}
      </button>

      <h3 className="hidden print:block text-xl font-bold mb-4">Składniki ({porcje} porcji):</h3>

      <ul className="space-y-1">
        {skladniki.map(skladnik => {
          const isChecked = zaznaczone.has(skladnik.id);
          const calc = obliczIlosc(skladnik.quantity, skladnik.name, skladnik.unit);

          return (
            <li
              key={skladnik.id}
              onClick={() => toggleSkładnik(skladnik.id)}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group print:break-inside-avoid"
            >
              <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-colors print:hidden ${
                isChecked ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 group-hover:border-orange-500'
              }`}>
                {isChecked && (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>

              <div className={`flex justify-between w-full gap-2 transition-all ${
                isChecked ? 'opacity-40 line-through' : 'opacity-100'
              } print:opacity-100 print:no-underline`}>
                <span className="text-gray-700 text-sm md:text-base">{skladnik.name}</span>
                <span className="font-bold text-gray-900 text-right whitespace-nowrap text-sm md:text-base">
                  {calc.quantity} {calc.unit}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}