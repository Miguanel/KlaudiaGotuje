import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface ShoppingItem {
  id: string;
  name: string;
  quantity: number | string;
  unit: string;
  checked: boolean;
  recipes?: string[]; // Lista przepisów, z których pochodzi składnik
}

export default function ShoppingList() {
  const [items, setItems] = useState<ShoppingItem[]>([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('shopping_list') || '[]');
    setItems(processAndMergeItems(saved));
  }, []);

  // Funkcja inteligentnie łącząca i sumująca takie same składniki
  const processAndMergeItems = (rawItems: any[]): ShoppingItem[] => {
    const map = new Map<string, ShoppingItem>();

    rawItems.forEach(item => {
      // Normalizujemy nazwę i jednostkę do małych liter dla pewności dopasowania
      const key = `${item.name.trim().toLowerCase()}_${item.unit.trim().toLowerCase()}`;

      const numericQty = Number(item.quantity);
      const isNumeric = !isNaN(numericQty);

      if (map.has(key)) {
        const existing = map.get(key)!;
        if (isNumeric && !isNaN(Number(existing.quantity))) {
          existing.quantity = Number(existing.quantity) + numericQty;
        }
        // Scalamy źródłowe przepisy, jeśli istnieją
        if (item.recipeName && existing.recipes && !existing.recipes.includes(item.recipeName)) {
          existing.recipes.push(item.recipeName);
        }
      } else {
        map.set(key, {
          id: item.id || `${Date.now()}-${Math.random()}`,
          name: item.name.trim(),
          quantity: isNumeric ? numericQty : item.quantity,
          unit: item.unit.trim(),
          checked: item.checked || false,
          recipes: item.recipeName ? [item.recipeName] : (item.recipes || [])
        });
      }
    });

    const merged = Array.from(map.values());
    localStorage.setItem('shopping_list', JSON.stringify(merged));
    return merged;
  };

  const toggleItem = (id: string) => {
    const updated = items.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    setItems(updated);
    localStorage.setItem('shopping_list', JSON.stringify(updated));
  };

  const removeItem = (id: string) => {
    const updated = items.filter(item => item.id !== id);
    setItems(updated);
    localStorage.setItem('shopping_list', JSON.stringify(updated));
  };

  const clearList = () => {
    setItems([]);
    localStorage.removeItem('shopping_list');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-1">
            Twoja lista zakupów 🛒
          </h1>
          <p className="text-gray-500 text-sm">Składniki z wielu przepisów zostały automatycznie zsumowane.</p>
        </div>
        {items.length > 0 && (
          <button
            onClick={clearList}
            className="text-sm font-semibold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl transition-colors"
          >
            Wyczyść całą listę
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-gray-500 text-lg mb-4">Twoja lista zakupów jest pusta.</p>
          <Link
            to="/"
            className="inline-block bg-orange-500 text-white font-bold px-6 py-3 rounded-xl hover:bg-orange-600 transition-colors shadow-sm"
          >
            Przeglądaj przepisy
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <ul className="divide-y divide-gray-100">
            {items.map(item => (
              <li
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={`flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                  item.checked ? 'bg-gray-50/80' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                    item.checked ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'
                  }`}>
                    {item.checked && (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <span className={`text-gray-800 font-medium capitalize block ${item.checked ? 'line-through text-gray-400' : ''}`}>
                      {item.name}
                    </span>
                    {item.recipes && item.recipes.length > 0 && (
                      <span className="text-xs text-gray-400">
                        Z przepisów: {item.recipes.join(', ')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className={`font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-lg text-sm ${item.checked ? 'line-through text-gray-400 bg-gray-50' : ''}`}>
                    {typeof item.quantity === 'number' && !Number.isInteger(item.quantity)
                      ? item.quantity.toFixed(1)
                      : item.quantity} {item.unit}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeItem(item.id);
                    }}
                    className="text-gray-400 hover:text-red-500 p-1 rounded-lg transition-colors"
                    title="Usuń pozycję"
                  >
                    ✕
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}