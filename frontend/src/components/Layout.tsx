import { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaCrown, FaGem, FaShoppingCart, FaPlus, FaUser, FaSignOutAlt, FaMagic } from 'react-icons/fa';

export default function Layout() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

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
    <div className="min-h-screen flex flex-col bg-[#1A0D16] text-[#FDFBF7] font-sans">
      <header className="bg-[#0D1321]/90 backdrop-blur-md border-b border-[#540B0E] sticky top-0 z-50 shadow-neon">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">

          {/* LOGO */}
          <Link to="/" className="text-xl sm:text-2xl font-black tracking-tight text-[#FDFBF7] flex items-center gap-1.5 hover:scale-105 transition-transform" onClick={closeMenu}>
            <span>
              <FaCrown className="text-[#D4AF37] inline mr-1" style={{ filter: 'drop-shadow(0 0 6px rgba(212,175,35,0.6))' }} />
              <span className="text-gold">Diamentowe Smaki</span>
              <span className="hidden sm:inline text-gray-400 font-bold text-xs uppercase tracking-widest ml-2">Engibadwoman</span>
            </span>
            <FaGem className="text-[#D4AF37] text-glow inline ml-1" />
          </Link>

          {/* PRZYCISK HAMBURGER MENU */}
          <button
            className="md:hidden p-2 text-gray-300 hover:text-[#1F51FF] focus:outline-none transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Otwórz menu"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* MENU DESKTOPOWE */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-bold text-gray-300">
            <Link to="/" className="hover:text-[#FDFBF7] hover:text-glow transition flex items-center gap-1.5">
              <FaMagic className="text-[#1F51FF]" /> Przepisy
            </Link>
            <Link to="/zakupy" className="hover:text-[#FDFBF7] hover:text-glow transition flex items-center gap-1.5">
              <FaShoppingCart className="text-[#1F51FF]" style={{ filter: 'drop-shadow(0 0 6px rgba(31,81,255,0.8))' }} /> Zakupy
            </Link>
            <Link to="/ulubione" className="hover:text-[#FDFBF7] hover:text-glow transition flex items-center gap-1.5">
              <FaGem className="text-[#D4AF37]" /> Ulubione
            </Link>

            {isAuthenticated && (
              <Link to="/dodaj-przepis" className="bg-[#E60026] text-[#FDFBF7] px-4 py-2 rounded-xl shadow-chili hover:bg-red-700 transition flex items-center gap-1">
                <FaPlus className="inline" /> Dodaj przepis
              </Link>
            )}

            <Link to="/o-mnie" className="hover:text-[#FDFBF7] hover:text-glow transition flex items-center gap-1.5">
              <FaUser className="text-[#D4AF37]" /> O mnie
            </Link>

            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="text-red-400 hover:text-red-300 transition font-bold flex items-center gap-1"
              >
                <FaSignOutAlt /> Wyloguj
              </button>
            ) : (
              <Link to="/login" className="text-[#E60026] hover:text-red-400 transition font-black">
                Logowanie
              </Link>
            )}
          </nav>
        </div>

        {/* MENU MOBILNE */}
        {isMobileMenuOpen && (
          <nav className="md:hidden absolute top-16 left-0 w-full bg-[#0D1321] border-b border-[#540B0E] shadow-neon flex flex-col py-4 px-6 gap-4 font-bold text-gray-200 z-40">
            <Link to="/" className="py-2 border-b border-[#540B0E] hover:text-[#1F51FF] flex items-center gap-2" onClick={closeMenu}>
              <FaMagic className="text-[#1F51FF]" /> Przepisy
            </Link>
            <Link to="/zakupy" className="py-2 border-b border-[#540B0E] hover:text-[#1F51FF] flex items-center gap-2" onClick={closeMenu}>
              <FaShoppingCart className="text-[#1F51FF]" /> Lista zakupów
            </Link>
            <Link to="/ulubione" className="py-2 border-b border-[#540B0E] hover:text-[#1F51FF] flex items-center gap-2" onClick={closeMenu}>
              <FaGem className="text-[#D4AF37]" /> Ulubione przepisy
            </Link>

            {isAuthenticated && (
              <Link to="/dodaj-przepis" className="py-2 border-b border-[#540B0E] text-[#E60026] flex items-center gap-2" onClick={closeMenu}>
                <FaPlus /> Dodaj nowy przepis
              </Link>
            )}

            <Link to="/o-mnie" className="py-2 border-b border-[#540B0E] hover:text-[#1F51FF] flex items-center gap-2" onClick={closeMenu}>
              <FaUser className="text-[#D4AF37]" /> O mnie
            </Link>

            {isAuthenticated ? (
              <button onClick={handleLogout} className="py-2 text-left text-red-400 flex items-center gap-2">
                <FaSignOutAlt /> Wyloguj administratora
              </button>
            ) : (
              <Link to="/login" className="py-2 text-[#E60026]" onClick={closeMenu}>
                Logowanie do panelu
              </Link>
            )}
          </nav>
        )}
      </header>

      <main className="flex-grow">
        <Outlet />
      </main>

      <footer className="bg-[#0D1321] border-t border-[#540B0E] py-12 text-center text-sm text-gray-300">
        <p className="font-bold text-[#FDFBF7] mb-1 flex justify-center items-center gap-2 text-lg">
          <FaCrown className="text-[#D4AF37]" style={{ filter: 'drop-shadow(0 0 6px rgba(212,175,35,0.6))' }} />
          <span className="text-gold">Diamentowe Smaki</span>
          <FaGem className="text-[#D4AF37]" />
        </p>
        <p className="text-[#FDFBF7]/80">© {new Date().getFullYear()} Wszystkie prawa zastrzeżone. Luksusowy świat kulinarny glamour ✨</p>
      </footer>
    </div>
  );
}