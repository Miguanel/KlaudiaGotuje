import { useEffect, useState } from 'react';
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
}

/**
 * Lista rozdziałów, w której po kliknięciu rozdziału jego podrozdziały
 * płynnie się rozwijają (a poprzednio otwarty rozdział się zwija).
 */
export default function ChapterAccordion({ chapters, activeSlug, twoColumns = false }: Props) {
  // Rozdział, w którym jest aktualnie wybrana kategoria – otwarty na starcie
  const activeChapterId = chapters.find(ch => ch.slug === activeSlug || ch.children.some(s => s.slug === activeSlug))?.id ?? null;
  const [openId, setOpenId] = useState<string | null>(activeChapterId);

  useEffect(() => { setOpenId(activeChapterId); }, [activeChapterId]);

  return (
    <ul className={twoColumns ? 'grid md:grid-cols-2 gap-x-6 gap-y-2 items-start' : 'space-y-2'}>
      {chapters.map(ch => {
        const Icon = chapterIcon(ch.name);
        const open = openId === ch.id;
        const panelId = `rozdzial-${ch.id}`;
        return (
          <li
            key={ch.id}
            className={`rounded-2xl border transition-all duration-300 ${open ? 'border-cobalt/40 bg-card shadow-glow' : 'border-line bg-card/60 hover:border-cobalt/30 hover:shadow-glow'}`}
          >
            <button
              type="button"
              onClick={() => setOpenId(open ? null : ch.id)}
              aria-expanded={open}
              aria-controls={panelId}
              className="w-full flex items-center gap-3 px-4 py-3 text-left"
            >
              <span className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center transition-colors duration-300 ${open ? 'bg-burgundy text-gold border border-gold/40' : 'bg-burgundy/50 text-gold border border-burgundy'}`}>
                <Icon className="text-xl" />
              </span>
              <span className={`flex-1 font-display uppercase tracking-wide text-base sm:text-lg transition-colors ${open ? 'text-gold' : 'text-cream'}`}>
                {ch.name}
              </span>
              <span className="text-xs text-muted hidden sm:inline">{ch.children.length}</span>
              <FaChevronDown className={`text-muted transition-transform duration-300 ${open ? 'rotate-180 text-gold' : ''}`} />
            </button>

            {/* Animowane rozwijanie: grid-rows 0fr → 1fr */}
            <div
              id={panelId}
              className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
            >
              <div className="overflow-hidden min-h-0">
                <div className="flex flex-wrap gap-2 px-4 pb-4 pt-1">
                  <Link
                    to={`/?category=${ch.slug}`}
                    tabIndex={open ? 0 : -1}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition ${
                      activeSlug === ch.slug ? 'bg-chili border-chili text-white' : 'border-gold/50 text-gold hover:bg-gold/10'
                    }`}
                  >
                    Cały rozdział <FaArrowRight className="text-[10px]" />
                  </Link>
                  {ch.children.map(sub => (
                    <Link
                      key={sub.id}
                      to={`/?category=${sub.slug}`}
                      tabIndex={open ? 0 : -1}
                      className={`px-3 py-1.5 rounded-full text-xs border transition ${
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
