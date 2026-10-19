import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MediaItem, Language, WatchProgress } from '../types.ts';
import { MediaCard } from './MediaCard.tsx';

interface MediaRowProps {
  title: string;
  items: MediaItem[];
  onPlay: (item: MediaItem) => void;
  onOpenDetails: (item: MediaItem) => void;
  onToggleList: (item: MediaItem) => void;
  isInList: (item: MediaItem) => boolean;
  progressMap?: Record<string, WatchProgress>;
  compact?: boolean;
  currentLang: Language;
}

export const MediaRow: React.FC<MediaRowProps> = ({
  title,
  items,
  onPlay,
  onOpenDetails,
  onToggleList,
  isInList,
  progressMap = {},
  compact = false,
  currentLang,
}) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  if (!items || items.length === 0) return null;

  const checkScroll = () => {
    if (rowRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
      setCanScrollLeft(Math.abs(scrollLeft) > 10);
      setCanScrollRight(Math.abs(scrollLeft) + clientWidth < scrollWidth - 10);
    }
  };

  const handleScroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const scrollAmount = rowRef.current.clientWidth * 0.75;
      const factor = currentLang === 'ar' ? (direction === 'left' ? 1 : -1) : (direction === 'left' ? -1 : 1);
      rowRef.current.scrollBy({
        left: factor * scrollAmount,
        behavior: 'smooth',
      });
      setTimeout(checkScroll, 350);
    }
  };

  return (
    <section className="relative px-4 md:px-12 my-6 md:my-8 group/row select-none">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg md:text-xl font-bold text-white tracking-wide hover:text-[#e50914] transition cursor-pointer flex items-center gap-2">
          <span>{title}</span>
          <span className="text-xs font-semibold text-zinc-500 bg-zinc-800/80 px-2 py-0.5 rounded">
            {items.length}
          </span>
        </h2>
      </div>

      <div className="relative">
        {/* Left Arrow Button */}
        <button
          type="button"
          onClick={() => handleScroll('left')}
          className="absolute -left-2 md:-left-6 top-1/2 -translate-y-1/2 z-20 h-28 w-8 md:w-10 bg-black/70 hover:bg-black/90 text-white flex items-center justify-center rounded-r-md opacity-0 group-hover/row:opacity-100 transition-opacity backdrop-blur-sm cursor-pointer border-y border-r border-zinc-700 shadow-xl"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-6 h-6 rtl:rotate-180" />
        </button>

        {/* Scrollable Container */}
        <div
          ref={rowRef}
          onScroll={checkScroll}
          className="flex items-start gap-3 md:gap-4 overflow-x-auto no-scrollbar scroll-smooth py-2"
        >
          {items.map((item) => (
            <MediaCard
              key={`${item.type}-${item.id}`}
              item={item}
              onPlay={onPlay}
              onOpenDetails={onOpenDetails}
              onToggleList={onToggleList}
              isSaved={isInList(item)}
              progress={progressMap[item.imdb_id] || progressMap[item.id]}
              compact={compact}
              currentLang={currentLang}
            />
          ))}
        </div>

        {/* Right Arrow Button */}
        <button
          type="button"
          onClick={() => handleScroll('right')}
          className="absolute -right-2 md:-right-6 top-1/2 -translate-y-1/2 z-20 h-28 w-8 md:w-10 bg-black/70 hover:bg-black/90 text-white flex items-center justify-center rounded-l-md opacity-0 group-hover/row:opacity-100 transition-opacity backdrop-blur-sm cursor-pointer border-y border-l border-zinc-700 shadow-xl"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-6 h-6 rtl:rotate-180" />
        </button>
      </div>
    </section>
  );
};
