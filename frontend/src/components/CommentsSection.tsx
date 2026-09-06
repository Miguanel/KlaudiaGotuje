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
    <div className="mt-12 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-6 border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-900">Komentarze i oceny</h2>
        {averageRating !== null && (
          <div className="flex items-center gap-1 bg-orange-50 text-orange-700 px-3 py-1.5 rounded-xl font-bold text-sm">
            <span>⭐</span>
            <span>{averageRating} / 5</span>
          </div>
        )}
      </div>

      {/* Formularz dodawania */}
      <form onSubmit={handleSubmit} className="mb-10 bg-gray-50 p-6 rounded-xl border border-gray-200/60">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Dodaj swoją opinię</h3>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Twoje imię</label>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              required
              placeholder="np. Anna"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-orange-500/20 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Ocena</label>
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-orange-500/20 outline-none"
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
          <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Komentarz</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={3}
            placeholder="Jak wyszedł Ci ten przepis? Podziel się wrażeniami..."
            className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-orange-500/20 outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="bg-orange-500 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-orange-600 transition-colors shadow-sm disabled:opacity-50"
        >
          {submitting ? 'Wysyłanie...' : 'Opublikuj komentarz'}
        </button>
      </form>

      {/* Lista komentarzy */}
      {comments.length === 0 ? (
        <p className="text-gray-500 text-center py-6">Brak komentarzy. Bądź pierwszą osobą, która oceni ten przepis!</p>
      ) : (
        <div className="space-y-6">
          {comments.map(comment => (
            <div key={comment.id} className="border-b border-gray-100 pb-6 last:border-none">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-gray-900">{comment.author_name}</span>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-400">
                    {new Date(comment.created_at).toLocaleDateString('pl-PL')}
                  </span>
                  {isAuthenticated && (
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="text-xs text-red-500 hover:text-red-700 font-bold bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg transition-colors"
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
              <p className="text-gray-600 text-sm leading-relaxed">{comment.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}