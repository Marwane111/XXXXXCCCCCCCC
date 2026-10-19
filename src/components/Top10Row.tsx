import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { MediaItem, Language } from '../types.ts';
import { useTranslation } from '../i18n/translations.ts';

interface Top10RowProps {
  items: MediaItem[];
  onPlay: (item: MediaItem) => void;
  onOpenDetails: (item: MediaItem) => void;
  currentLang: Language;
}

export const Top10Row: React.FC<Top10RowProps> = ({
  items,
  onPlay,
  onOpenDetails,
  currentLang,
}) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const t = useTranslation(currentLang);

  const top10 = items.slice(0, 10);
  if (top10.length === 0) return null;

  const handleScroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const scrollAmount = rowRef.current.clientWidth * 0.7;
      const factor = currentLang === 'ar' ? (direction === 'left' ? 1 : -1) : (direction === 'left' ? -1 : 1);
      rowRef.current.scrollBy({
        left: factor * scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="relative px-4 md:px-12 my-8 md:my-10 group/row select-none">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-1.5 h-5 bg-[#e50914] rounded-full inline-block" />
        <h2 className="text-lg md:text-xl font-bold text-white tracking-wide flex items-center gap-2">
          <span>{t.top10Movies}</span>
          <span className="text-[11px] font-bold text-[#e50914] border border-[#e50914]/40 bg-[#e50914]/10 px-2 py-0.5 rounded flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            TODAY
          </span>
        </h2>
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => handleScroll('left')}
          className="absolute -left-2 md:-left-6 top-1/2 -translate-y-1/2 z-20 h-32 w-8 md:w-10 bg-black/70 hover:bg-black/90 text-white flex items-center justify-center rounded-r-md opacity-0 group-hover/row:opacity-100 transition-opacity backdrop-blur-sm cursor-pointer border-y border-r border-zinc-700 shadow-xl"
        >
          <ChevronLeft className="w-6 h-6 rtl:rotate-180" />
        </button>

        <div
          ref={rowRef}
          className="flex items-center gap-6 overflow-x-auto no-scrollbar scroll-smooth py-3"
        >
          {top10.map((item, index) => {
            const rank = index + 1;
            return (
              <div
                key={item.id}
                onClick={() => onOpenDetails(item)}
                className="relative flex items-end shrink-0 cursor-pointer group/card transition-transform duration-300 hover:scale-105"
              >
                {/* Giant Netflix Outlined Number */}
                <div className="relative select-none pointer-events-none -mr-4 md:-mr-6 rtl:-mr-0 rtl:-ml-4 rtl:md:-ml-6 z-0">
                  <span
                    className="text-7xl sm:text-8xl md:text-9xl font-black font-brand tracking-tighter text-[#181818] leading-none"
                    style={{
                      WebkitTextStroke: '3px #595959',
                      textShadow: '0 8px 16px rgba(0,0,0,0.9)',
                    }}
                  >
                    {rank}
                  </span>
                </div>

                {/* Poster Card */}
                <div className="relative z-10 w-28 sm:w-36 md:w-44 aspect-[2/3] rounded-md overflow-hidden bg-zinc-900 border border-zinc-800 shadow-xl group-hover/card:border-zinc-500 transition">
                  <img
                    src={item.poster || item.backdrop}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity flex flex-col justify-end p-2">
                    <p className="text-xs font-bold text-white truncate">{item.title}</p>
                    <span className="text-[10px] text-emerald-400 font-semibold">{item.quality || '1080p'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => handleScroll('right')}
          className="absolute -right-2 md:-right-6 top-1/2 -translate-y-1/2 z-20 h-32 w-8 md:w-10 bg-black/70 hover:bg-black/90 text-white flex items-center justify-center rounded-l-md opacity-0 group-hover/row:opacity-100 transition-opacity backdrop-blur-sm cursor-pointer border-y border-l border-zinc-700 shadow-xl"
        >
          <ChevronRight className="w-6 h-6 rtl:rotate-180" />
        </button>
      </div>
    </section>
  );
};
