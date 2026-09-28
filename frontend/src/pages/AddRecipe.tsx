import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCategories } from '../hooks/useCategories';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import { FaCrown, FaPlus, FaCamera, FaCheck, FaLock } from 'react-icons/fa';

interface StepData {
  step_number: number;
  instruction: string;
  imageFile: File | null;
  imagePreview: string | null;
}

export default function AddRecipe() {
  const { token, isAuthenticated } = useAuth();
  const { chapters } = useCategories();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [prepTime, setPrepTime] = useState(30);
  const [categoryId, setCategoryId] = useState('');

  const [mainImage, setMainImage] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);

  const [ingredients, setIngredients] = useState([{ name: '', quantity: 1, unit: 'g' }]);
  const [steps, setSteps] = useState<StepData[]>([{ step_number: 1, instruction: '', imageFile: null, imagePreview: null }]);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center text-cream">
        <div className="bg-card p-8 rounded-3xl border border-line shadow-neon">
          <FaLock className="text-chaber text-4xl mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Brak dostępu</h1>
          <p className="text-muted mb-6 text-sm">Musisz się zalogować jako administrator, aby dodawać przepisy.</p>
          <button onClick={() => navigate('/login')} className="bg-chaber text-cream px-6 py-3 rounded-xl font-bold shadow-neon hover:brightness-110 transition-all">
            Przejdź do logowania
          </button>
        </div>
      </div>
    );
  }

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMainImage(file);
      setMainImagePreview(URL.createObjectURL(file));
    }
  };

  const addIngredientField = () => setIngredients([...ingredients, { name: '', quantity: 1, unit: 'g' }]);
  const addStepField = () => setSteps([...steps, { step_number: steps.length + 1, instruction: '', imageFile: null, imagePreview: null }]);

  const handleStepImageChange = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const updated = [...steps];
      updated[idx].imageFile = file;
      updated[idx].imagePreview = URL.createObjectURL(file);
      setSteps(updated);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const payloadObj = {
        name,
        description,
        prep_time: Number(prepTime),
        category_id: categoryId || null,
        ingredients,
        steps: steps.map(s => ({
          step_number: s.step_number,
          instruction: s.instruction,
          ingredient_ids: []
        })),
      };

      const formData = new FormData();
      formData.append('payload_data', JSON.stringify(payloadObj));

      if (mainImage) {
        formData.append('main_image', mainImage);
      }

      steps.forEach((step, idx) => {
        if (step.imageFile) {
          formData.append(`step_image_${idx}`, step.imageFile);
        }
      });

      const newRecipe = await apiClient.recipes.create(formData, token);
      navigate(`/przepis/${newRecipe.id}`);
    } catch (err: any) {
      setError(err.message || 'Wystąpił błąd podczas zapisywania przepisu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 text-cream">
      <h1 className="font-display uppercase tracking-wide text-3xl sm:text-4xl text-gold mb-2 flex items-center gap-3">
        <FaCrown className="text-gold" /> Dodaj nowy przepis
      </h1>
      <p className="text-muted mb-8 text-sm md:text-base font-medium flex items-center gap-1.5">
        <span>Wypełnij formularz, prześlij zdjęcia i udostępnij nową potrawę.</span>
      </p>
      {error && <div className="bg-chaber/10 border border-chaber/50 text-chaber-soft p-4 rounded-xl mb-6 font-bold text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-8 bg-card p-4 sm:p-8 rounded-3xl border border-line shadow-neon">

        {/* Informacje podstawowe */}
        <div className="space-y-6">
          <h2 className="font-display uppercase tracking-wide text-xl text-gold border-b border-line pb-3 flex items-center gap-2">
            <span className="text-gold">Informacje podstawowe</span>
          </h2>

          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-full md:w-1/3 flex flex-col items-center gap-3">
              <label className="block text-xs font-bold text-muted uppercase w-full text-left">Zdjęcie główne</label>
              <div className="w-full aspect-video bg-ink border-2 border-dashed border-line rounded-2xl overflow-hidden relative flex flex-col items-center justify-center hover:border-chaber transition-colors">
                {mainImagePreview ? (
                  <img src={mainImagePreview} alt="Podgląd" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-4">
                    <FaCamera className="text-chaber text-2xl mx-auto mb-2" />
                    <span className="text-muted text-xs font-bold">Brak zdjęcia</span>
                  </div>
                )}
                <input
                  type="file" accept="image/*"
                  onChange={handleMainImageChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
              <p className="text-xs text-muted text-center font-medium">Kliknij na obszar, aby dodać plik (JPG, PNG).</p>
            </div>

            <div className="w-full md:w-2/3 space-y-4">
              <div>
                <label className="block text-xs font-bold text-muted uppercase mb-1">Nazwa przepisu</label>
                <input
                  type="text" value={name} onChange={e => setName(e.target.value)} required
                  className="w-full px-4 py-2.5 border border-line rounded-xl outline-none bg-ink text-cream focus:border-chaber"
                  placeholder="np. Domowe spaghetti"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-muted uppercase mb-1">Rozdział / podrozdział</label>
                  <select
                    value={categoryId} onChange={e => setCategoryId(e.target.value)}
                    className="w-full px-4 py-2.5 border border-line rounded-xl outline-none bg-ink text-cream font-bold"
                  >
                    <option value="">Wybierz rozdział / podrozdział…</option>
                    {chapters.map(ch => (
                      <optgroup key={ch.id} label={ch.name}>
                        <option value={ch.id}>{ch.name} (cały rozdział)</option>
                        {ch.children.map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
                      </optgroup>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted uppercase mb-1">Czas (min)</label>
                  <input
                    type="number" value={prepTime} onChange={e => setPrepTime(Number(e.target.value))} required min={1}
                    className="w-full px-4 py-2.5 border border-line rounded-xl outline-none bg-ink text-cream"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-muted uppercase mb-1">Opis / Wstęp</label>
                <textarea
                  value={description} onChange={e => setDescription(e.target.value)} rows={3} required
                  className="w-full px-4 py-2.5 border border-line rounded-xl outline-none bg-ink text-cream"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Składniki */}
        <div className="space-y-4">
          <h2 className="font-display uppercase tracking-wide text-xl text-gold border-b border-line pb-3">Składniki</h2>
          {ingredients.map((ing, idx) => (
            <div key={idx} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <input
                type="text" placeholder="Nazwa produktu" value={ing.name}
                onChange={e => {
                  const updated = [...ingredients];
                  updated[idx].name = e.target.value;
                  setIngredients(updated);
                }} required
                className="w-full sm:flex-grow px-4 py-2.5 border border-line rounded-xl outline-none bg-ink text-cream"
              />
              <div className="flex gap-3 w-full sm:w-auto">
                <input
                  type="number" step="0.1" placeholder="Ilość" value={ing.quantity}
                  onChange={e => {
                    const updated = [...ingredients];
                    updated[idx].quantity = Number(e.target.value);
                    setIngredients(updated);
                  }} required
                  className="w-1/2 sm:w-24 px-4 py-2.5 border border-line rounded-xl outline-none bg-ink text-cream"
                />
                <input
                  type="text" placeholder="Jednostka" value={ing.unit}
                  onChange={e => {
                    const updated = [...ingredients];
                    updated[idx].unit = e.target.value;
                    setIngredients(updated);
                  }} required
                  className="w-1/2 sm:w-28 px-4 py-2.5 border border-line rounded-xl outline-none bg-ink text-cream"
                />
              </div>
            </div>
          ))}
          <button type="button" onClick={addIngredientField} className="text-sm font-bold text-chaber hover:underline flex items-center gap-1">
            <FaPlus /> Dodaj kolejny składnik
          </button>
        </div>

        {/* Kroki */}
        <div className="space-y-6">
          <h2 className="font-display uppercase tracking-wide text-xl text-gold border-b border-line pb-3">Kroki przygotowania</h2>
          {steps.map((step, idx) => (
            <div key={idx} className="flex flex-col sm:flex-row gap-4 items-start bg-ink p-4 rounded-2xl border border-line">
              <div className="w-8 h-8 rounded-xl bg-chaber/15 border border-chaber text-chaber flex items-center justify-center font-bold flex-shrink-0 mt-1 shadow-neon">
                {idx + 1}
              </div>

              <div className="flex-grow w-full space-y-3">
                <textarea
                  placeholder={`Instrukcja dla kroku ${idx + 1}...`}
                  value={step.instruction}
                  onChange={e => {
                    const updated = [...steps];
                    updated[idx].instruction = e.target.value;
                    setSteps(updated);
                  }} required rows={3}
                  className="w-full px-4 py-2.5 border border-line rounded-xl outline-none bg-card text-cream"
                />

                <div className="flex items-center gap-4">
                  <div className="relative overflow-hidden w-28 h-16 bg-card border border-line rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-chaber transition-colors">
                    {step.imagePreview ? (
                      <img src={step.imagePreview} alt="Podgląd kroku" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-1">
                        <FaCamera className="text-chaber text-sm mx-auto mb-1" />
                        <span className="text-[10px] font-bold text-muted">Zdjęcie kroku</span>
                      </div>
                    )}
                    <input
                      type="file" accept="image/*"
                      onChange={(e) => handleStepImageChange(idx, e)}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                  {step.imagePreview && (
                    <span className="text-xs text-green-400 font-bold flex items-center gap-1">
                      <FaCheck /> Dodano zdjęcie
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          <button type="button" onClick={addStepField} className="text-sm font-bold text-chaber hover:underline flex items-center gap-1">
            <FaPlus /> Dodaj kolejny krok
          </button>
        </div>

        <button
          type="submit" disabled={loading}
          className="w-full py-4 bg-chaber text-cream font-bold rounded-2xl hover:brightness-110 transition-all shadow-neon disabled:opacity-50 text-base md:text-lg hover:scale-[1.01] flex items-center justify-center gap-2"
        >
          {loading ? 'Publikowanie...' : 'Opublikuj przepis'}
        </button>

      </form>
    </div>
  );
}
