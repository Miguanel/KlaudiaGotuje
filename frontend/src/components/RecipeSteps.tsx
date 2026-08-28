import type { RecipeStep } from '../types';
import { apiClient } from '../api/client';

interface Props {
  kroki: RecipeStep[];
}

export default function RecipeSteps({ kroki }: Props) {
  if (!kroki || kroki.length === 0) return null;

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-8 text-gray-900 border-b pb-4">Krok po kroku</h2>

      <div className="space-y-12">
        {kroki.map((krok) => (
          <div key={krok.id} className="flex flex-col md:flex-row gap-6 items-start">

            {/* Ozdobny numer kroku */}
            <div className="flex-shrink-0 w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-black text-xl shadow-sm">
              {krok.numer}
            </div>

            <div className="flex-grow">
              <p className="text-gray-700 text-lg leading-relaxed mb-4 whitespace-pre-line">
                {krok.tresc}
              </p>

              {/* Opcjonalne zdjęcie kroku */}
              {krok.zdjecie_url && (
                <img
                  src={apiClient.utils.getImageUrl(krok.zdjecie_url)}
                  alt={`Krok ${krok.numer}`}
                  className="rounded-xl shadow-sm w-full max-w-lg object-cover max-h-80"
                />
              )}
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}