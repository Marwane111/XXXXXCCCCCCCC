import React from 'react';
import { Play, X, Clock } from 'lucide-react';
import { WatchProgress, MediaItem, Language } from '../types.ts';
import { useTranslation } from '../i18n/translations.ts';

interface ContinueWatchingRowProps {
  progressList: WatchProgress[];
  onPlayResume: (progress: WatchProgress) => void;
  onOpenDetails: (item: MediaItem) => void;
  onRemoveProgress: (id: string) => void;
  currentLang: Language;
}

export const ContinueWatchingRow: React.FC<ContinueWatchingRowProps> = ({
  progressList,
  onPlayResume,
  onOpenDetails,
  onRemoveProgress,
  currentLang,
}) => {
  const t = useTranslation(currentLang);

  if (!progressList || progressList.length === 0) return null;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const hours = Math.floor(mins / 60);
    const remMins = mins % 60;
    if (hours > 0) {
      return `${hours}h ${remMins}m`;
    }
    return `${mins}m`;
  };

  return (
    <section className="px-4 md:px-12 my-6 md:my-8 select-none">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-5 h-5 text-[#e50914]" />
        <h2 className="text-lg md:text-xl font-bold text-white tracking-wide">
          {t.continueWatching}
        </h2>
      </div>

      <div className="flex items-start gap-4 overflow-x-auto no-scrollbar py-2">
        {progressList.map((prog) => {
          const mediaObj: MediaItem = {
            id: prog.id,
            imdb_id: prog.imdb_id,
            tmdb_id: prog.tmdb_id,
            type: prog.type,
            title: prog.title,
            year: '',
            poster: prog.poster,
            backdrop: prog.backdrop || prog.poster,
            overview: '',
            genres: [],
          };

          return (
            <div
              key={prog.id}
              className="relative shrink-0 w-52 sm:w-60 md:w-68 bg-[#181818] border border-zinc-800 rounded-lg overflow-hidden group shadow-lg"
            >
              {/* Backdrop / Thumbnail Container */}
              <div
                onClick={() => onPlayResume(prog)}
                className="relative aspect-video w-full overflow-hidden cursor-pointer"
              >
                <img
                  src={prog.backdrop || prog.poster}
                  alt={prog.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white/90 text-black flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 fill-black translate-x-0.5 rtl:-translate-x-0.5" />
                  </div>
                </div>

                {/* Season/Episode Tag */}
                {prog.type === 'tv' && prog.season && (
                  <span className="absolute top-2 left-2 rtl:left-auto rtl:right-2 bg-black/80 backdrop-blur-sm text-[10px] font-bold text-white px-2 py-0.5 rounded border border-white/10">
                    S{prog.season}:E{prog.episode || 1}
                  </span>
                )}

                {/* Remove button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveProgress(prog.id);
                  }}
                  className="absolute top-2 right-2 rtl:right-auto rtl:left-2 p-1 rounded-full bg-black/60 hover:bg-black/90 text-zinc-300 hover:text-white transition cursor-pointer"
                  title="Remove from history"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Progress bar */}
              <div className="h-1 bg-zinc-800 w-full">
                <div
                  className="h-full bg-[#e50914]"
                  style={{ width: `${Math.min(100, Math.max(5, prog.percentage))}%` }}
                />
              </div>

              {/* Bottom Info & Resume Action */}
              <div className="p-3 flex items-center justify-between">
                <div className="truncate pr-2 rtl:pr-0 rtl:pl-2">
                  <h4
                    onClick={() => onOpenDetails(mediaObj)}
                    className="text-xs sm:text-sm font-semibold text-white truncate hover:text-[#e50914] cursor-pointer"
                  >
                    {prog.title}
                  </h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    {prog.duration > 0
                      ? `${formatTime(prog.currentTime)} / ${formatTime(prog.duration)}`
                      : `${Math.round(prog.percentage)}% watched`}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onPlayResume(prog)}
                  className="shrink-0 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-2.5 py-1.5 rounded transition cursor-pointer"
                >
                  {t.resume}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
