import React, { useState } from 'react';
import { X, Play, Plus, Check, Star, Film, Tv, Sparkles, Image as ImageIcon, Layers, Users, ChevronDown } from 'lucide-react';
import { MediaItem, Language, SeasonInfo } from '../types.ts';
import { useTranslation } from '../i18n/translations.ts';
import { generateGalleryForMedia } from '../services/vidsrc.ts';

interface MediaDetailModalProps {
  item: MediaItem | null;
  onClose: () => void;
  onPlay: (item: MediaItem, season?: number, episode?: number) => void;
  onToggleList: (item: MediaItem) => void;
  isSaved: boolean;
  similarItems: MediaItem[];
  currentLang: Language;
}

export const MediaDetailModal: React.FC<MediaDetailModalProps> = ({
  item,
  onClose,
  onPlay,
  onToggleList,
  isSaved,
  similarItems,
  currentLang,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'gallery' | 'episodes' | 'similar'>('overview');
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const t = useTranslation(currentLang);

  if (!item) return null;

  const galleryImages = (item.gallery && item.gallery.length > 0)
    ? item.gallery
    : generateGalleryForMedia(item.poster, item.backdrop, item.title);

  const seasonsList: SeasonInfo[] = item.seasons || (item.type === 'tv' ? [
    { season: 1, episodes: 10, quality: '1080p' }
  ] : []);

  const currentSeasonData = seasonsList.find((s) => s.season === selectedSeason) || seasonsList[0];
  const episodeCount = currentSeasonData ? currentSeasonData.episodes : 10;
  const episodesArray = Array.from({ length: episodeCount }, (_, i) => i + 1);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl bg-[#181818] text-white rounded-none sm:rounded-xl overflow-hidden shadow-2xl border border-zinc-800 my-auto max-h-[96vh] flex flex-col"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 rtl:right-auto rtl:left-4 z-30 w-9 h-9 rounded-full bg-[#181818]/80 hover:bg-zinc-700 text-white flex items-center justify-center transition border border-white/20 shadow-lg cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Hero Header with Backdrop */}
        <div className="relative aspect-[16/9] max-h-[380px] w-full shrink-0 overflow-hidden bg-zinc-950">
          <img
            src={item.backdrop || item.poster}
            alt={item.title}
            className="w-full h-full object-cover filter brightness-90"
          />

          {/* Vignette gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-[#181818]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#181818]/80 via-transparent to-transparent rtl:bg-gradient-to-l" />

          {/* Title and Action Buttons Over Header */}
          <div className="absolute bottom-6 left-6 right-6 rtl:left-6 rtl:right-6 flex flex-col gap-3">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black font-brand text-white drop-shadow-md">
              {item.title}
            </h2>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onPlay(item, item.type === 'tv' ? selectedSeason : undefined, 1)}
                className="flex items-center gap-2 bg-white text-black hover:bg-zinc-200 px-6 py-2.5 rounded-md font-bold text-sm md:text-base shadow-xl transition transform hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Play className="w-5 h-5 fill-black" />
                <span>{t.play}</span>
              </button>

              <button
                type="button"
                onClick={() => onToggleList(item)}
                className={`p-2.5 rounded-full border transition cursor-pointer ${
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

        {/* Navigation Tabs inside Modal */}
        <div className="flex items-center gap-2 border-b border-zinc-800 px-6 pt-3 pb-0 bg-[#141414] overflow-x-auto no-scrollbar shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`pb-3 px-3 text-sm font-semibold transition border-b-2 cursor-pointer ${
              activeTab === 'overview'
                ? 'text-[#e50914] border-[#e50914]'
                : 'text-zinc-400 border-transparent hover:text-white'
            }`}
          >
            {t.overview}
          </button>

          {item.type === 'tv' && (
            <button
              type="button"
              onClick={() => setActiveTab('episodes')}
              className={`pb-3 px-3 text-sm font-semibold transition border-b-2 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'episodes'
                  ? 'text-[#e50914] border-[#e50914]'
                  : 'text-zinc-400 border-transparent hover:text-white'
              }`}
            >
              <Tv className="w-4 h-4" />
              <span>{t.episodes}</span>
            </button>
          )}

          {/* User requested: Multiple images (1st, 2nd, 3rd, 4th image) */}
          <button
            type="button"
            onClick={() => setActiveTab('gallery')}
            className={`pb-3 px-3 text-sm font-semibold transition border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'gallery'
                ? 'text-[#e50914] border-[#e50914]'
                : 'text-zinc-400 border-transparent hover:text-white'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>{t.gallery}</span>
            <span className="bg-zinc-800 text-[10px] px-1.5 py-0.5 rounded text-zinc-300 font-bold">
              {galleryImages.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('similar')}
            className={`pb-3 px-3 text-sm font-semibold transition border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'similar'
                ? 'text-[#e50914] border-[#e50914]'
                : 'text-zinc-400 border-transparent hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>{t.moreLikeThis}</span>
          </button>
        </div>

        {/* Modal Body / Tab Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-4">
                  {/* Metadata Chips */}
                  <div className="flex flex-wrap items-center gap-2.5 text-xs sm:text-sm font-semibold text-zinc-300">
                    {item.matchScore && (
                      <span className="text-emerald-400 font-bold">{item.matchScore}% {t.match}</span>
                    )}
                    <span className="text-zinc-400">{item.year}</span>
                    <span className="border border-zinc-600 px-1.5 py-0.5 rounded text-[11px] font-bold text-zinc-200">
                      {item.ageRating || '16+'}
                    </span>
                    <span className="bg-zinc-800 px-1.5 py-0.5 rounded text-[11px] font-bold text-zinc-300 border border-zinc-700">
                      {item.quality || '1080p'}
                    </span>
                    {item.duration && <span>{item.duration}</span>}
                    {item.rating && (
                      <span className="flex items-center gap-1 text-amber-400 font-bold bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        {item.rating.toFixed(1)} / 10
                      </span>
                    )}
                  </div>

                  {/* Synopsis */}
                  <p className="text-sm md:text-base text-zinc-200 leading-relaxed font-light">
                    {item.overview}
                  </p>

                  {/* VidSrc Streaming Details Badge */}
                  <div className="bg-[#141414] border border-zinc-800 rounded-lg p-3 text-xs text-zinc-400 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white">VidSrc Embed Engine</p>
                      <p className="text-[11px]">IMDb: {item.imdb_id} {item.tmdb_id ? `• TMDb: ${item.tmdb_id}` : ''}</p>
                    </div>
                    <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold px-2 py-1 rounded">
                      {t.readyToStream}
                    </span>
                  </div>
                </div>

                {/* Right Column: Cast & Genres */}
                <div className="space-y-4 text-xs text-zinc-400 border-t md:border-t-0 md:border-l rtl:md:border-l-0 rtl:md:border-r border-zinc-800 md:pl-6 rtl:md:pl-0 rtl:md:pr-6">
                  {item.cast && item.cast.length > 0 && (
                    <div>
                      <span className="text-zinc-500 block mb-1 font-semibold">{t.cast}:</span>
                      <div className="space-y-1">
                        {item.cast.map((c, i) => (
                          <p key={i} className="text-zinc-200">
                            <span className="font-medium">{c.name}</span>
                            {c.character && <span className="text-zinc-400 text-[11px]"> as {c.character}</span>}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  {item.director && (
                    <div>
                      <span className="text-zinc-500 block mb-1 font-semibold">Director:</span>
                      <p className="text-zinc-200 font-medium">{item.director}</p>
                    </div>
                  )}

                  {item.genres && item.genres.length > 0 && (
                    <div>
                      <span className="text-zinc-500 block mb-1 font-semibold">{t.genresLabel}</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {item.genres.map((g) => (
                          <span
                            key={g}
                            className="bg-zinc-800 text-zinc-300 text-[11px] px-2 py-0.5 rounded border border-zinc-700"
                          >
                            {g}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EPISODES (FOR TV SHOWS) */}
          {activeTab === 'episodes' && item.type === 'tv' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="relative inline-block">
                  <select
                    value={selectedSeason}
                    onChange={(e) => setSelectedSeason(Number(e.target.value))}
                    className="bg-zinc-800 border border-zinc-700 text-white text-sm font-semibold rounded-md px-4 py-2 pr-8 appearance-none cursor-pointer focus:outline-none"
                  >
                    {seasonsList.map((s) => (
                      <option key={s.season} value={s.season}>
                        {t.season} {s.season} ({s.episodes} {t.episodes})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-2.5 rtl:right-auto rtl:left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <span className="text-xs text-zinc-400">
                  {episodesArray.length} {t.episodes} in {t.season} {selectedSeason}
                </span>
              </div>

              <div className="space-y-2">
                {episodesArray.map((epNum) => (
                  <div
                    key={epNum}
                    onClick={() => onPlay(item, selectedSeason, epNum)}
                    className="flex items-center gap-4 p-3 bg-zinc-900/80 hover:bg-zinc-800/80 rounded-lg transition border border-zinc-800 cursor-pointer group"
                  >
                    <span className="text-lg font-bold text-zinc-500 group-hover:text-white w-6 text-center">
                      {epNum}
                    </span>

                    <div className="relative aspect-video w-28 sm:w-36 rounded overflow-hidden shrink-0 bg-black">
                      <img
                        src={item.backdrop || item.poster}
                        alt={`${t.episode} ${epNum}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition flex items-center justify-center">
                        <Play className="w-6 h-6 fill-white text-white opacity-80 group-hover:opacity-100" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-white truncate group-hover:text-[#e50914] transition">
                          {t.episode} {epNum}
                        </h4>
                        <span className="text-xs text-zinc-400">45m</span>
                      </div>
                      <p className="text-xs text-zinc-400 line-clamp-2 mt-1">
                        Watch {item.title} Season {selectedSeason}, Episode {epNum} in 1080p with instant subtitle support.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: PHOTO GALLERY & STILLS (Fulfilling user request: "بغيت أي فيلم يطلع لي التصويرات الأولى والتصويرات الثانية والتالتة والرابعة") */}
          {activeTab === 'gallery' && (
            <div className="space-y-4">
              <div className="bg-zinc-900/60 border border-zinc-800 p-3 rounded-lg text-xs text-zinc-300 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white">{t.stillsAndPosters}</p>
                  <p className="text-zinc-400">Click any image to enlarge in full-screen cinematic preview.</p>
                </div>
                <span className="bg-[#e50914]/20 text-[#e50914] border border-[#e50914]/30 px-2.5 py-1 rounded-full font-bold text-[11px]">
                  {galleryImages.length} High-Res Shots
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {galleryImages.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    onClick={() => setLightboxImage(imgUrl)}
                    className="relative aspect-video rounded-lg overflow-hidden bg-black border border-zinc-800 cursor-pointer group shadow-md"
                  >
                    <img
                      src={imgUrl}
                      alt={`${item.title} Still ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="bg-black/70 backdrop-blur-sm text-xs font-bold text-white px-3 py-1.5 rounded border border-white/20">
                        View Photo #{idx + 1}
                      </span>
                    </div>
                    <span className="absolute bottom-2 left-2 rtl:left-auto rtl:right-2 bg-black/70 text-[10px] font-bold text-zinc-300 px-1.5 py-0.5 rounded">
                      Image {idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: SIMILAR TITLES */}
          {activeTab === 'similar' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {similarItems.filter((s) => s.id !== item.id).slice(0, 8).map((sim) => (
                <div
                  key={sim.id}
                  onClick={() => onPlay(sim)}
                  className="bg-zinc-900 border border-zinc-800 rounded-md overflow-hidden cursor-pointer group hover:border-zinc-500 transition shadow"
                >
                  <div className="relative aspect-[2/3] w-full">
                    <img
                      src={sim.poster || sim.backdrop}
                      alt={sim.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <Play className="w-8 h-8 fill-white text-white" />
                    </div>
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-semibold text-white truncate">{sim.title}</p>
                    <div className="flex items-center justify-between text-[10px] text-zinc-400 mt-1">
                      <span className="text-emerald-400 font-bold">{sim.matchScore || 95}%</span>
                      <span>{sim.year}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Lightbox Modal for Fullscreen Image Preview */}
        {lightboxImage && (
          <div
            className="fixed inset-0 z-60 bg-black/95 flex items-center justify-center p-4 animate-in fade-in"
            onClick={() => setLightboxImage(null)}
          >
            <button
              type="button"
              onClick={() => setLightboxImage(null)}
              className="absolute top-6 right-6 text-white p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={lightboxImage}
              alt="High-res still"
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl border border-zinc-800"
            />
          </div>
        )}
      </div>
    </div>
  );
};
