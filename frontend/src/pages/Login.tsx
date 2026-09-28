import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaCrown, FaLock } from 'react-icons/fa';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/token/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error('Nieprawidłowa nazwa użytkownika lub hasło.');
      }

      const data = await response.json();
      login(data.access, data.refresh);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Wystąpił błąd logowania.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20 text-cream">
      <div className="bg-card p-8 rounded-3xl border border-line shadow-glow">
        <div className="text-center mb-6">
          <FaCrown className="text-gold text-3xl mx-auto mb-2" />
          <h1 className="font-display uppercase tracking-wide text-3xl text-gold">Panel administratora</h1>
          <p className="text-muted text-sm mt-1">Zaloguj się, aby zarządzać serwisem.</p>
        </div>

        {error && (
          <div className="bg-burgundy/60 border border-burgundy text-cream p-3 rounded-xl text-sm mb-4 text-center font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-muted uppercase mb-1">Login</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-ink border border-line rounded-xl focus:ring-2 focus:ring-burgundy/60 focus:border-gold/60 outline-none transition-all text-cream"
              placeholder="Wpisz login..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-muted uppercase mb-1">Hasło</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-ink border border-line rounded-xl focus:ring-2 focus:ring-burgundy/60 focus:border-gold/60 outline-none transition-all text-cream"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-chili text-cream font-bold rounded-full hover:brightness-110 transition-all shadow-chili disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <FaLock /> {loading ? 'Logowanie...' : 'Zaloguj się'}
          </button>
        </form>
      </div>
    </div>
  );
}
