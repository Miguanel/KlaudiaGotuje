export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-12 items-center">

        {/* Zdjęcie profilowe */}
        <div className="w-48 h-48 md:w-64 md:h-64 flex-shrink-0">
          <img
            src="https://placehold.co/400x400/ea580c/white?text=Klaudia"
            alt="Klaudia"
            className="w-full h-full object-cover rounded-full shadow-lg border-4 border-orange-50"
          />
        </div>

        {/* Sekcja tekstowa */}
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-4xl font-black text-gray-900 mb-6">Cześć, tu Klaudia! 👋</h1>
          <p className="text-lg text-gray-600 leading-relaxed mb-6">
            Witają w moim kulinarnym świecie. Od lat pasjonuję się gotowaniem,
            odkrywaniem nowych smaków i dzieleniem się sprawdzonymi przepisami.
            Znajdziesz tu zarówno szybkie pomysły na obiad po pracy, jak i
            wypieki, które skradną serca Twoich bliskich.
          </p>
          <p className="text-lg text-gray-600 leading-relaxed mb-10">
            Wierzę, że w kuchni najważniejsze są dobre chęci, świeże składniki
            i szczypta wyobraźni. Rozgość się!
          </p>

          {/* Sekcja kontaktowa */}
          <div className="bg-orange-50 p-6 rounded-2xl inline-block w-full md:w-auto">
            <h2 className="text-sm font-bold text-orange-800 uppercase tracking-widest mb-4">Współpraca i kontakt</h2>
            <a
              href="mailto:kontakt@klaudiagotuje.pl"
              className="text-xl font-bold text-gray-900 hover:text-orange-600 transition-colors flex items-center justify-center md:justify-start gap-3"
            >
              <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              kontakt@klaudiagotuje.pl
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}