import { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  // Stan kontrolujący otwarcie menu mobilnego
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  const closeMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0510] text-white font-sans">
      <header className="bg-[#160A22]/80 backdrop-blur-md border-b border-[#25113A] sticky top-0 z-50 shadow-neon">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">

          {/* LOGO */}
          <Link to="/" className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-1.5 hover:scale-105 transition-transform" onClick={closeMenu}>
            <span>👑 Diamentowe Smaki <span className="hidden sm:inline">Engibadwoman</span></span>
            <span className="text-[#FF007F] text-glow">💎</span>
          </Link>

          {/* PRZYCISK HAMBURGER MENU (WIDOCZNY TYLKO NA URZĄDZENIACH MOBILNYCH) */}
          <button
            className="md:hidden p-2 text-gray-300 hover:text-[#FF1493] focus:outline-none transition-colors text-glow"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Otwórz menu"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                // Ikonka "X" (Zamknij)
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              ) : (
                // Ikonka "Hamburger" (Otwórz)
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* MENU DESKTOPOWE */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-bold text-gray-300">
            <Link to="/" className="hover:text-[#FF1493] hover:text-glow transition flex items-center gap-1.5">
              <span>✨</span> Przepisy
            </Link>
            <Link to="/zakupy" className="hover:text-[#FF1493] hover:text-glow transition flex items-center gap-1.5">
              <span>🛍️</span> Zakupy
            </Link>
            <Link to="/ulubione" className="hover:text-[#FF1493] hover:text-glow transition flex items-center gap-1.5">
              <span>💖</span> Ulubione
            </Link>

            {isAuthenticated && (
              <Link to="/dodaj-przepis" className="text-[#FF007F] text-glow hover:text-[#FF66B2] transition flex items-center gap-1">
                <span>➕</span> Dodaj przepis
              </Link>
            )}

            <Link to="/o-mnie" className="hover:text-[#FF1493] hover:text-glow transition flex items-center gap-1.5">
              <span>👸</span> O mnie
            </Link>

            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="text-red-500 hover:text-red-400 transition font-bold"
              >
                Wyloguj
              </button>
            ) : (
              <Link to="/login" className="text-[#FF1493] text-glow hover:text-[#FF66B2] transition font-black">
                Logowanie
              </Link>
            )}
          </nav>
        </div>

        {/* MENU MOBILNE (ROZWIJANE POD NAGŁÓWKIEM) */}
        {isMobileMenuOpen && (
          <nav className="md:hidden absolute top-16 left-0 w-full bg-[#160A22] border-b border-[#25113A] shadow-neon flex flex-col py-4 px-6 gap-4 font-bold text-gray-200 z-40">
            <Link to="/" className="py-2 border-b border-[#25113A] hover:text-[#FF1493] hover:text-glow flex items-center gap-2" onClick={closeMenu}>
              <span>✨</span> Przepisy
            </Link>
            <Link to="/zakupy" className="py-2 border-b border-[#25113A] hover:text-[#FF1493] hover:text-glow flex items-center gap-2" onClick={closeMenu}>
              <span>🛍️</span> Lista zakupów
            </Link>
            <Link to="/ulubione" className="py-2 border-b border-[#25113A] hover:text-[#FF1493] hover:text-glow flex items-center gap-2" onClick={closeMenu}>
              <span>💖</span> Ulubione przepisy
            </Link>

            {isAuthenticated && (
              <Link to="/dodaj-przepis" className="py-2 border-b border-[#25113A] text-[#FF007F] text-glow flex items-center gap-2" onClick={closeMenu}>
                <span>➕</span> Dodaj nowy przepis
              </Link>
            )}

            <Link to="/o-mnie" className="py-2 border-b border-[#25113A] hover:text-[#FF1493] hover:text-glow flex items-center gap-2" onClick={closeMenu}>
              <span>👸</span> O mnie
            </Link>

            {isAuthenticated ? (
              <button onClick={handleLogout} className="py-2 text-left text-red-500">
                Wyloguj administratora
              </button>
            ) : (
              <Link to="/login" className="py-2 text-[#FF1493] text-glow" onClick={closeMenu}>
                Logowanie do panelu
              </Link>
            )}
          </nav>
        )}
      </header>

      <main className="flex-grow">
        <Outlet />
      </main>

      <footer className="bg-[#0B0510] border-t border-[#25113A] py-12 text-center text-sm text-gray-400">
        <p className="font-bold text-white mb-1 flex justify-center items-center gap-2 text-lg">
          <span>👑</span> Diamentowe Smaki <span>💎</span>
        </p>
        <p>© {new Date().getFullYear()} Wszystkie prawa zastrzeżone.</p>
      </footer>
    </div>
  );
}