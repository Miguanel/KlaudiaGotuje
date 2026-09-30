import type { CSSProperties, ReactNode } from 'react';
import rogLG from '../assets/menu/rog-lg.webp';
import rogPG from '../assets/menu/rog-pg.webp';
import rogLD from '../assets/menu/rog-ld.webp';
import rogPD from '../assets/menu/rog-pd.webp';
import ornamentG from '../assets/menu/ornament-g.webp';
import ornamentD from '../assets/menu/ornament-d.webp';
import bokL from '../assets/menu/bok-l.webp';
import bokP from '../assets/menu/bok-p.webp';
import wypelnienie from '../assets/menu/wypelnienie.jpg';

/*
 * Ozdobna złota ramka (grafika grafiki/noweTloMenu.png) – RESPONSYWNA.
 *
 * Zamiast rozciągać jeden obraz (korona, świece i desery by się zniekształcały), grafika jest pocięta na części:
 * 4 narożniki, korona u góry, ornament na dole, ozdoby na środku obu boków i aksamitne wypełnienie.
 * Podwójna złota linia ramki jest rysowana w CSS, więc ramka pasuje do każdej szerokości i wysokości
 * (także gdy rozdziały w menu się rozwijają). Części mają miękko wygaszone brzegi – brak widocznych łączeń.
 *
 * Skala `--s` (1 = oryginał 1024 px szerokości) ustawiana w index.css (.ornate-frame).
 * Wszystkie odległości poniżej to piksele oryginału × skala.
 */
const FRAME = { top: 186, left: 124, right: 125, bottom: 193 };

export default function OrnateFrame({ children, className = '' }: { children: ReactNode; className?: string }) {
  const piece = 'absolute pointer-events-none select-none h-auto';
  const px = (n: number) => `calc(var(--s) * ${n}px)`;

  return (
    <div
      className={`ornate-frame relative isolate overflow-hidden rounded-[calc(var(--s)*36px)] ${className}`}
      style={{
        backgroundImage: `linear-gradient(rgba(7,11,28,0.15), rgba(7,11,28,0.35)), url(${wypelnienie})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      } as CSSProperties}
    >
      {/* podwójna złota linia ramki (pod ozdobami – tam, gdzie są, widać ramkę z grafiki) */}
      <div
        aria-hidden="true"
        className="absolute pointer-events-none border-double border-[#D9B25A] shadow-[0_0_10px_rgba(212,175,55,0.45),inset_0_0_10px_rgba(212,175,55,0.2)]"
        style={{
          top: px(FRAME.top), left: px(FRAME.left), right: px(FRAME.right), bottom: px(FRAME.bottom),
          borderWidth: `max(3px, calc(var(--s) * 9px))`,
          borderRadius: px(24),
        }}
      />

      {/* ozdoby na brzegach */}
      <img src={bokL} alt="" aria-hidden="true" className={`${piece} left-0 top-1/2 -translate-y-1/2`} style={{ width: px(210) }} />
      <img src={bokP} alt="" aria-hidden="true" className={`${piece} right-0 top-1/2 -translate-y-1/2`} style={{ width: px(210) }} />
      <img src={rogLG} alt="" aria-hidden="true" className={`${piece} top-0 left-0`} style={{ width: px(430) }} />
      <img src={rogPG} alt="" aria-hidden="true" className={`${piece} top-0 right-0`} style={{ width: px(430) }} />
      <img src={rogLD} alt="" aria-hidden="true" className={`${piece} bottom-0 left-0`} style={{ width: px(430) }} />
      <img src={rogPD} alt="" aria-hidden="true" className={`${piece} bottom-0 right-0`} style={{ width: px(430) }} />

      <img src={ornamentG} alt="" aria-hidden="true" className={`${piece} top-0 left-1/2 -translate-x-1/2`} style={{ width: px(424) }} />
      <img src={ornamentD} alt="" aria-hidden="true" className={`${piece} bottom-0 left-1/2 -translate-x-1/2`} style={{ width: px(424) }} />

      {/* treść – zawsze wewnątrz ramki */}
      <div
        className="relative"
        style={{
          paddingTop: `calc(var(--s) * ${FRAME.top}px + 1.75rem)`,
          paddingBottom: `calc(var(--s) * ${FRAME.bottom}px + 1.75rem)`,
          paddingLeft: `calc(var(--s) * ${FRAME.left}px + 0.8rem)`,
          paddingRight: `calc(var(--s) * ${FRAME.right}px + 0.8rem)`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
