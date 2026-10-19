import React, { useState, useEffect } from 'react';
import { Play, Info, Plus, Check, Volume2, VolumeX, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { MediaItem, Language } from '../types.ts';
import { useTranslation } from '../i18n/translations.ts';

interface BillboardHeroProps {
  items: MediaItem[];
  onPlay: (item: MediaItem) => void;
  onOpenDetails: (item: MediaItem) => void;
  onToggleList: (item: MediaItem) => void;
  isInList: (item: MediaItem) => boolean;
  currentLang: Language;
}

export const BillboardHero: React.FC<BillboardHeroProps> = ({
  items,
  onPlay,
  onOpenDetails,
  onToggleList,
  isInList,
  currentLang,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const t = useTranslation(currentLang);

  const heroItem = items[currentIndex] || items[0];

  useEffect(() => {
    if (items.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 9000);
    return () => clearInterval(interval);
  }, [items.length]);

  if (!heroItem) return null;

  const isSaved = isInList(heroItem);

  const [imgError, setImgError] = useState(false);
  const fallbackBackdrop = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1280&auto=format&fit=crop&q=80';
  const heroImage = imgError ? fallbackBackdrop : (heroItem.backdrop || heroItem.poster || fallbackBackdrop);

  return (
    <div className="relative w-full min-h-[560px] sm:min-h-[620px] md:min-h-[680px] lg:h-[88vh] overflow-hidden select-none">
      {/* Background Image & Ambient Gradients */}
      <div className="absolute inset-0">
        <img
          key={heroItem.id}
          src={heroImage}
          alt={heroItem.title}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover object-center animate-in fade-in duration-700 filter brightness-90 transition-transform duration-10000"
        />

        {/* Cinematic Vignette Overlays (Netflix Signature) */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/40 to-black/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/60 to-transparent rtl:bg-gradient-to-l" />
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#141414] via-[#141414]/90 to-transparent" />
      </div>

      {/* Hero Content Information with safe padding */}
      <div className="relative z-10 h-full max-w-7xl mx-auto px-4 md:px-12 flex flex-col justify-end pb-20 sm:pb-24 md:pb-28">
        <div className="max-w-2xl space-y-4">
          {/* Top 10 or Featured Badge */}
          {heroItem.isTop10 && (
            <div className="flex items-center gap-2">
              <span className="bg-[#e50914] text-white text-[11px] font-black px-2 py-0.5 rounded tracking-wide uppercase shadow-md flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                TOP 10
              </span>
              <span className="text-xs md:text-sm font-bold text-white tracking-wide">
                #{heroItem.top10Rank || 1} {t.top10Today}
              </span>
            </div>
          )}

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] leading-none font-brand">
            {heroItem.title}
          </h1>

          {/* Metadata badges */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs md:text-sm font-semibold text-zinc-300">
            {heroItem.matchScore && (
              <span className="text-emerald-400 font-bold">
                {heroItem.matchScore}% {t.match}
              </span>
            )}
            <span className="text-zinc-400">{heroItem.year}</span>
            <span className="border border-zinc-500/80 px-1.5 py-0.5 rounded text-[11px] font-bold text-zinc-200">
              {heroItem.ageRating || '16+'}
            </span>
            <span className="bg-zinc-800/80 px-1.5 py-0.5 rounded text-[11px] font-bold text-zinc-300 border border-zinc-700">
              {heroItem.quality || '1080p'}
            </span>
            {heroItem.duration && (
              <span className="text-zinc-400">{heroItem.duration}</span>
            )}
            {heroItem.genres && heroItem.genres.length > 0 && (
              <span className="hidden sm:inline-block text-zinc-400 text-xs">
                • {heroItem.genres.slice(0, 3).join(' • ')}
              </span>
            )}
          </div>

          {/* Synopsis */}
          <p className="text-xs sm:text-sm md:text-base text-zinc-300 line-clamp-3 md:line-clamp-4 max-w-xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] leading-relaxed font-light">
            {heroItem.overview}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => onPlay(heroItem)}
              className="flex items-center gap-2 bg-white text-black hover:bg-zinc-200 px-6 py-2.5 md:py-3 rounded-md font-bold text-sm md:text-base shadow-xl transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-black text-black" />
              <span>{t.play}</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenDetails(heroItem)}
              className="flex items-center gap-2 bg-zinc-600/70 hover:bg-zinc-600/90 text-white backdrop-blur-md px-5 py-2.5 md:py-3 rounded-md font-semibold text-sm md:text-base transition-all transform hover:scale-105 active:scale-95 cursor-pointer border border-white/10"
            >
              <Info className="w-5 h-5" />
              <span>{t.moreInfo}</span>
            </button>

            <button
              type="button"
              onClick={() => onToggleList(heroItem)}
              className={`p-2.5 md:p-3 rounded-full border transition-all cursor-pointer ${
                isSaved
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                  : 'bg-zinc-800/80 border-zinc-600 text-white hover:bg-zinc-700'
              }`}
              title={isSaved ? t.removeFromList : t.addToList}
            >
              {isSaved ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Right Controls: Maturity Rating & Carousel Switchers */}
      <div className="absolute right-0 rtl:right-auto rtl:left-0 bottom-24 md:bottom-28 z-20 flex items-center gap-3 px-4 md:px-12">
        <button
          type="button"
          onClick={() => setIsMuted(!isMuted)}
          className="p-2.5 rounded-full border border-zinc-600 bg-black/60 text-white hover:bg-black/90 transition cursor-pointer"
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-[#e50914]" />}
        </button>

        <div className="border-l-2 rtl:border-l-0 rtl:border-r-2 border-zinc-400 bg-black/50 text-zinc-300 text-xs px-3 py-1 font-bold">
          {heroItem.ageRating || '16+'}
        </div>

        {items.length > 1 && (
          <div className="hidden sm:flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded-full border border-zinc-800">
            <button
              type="button"
              onClick={() => setCurrentIndex((prev) => (prev - 1 + items.length) % items.length)}
              className="text-zinc-400 hover:text-white p-1 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
            </button>
            <div className="flex gap-1">
              {items.slice(0, 6).map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    currentIndex === idx ? 'w-5 bg-[#e50914]' : 'w-1.5 bg-zinc-600'
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => setCurrentIndex((prev) => (prev + 1) % items.length)}
              className="text-zinc-400 hover:text-white p-1 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4 rtl:rotate-180" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
