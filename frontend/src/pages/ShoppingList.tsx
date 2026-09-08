import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingCart, FaCheck, FaTrash } from 'react-icons/fa';

interface ShoppingItem {
  id: string;
  name: string;
  quantity: number | string;
  unit: string;
  checked: boolean;
  recipes?: string[];
}

export default function ShoppingList() {
  const [items, setItems] = useState<ShoppingItem[]>([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('shopping_list') || '[]');
    setItems(processAndMergeItems(saved));
  }, []);

  const processAndMergeItems = (rawItems: any[]): ShoppingItem[] => {
    const map = new Map<string, ShoppingItem>();

    rawItems.forEach(item => {
      const key = `${item.name.trim().toLowerCase()}_${item.unit.trim().toLowerCase()}`;

      const numericQty = Number(item.quantity);
      const isNumeric = !isNaN(numericQty);

      if (map.has(key)) {
        const existing = map.get(key)!;
        if (isNumeric && !isNaN(Number(existing.quantity))) {
          existing.quantity = Number(existing.quantity) + numericQty;
        }
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
    <div className="max-w-3xl mx-auto px-4 py-12 text-white">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-[#25113A] pb-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-1 flex items-center gap-2">
            <span className="text-gold">Twoja lista zakupów</span> <FaShoppingCart className="text-[#FF1493]" />
          </h1>
          <p className="text-gray-400 text-sm">Składniki z wielu przepisów zostały automatycznie zsumowane. ✨</p>
        </div>
        {items.length > 0 && (
          <button
            onClick={clearList}
            className="text-sm font-bold text-red-400 hover:text-red-300 bg-red-950/40 border border-red-900/50 hover:bg-red-900/50 px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <FaTrash /> Wyczyść całą listę
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="bg-[#160A22] p-12 text-center rounded-3xl border border-[#25113A] shadow-neon">
          <p className="text-gray-400 text-lg mb-4">Twoja lista zakupów jest pusta.</p>
          <Link
            to="/"
            className="inline-block bg-[#FF1493] text-white font-black px-6 py-3 rounded-xl hover:bg-[#FF007F] transition-all shadow-neon"
          >
            Przeglądaj przepisy ✨
          </Link>
        </div>
      ) : (
        <div className="bg-[#160A22] rounded-3xl border border-[#25113A] shadow-neon overflow-hidden">
          <ul className="divide-y divide-[#25113A]">
            {items.map(item => (
              <li
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={`flex items-center justify-between p-4 hover:bg-[#25113A]/30 cursor-pointer transition-colors ${
                  item.checked ? 'bg-[#0B0510]/50' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors ${
                    item.checked ? 'bg-[#FF1493] border-[#FF1493] text-white shadow-neon' : 'border-[#25113A] bg-[#0B0510]'
                  }`}>
                    {item.checked && <FaCheck className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <span className={`text-gray-200 font-bold capitalize block ${item.checked ? 'line-through text-gray-500' : ''}`}>
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
                  <span className={`font-black text-gray-200 bg-[#0B0510] border border-[#25113A] px-3 py-1.5 rounded-xl text-sm ${item.checked ? 'line-through text-gray-500' : ''}`}>
                    {typeof item.quantity === 'number' && !Number.isInteger(item.quantity)
                      ? item.quantity.toFixed(1)
                      : item.quantity} {item.unit}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeItem(item.id);
                    }}
                    className="text-gray-400 hover:text-red-400 p-2 rounded-xl transition-colors"
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