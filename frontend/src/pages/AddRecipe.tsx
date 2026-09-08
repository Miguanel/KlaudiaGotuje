import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCategories } from '../hooks/useCategories';
import { useTags } from '../hooks/useTags';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import { FaCrown, FaGem, FaPlus, FaCamera, FaCheck, FaLock } from 'react-icons/fa';

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
      <div className="max-w-md mx-auto px-4 py-20 text-center text-white">
        <div className="bg-[#160A22] p-8 rounded-3xl border border-[#25113A] shadow-neon">
          <FaLock className="text-[#FF1493] text-4xl mx-auto mb-4" />
          <h1 className="text-2xl font-black mb-2 text-glow">Brak dostępu</h1>
          <p className="text-gray-400 mb-6 text-sm">Musisz się zalogować jako administrator, aby dodawać przepisy.</p>
          <button onClick={() => navigate('/login')} className="bg-[#FF1493] text-white px-6 py-3 rounded-xl font-black shadow-neon hover:bg-[#FF007F] transition-all">
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
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 text-white">
      <h1 className="text-2xl md:text-3xl font-black mb-2 text-glow flex items-center gap-2">
        <FaCrown className="text-[#FF1493]" /> Dodaj nowy przepis <FaGem className="text-[#FF007F]" />
      </h1>
      <p className="text-gray-400 mb-8 text-sm md:text-base font-medium">Wypełnij formularz, prześlij zdjęcia i udostępnij nową potrawę. ✨</p>

      {error && <div className="bg-red-950/60 border border-red-900 text-red-300 p-4 rounded-xl mb-6 font-bold text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-8 bg-[#160A22] p-4 sm:p-8 rounded-3xl border border-[#25113A] shadow-neon">

        {/* Informacje podstawowe */}
        <div className="space-y-6">
          <h2 className="text-lg md:text-xl font-black text-white border-b border-[#25113A] pb-3 flex items-center gap-2">
            <span>💎 Informacje podstawowe</span>
          </h2>

          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-full md:w-1/3 flex flex-col items-center gap-3">
              <label className="block text-xs font-black text-gray-400 uppercase w-full text-left">Zdjęcie główne</label>
              <div className="w-full aspect-video bg-[#0B0510] border-2 border-dashed border-[#25113A] rounded-2xl overflow-hidden relative flex flex-col items-center justify-center hover:border-[#FF1493] transition-colors">
                {mainImagePreview ? (
                  <img src={mainImagePreview} alt="Podgląd" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-4">
                    <FaCamera className="text-[#FF1493] text-2xl mx-auto mb-2" />
                    <span className="text-gray-400 text-xs font-bold">Brak zdjęcia</span>
                  </div>
                )}
                <input
                  type="file" accept="image/*"
                  onChange={handleMainImageChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
              <p className="text-xs text-gray-500 text-center font-medium">Kliknij na obszar, aby dodać plik (JPG, PNG).</p>
            </div>

            <div className="w-full md:w-2/3 space-y-4">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase mb-1">Nazwa przepisu</label>
                <input
                  type="text" value={name} onChange={e => setName(e.target.value)} required
                  className="w-full px-4 py-2.5 border border-[#25113A] rounded-xl outline-none bg-[#0B0510] text-white focus:border-[#FF1493]"
                  placeholder="np. Domowe spaghetti"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase mb-1">Kategoria</label>
                  <select
                    value={categoryId} onChange={e => setCategoryId(e.target.value)}
                    className="w-full px-4 py-2.5 border border-[#25113A] rounded-xl outline-none bg-[#0B0510] text-white font-bold"
                  >
                    <option value="">Wybierz kategorię...</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase mb-1">Czas (min)</label>
                  <input
                    type="number" value={prepTime} onChange={e => setPrepTime(Number(e.target.value))} required min={1}
                    className="w-full px-4 py-2.5 border border-[#25113A] rounded-xl outline-none bg-[#0B0510] text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase mb-1">Opis / Wstęp</label>
                <textarea
                  value={description} onChange={e => setDescription(e.target.value)} rows={3} required
                  className="w-full px-4 py-2.5 border border-[#25113A] rounded-xl outline-none bg-[#0B0510] text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sekcja Tagów */}
        <div className="space-y-4">
          <h2 className="text-lg md:text-xl font-black text-white border-b border-[#25113A] pb-3">Tagi</h2>
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <button
                key={tag.id} type="button" onClick={() => toggleTag(tag.id)}
                className={`px-4 py-2 rounded-full text-xs font-black transition-all border ${
                  selectedTags.includes(tag.id)
                    ? 'bg-[#FF1493] text-white border-[#FF1493] shadow-neon'
                    : 'bg-[#0B0510] text-gray-400 border-[#25113A] hover:border-[#FF1493]'
                }`}
              >
                #{tag.name}
              </button>
            ))}
          </div>
        </div>

        {/* Składniki */}
        <div className="space-y-4">
          <h2 className="text-lg md:text-xl font-black text-white border-b border-[#25113A] pb-3">Składniki</h2>
          {ingredients.map((ing, idx) => (
            <div key={idx} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <input
                type="text" placeholder="Nazwa produktu" value={ing.name}
                onChange={e => {
                  const updated = [...ingredients];
                  updated[idx].name = e.target.value;
                  setIngredients(updated);
                }} required
                className="w-full sm:flex-grow px-4 py-2.5 border border-[#25113A] rounded-xl outline-none bg-[#0B0510] text-white"
              />
              <div className="flex gap-3 w-full sm:w-auto">
                <input
                  type="number" step="0.1" placeholder="Ilość" value={ing.quantity}
                  onChange={e => {
                    const updated = [...ingredients];
                    updated[idx].quantity = Number(e.target.value);
                    setIngredients(updated);
                  }} required
                  className="w-1/2 sm:w-24 px-4 py-2.5 border border-[#25113A] rounded-xl outline-none bg-[#0B0510] text-white"
                />
                <input
                  type="text" placeholder="Jednostka" value={ing.unit}
                  onChange={e => {
                    const updated = [...ingredients];
                    updated[idx].unit = e.target.value;
                    setIngredients(updated);
                  }} required
                  className="w-1/2 sm:w-28 px-4 py-2.5 border border-[#25113A] rounded-xl outline-none bg-[#0B0510] text-white"
                />
              </div>
            </div>
          ))}
          <button type="button" onClick={addIngredientField} className="text-sm font-black text-[#FF1493] hover:underline flex items-center gap-1">
            <FaPlus /> Dodaj kolejny składnik
          </button>
        </div>

        {/* Kroki */}
        <div className="space-y-6">
          <h2 className="text-lg md:text-xl font-black text-white border-b border-[#25113A] pb-3">Kroki przygotowania</h2>
          {steps.map((step, idx) => (
            <div key={idx} className="flex flex-col sm:flex-row gap-4 items-start bg-[#0B0510] p-4 rounded-2xl border border-[#25113A]">
              <div className="w-8 h-8 rounded-xl bg-[#FF1493]/20 border border-[#FF1493] text-[#FF66B2] flex items-center justify-center font-black flex-shrink-0 mt-1 shadow-neon">
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
                  className="w-full px-4 py-2.5 border border-[#25113A] rounded-xl outline-none bg-[#160A22] text-white"
                />

                <div className="flex items-center gap-4">
                  <div className="relative overflow-hidden w-28 h-16 bg-[#160A22] border border-[#25113A] rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#FF1493] transition-colors">
                    {step.imagePreview ? (
                      <img src={step.imagePreview} alt="Podgląd kroku" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-1">
                        <FaCamera className="text-[#FF1493] text-sm mx-auto mb-1" />
                        <span className="text-[10px] font-black text-gray-400">Zdjęcie kroku</span>
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
          <button type="button" onClick={addStepField} className="text-sm font-black text-[#FF1493] hover:underline flex items-center gap-1">
            <FaPlus /> Dodaj kolejny krok
          </button>
        </div>

        <button
          type="submit" disabled={loading}
          className="w-full py-4 bg-[#FF1493] text-white font-black rounded-2xl hover:bg-[#FF007F] transition-all shadow-neon disabled:opacity-50 text-base md:text-lg hover:scale-[1.01]"
        >
          {loading ? 'Publikowanie... ✨' : 'Opublikuj przepis 🚀'}
        </button>

      </form>
    </div>
  );
}