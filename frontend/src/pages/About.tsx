import { FaCrown, FaGem, FaEnvelope, FaInstagram, FaTiktok } from 'react-icons/fa';
import profileImg from '../assets/engibadwoman.jpg';

export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-[#FDFBF7]">
      <div className="bg-[#0D1321] rounded-3xl p-8 md:p-12 shadow-neon border border-[#540B0E] flex flex-col md:flex-row gap-12 items-center">

        {/* Zdjęcie profilowe */}
        <div className="w-48 h-48 md:w-64 md:h-64 flex-shrink-0 relative">
          <div className="absolute inset-0 rounded-full border-2 border-[#D4AF37]/60 shadow-[0_0_15px_rgba(212,175,35,0.3)] animate-pulse"></div>
          <img
            src={profileImg}
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

          {/* Sekcja kontaktowa / Media społecznościowe */}
          <div className="bg-[#1A0D16] p-6 rounded-2xl border border-[#540B0E] w-full shadow-sm">
            <h2 className="text-xs font-black text-[#D4AF37] uppercase tracking-widest mb-3 flex items-center justify-center md:justify-start gap-1.5">
              <FaGem className="text-[#1F51FF]" /> Współpraca i moje social media
            </h2>

            <p className="text-xs md:text-sm text-gray-400 mb-5 font-bold">
              Warto zaznaczyć, że na moich profilach dostępne są filmy z przygotowania przepisów krok po kroku! 🎬
            </p>

            <div className="flex flex-col gap-3">
              {/* Instagram */}
              <a
                href="https://www.instagram.com/engibadwoman?stkn=emYxdmN4eXAzcmo%3D&utm_source=qr"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-center md:justify-start gap-3 p-3 rounded-xl bg-[#0D1321] border border-[#540B0E] hover:border-[#D4AF37] hover:shadow-[0_0_8px_rgba(212,175,35,0.3)] transition-all duration-300"
              >
                <FaInstagram className="text-[#D4AF37] text-xl group-hover:scale-110 transition-transform" />
                <span className="text-sm font-bold text-[#FDFBF7] group-hover:text-[#D4AF37] transition-colors">
                  Instagram (@engibadwoman)
                </span>
              </a>

              {/* TikTok */}
              <a
                href="https://www.tiktok.com/@engibadwoman?_r=1&_t=ZN-99mPvj6dZoc"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-center md:justify-start gap-3 p-3 rounded-xl bg-[#0D1321] border border-[#540B0E] hover:border-[#E60026] hover:shadow-[0_0_8px_rgba(230,0,38,0.3)] transition-all duration-300"
              >
                <FaTiktok className="text-[#E60026] text-xl group-hover:scale-110 transition-transform" />
                <span className="text-sm font-bold text-[#FDFBF7] group-hover:text-[#E60026] transition-colors">
                  TikTok (@engibadwoman)
                </span>
              </a>

              {/* E-mail */}
              <a
                href="mailto:engibadwoman@gmail.com"
                className="group flex items-center justify-center md:justify-start gap-3 p-3 rounded-xl bg-[#0D1321] border border-[#540B0E] hover:border-[#1F51FF] hover:shadow-neon transition-all duration-300"
              >
                <FaEnvelope className="text-[#1F51FF] text-xl group-hover:scale-110 transition-transform" />
                <span className="text-sm font-bold text-[#FDFBF7] group-hover:text-[#1F51FF] transition-colors">
                  engibadwoman@gmail.com
                </span>
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}