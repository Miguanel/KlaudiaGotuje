import { useState } from 'react';
import type { Ingredient } from '../types';

interface Props {
  skladniki: Ingredient[];
  bazowePorcje?: number;
}

export default function IngredientsPanel({ skladniki, bazowePorcje = 4 }: Props) {
  const [porcje, setPorcje] = useState<number>(bazowePorcje);

  // Stan do zapamiętywania zaznaczonych składników (przechowuje ich ID)
  const [zaznaczone, setZaznaczone] = useState<Set<string>>(new Set());

  const obliczIlosc = (iloscStr: string | number) => {
    const num = Number(iloscStr);
    if (isNaN(num)) return iloscStr;
    const przeliczona = (num / bazowePorcje) * porcje;
    return Number.isInteger(przeliczona) ? przeliczona : przeliczona.toFixed(1);
  };

  // Funkcja przełączająca stan zaznaczenia
  const toggleSkładnik = (id: string) => {
    setZaznaczone(prev => {
      const nowe = new Set(prev);
      if (nowe.has(id)) nowe.delete(id);
      else nowe.add(id);
      return nowe;
    });
  };

  // Funkcja wywołująca systemowe okno drukowania
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="sticky top-24 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm print:border-none print:shadow-none print:p-0">

      {/* Przycisk Drukuj - widoczny tylko na ekranie, ukryty przy drukowaniu */}
      <div className="flex justify-between items-center mb-6 print:hidden">
        <h3 className="text-xl font-bold text-gray-900">Składniki</h3>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-orange-500 transition-colors"
          title="Wydrukuj przepis"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Drukuj
        </button>
      </div>

      <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl mb-6 print:hidden">
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

      {/* Napis widoczny tylko na wydruku */}
      <h3 className="hidden print:block text-xl font-bold mb-4">Składniki ({porcje} porcji):</h3>

      <ul className="space-y-1">
        {skladniki.map(skladnik => {
          const isChecked = zaznaczone.has(skladnik.id);
          return (
            <li
              key={skladnik.id}
              onClick={() => toggleSkładnik(skladnik.id)}
              className="flex items-center gap-4 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group print:break-inside-avoid"
            >
              {/* Checkbox (tylko na ekranie) */}
              <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-colors print:hidden ${
                isChecked ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 group-hover:border-orange-500'
              }`}>
                {isChecked && (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>

              <div className={`flex justify-between w-full transition-all ${
                isChecked ? 'opacity-40 line-through' : 'opacity-100'
              } print:opacity-100 print:no-underline`}>
                <span className="text-gray-700">{skladnik.nazwa}</span>
                <span className="font-bold text-gray-900 ml-4 text-right">
                  {obliczIlosc(skladnik.ilosc)} {skladnik.jednostka}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}