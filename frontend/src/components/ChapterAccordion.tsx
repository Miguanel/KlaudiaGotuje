import { useEffect, useState } from 'react';
import type React from 'react';
import { Link } from 'react-router-dom';
import { FaChevronDown, FaArrowRight } from 'react-icons/fa';
import type { Chapter } from '../hooks/useCategories';
import { chapterIcon } from '../utils/chapterIcons';

interface Props {
  chapters: Chapter[];
  /** slug aktualnie wybranej kategorii (rozdziału lub podrozdziału) */
  activeSlug?: string | null;
  /** układ w dwóch kolumnach (menu na komputerze) */
  twoColumns?: boolean;
  /** kafelki pojawiają się kaskadowo przy otwieraniu menu (klasa .menu-item) */
  staggered?: boolean;
}

/**
 * Lista rozdziałów, w której po kliknięciu rozdziału jego podrozdziały
 * płynnie się rozwijają (a poprzednio otwarty rozdział się zwija).
 */
export default function ChapterAccordion({ chapters, activeSlug, twoColumns = false, staggered = false }: Props) {
  // Rozdział, w którym jest aktualnie wybrana kategoria – otwarty na starcie
  const activeChapterId = chapters.find(ch => ch.slug === activeSlug || ch.children.some(s => s.slug === activeSlug))?.id ?? null;
  const [openId, setOpenId] = useState<string | null>(activeChapterId);

  useEffect(() => { setOpenId(activeChapterId); }, [activeChapterId]);

  return (
    <ul className={twoColumns ? 'grid md:grid-cols-2 gap-x-6 gap-y-2 items-start' : 'space-y-2'}>
      {chapters.map((ch, idx) => {
        const Icon = chapterIcon(ch.name);
        const open = openId === ch.id;
        const panelId = `rozdzial-${ch.id}`;
        return (
          <li
            key={ch.id}
            data-open={open}
            style={{ '--i': idx } as React.CSSProperties}
            className={`${staggered ? 'menu-item ' : ''}rounded-2xl border backdrop-blur-sm transition-[border-color,background-color,box-shadow] duration-500 ${open ? 'border-gold/50 bg-card/85 shadow-glow' : 'border-gold/15 bg-card/55 hover:border-gold/40 hover:bg-card/70 hover:shadow-glow'}`}
          >
            <button
              type="button"
              onClick={() => setOpenId(open ? null : ch.id)}
              aria-expanded={open}
              aria-controls={panelId}
              className="group/acc w-full flex items-center gap-3 px-4 py-3 text-left"
            >
              <span className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(.34,1.56,.64,1)] ${open ? 'bg-burgundy text-gold border border-gold/60 -rotate-12 scale-110 shadow-[0_0_14px_rgba(212,175,55,0.45)]' : 'bg-burgundy/50 text-gold border border-burgundy group-hover/acc:scale-105 group-hover/acc:-rotate-6'}`}>
                <Icon className="text-xl" />
              </span>
              <span className={`flex-1 font-display uppercase tracking-wide text-[15px] leading-snug sm:text-lg transition-colors ${open ? 'text-gold' : 'text-cream'}`}>
                {ch.name}
              </span>
              <span className="text-xs text-muted hidden sm:inline">{ch.children.length}</span>
              <FaChevronDown className={`text-muted transition-transform duration-500 ease-[cubic-bezier(.34,1.56,.64,1)] ${open ? 'rotate-180 text-gold' : 'group-hover/acc:translate-y-0.5'}`} />
            </button>

            {/* Animowane rozwijanie: grid-rows 0fr → 1fr */}
            <div
              id={panelId}
              className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(.22,1,.36,1)] ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
            >
              <div className="overflow-hidden min-h-0">
                <div className="flex flex-wrap gap-2 px-4 pb-4 pt-1">
                  <Link
                    to={`/?category=${ch.slug}`}
                    tabIndex={open ? 0 : -1}
                    style={{ '--i': 0 } as React.CSSProperties}
                    className={`sub-pill inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition ${
                      activeSlug === ch.slug ? 'bg-chili border-chili text-white' : 'border-gold/50 text-gold hover:bg-gold/10'
                    }`}
                  >
                    Cały rozdział <FaArrowRight className="text-[10px]" />
                  </Link>
                  {ch.children.map((sub, i) => (
                    <Link
                      key={sub.id}
                      to={`/?category=${sub.slug}`}
                      tabIndex={open ? 0 : -1}
                      style={{ '--i': i + 1 } as React.CSSProperties}
                      className={`sub-pill px-3 py-1.5 rounded-full text-xs border transition ${
                        activeSlug === sub.slug
                          ? 'bg-chili border-chili text-white font-semibold'
                          : 'bg-burgundy/80 border-gold/25 text-cream hover:bg-burgundy hover:border-gold hover:text-gold'
                      }`}
                    >
                      {sub.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
