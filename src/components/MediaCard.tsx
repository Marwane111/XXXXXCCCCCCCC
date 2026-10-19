import React, { useState } from 'react';
import { Play, Plus, Check, Info, Star } from 'lucide-react';
import { MediaItem, Language, WatchProgress } from '../types.ts';
import { useTranslation } from '../i18n/translations.ts';

interface MediaCardProps {
  item: MediaItem;
  onPlay: (item: MediaItem) => void;
  onOpenDetails: (item: MediaItem) => void;
  onToggleList: (item: MediaItem) => void;
  isSaved: boolean;
  progress?: WatchProgress;
  compact?: boolean;
  currentLang: Language;
}

export const MediaCard: React.FC<MediaCardProps> = ({
  item,
  onPlay,
  onOpenDetails,
  onToggleList,
  isSaved,
  progress,
  compact = false,
  currentLang,
}) => {
  const [imgError, setImgError] = useState(false);
  const t = useTranslation(currentLang);

  const fallbackPoster = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=80';
  const displayImage = imgError ? fallbackPoster : (item.poster || item.backdrop || fallbackPoster);

  return (
    <div
      className={`relative group shrink-0 transition-all duration-300 select-none ${
        compact ? 'w-28 sm:w-36 md:w-44' : 'w-36 sm:w-44 md:w-52 lg:w-56'
      }`}
    >
      {/* Poster Image Container */}
      <div
        onClick={() => onOpenDetails(item)}
        className="relative aspect-[2/3] w-full rounded-md overflow-hidden bg-zinc-900 border border-zinc-800/80 cursor-pointer shadow-md group-hover:shadow-2xl transition-all"
      >
        <img
          src={displayImage}
          alt={item.title}
          loading="lazy"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Quality or Type Badge */}
        <div className="absolute top-2 left-2 flex items-center gap-1">
          {(item as any).badgeTag ? (
            <span className="bg-[#e50914] text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow flex items-center gap-1 uppercase tracking-wider">
              {(item as any).badgeTag}
            </span>
          ) : (
            <>
              {item.quality && (
                <span className="bg-black/75 backdrop-blur-sm text-[10px] font-bold text-zinc-200 px-1.5 py-0.5 rounded border border-white/10 shadow-sm">
                  {item.quality}
                </span>
              )}
              {item.type === 'tv' && (
                <span className="bg-[#e50914]/90 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider shadow">
                  SERIES
                </span>
              )}
            </>
          )}
        </div>

        {/* Rating star on top right */}
        {item.rating && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/70 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] text-amber-400 font-bold border border-white/10">
            <Star className="w-2.5 h-2.5 fill-amber-400" />
            <span>{item.rating.toFixed(1)}</span>
          </div>
        )}

        {/* Quick Play Overlay Button (Desktop Hover + Mobile Visible Play Badge) */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPlay(item);
            }}
            className="w-12 h-12 rounded-full bg-white text-black hover:bg-zinc-200 flex items-center justify-center shadow-xl transform scale-95 hover:scale-105 active:scale-90 transition cursor-pointer"
            title="Play Video"
          >
            <Play className="w-6 h-6 fill-black translate-x-0.5" />
          </button>
        </div>

        {/* Continue watching progress bar */}
        {progress && progress.percentage > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-zinc-800">
            <div
              className="h-full bg-[#e50914] shadow-sm"
              style={{ width: `${Math.min(100, Math.max(5, progress.percentage))}%` }}
            />
          </div>
        )}
      </div>

      {/* Card Info Below Poster */}
      <div className="mt-2 px-1">
        <div className="flex items-start justify-between gap-1">
          <h4
            onClick={() => onOpenDetails(item)}
            className="text-xs sm:text-sm font-semibold text-zinc-100 truncate group-hover:text-white transition cursor-pointer flex-1"
          >
            {item.title}
          </h4>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPlay(item);
            }}
            className="p-1 rounded text-zinc-300 hover:text-white hover:bg-zinc-800 transition cursor-pointer shrink-0"
            title="Play Now"
          >
            <Play className="w-3.5 h-3.5 fill-current text-[#e50914]" />
          </button>
        </div>

        <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-1">
          <div className="flex items-center gap-1.5">
            {item.matchScore && (
              <span className="text-emerald-400 font-bold">{item.matchScore}%</span>
            )}
            <span>{item.year}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleList(item);
              }}
              className={`p-1 rounded-full transition cursor-pointer ${
                isSaved ? 'text-emerald-400' : 'text-zinc-400 hover:text-white'
              }`}
              title={isSaved ? 'Remove from My List' : 'Add to My List'}
            >
              {isSaved ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenDetails(item);
              }}
              className="p-1 text-zinc-400 hover:text-white rounded-full transition cursor-pointer"
              title="More Info"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {item.genres && item.genres.length > 0 && (
          <p className="text-[10px] text-zinc-500 truncate mt-0.5">
            {item.genres.slice(0, 2).join(' • ')}
          </p>
        )}
      </div>
    </div>
  );
};
