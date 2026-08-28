// Zaktualizowany src/components/Layout.tsx
import { Link, Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7]">
      {/* Minimalistyczny, elegancki Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-gray-200/80 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="text-2xl font-black tracking-tight text-gray-900">
            KlaudiaGotuje<span className="text-orange-500">.</span>
          </Link>

          <nav className="flex items-center gap-6 text-sm font-semibold text-gray-600">
            <Link to="/" className="hover:text-orange-500 transition">
              Przepisy
            </Link>
            <Link to="/o-mnie" className="hover:text-orange-500 transition">
              O mnie
            </Link>
          </nav>
        </div>
      </header>

      {/* Dynamiczna treść */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Stopka */}
      <footer className="bg-white border-t border-gray-200 py-12 text-center text-sm text-gray-500">
        <p className="font-bold text-gray-900 mb-1">KlaudiaGotuje</p>
        <p>© {new Date().getFullYear()} Wszystkie prawa zastrzeżone.</p>
      </footer>
    </div>
  );
}