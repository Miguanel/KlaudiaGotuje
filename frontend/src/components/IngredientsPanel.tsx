import { useState } from 'react';
import type { Ingredient } from '../types';
import { convertIngredientUnit } from '../utils/unitConverter';
import { FaMinus, FaPlus, FaShoppingBasket, FaCheck } from 'react-icons/fa';

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

  const toggleSkladnik = (id: string) => {
    setZaznaczone(prev => {
      const nowe = new Set(prev);
      if (nowe.has(id)) nowe.delete(id);
      else nowe.add(id);
      return nowe;
    });
  };

  const addToShoppingList = () => {
    let currentList: unknown[] = [];
    try { currentList = JSON.parse(localStorage.getItem('shopping_list') || '[]'); } catch { currentList = []; }

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
    <aside className="lg:sticky lg:top-36 bg-card border border-line rounded-3xl p-5 sm:p-6 print:border-none print:p-0 print:static">
      <h2 className="label-pill mb-5 print:hidden">Składniki</h2>
      <h2 className="hidden print:block text-xl font-bold mb-3">Składniki ({porcje} porcji)</h2>

      <div className="space-y-3 mb-5 print:hidden">
        {/* PORCJE */}
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-semibold text-muted">Porcje</span>
          <div className="flex items-center gap-1 bg-ink/60 border border-line rounded-full p-1">
            <button
              onClick={() => setPorcje(p => Math.max(1, p - 1))}
              className="w-8 h-8 rounded-full flex items-center justify-center text-cream hover:bg-pink hover:text-white transition"
              aria-label="Mniej porcji"
            ><FaMinus className="text-xs" /></button>
            <span className="font-display text-xl w-8 text-center" aria-live="polite">{porcje}</span>
            <button
              onClick={() => setPorcje(p => p + 1)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-cream hover:bg-pink hover:text-white transition"
              aria-label="Więcej porcji"
            ><FaPlus className="text-xs" /></button>
          </div>
        </div>

        {/* MIARY */}
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-semibold text-muted">Miary</span>
          <div className="inline-flex p-1 bg-ink/60 border border-line rounded-full text-xs font-semibold">
            {([['default', 'Domowe'], ['grams', 'W gramach']] as const).map(([value, label]) => (
              <button
                key={value}
                onClick={() => setWeightMode(value)}
                aria-pressed={weightMode === value}
                className={`px-3 h-7 rounded-full transition ${weightMode === value ? 'bg-pink text-white' : 'text-muted hover:text-cream'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <ul className="divide-y divide-line/70 border-y border-line/70 mb-5">
        {skladniki.map(skladnik => {
          const isChecked = zaznaczone.has(skladnik.id);
          const calc = obliczIlosc(skladnik.quantity, skladnik.name, skladnik.unit);

          return (
            <li key={skladnik.id} className="print:break-inside-avoid">
              <button
                type="button"
                onClick={() => toggleSkladnik(skladnik.id)}
                aria-pressed={isChecked}
                className="w-full flex items-center gap-3 py-3 text-left group"
              >
                <span className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition print:hidden ${
                  isChecked ? 'bg-pink border-pink text-white' : 'border-line group-hover:border-pink'
                }`}>
                  {isChecked && <FaCheck className="text-[10px]" />}
                </span>
                <span className={`flex-1 flex justify-between gap-3 transition ${isChecked ? 'opacity-40 line-through' : ''} print:opacity-100 print:no-underline`}>
                  <span className="text-[15px] text-cream">{skladnik.name}</span>
                  <span className="text-[15px] font-bold text-pink-soft whitespace-nowrap">{calc.quantity} {calc.unit}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <button
        onClick={addToShoppingList}
        className={`w-full h-12 rounded-full text-sm font-bold flex items-center justify-center gap-2 transition print:hidden ${
          addedToShopping ? 'bg-gold text-ink' : 'border border-gold/60 text-gold hover:bg-gold/10'
        }`}
      >
        {addedToShopping ? <><FaCheck /> Dodano do listy zakupów</> : <><FaShoppingBasket /> Dodaj do listy zakupów</>}
      </button>
    </aside>
  );
}
