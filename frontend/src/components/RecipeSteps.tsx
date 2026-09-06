import { useState } from 'react';
import type { RecipeStep, Ingredient } from '../types';
import { apiClient } from '../api/client';

interface Props {
  kroki: RecipeStep[];
  recipeName?: string;
  wszystkieSkladniki?: Ingredient[]; // Wszystkie składniki przepisu do parsera automatycznego
}

export default function RecipeSteps({ kroki, recipeName = 'Przepis', wszystkieSkladniki = [] }: Props) {
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  if (!kroki || kroki.length === 0) return null;

  const currentStep = kroki[currentStepIndex];

  // Inteligentny algorytm wyciągający składniki z tekstu kroku (jeśli nie podano ich jawnie)
  const getRelevantIngredients = (step: RecipeStep): Ingredient[] => {
    if (step.ingredients && step.ingredients.length > 0) {
      return step.ingredients;
    }
    // Parser automatyczny obcinający końcówki (np. "mąkę" -> "mąk", dopasowanie do "mąka")
    const text = step.instruction.toLowerCase();
    return wszystkieSkladniki.filter(ing => {
      const baseName = ing.name.toLowerCase().trim();
      const shortBase = baseName.slice(0, Math.max(3, baseName.length - 2)); // ucięcie końcówki
      return text.includes(baseName) || text.includes(shortBase);
    });
  };

  const handleNext = () => {
    if (currentStepIndex < kroki.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  return (
    <>
      <div className="mt-12">
        <div className="flex justify-between items-center mb-8 border-b pb-4">
          <h2 className="text-2xl font-bold text-gray-900">Krok po kroku</h2>
          <button
            onClick={() => {
              setCurrentStepIndex(0);
              setIsFocusMode(true);
            }}
            className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-orange-600 transition-colors"
          >
            <span>👨‍🍳</span> Tryb gotowania (Focus)
          </button>
        </div>

        <div className="space-y-12">
          {kroki.map((krok) => {
            const relSkładniki = getRelevantIngredients(krok);
            return (
              <div key={krok.id} className="flex flex-col md:flex-row gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-black text-xl shadow-sm">
                  {krok.step_number}
                </div>

                <div className="flex-grow">
                  <p className="text-gray-700 text-lg leading-relaxed mb-3 whitespace-pre-line">
                    {krok.instruction}
                  </p>

                  {/* Wyświetlanie powiązanych składników w zwykłym widoku */}
                  {relSkładniki.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4 bg-orange-50/60 p-3 rounded-xl border border-orange-100 w-fit">
                      <span className="text-xs font-bold text-orange-800 uppercase tracking-wide self-center mr-1">Potrzebne:</span>
                      {relSkładniki.map(ing => (
                        <span key={ing.id} className="bg-white px-2.5 py-1 rounded-lg text-xs font-bold text-gray-700 shadow-sm border border-orange-200">
                          {ing.name} ({ing.quantity} {ing.unit})
                        </span>
                      ))}
                    </div>
                  )}

                  {krok.image_url && (
                    <img
                      src={apiClient.utils.getImageUrl(krok.image_url)}
                      alt={`Krok ${krok.step_number}`}
                      className="rounded-xl shadow-sm w-full max-w-lg object-cover max-h-80"
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL TRYBU SKUPIENIA (FOCUS MODE) Z POWIAZANYMI SKŁADNIKAMI */}
      {isFocusMode && (
        <div className="fixed inset-0 z-50 bg-gray-900/95 backdrop-blur-md flex flex-col justify-between p-6 md:p-12 text-white">

          <div className="flex justify-between items-center max-w-4xl mx-auto w-full">
            <div>
              <span className="text-xs uppercase font-bold text-orange-400 tracking-wider">Tryb Asystenta</span>
              <h3 className="text-lg md:text-xl font-bold text-gray-200">{recipeName}</h3>
            </div>
            <button
              onClick={() => setIsFocusMode(false)}
              className="bg-white/10 hover:bg-white/25 text-white w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="max-w-2xl mx-auto w-full text-center my-auto px-4">
            <div className="inline-block bg-orange-500 text-white font-black text-2xl w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-6">
              {currentStep.step_number}
            </div>

            <p className="text-2xl md:text-3xl font-medium leading-relaxed mb-6 text-gray-100">
              {currentStep.instruction}
            </p>

            {/* Składniki w trybie Focus Mode */}
            {(() => {
              const relSkładniki = getRelevantIngredients(currentStep);
              if (relSkładniki.length === 0) return null;
              return (
                <div className="flex flex-wrap justify-center gap-2 mb-6">
                  {relSkładniki.map(ing => (
                    <span key={ing.id} className="bg-orange-500/20 border border-orange-500/40 px-3 py-1.5 rounded-xl text-sm font-bold text-orange-200">
                      📦 {ing.name}: {ing.quantity} {ing.unit}
                    </span>
                  ))}
                </div>
              );
            })()}

            {currentStep.image_url && (
              <img
                src={apiClient.utils.getImageUrl(currentStep.image_url)}
                alt={`Krok ${currentStep.step_number}`}
                className="rounded-2xl shadow-2xl max-h-60 mx-auto object-cover border border-white/10 mb-4"
              />
            )}
          </div>

          <div className="max-w-xl mx-auto w-full flex flex-col items-center gap-4">
            <div className="text-sm font-semibold text-gray-400">
              Krok {currentStepIndex + 1} z {kroki.length}
            </div>

            <div className="flex justify-between w-full gap-4">
              <button
                onClick={handlePrev}
                disabled={currentStepIndex === 0}
                className="flex-1 py-4 bg-white/10 hover:bg-white/20 disabled:opacity-30 font-bold rounded-2xl transition-all text-center text-lg shadow-md"
              >
                ← Poprzedni
              </button>
              <button
                onClick={handleNext}
                disabled={currentStepIndex === kroki.length - 1}
                className="flex-1 py-4 bg-orange-500 hover:bg-orange-600 disabled:opacity-30 font-bold rounded-2xl transition-all text-center text-lg shadow-md"
              >
                Następny →
              </button>
            </div>
          </div>

        </div>
      )}
    </>
  );
}