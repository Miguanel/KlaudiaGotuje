import { useState } from 'react';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import type { Comment } from '../types';

interface Props {
  recipeId: string;
  initialComments: Comment[];
  averageRating: number | null;
}

export default function CommentsSection({ recipeId, initialComments, averageRating }: Props) {
  const { isAuthenticated, token } = useAuth();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [authorName, setAuthorName] = useState('');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !content.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const newComment = await apiClient.recipes.addComment(recipeId, {
        author_name: authorName,
        content,
        rating,
      });
      setComments([newComment, ...comments]);
      setAuthorName('');
      setContent('');
      setRating(5);
    } catch (err) {
      setError('Wystąpił błąd podczas wysyłania komentarza.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!token || !window.confirm('Czy na pewno chcesz usunąć ten komentarz?')) return;

    try {
      await apiClient.recipes.deleteComment(commentId, token);
      setComments(comments.filter(c => c.id !== commentId));
    } catch (err) {
      alert('Nie udało się usunąć komentarza.');
    }
  };

  return (
    <div className="mt-12 bg-[#0D1321] p-8 rounded-3xl border border-[#540B0E] shadow-neon text-[#FDFBF7]">
      <div className="flex items-center justify-between mb-6 border-b border-[#540B0E] pb-4">
        <h2 className="text-2xl font-black text-glow">💬 Komentarze i oceny 💖</h2>
        {averageRating !== null && (
          <div className="flex items-center gap-1 bg-[#1F51FF]/20 border border-[#1F51FF] text-[#1F51FF] px-3.5 py-1.5 rounded-xl font-black text-sm shadow-neon">
            <span>⭐</span>
            <span>{averageRating} / 5</span>
          </div>
        )}
      </div>

      {/* Formularz dodawania */}
      <form onSubmit={handleSubmit} className="mb-10 bg-[#1A0D16] p-6 rounded-2xl border border-[#540B0E]">
        <h3 className="text-lg font-black text-[#FDFBF7] mb-4">Zostaw swoją opinię ✨</h3>

        {error && <p className="text-red-400 text-sm mb-4 font-bold">{error}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-black text-gray-300 uppercase mb-1">Twoje imię</label>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              required
              placeholder="Podpis"
              className="w-full px-4 py-2.5 border border-[#540B0E] rounded-xl bg-[#0D1321] text-[#FDFBF7] placeholder-gray-400 focus:ring-2 focus:ring-[#1F51FF] outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-black text-gray-300 uppercase mb-1">Ocena</label>
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="w-full px-4 py-2.5 border border-[#540B0E] rounded-xl bg-[#0D1321] text-[#FDFBF7] focus:ring-2 focus:ring-[#1F51FF] outline-none font-bold"
            >
              <option value={5}>⭐⭐⭐⭐⭐ (5/5)</option>
              <option value={4}>⭐⭐⭐⭐ (4/5)</option>
              <option value={3}>⭐⭐⭐ (3/5)</option>
              <option value={2}>⭐⭐ (2/5)</option>
              <option value={1}>⭐ (1/5)</option>
            </select>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-black text-gray-300 uppercase mb-1">Komentarz</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={3}
            placeholder="Jak wyszedł Ci ten przepis? Podziel się wrażeniami... 💎"
            className="w-full px-4 py-2.5 border border-[#540B0E] rounded-xl bg-[#0D1321] text-[#FDFBF7] placeholder-gray-400 focus:ring-2 focus:ring-[#1F51FF] outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="bg-[#E60026] text-[#FDFBF7] font-black px-6 py-3 rounded-xl hover:bg-red-700 transition-all shadow-chili disabled:opacity-50 hover:scale-105"
        >
          {submitting ? 'Wysyłanie...' : 'Opublikuj komentarz 🚀'}
        </button>
      </form>

      {/* Lista komentarzy */}
      {comments.length === 0 ? (
        <p className="text-gray-300 text-center py-6 font-bold">Brak komentarzy. Bądź pierwszą osobą, która oceni ten przepis! ✨</p>
      ) : (
        <div className="space-y-6">
          {comments.map(comment => (
            <div key={comment.id} className="border-b border-[#540B0E] pb-6 last:border-none">
              <div className="flex justify-between items-center mb-2">
                <span className="font-black text-[#FDFBF7] text-base">{comment.author_name}</span>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-300 font-bold">
                    {new Date(comment.created_at).toLocaleDateString('pl-PL')}
                  </span>
                  {isAuthenticated && (
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="text-xs text-red-400 hover:text-red-300 font-black bg-red-950/50 border border-red-900 px-2.5 py-1 rounded-lg transition-colors"
                      title="Usuń komentarz"
                    >
                      Usuń
                    </button>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs mb-2">
                {Array.from({ length: comment.rating }).map((_, i) => (
                  <span key={i}>⭐</span>
                ))}
              </div>
              <p className="text-gray-200 text-sm leading-relaxed font-medium">{comment.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}