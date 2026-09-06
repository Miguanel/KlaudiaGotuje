import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCategories } from '../hooks/useCategories';
import { useTags } from '../hooks/useTags';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';

interface StepData {
  step_number: number;
  instruction: string;
  imageFile: File | null;
  imagePreview: string | null;
}

export default function AddRecipe() {
  const { token, isAuthenticated } = useAuth();
  const { categories } = useCategories();
  const { tags } = useTags();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [prepTime, setPrepTime] = useState(30);
  const [categoryId, setCategoryId] = useState('');

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);

  const [ingredients, setIngredients] = useState([{ name: '', quantity: 1, unit: 'g' }]);
  const [steps, setSteps] = useState<StepData[]>([{ step_number: 1, instruction: '', imageFile: null, imagePreview: null }]);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Brak dostępu</h1>
        <p className="text-gray-500 mb-6">Musisz się zalogować jako administrator, aby dodawać przepisy.</p>
        <button onClick={() => navigate('/login')} className="bg-orange-500 text-white px-6 py-2.5 rounded-xl font-bold">
          Przejdź do logowania
        </button>
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

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
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
        tag_ids: selectedTags,
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
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">Dodaj nowy przepis 🍳</h1>
      <p className="text-gray-500 mb-8 text-sm md:text-base">Wypełnij formularz, prześlij zdjęcia i udostępnij nową potrawę.</p>

      {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 font-medium text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-4 sm:p-8 rounded-3xl border border-gray-100 shadow-sm">

        {/* Informacje podstawowe */}
        <div className="space-y-6">
          <h2 className="text-lg md:text-xl font-bold text-gray-800 border-b pb-2">Informacje podstawowe</h2>

          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-full md:w-1/3 flex flex-col items-center gap-3">
              <label className="block text-xs font-bold text-gray-600 uppercase w-full text-left">Zdjęcie główne</label>
              <div className="w-full aspect-video bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl overflow-hidden relative flex items-center justify-center">
                {mainImagePreview ? (
                  <img src={mainImagePreview} alt="Podgląd" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gray-400 text-sm font-medium">Brak zdjęcia</span>
                )}
                <input
                  type="file" accept="image/*"
                  onChange={handleMainImageChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
              <p className="text-xs text-gray-400 text-center">Kliknij na obszar, aby dodać plik (JPG, PNG).</p>
            </div>

            <div className="w-full md:w-2/3 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Nazwa przepisu</label>
                <input
                  type="text" value={name} onChange={e => setName(e.target.value)} required
                  className="w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20"
                  placeholder="np. Domowe spaghetti"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Kategoria</label>
                  <select
                    value={categoryId} onChange={e => setCategoryId(e.target.value)}
                    className="w-full px-4 py-2.5 border rounded-xl outline-none bg-white"
                  >
                    <option value="">Wybierz kategorię...</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Czas (min)</label>
                  <input
                    type="number" value={prepTime} onChange={e => setPrepTime(Number(e.target.value))} required min={1}
                    className="w-full px-4 py-2.5 border rounded-xl outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Opis / Wstęp</label>
                <textarea
                  value={description} onChange={e => setDescription(e.target.value)} rows={3} required
                  className="w-full px-4 py-2.5 border rounded-xl outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sekcja Tagów */}
        <div className="space-y-4">
          <h2 className="text-lg md:text-xl font-bold text-gray-800 border-b pb-2">Tagi</h2>
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <button
                key={tag.id} type="button" onClick={() => toggleTag(tag.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                  selectedTags.includes(tag.id)
                    ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                    : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-orange-300'
                }`}
              >
                #{tag.name}
              </button>
            ))}
          </div>
        </div>

        {/* Składniki */}
        <div className="space-y-4">
          <h2 className="text-lg md:text-xl font-bold text-gray-800 border-b pb-2">Składniki</h2>
          {ingredients.map((ing, idx) => (
            <div key={idx} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <input
                type="text" placeholder="Nazwa produktu" value={ing.name}
                onChange={e => {
                  const updated = [...ingredients];
                  updated[idx].name = e.target.value;
                  setIngredients(updated);
                }} required
                className="w-full sm:flex-grow px-4 py-2 border rounded-xl outline-none"
              />
              <div className="flex gap-3 w-full sm:w-auto">
                <input
                  type="number" step="0.1" placeholder="Ilość" value={ing.quantity}
                  onChange={e => {
                    const updated = [...ingredients];
                    updated[idx].quantity = Number(e.target.value);
                    setIngredients(updated);
                  }} required
                  className="w-1/2 sm:w-24 px-4 py-2 border rounded-xl outline-none"
                />
                <input
                  type="text" placeholder="Jednostka" value={ing.unit}
                  onChange={e => {
                    const updated = [...ingredients];
                    updated[idx].unit = e.target.value;
                    setIngredients(updated);
                  }} required
                  className="w-1/2 sm:w-28 px-4 py-2 border rounded-xl outline-none"
                />
              </div>
            </div>
          ))}
          <button type="button" onClick={addIngredientField} className="text-sm font-bold text-orange-500 hover:underline">
            + Dodaj kolejny składnik
          </button>
        </div>

        {/* Kroki */}
        <div className="space-y-6">
          <h2 className="text-lg md:text-xl font-bold text-gray-800 border-b pb-2">Kroki przygotowania</h2>
          {steps.map((step, idx) => (
            <div key={idx} className="flex flex-col sm:flex-row gap-4 items-start bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
              <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold flex-shrink-0 mt-1">
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
                  className="w-full px-4 py-2 border rounded-xl outline-none"
                />

                <div className="flex items-center gap-4">
                  <div className="relative overflow-hidden w-24 h-16 bg-white border border-gray-200 rounded-lg flex items-center justify-center cursor-pointer hover:border-orange-300">
                    {step.imagePreview ? (
                      <img src={step.imagePreview} alt="Podgląd kroku" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] font-bold text-gray-400 text-center px-2">+ Zdjęcie<br/>kroku</span>
                    )}
                    <input
                      type="file" accept="image/*"
                      onChange={(e) => handleStepImageChange(idx, e)}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                  {step.imagePreview && <span className="text-xs text-green-600 font-bold">Dodano zdjęcie</span>}
                </div>
              </div>
            </div>
          ))}
          <button type="button" onClick={addStepField} className="text-sm font-bold text-orange-500 hover:underline">
            + Dodaj kolejny krok
          </button>
        </div>

        <button
          type="submit" disabled={loading}
          className="w-full py-4 bg-orange-500 text-white font-bold rounded-2xl hover:bg-orange-600 transition-colors shadow-sm disabled:opacity-50 text-base md:text-lg"
        >
          {loading ? 'Publikowanie...' : 'Opublikuj przepis'}
        </button>

      </form>
    </div>
  );
}