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
    <div className="min-h-screen flex flex-col bg-[#FDFBF7]">
      <header className="bg-white/90 backdrop-blur-md border-b border-gray-200/80 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">

          {/* LOGO */}
          <Link to="/" className="text-xl sm:text-2xl font-black tracking-tight text-gray-900" onClick={closeMenu}>
            Diamentowe Smaki EngiBadWoman<span className="text-orange-500">.</span>
          </Link>

          {/* PRZYCISK HAMBURGER MENU (WIDOCZNY TYLKO NA URZĄDZENIACH MOBILNYCH) */}
          <button
            className="md:hidden p-2 text-gray-600 hover:text-orange-500 focus:outline-none transition-colors"
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

          {/* MENU DESKTOPOWE (UKRYTE NA TELEFONACH, WIDOCZNE OD SZEROKOŚCI "md") */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-gray-600">
            <Link to="/" className="hover:text-orange-500 transition">
              Przepisy
            </Link>
            <Link to="/zakupy" className="hover:text-orange-500 transition flex items-center gap-1.5">
              <span>🛒</span> Zakupy
            </Link>
            <Link to="/ulubione" className="hover:text-orange-500 transition flex items-center gap-1.5">
              <span>❤️</span> Ulubione
            </Link>

            {isAuthenticated && (
              <Link to="/dodaj-przepis" className="text-orange-600 hover:text-orange-700 transition font-bold">
                + Dodaj przepis
              </Link>
            )}

            <Link to="/o-mnie" className="hover:text-orange-500 transition">
              O mnie
            </Link>

            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="text-red-500 hover:text-red-700 transition font-bold"
              >
                Wyloguj
              </button>
            ) : (
              <Link to="/login" className="text-orange-500 hover:text-orange-600 transition font-bold">
                Logowanie
              </Link>
            )}
          </nav>
        </div>

        {/* MENU MOBILNE (ROZWIJANE POD NAGŁÓWKIEM) */}
        {isMobileMenuOpen && (
          <nav className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-gray-200 shadow-xl flex flex-col py-4 px-6 gap-4 font-bold text-gray-800 z-40">
            <Link to="/" className="py-2 border-b border-gray-100 hover:text-orange-500" onClick={closeMenu}>
              Przepisy
            </Link>
            <Link to="/zakupy" className="py-2 border-b border-gray-100 hover:text-orange-500 flex items-center gap-2" onClick={closeMenu}>
              <span>🛒</span> Lista zakupów
            </Link>
            <Link to="/ulubione" className="py-2 border-b border-gray-100 hover:text-orange-500 flex items-center gap-2" onClick={closeMenu}>
              <span>❤️</span> Ulubione przepisy
            </Link>

            {isAuthenticated && (
              <Link to="/dodaj-przepis" className="py-2 border-b border-gray-100 text-orange-600" onClick={closeMenu}>
                + Dodaj nowy przepis
              </Link>
            )}

            <Link to="/o-mnie" className="py-2 border-b border-gray-100 hover:text-orange-500" onClick={closeMenu}>
              O mnie
            </Link>

            {isAuthenticated ? (
              <button onClick={handleLogout} className="py-2 text-left text-red-500">
                Wyloguj administratora
              </button>
            ) : (
              <Link to="/login" className="py-2 text-orange-500" onClick={closeMenu}>
                Logowanie do panelu
              </Link>
            )}
          </nav>
        )}
      </header>

      <main className="flex-grow">
        <Outlet />
      </main>

      <footer className="bg-white border-t border-gray-200 py-12 text-center text-sm text-gray-500">
        <p className="font-bold text-gray-900 mb-1">Diamentowe Smaki</p>
        <p>© {new Date().getFullYear()} Wszystkie prawa zastrzeżone.</p>
      </footer>
    </div>
  );
}