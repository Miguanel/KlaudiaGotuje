import { useEffect, useState } from 'react';
import type { RecipeStep, Ingredient } from '../types';
import { apiClient } from '../api/client';
import { FaCrown, FaPlay, FaTimes, FaArrowLeft, FaArrowRight } from 'react-icons/fa';

interface Props {
  kroki: RecipeStep[];
  recipeName?: string;
  wszystkieSkladniki?: Ingredient[];
}

export default function RecipeSteps({ kroki, recipeName = 'Przepis', wszystkieSkladniki = [] }: Props) {
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Klawiatura w trybie gotowania: strzałki i Esc
  useEffect(() => {
    if (!isFocusMode) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFocusMode(false);
      if (e.key === 'ArrowRight') setCurrentStepIndex(i => Math.min(kroki.length - 1, i + 1));
      if (e.key === 'ArrowLeft') setCurrentStepIndex(i => Math.max(0, i - 1));
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isFocusMode, kroki.length]);

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

  return (
    <>
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <h2 className="label-pill print:hidden">Przygotowanie</h2>
        <h2 className="hidden print:block text-xl font-bold">Przygotowanie</h2>
        <button
          onClick={() => { setCurrentStepIndex(0); setIsFocusMode(true); }}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-full border border-gold/60 text-gold text-sm font-bold hover:bg-gold/10 transition print:hidden"
        >
          <FaPlay className="text-xs" /> Tryb gotowania
        </button>
      </div>

      <ol className="space-y-7">
        {kroki.map((krok) => {
          const rel = getRelevantIngredients(krok);
          return (
            <li key={krok.id} className="flex gap-4 sm:gap-5 print:break-inside-avoid">
              <span className="shrink-0 w-10 h-10 rounded-full bg-burgundy border border-gold/40 text-gold font-display text-xl flex items-center justify-center print:shadow-none print:bg-transparent print:text-black print:border print:border-black">
                {krok.step_number}
              </span>

              <div className="flex-1 pt-1.5 min-w-0">
                <p className="text-[16px] sm:text-[17px] leading-relaxed text-cream whitespace-pre-line">
                  {krok.instruction}
                </p>

                {rel.length > 0 && (
                  <p className="mt-3 text-sm text-muted print:hidden">
                    <span className="font-semibold text-gold">Potrzebne: </span>
                    {rel.map(ing => `${ing.name} (${ing.quantity} ${ing.unit})`).join(', ')}
                  </p>
                )}

                {krok.image_url && (
                  <img
                    src={apiClient.utils.getImageUrl(krok.image_url)}
                    alt={`Krok ${krok.step_number}`}
                    loading="lazy"
                    className="mt-4 rounded-2xl w-full max-w-lg object-cover max-h-80 border border-line"
                  />
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {/* TRYB GOTOWANIA – jeden krok na ekranie, duży tekst */}
      {isFocusMode && (
        <div role="dialog" aria-modal="true" aria-label="Tryb gotowania" className="fixed inset-0 z-[60] bg-ink/98 backdrop-blur-xl flex flex-col p-5 sm:p-10 text-cream">
          <div className="flex justify-between items-start gap-4 max-w-4xl mx-auto w-full">
            <div className="min-w-0">
              <span className="text-xs uppercase font-bold text-gold tracking-widest flex items-center gap-1.5">
                <FaCrown /> Tryb gotowania
              </span>
              <h3 className="font-display uppercase tracking-wide text-xl sm:text-2xl truncate">{recipeName}</h3>
            </div>
            <button
              onClick={() => setIsFocusMode(false)}
              className="shrink-0 w-11 h-11 rounded-full bg-card border border-line flex items-center justify-center hover:border-gold/60 transition"
              aria-label="Zamknij tryb gotowania"
            >
              <FaTimes />
            </button>
          </div>

          {/* pasek postępu */}
          <div className="max-w-4xl mx-auto w-full mt-5 h-1.5 rounded-full bg-line overflow-hidden">
            <div className="h-full bg-gold transition-all duration-300" style={{ width: `${((currentStepIndex + 1) / kroki.length) * 100}%` }} />
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col justify-center max-w-2xl mx-auto w-full text-center py-8">
            <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-burgundy border border-gold/50 text-gold font-display text-3xl flex items-center justify-center">
              {currentStep.step_number}
            </div>
            <p className="text-2xl sm:text-3xl font-semibold leading-relaxed mb-6">{currentStep.instruction}</p>

            {(() => {
              const rel = getRelevantIngredients(currentStep);
              if (rel.length === 0) return null;
              return (
                <div className="flex flex-wrap justify-center gap-2 mb-6">
                  {rel.map(ing => (
                    <span key={ing.id} className="px-3.5 py-2 rounded-full bg-card border border-gold/40 text-sm font-semibold text-gold">
                      {ing.name}: {ing.quantity} {ing.unit}
                    </span>
                  ))}
                </div>
              );
            })()}

            {currentStep.image_url && (
              <img
                src={apiClient.utils.getImageUrl(currentStep.image_url)}
                alt={`Krok ${currentStep.step_number}`}
                className="rounded-3xl max-h-60 mx-auto object-cover border border-line"
              />
            )}
          </div>

          <div className="max-w-xl mx-auto w-full">
            <p className="text-center text-sm font-semibold text-muted mb-3">Krok {currentStepIndex + 1} z {kroki.length}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setCurrentStepIndex(i => Math.max(0, i - 1))}
                disabled={currentStepIndex === 0}
                className="flex-1 h-14 rounded-full border border-line font-bold flex items-center justify-center gap-2 hover:border-gold/60 disabled:opacity-30 transition"
              >
                <FaArrowLeft /> Poprzedni
              </button>
              {currentStepIndex < kroki.length - 1 ? (
                <button
                  onClick={() => setCurrentStepIndex(i => Math.min(kroki.length - 1, i + 1))}
                  className="flex-1 h-14 rounded-full bg-chili text-white font-bold flex items-center justify-center gap-2 hover:brightness-110 transition shadow-chili"
                >
                  Następny <FaArrowRight />
                </button>
              ) : (
                <button
                  onClick={() => setIsFocusMode(false)}
                  className="flex-1 h-14 rounded-full bg-gold text-ink font-bold flex items-center justify-center gap-2 hover:brightness-110 transition"
                >
                  <FaCrown /> Gotowe!
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
