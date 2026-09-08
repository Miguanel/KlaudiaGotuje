import { useState } from 'react';
import type { RecipeStep, Ingredient } from '../types';
import { apiClient } from '../api/client';

interface Props {
  kroki: RecipeStep[];
  recipeName?: string;
  wszystkieSkladniki?: Ingredient[];
}

export default function RecipeSteps({ kroki, recipeName = 'Przepis', wszystkieSkladniki = [] }: Props) {
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  if (!kroki || kroki.length === 0) return null;

  const currentStep = kroki[currentStepIndex];

  const getRelevantIngredients = (step: RecipeStep): Ingredient[] => {
    if (step.ingredients && step.ingredients.length > 0) {
      return step.ingredients;
    }
    const text = step.instruction.toLowerCase();
    return wszystkieSkladniki.filter(ing => {
      const baseName = ing.name.toLowerCase().trim();
      const shortBase = baseName.slice(0, Math.max(3, baseName.length - 2));
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
      <div className="mt-4 text-white">
        <div className="flex justify-between items-center mb-8 border-b border-[#25113A] pb-4">
          <h2 className="text-2xl font-black text-glow">👑 Krok po kroku</h2>
          <button
            onClick={() => {
              setCurrentStepIndex(0);
              setIsFocusMode(true);
            }}
            className="flex items-center gap-2 bg-[#FF1493] text-white px-5 py-2.5 rounded-xl text-sm font-black shadow-neon hover:bg-[#FF007F] transition-all hover:scale-105"
          >
            <span>👩‍🍳</span> Tryb gotowania (Focus)
          </button>
        </div>

        <div className="space-y-10">
          {kroki.map((krok) => {
            const relSkładniki = getRelevantIngredients(krok);
            return (
              <div key={krok.id} className="flex flex-col md:flex-row gap-6 items-start border-b border-[#25113A]/50 pb-8 last:border-none">
                <div className="flex-shrink-0 w-12 h-12 bg-[#FF1493]/20 border border-[#FF1493] text-[#FF66B2] rounded-2xl flex items-center justify-center font-black text-xl shadow-neon">
                  {krok.step_number}
                </div>

                <div className="flex-grow">
                  <p className="text-gray-200 text-lg leading-relaxed mb-4 whitespace-pre-line font-medium">
                    {krok.instruction}
                  </p>

                  {relSkładniki.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4 bg-[#0B0510] p-3.5 rounded-2xl border border-[#25113A] w-fit">
                      <span className="text-xs font-black text-[#FF1493] uppercase tracking-wide self-center mr-1">Potrzebne:</span>
                      {relSkładniki.map(ing => (
                        <span key={ing.id} className="bg-[#160A22] px-3 py-1 rounded-xl text-xs font-bold text-gray-200 shadow-sm border border-[#25113A]">
                          {ing.name} ({ing.quantity} {ing.unit})
                        </span>
                      ))}
                    </div>
                  )}

                  {krok.image_url && (
                    <img
                      src={apiClient.utils.getImageUrl(krok.image_url)}
                      alt={`Krok ${krok.step_number}`}
                      className="rounded-2xl shadow-neon w-full max-w-lg object-cover max-h-80 border border-[#25113A]"
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL TRYBU SKUPIENIA (FOCUS MODE) */}
      {isFocusMode && (
        <div className="fixed inset-0 z-50 bg-[#0B0510]/98 backdrop-blur-xl flex flex-col justify-between p-6 md:p-12 text-white">

          <div className="flex justify-between items-center max-w-4xl mx-auto w-full">
            <div>
              <span className="text-xs uppercase font-black text-[#FF1493] tracking-wider text-glow">Tryb Asystenta Księżniczki 👑</span>
              <h3 className="text-lg md:text-xl font-bold text-gray-200">{recipeName}</h3>
            </div>
            <button
              onClick={() => setIsFocusMode(false)}
              className="bg-[#160A22] hover:bg-[#FF1493] border border-[#25113A] text-white w-10 h-10 rounded-full flex items-center justify-center text-lg font-black transition-all shadow-neon"
            >
              ✕
            </button>
          </div>

          <div className="max-w-2xl mx-auto w-full text-center my-auto px-4">
            <div className="inline-block bg-[#FF1493] text-white font-black text-2xl w-16 h-16 rounded-2xl flex items-center justify-center shadow-neon mx-auto mb-6">
              {currentStep.step_number}
            </div>

            <p className="text-2xl md:text-3xl font-bold leading-relaxed mb-6 text-gray-100 text-glow">
              {currentStep.instruction}
            </p>

            {(() => {
              const relSkładniki = getRelevantIngredients(currentStep);
              if (relSkładniki.length === 0) return null;
              return (
                <div className="flex flex-wrap justify-center gap-2 mb-6">
                  {relSkładniki.map(ing => (
                    <span key={ing.id} className="bg-[#160A22] border border-[#FF1493] px-3.5 py-2 rounded-xl text-sm font-black text-[#FF66B2] shadow-neon">
                      💎 {ing.name}: {ing.quantity} {ing.unit}
                    </span>
                  ))}
                </div>
              );
            })()}

            {currentStep.image_url && (
              <img
                src={apiClient.utils.getImageUrl(currentStep.image_url)}
                alt={`Krok ${currentStep.step_number}`}
                className="rounded-3xl shadow-neon max-h-60 mx-auto object-cover border border-[#25113A] mb-4"
              />
            )}
          </div>

          <div className="max-w-xl mx-auto w-full flex flex-col items-center gap-4">
            <div className="text-sm font-black text-gray-400">
              Krok {currentStepIndex + 1} z {kroki.length}
            </div>

            <div className="flex justify-between w-full gap-4">
              <button
                onClick={handlePrev}
                disabled={currentStepIndex === 0}
                className="flex-1 py-4 bg-[#160A22] border border-[#25113A] hover:border-[#FF1493] disabled:opacity-30 font-black rounded-2xl transition-all text-center text-lg shadow-neon"
              >
                ← Poprzedni
              </button>
              <button
                onClick={handleNext}
                disabled={currentStepIndex === kroki.length - 1}
                className="flex-1 py-4 bg-[#FF1493] hover:bg-[#FF007F] disabled:opacity-30 font-black rounded-2xl transition-all text-center text-lg shadow-neon text-white"
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