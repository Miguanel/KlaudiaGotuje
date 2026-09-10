import { FaCrown, FaGem, FaEnvelope } from 'react-icons/fa';

export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-[#FDFBF7]">
      <div className="bg-[#0D1321] rounded-3xl p-8 md:p-12 shadow-neon border border-[#540B0E] flex flex-col md:flex-row gap-12 items-center">

        {/* Zdjęcie profilowe */}
        <div className="w-48 h-48 md:w-64 md:h-64 flex-shrink-0 relative">
          <div className="absolute inset-0 rounded-full border-2 border-[#D4AF37]/60 shadow-[0_0_15px_rgba(212,175,35,0.3)] animate-pulse"></div>
          <img
            src="https://placehold.co/400x400/0D1321/1F51FF?text=Engibadwoman"
            alt="Engibadwoman"
            className="w-full h-full object-cover rounded-full shadow-neon border-4 border-[#540B0E]"
          />
        </div>

        {/* Sekcja tekstowa */}
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-4xl font-black text-[#FDFBF7] mb-4 flex items-center justify-center md:justify-start gap-2">
            <FaCrown className="text-[#D4AF37]" /> <span className="text-gold">Cześć!</span> 👋
          </h1>
          <p className="text-base md:text-lg text-[#FDFBF7] leading-relaxed mb-4 font-medium">
            Witaj w moim ekskluzywnym kulinarnym świecie, gdzie zasady dyktuje smak, a kompromisy nie istnieją. Jestem kobietą nadwyraz wybredną – jeśli coś trafia na mój talerz, musi być po prostu perfekcyjne. Mój czarny humor to tylko część mnie, ale to właśnie dzięki temu specyficznemu podejściu do życia tworzę dania zupełnie inne niż wszystkie. Kuchnia to dla mnie sztuka, magia i wolność.
          </p>
          <p className="text-base md:text-lg text-[#FDFBF7] leading-relaxed mb-4 font-medium">
            Nie znajdziesz tu nudy. Przełamuję schematy i łączę kuchnię tradycyjną, nowoczesną oraz potrawy na diecie. Sama schudłam prawie 50 kg i chętnie pokażę Ci, jak to zrobiłam! Ale uwaga – nie mam zamiaru ograniczać się do nudnych, „suchych” fit porad czy wyłącznie niskokalorycznych przepisów. Gotuję zdrowo, mądrze i z ogromną pasją, ale przede wszystkim: gotuję z charakterem. Znajdziesz tu zarówno lekkie, wysokobiałkowe posiłki, jak i domowe pieczywo czy rozpustne desery.
          </p>
          <p className="text-base md:text-lg text-[#FDFBF7] leading-relaxed mb-8 font-medium">
            Rozgość się w mojej księdze przepisów i odkryj smaki w wersji premium! ✨
          </p>

          {/* Sekcja kontaktowa */}
          <div className="bg-[#1A0D16] p-6 rounded-2xl border border-[#540B0E] inline-block w-full md:w-auto shadow-sm">
            <h2 className="text-xs font-black text-[#D4AF37] uppercase tracking-widest mb-3 flex items-center justify-center md:justify-start gap-1.5">
              <FaGem className="text-[#1F51FF]" /> Współpraca i kontakt
            </h2>
            <a
              href="mailto:kontakt@diamentowesmaki.pl"
              className="text-lg font-bold text-[#FDFBF7] hover:text-[#1F51FF] transition-colors flex items-center justify-center md:justify-start gap-3"
            >
              <FaEnvelope className="text-[#1F51FF]" />
              kontakt@diamentowesmaki.pl
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}