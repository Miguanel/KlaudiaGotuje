import type { CSSProperties, ReactNode } from 'react';
import rogLG from '../assets/menu/rog-lg.webp';
import rogPG from '../assets/menu/rog-pg.webp';
import rogLD from '../assets/menu/rog-ld.webp';
import rogPD from '../assets/menu/rog-pd.webp';
import ornamentG from '../assets/menu/ornament-g.webp';
import ornamentD from '../assets/menu/ornament-d.webp';
import wypelnienie from '../assets/menu/wypelnienie.jpg';

/*
 * Ozdobna złota ramka (grafika tloMenu z projektu) – RESPONSYWNA.
 *
 * Zamiast rozciągać jeden obraz (korona i owoce by się zniekształcały), grafika jest pocięta na części:
 * 4 narożniki, ornament z koroną u góry, ornament na dole i aksamitne wypełnienie.
 * Złota linia ramki jest rysowana w CSS, więc ramka pasuje do każdej szerokości i wysokości
 * (także gdy rozdziały w menu się rozwijają). Części mają miękko wygaszone brzegi – brak widocznych łączeń.
 *
 * Skala `--s` (1 = oryginał 1024 px szerokości): telefon 0.36, komputer 0.5.
 * Wszystkie odległości poniżej to piksele oryginału × skala.
 */
export default function OrnateFrame({ children, className = '' }: { children: ReactNode; className?: string }) {
  const piece = 'absolute pointer-events-none select-none h-auto';
  const px = (n: number) => `calc(var(--s) * ${n}px)`;

  return (
    <div
      className={`ornate-frame relative isolate overflow-hidden rounded-[calc(var(--s)*28px)] ${className}`}
      style={{
        backgroundImage: `linear-gradient(rgba(7,11,28,0.25), rgba(7,11,28,0.45)), url(${wypelnienie})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      } as CSSProperties}
    >
      {/* złota linia ramki */}
      <div
        aria-hidden="true"
        className="absolute pointer-events-none border-[1.5px] border-gold/85 shadow-[0_0_8px_rgba(212,175,55,0.35),inset_0_0_8px_rgba(212,175,55,0.12)]"
        style={{ top: px(104), left: px(71), right: px(70), bottom: px(96), borderRadius: px(26) }}
      />

      {/* ozdoby */}
      <img src={rogLG} alt="" aria-hidden="true" className={`${piece} top-0 left-0`} style={{ width: px(320) }} />
      <img src={rogPG} alt="" aria-hidden="true" className={`${piece} top-0 right-0`} style={{ width: px(320) }} />
      <img src={rogLD} alt="" aria-hidden="true" className={`${piece} bottom-0 left-0`} style={{ width: px(320) }} />
      <img src={rogPD} alt="" aria-hidden="true" className={`${piece} bottom-0 right-0`} style={{ width: px(320) }} />
      <img src={ornamentG} alt="" aria-hidden="true" className={`${piece} top-0 left-1/2 -translate-x-1/2`} style={{ width: px(424) }} />
      <img src={ornamentD} alt="" aria-hidden="true" className={`${piece} bottom-0 left-1/2 -translate-x-1/2`} style={{ width: px(424) }} />

      {/* treść – zawsze wewnątrz ramki */}
      <div
        className="relative"
        style={{
          paddingTop: `calc(var(--s) * 104px + 2.25rem)`,
          paddingBottom: `calc(var(--s) * 96px + 2.25rem)`,
          paddingLeft: `calc(var(--s) * 71px + 0.9rem)`,
          paddingRight: `calc(var(--s) * 70px + 0.9rem)`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
