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
    <div className="max-w-md mx-auto px-4 py-20 text-white">
      <div className="bg-[#160A22] p-8 rounded-3xl border border-[#25113A] shadow-neon">
        <div className="text-center mb-6">
          <FaCrown className="text-amber-400 text-3xl mx-auto mb-2" style={{ filter: 'drop-shadow(0 0 8px rgba(251,191,36,0.6))' }} />
          <h1 className="text-2xl font-black text-gold">Panel Administratora</h1>
          <p className="text-gray-400 text-sm mt-1">Zaloguj się, aby zarządzać serwisem.</p>
        </div>

        {error && (
          <div className="bg-red-950/60 border border-red-900 text-red-300 p-3 rounded-xl text-sm mb-4 text-center font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase mb-1">Login</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-[#0B0510] border border-[#25113A] rounded-xl focus:ring-2 focus:ring-[#FF1493] focus:border-[#FF1493] outline-none transition-all text-white"
              placeholder="Wpisz login..."
            />
          </div>

          <div>
            <label className="block text-xs font-black text-gray-400 uppercase mb-1">Hasło</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-[#0B0510] border border-[#25113A] rounded-xl focus:ring-2 focus:ring-[#FF1493] focus:border-[#FF1493] outline-none transition-all text-white"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#FF1493] text-white font-black rounded-xl hover:bg-[#FF007F] transition-all shadow-neon disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <FaLock /> {loading ? 'Logowanie...' : 'Zaloguj się'}
          </button>
        </form>
      </div>
    </div>
  );
}