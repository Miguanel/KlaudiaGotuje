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
    <div className="sticky top-24 bg-[#160A22] p-5 sm:p-6 rounded-3xl border border-[#25113A] shadow-neon print:border-none print:shadow-none print:p-0 text-white">

      <div className="flex flex-wrap justify-between items-center gap-3 mb-5 print:hidden">
        <h3 className="text-xl font-black text-glow">💎 Składniki</h3>
        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 text-sm font-bold text-gray-400 hover:text-[#FF1493] transition-colors"
          title="Wydrukuj przepis"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Drukuj
        </button>
      </div>

      {/* PRZEŁĄCZNIK MIAR */}
      <div className="flex bg-[#0B0510] p-1 rounded-xl mb-4 border border-[#25113A] print:hidden">
        <button
          onClick={() => setWeightMode('default')}
          className={`flex-1 py-1.5 px-1 text-[11px] sm:text-xs font-black rounded-lg transition-all ${
            weightMode === 'default' ? 'bg-[#FF1493] text-white shadow-neon' : 'text-gray-400 hover:text-white'
          }`}
        >
          Miary domowe
        </button>
        <button
          onClick={() => setWeightMode('grams')}
          className={`flex-1 py-1.5 px-1 text-[11px] sm:text-xs font-black rounded-lg transition-all ${
            weightMode === 'grams' ? 'bg-[#FF1493] text-white shadow-neon' : 'text-gray-400 hover:text-white'
          }`}
        >
          ⚖️ Na gramy
        </button>
      </div>

      <div className="flex flex-wrap justify-between items-center gap-3 bg-[#0B0510] p-3.5 rounded-2xl border border-[#25113A] mb-4 print:hidden">
        <span className="text-sm font-bold text-gray-300">Liczba porcji:</span>
        <div className="flex items-center gap-3 bg-[#160A22] px-3 py-1 rounded-xl border border-[#25113A]">
          <button
            onClick={() => setPorcje(p => Math.max(1, p - 1))}
            className="w-6 h-6 flex items-center justify-center font-black text-gray-400 hover:text-[#FF1493] transition"
          >-</button>
          <span className="font-black text-white min-w-[20px] text-center text-glow">{porcje}</span>
          <button
            onClick={() => setPorcje(p => p + 1)}
            className="w-6 h-6 flex items-center justify-center font-black text-gray-400 hover:text-[#FF1493] transition"
          >+</button>
        </div>
      </div>

      <button
        onClick={addToShoppingList}
        className={`w-full mb-6 py-3 px-4 rounded-2xl text-sm font-black shadow-sm transition-all flex items-center justify-center gap-2 print:hidden ${
          addedToShopping
            ? 'bg-green-600 text-white shadow-lg'
            : 'bg-[#FF1493] hover:bg-[#FF007F] text-white shadow-neon hover:scale-[1.02]'
        }`}
      >
        <span>🛒</span>
        {addedToShopping ? 'Dodano do listy! ✨' : 'Dodaj składniki do zakupów'}
      </button>

      <h3 className="hidden print:block text-xl font-bold mb-4">Składniki ({porcje} porcji):</h3>

      <ul className="space-y-2">
        {skladniki.map(skladnik => {
          const isChecked = zaznaczone.has(skladnik.id);
          const calc = obliczIlosc(skladnik.quantity, skladnik.name, skladnik.unit);

          return (
            <li
              key={skladnik.id}
              onClick={() => toggleSkładnik(skladnik.id)}
              className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#0B0510]/60 cursor-pointer transition-colors group print:break-inside-avoid border border-transparent hover:border-[#25113A]"
            >
              <div className={`w-5 h-5 rounded-lg border flex items-center justify-center flex-shrink-0 transition-colors print:hidden ${
                isChecked ? 'bg-[#FF1493] border-[#FF1493] text-white shadow-neon' : 'border-[#25113A] bg-[#0B0510] group-hover:border-[#FF1493]'
              }`}>
                {isChecked && (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>

              <div className={`flex justify-between w-full gap-2 transition-all ${
                isChecked ? 'opacity-30 line-through' : 'opacity-100'
              } print:opacity-100 print:no-underline`}>
                <span className="text-gray-200 text-sm md:text-base font-medium">{skladnik.name}</span>
                <span className="font-black text-[#FF66B2] text-right whitespace-nowrap text-sm md:text-base">
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