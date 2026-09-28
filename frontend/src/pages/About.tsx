import { FaCrown, FaEnvelope, FaInstagram, FaTiktok } from 'react-icons/fa';
import profileImg from '../assets/engibadwoman.jpg';

const socials = [
  { href: 'https://www.instagram.com/engibadwoman?stkn=emYxdmN4eXAzcmo%3D&utm_source=qr', icon: FaInstagram, label: 'Instagram', handle: '@engibadwoman', external: true },
  { href: 'https://www.tiktok.com/@engibadwoman?_r=1&_t=ZN-99mPvj6dZoc', icon: FaTiktok, label: 'TikTok', handle: '@engibadwoman', external: true },
  { href: 'mailto:engibadwoman@gmail.com', icon: FaEnvelope, label: 'E-mail', handle: 'engibadwoman@gmail.com', external: false },
];

export default function About() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10 sm:py-16">
      <div className="grid md:grid-cols-[320px_1fr] gap-10 md:gap-14 items-start">

        {/* ZDJĘCIE */}
        <div className="flex justify-center md:sticky md:top-36">
          <div className="relative w-56 h-56 sm:w-72 sm:h-72 mt-8">
            <FaCrown className="absolute -top-10 left-1/2 -translate-x-1/2 text-gold text-5xl z-10 drop-shadow-[0_0_14px_rgba(244,199,82,0.7)]" />
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-pink via-pink/40 to-gold p-[3px] shadow-neon">
              <img src={profileImg} alt="Engibadwoman" className="w-full h-full rounded-full object-cover bg-ink" />
            </div>
          </div>
        </div>

        {/* TEKST */}
        <div>
          <p className="font-script text-pink text-4xl">Cześć!</p>
          <h1 className="font-display uppercase tracking-wide text-4xl sm:text-5xl leading-none mb-6">
            <span className="text-cream">Tu </span><span className="text-gold">Engibadwoman</span>
          </h1>

          <div className="space-y-4 text-base sm:text-lg leading-relaxed text-cream/90">
            <p>
              Witaj w moim ekskluzywnym kulinarnym świecie, gdzie zasady dyktuje smak, a kompromisy nie istnieją. Jestem kobietą nadwyraz wybredną – jeśli coś trafia na mój talerz, musi być po prostu perfekcyjne. Mój czarny humor to tylko część mnie, ale to właśnie dzięki temu specyficznemu podejściu do życia tworzę dania zupełnie inne niż wszystkie. Kuchnia to dla mnie sztuka, magia i wolność.
            </p>
            <p>
              Nie znajdziesz tu nudy. Przełamuję schematy i łączę kuchnię tradycyjną, nowoczesną oraz potrawy na diecie. <strong className="text-pink-soft">Sama schudłam prawie 50 kg</strong> i chętnie pokażę Ci, jak to zrobiłam! Ale uwaga – nie mam zamiaru ograniczać się do nudnych, „suchych” fit porad czy wyłącznie niskokalorycznych przepisów. Gotuję zdrowo, mądrze i z ogromną pasją, ale przede wszystkim: gotuję z charakterem. Znajdziesz tu zarówno lekkie, wysokobiałkowe posiłki, jak i domowe pieczywo czy rozpustne desery.
            </p>
            <p>Rozgość się w mojej księdze przepisów i odkryj smaki w wersji premium!</p>
          </div>

          <div className="mt-10 bg-card border border-line rounded-3xl p-5 sm:p-6">
            <h2 className="label-pill mb-3">Współpraca i social media</h2>
            <p className="text-sm text-muted mb-5">Na moich profilach znajdziesz filmy z przygotowania przepisów krok po kroku.</p>
            <div className="grid sm:grid-cols-3 gap-3">
              {socials.map(({ href, icon: Icon, label, handle, external }) => (
                <a
                  key={label}
                  href={href}
                  {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="group flex items-center gap-3 p-3 rounded-2xl bg-ink/60 border border-line hover:border-pink hover:shadow-neon transition"
                >
                  <span className="w-10 h-10 shrink-0 rounded-full bg-pink/15 flex items-center justify-center">
                    <Icon className="text-pink text-lg" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs text-muted">{label}</span>
                    <span className="block text-sm font-semibold text-cream truncate">{handle}</span>
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
