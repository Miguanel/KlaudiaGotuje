import { useState } from 'react';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import type { Comment } from '../types';
import { FaStar, FaRegStar, FaTrashAlt } from 'react-icons/fa';
import { plural } from '../utils/plural';

interface Props {
  recipeId: string;
  initialComments: Comment[];
  averageRating: number | null;
}

function Stars({ value, size = 'text-sm' }: { value: number; size?: string }) {
  return (
    <span className={`inline-flex gap-0.5 text-gold ${size}`} aria-label={`Ocena ${value} na 5`}>
      {[1, 2, 3, 4, 5].map(i => (i <= Math.round(value) ? <FaStar key={i} /> : <FaRegStar key={i} className="text-line" />))}
    </span>
  );
}

export default function CommentsSection({ recipeId, initialComments, averageRating }: Props) {
  const { isAuthenticated, token } = useAuth();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [authorName, setAuthorName] = useState('');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState<number | null>(null);
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
    } catch {
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
    } catch {
      alert('Nie udało się usunąć komentarza.');
    }
  };

  const inputCls = 'w-full px-4 h-11 rounded-xl bg-ink/60 border border-line text-cream placeholder:text-muted focus:outline-none focus:border-pink focus:ring-2 focus:ring-pink/30 transition';

  return (
    <section className="mt-12 bg-card border border-line rounded-3xl p-5 sm:p-8" aria-labelledby="opinie">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h2 id="opinie" className="label-pill">Opinie</h2>
        {averageRating !== null && (
          <div className="flex items-center gap-2 text-sm">
            <Stars value={averageRating} />
            <span className="font-bold text-cream">{averageRating.toFixed(1)}</span>
            <span className="text-muted">· {comments.length} {plural(comments.length, 'opinia', 'opinie', 'opinii')}</span>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-[1fr_1.2fr] gap-8">
        {/* FORMULARZ */}
        <form onSubmit={handleSubmit} className="space-y-4 bg-ink/40 border border-line rounded-2xl p-5 self-start">
          <h3 className="font-display uppercase tracking-wide text-lg text-gold">Jak Ci wyszło?</h3>

          {error && <p className="text-pink-soft text-sm font-semibold">{error}</p>}

          <div>
            <span className="block text-xs font-semibold text-muted mb-1.5">Twoja ocena</span>
            <div className="flex gap-1" onMouseLeave={() => setHover(null)}>
              {[1, 2, 3, 4, 5].map(i => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRating(i)}
                  onMouseEnter={() => setHover(i)}
                  aria-label={`${i} na 5`}
                  aria-pressed={rating === i}
                  className="text-2xl text-gold transition-transform hover:scale-110"
                >
                  {i <= (hover ?? rating) ? <FaStar /> : <FaRegStar className="text-line" />}
                </button>
              ))}
            </div>
          </div>

          <label className="block">
            <span className="block text-xs font-semibold text-muted mb-1.5">Imię</span>
            <input type="text" value={authorName} onChange={(e) => setAuthorName(e.target.value)} required placeholder="Jak się podpiszesz?" className={inputCls} />
          </label>

          <label className="block">
            <span className="block text-xs font-semibold text-muted mb-1.5">Komentarz</span>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={4}
              placeholder="Podziel się wrażeniami…"
              className={`${inputCls} h-auto py-3`}
            />
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="w-full h-11 rounded-full bg-pink text-white font-bold hover:brightness-110 transition disabled:opacity-50"
          >
            {submitting ? 'Wysyłanie…' : 'Opublikuj opinię'}
          </button>
        </form>

        {/* LISTA */}
        {comments.length === 0 ? (
          <p className="text-muted text-center self-center py-6">Brak opinii. Bądź pierwszą osobą, która oceni ten przepis!</p>
        ) : (
          <ul className="divide-y divide-line">
            {comments.map(comment => (
              <li key={comment.id} className="py-4 first:pt-0">
                <div className="flex justify-between items-start gap-3 mb-1.5">
                  <div>
                    <span className="font-bold text-cream">{comment.author_name}</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Stars value={comment.rating} size="text-xs" />
                      <span className="text-xs text-muted">{new Date(comment.created_at).toLocaleDateString('pl-PL')}</span>
                    </div>
                  </div>
                  {isAuthenticated && (
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-muted hover:text-pink hover:bg-pink/10 transition"
                      title="Usuń komentarz"
                      aria-label="Usuń komentarz"
                    >
                      <FaTrashAlt className="text-xs" />
                    </button>
                  )}
                </div>
                <p className="text-sm leading-relaxed text-cream/90">{comment.content}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
