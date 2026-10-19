import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Play,
  Film,
  Tv,
  Flame,
  Bookmark,
  Grid,
  Filter,
  Search,
  SlidersHorizontal,
  Sparkles,
  Download,
  Bell,
  Check,
  Plus,
  Sliders,
  Server,
  Activity,
  Info,
  Calendar,
  Layers,
  ChevronRight,
  Zap,
  AlertCircle
} from 'lucide-react';
import { MediaItem, MediaType, Language, NavigationTab, UserSettings, WatchProgress } from './types.ts';
import { CURATED_MEDIA } from './data/curatedMedia.ts';
import {
  fetchLatestMoviesFeed,
  fetchLatestTvFeed,
  fetchMediaDetailFromVidSrc,
} from './services/vidsrc.ts';
import { rankAndEnrichMedia, partitionDistinctRows, recordTitleView } from './services/recommendationEngine.ts';
import { playNetflixSound } from './services/sound.ts';
import { useTranslation } from './i18n/translations.ts';
import { Navbar } from './components/Navbar.tsx';
import { MobileBottomNav } from './components/MobileBottomNav.tsx';
import { BillboardHero } from './components/BillboardHero.tsx';
import { MediaRow } from './components/MediaRow.tsx';
import { Top10Row } from './components/Top10Row.tsx';
import { ContinueWatchingRow } from './components/ContinueWatchingRow.tsx';
import { MediaCard } from './components/MediaCard.tsx';
import { MediaDetailModal } from './components/MediaDetailModal.tsx';
import { PlayerModal } from './components/PlayerModal.tsx';
import { SettingsModal } from './components/SettingsModal.tsx';
import { TroubleshootScreen } from './components/TroubleshootScreen.tsx';

const DEFAULT_SETTINGS: UserSettings = {
  authorized: true,
  compactPosters: false,
  autoplay: true,
  autonext: true,
  subtitleLanguage: 'en',
  customSubtitleUrl: '',
  customSubtitleLabel: 'Custom Subtitle',
  soundEffects: true,
  defaultServer: 'vidsrc_to',
  customDomain: 'https://vidsrc-ip.com',
};

export default function App() {
  // Navigation & UI State — English is primary default as requested!
  const [currentTab, setCurrentTab] = useState<NavigationTab>('home');
  const [currentLang, setCurrentLang] = useState<Language>('en');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'rating' | 'year' | 'title'>('featured');

  // Modals & Player State
  const [activePlayer, setActivePlayer] = useState<{
    item: MediaItem;
    season?: number;
    episode?: number;
  } | null>(null);

  const [activeDetailItem, setActiveDetailItem] = useState<MediaItem | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // User Settings State
  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const saved = localStorage.getItem('titan_flix_settings_en');
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Saved / Downloaded Watchlist State
  const [myListIds, setMyListIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('titan_flix_downloads');
      return saved ? JSON.parse(saved) : ['tt1300854', 'tt0944947', 'tt15239678', 'tt4574334'];
    } catch {
      return ['tt1300854', 'tt0944947', 'tt15239678', 'tt4574334'];
    }
  });

  // Coming Soon Notification Reminders
  const [reminders, setReminders] = useState<string[]>([]);

  // Watch Progress State (Resume functionality)
  const [watchProgressMap, setWatchProgressMap] = useState<Record<string, WatchProgress>>(() => {
    try {
      const saved = localStorage.getItem('titan_flix_progress');
      return saved ? JSON.parse(saved) : {
        'tt1300854': {
          id: 'tt1300854',
          imdb_id: 'tt1300854',
          tmdb_id: '68721',
          type: 'movie',
          title: 'Iron Man 3',
          poster: 'https://image.tmdb.org/t/p/w780/qhPtAc1TKbMPqNvcdXSOn9Bn7hZ.jpg',
          backdrop: 'https://image.tmdb.org/t/p/original/tM894ajP9v8pbgc72iV07A2G765.jpg',
          currentTime: 1420,
          duration: 7800,
          percentage: 18,
          lastWatched: Date.now() - 3600000,
        }
      };
    } catch {
      return {};
    }
  });

  // Dynamic Catalog Media
  const [allMedia, setAllMedia] = useState<MediaItem[]>(CURATED_MEDIA);
  const [comingSoonFeed, setComingSoonFeed] = useState<MediaItem[]>([]);

  const t = useTranslation(currentLang);

  // Set English html language and ltr
  useEffect(() => {
    document.documentElement.setAttribute('dir', 'ltr');
    document.documentElement.setAttribute('lang', 'en');
  }, []);

  // Persist settings
  useEffect(() => {
    try {
      localStorage.setItem('titan_flix_settings_en', JSON.stringify(settings));
    } catch {}
  }, [settings]);

  // Persist Downloads / My List
  useEffect(() => {
    try {
      localStorage.setItem('titan_flix_downloads', JSON.stringify(myListIds));
    } catch {}
  }, [myListIds]);

  // Persist Progress
  useEffect(() => {
    try {
      localStorage.setItem('titan_flix_progress', JSON.stringify(watchProgressMap));
    } catch {}
  }, [watchProgressMap]);

  // Load live feeds from VidSrc on startup to populate Coming Soon and live catalog
  useEffect(() => {
    const loadFeeds = async () => {
      try {
        const [moviesP1, moviesP2, tvP1, tvP2] = await Promise.all([
          fetchLatestMoviesFeed(1),
          fetchLatestMoviesFeed(2),
          fetchLatestTvFeed(1),
          fetchLatestTvFeed(2),
        ]);

        const incoming = [
          ...moviesP1.items,
          ...moviesP2.items,
          ...tvP1.items,
          ...tvP2.items,
        ];
        setComingSoonFeed(incoming.slice(0, 15));

        setAllMedia((prev) => {
          const map = new Map<string, MediaItem>();
          prev.forEach((item) => map.set(item.imdb_id || item.id, item));
          incoming.forEach((item) => {
            const key = item.imdb_id || item.id;
            if (!map.has(key)) {
              map.set(key, item);
            }
          });
          return Array.from(map.values());
        });
      } catch (err) {
        console.warn('Could not load VidSrc live feed:', err);
      }
    };

    loadFeeds();
  }, []);

  // Handle direct ID search (e.g. if user pastes tt1300854)
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (/^tt\d{6,12}$/i.test(trimmed)) {
      const exists = allMedia.some((m) => m.imdb_id.toLowerCase() === trimmed.toLowerCase());
      if (!exists) {
        fetchMediaDetailFromVidSrc(trimmed, 'movie').then((detail) => {
          if (detail && detail.title) {
            const newItem: MediaItem = {
              id: trimmed,
              imdb_id: trimmed,
              tmdb_id: detail.tmdb_id,
              type: 'movie',
              title: detail.title,
              year: detail.year || '2024',
              quality: detail.quality || '1080p',
              poster: detail.poster || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=780&auto=format&fit=crop&q=80',
              backdrop: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1280&auto=format&fit=crop&q=80',
              overview: `Direct title imported from VidSrc (${trimmed})`,
              rating: detail.rating || 8.0,
              matchScore: 97,
              genres: ['Action', 'Thriller'],
            };
            setAllMedia((prev) => [newItem, ...prev]);
          }
        });
      }
    }
  }, [searchQuery, allMedia]);

  // Audio Play helper & internal ranking update
  const handlePlayMedia = useCallback((item: MediaItem, season?: number, episode?: number) => {
    try {
      if (settings.soundEffects) {
        playNetflixSound();
      }
    } catch {}
    recordTitleView(item.id);
    setActivePlayer({ item, season, episode });
  }, [settings.soundEffects]);

  // Progress update callback from player
  const handleUpdateProgress = useCallback(
    (item: MediaItem, currentTime: number, duration: number, season?: number, episode?: number) => {
      const percentage = duration > 0 ? (currentTime / duration) * 100 : 0;
      setWatchProgressMap((prev) => ({
        ...prev,
        [item.imdb_id || item.id]: {
          id: item.id,
          imdb_id: item.imdb_id,
          tmdb_id: item.tmdb_id,
          type: item.type,
          title: item.title,
          poster: item.poster,
          backdrop: item.backdrop,
          season,
          episode,
          currentTime,
          duration,
          percentage,
          lastWatched: Date.now(),
        },
      }));
    },
    []
  );

  const handleRemoveProgress = useCallback((id: string) => {
    setWatchProgressMap((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  }, []);

  const handleClearAllHistory = useCallback(() => {
    setWatchProgressMap({});
  }, []);

  // Download / My List Toggle
  const handleToggleList = useCallback((item: MediaItem) => {
    const id = item.imdb_id || item.id;
    setMyListIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }, []);

  const isInList = useCallback(
    (item: MediaItem) => myListIds.includes(item.imdb_id || item.id),
    [myListIds]
  );

  const toggleReminder = (id: string) => {
    setReminders((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Filtered & Sorted Media items
  const allGenres = useMemo(() => {
    const set = new Set<string>();
    allMedia.forEach((m) => m.genres?.forEach((g) => set.add(g)));
    return Array.from(set).sort();
  }, [allMedia]);

  const filteredMedia = useMemo(() => {
    let list = [...allMedia];

    // Filter by tab
    if (currentTab === 'movies') {
      list = list.filter((m) => m.type === 'movie');
    } else if (currentTab === 'shows') {
      list = list.filter((m) => m.type === 'tv');
    } else if (currentTab === 'downloads') {
      list = list.filter((m) => myListIds.includes(m.imdb_id || m.id));
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.imdb_id.toLowerCase().includes(q) ||
          (m.genres && m.genres.some((g) => g.toLowerCase().includes(q))) ||
          (m.cast && m.cast.some((c) => c.name.toLowerCase().includes(q)))
      );
    }

    // Filter by genre
    if (selectedGenre !== 'all') {
      list = list.filter((m) => m.genres && m.genres.includes(selectedGenre));
    }

    // Sort
    if (sortBy === 'rating') {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'year') {
      list.sort((a, b) => (b.year || '').localeCompare(a.year || ''));
    } else if (sortBy === 'title') {
      list.sort((a, b) => a.title.localeCompare(b.title));
    }

    return list;
  }, [allMedia, currentTab, searchQuery, selectedGenre, sortBy, myListIds]);

  // Invisible internal system: ranks by live daily popularity & guarantees zero row duplicates
  const rankedCatalog = useMemo(() => rankAndEnrichMedia(allMedia), [allMedia]);
  const distinctRows = useMemo(() => partitionDistinctRows(rankedCatalog), [rankedCatalog]);
  const continueWatchingList = useMemo(() => {
    return Object.values(watchProgressMap).sort((a, b) => b.lastWatched - a.lastWatched);
  }, [watchProgressMap]);

  return (
    <div className={`min-h-screen bg-[#141414] text-[#e5e5e5] ${settings.compactPosters ? 'compact' : ''}`}>
      {/* Top Header matching IMG_20261019_190836.jpg */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedGenre={selectedGenre}
        onSelectGenre={setSelectedGenre}
        allGenres={allGenres}
        soundEnabled={settings.soundEffects}
        onToggleSound={() => setSettings({ ...settings, soundEffects: !settings.soundEffects })}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenDownloads={() => setCurrentTab('downloads')}
        downloadsCount={myListIds.length}
      />

      {/* Main Content Viewport */}
      <main className="pb-28">
        {/* VIEW 1: SEARCH RESULTS OR FILTERED TAB */}
        {searchQuery.trim() || currentTab === 'search' ? (
          <div className="pt-28 px-4 md:px-12 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                  <Search className="w-5 h-5 text-[#e50914]" />
                  <span>{searchQuery.trim() ? `Results for "${searchQuery}"` : 'Explore & Search Titles'}</span>
                </h1>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {filteredMedia.length} matching movies and TV shows
                </p>
              </div>

              {/* Quick Filters */}
              <div className="flex items-center gap-2">
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="bg-zinc-900 border border-zinc-700 text-xs text-white rounded-lg px-3 py-1.5 focus:outline-none"
                >
                  <option value="all">All Genres</option>
                  {allGenres.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-zinc-900 border border-zinc-700 text-xs text-white rounded-lg px-3 py-1.5 focus:outline-none"
                >
                  <option value="featured">Newest</option>
                  <option value="rating">Top Rated</option>
                  <option value="title">A - Z</option>
                </select>
              </div>
            </div>

            {/* Grid */}
            {filteredMedia.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
                {filteredMedia.map((item) => (
                  <MediaCard
                    key={`${item.type}-${item.id}`}
                    item={item}
                    onPlay={handlePlayMedia}
                    onOpenDetails={setActiveDetailItem}
                    onToggleList={handleToggleList}
                    isSaved={isInList(item)}
                    progress={watchProgressMap[item.imdb_id] || watchProgressMap[item.id]}
                    compact={settings.compactPosters}
                    currentLang="en"
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-24 px-4 bg-zinc-900/40 rounded-xl border border-zinc-800 max-w-md mx-auto my-12 space-y-3">
                <Search className="w-12 h-12 text-zinc-600 mx-auto" />
                <h3 className="text-base font-bold text-white">No titles found</h3>
                <p className="text-xs text-zinc-400">
                  Try searching for another movie, series name, or an IMDb ID like <span className="font-mono text-zinc-200">tt1300854</span>.
                </p>
              </div>
            )}
          </div>
        ) : currentTab === 'downloads' ? (
          /* VIEW 2: DOWNLOADS (From Bottom Bar IMG_20261019_190853.jpg) */
          <div className="pt-28 px-4 md:px-12 max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Download className="w-6 h-6 text-[#e50914]" />
                  <span>Downloads & Offline Watchlist</span>
                </h1>
                <p className="text-xs text-zinc-400 mt-1">
                  {myListIds.length} titles ready for instant streaming and playback
                </p>
              </div>

              <div className="flex items-center gap-2 bg-zinc-900/80 border border-zinc-800 px-3 py-1.5 rounded-lg text-xs text-zinc-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Smart Downloads ON</span>
              </div>
            </div>

            {filteredMedia.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filteredMedia.map((item) => (
                  <MediaCard
                    key={`${item.type}-${item.id}`}
                    item={item}
                    onPlay={handlePlayMedia}
                    onOpenDetails={setActiveDetailItem}
                    onToggleList={handleToggleList}
                    isSaved={true}
                    progress={watchProgressMap[item.imdb_id] || watchProgressMap[item.id]}
                    compact={settings.compactPosters}
                    currentLang="en"
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 px-4 bg-zinc-900/40 rounded-xl border border-zinc-800 max-w-md mx-auto my-8 space-y-3">
                <Download className="w-12 h-12 text-zinc-600 mx-auto" />
                <h3 className="text-base font-bold text-white">Never be without TITAN</h3>
                <p className="text-xs text-zinc-400">
                  Download movies and TV shows so you can always watch anytime on any device.
                </p>
                <button
                  type="button"
                  onClick={() => setCurrentTab('home')}
                  className="bg-white text-black font-bold text-xs px-5 py-2.5 rounded hover:bg-zinc-200 transition cursor-pointer"
                >
                  Find Something to Watch
                </button>
              </div>
            )}
          </div>
        ) : currentTab === 'coming_soon' ? (
          /* VIEW 3: COMING SOON (From Bottom Bar IMG_20261019_190853.jpg) */
          <div className="pt-28 px-4 md:px-12 max-w-3xl mx-auto space-y-8">
            <div className="border-b border-zinc-800 pb-3">
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Film className="w-6 h-6 text-[#e50914]" />
                <span>Coming Soon & Latest Arrivals</span>
              </h1>
              <p className="text-xs text-zinc-400 mt-1">
                Stay tuned for brand new blockbusters and fresh seasons added to VidSrc
              </p>
            </div>

            <div className="space-y-8">
              {(comingSoonFeed.length > 0 ? comingSoonFeed : allMedia.slice(0, 6)).map((item, idx) => {
                const hasReminder = reminders.includes(item.id);
                return (
                  <div
                    key={item.id}
                    className="bg-[#181818] border border-zinc-800 rounded-xl overflow-hidden shadow-xl group"
                  >
                    {/* Backdrop */}
                    <div
                      onClick={() => handlePlayMedia(item)}
                      className="relative aspect-video w-full overflow-hidden cursor-pointer bg-black"
                    >
                      <img
                        src={item.backdrop || item.poster}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent flex items-center justify-center">
                        <div className="w-14 h-14 rounded-full bg-black/60 border border-white/20 text-white flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition shadow-2xl">
                          <Play className="w-6 h-6 fill-white translate-x-0.5" />
                        </div>
                      </div>
                      <span className="absolute top-3 left-3 bg-[#e50914] text-white font-black text-[10px] px-2 py-0.5 rounded tracking-wide uppercase">
                        Coming {idx % 2 === 0 ? 'Friday' : 'Next Week'}
                      </span>
                    </div>

                    {/* Information & Action Buttons */}
                    <div className="p-4 sm:p-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-lg sm:text-xl font-bold text-white">{item.title}</h2>
                          <p className="text-xs text-zinc-400 flex items-center gap-2 mt-0.5">
                            <span className="text-emerald-400 font-semibold">{item.quality || '1080p'}</span>
                            <span>•</span>
                            <span>{item.genres?.slice(0, 3).join(', ')}</span>
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => toggleReminder(item.id)}
                            className={`flex flex-col items-center gap-1 text-xs transition cursor-pointer ${
                              hasReminder ? 'text-[#e50914]' : 'text-zinc-400 hover:text-white'
                            }`}
                          >
                            <Bell className="w-5 h-5 fill-current" />
                            <span className="text-[10px]">{hasReminder ? 'Reminded' : 'Remind Me'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setActiveDetailItem(item)}
                            className="flex flex-col items-center gap-1 text-xs text-zinc-400 hover:text-white transition cursor-pointer"
                          >
                            <Info className="w-5 h-5" />
                            <span className="text-[10px]">Info</span>
                          </button>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-zinc-300 font-light leading-relaxed">
                        {item.overview || `Catch the premier stream of ${item.title} on TITAN with 1080p source quality and multiple audio/subtitle channels.`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : currentTab === 'more' ? (
          /* VIEW 4: MORE / ACCOUNT / SETTINGS (From Bottom Bar IMG_20261019_190853.jpg) */
          <div className="pt-28 px-4 md:px-12 max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4 bg-[#181818] border border-zinc-800 p-4 rounded-xl shadow-lg">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-tr from-[#e50914] to-red-500 p-0.5 shadow-md shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
                  alt="Profile"
                  className="w-full h-full object-cover rounded-[10px]"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-bold text-white">Marwane (VIP Cinema)</h2>
                <p className="text-xs text-zinc-400">marwaneboukiri@gmail.com</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="bg-[#e50914]/20 text-[#e50914] text-[10px] font-bold px-2 py-0.5 rounded border border-[#e50914]/30">
                    VidSrc Pro 1080p
                  </span>
                  <span className="text-[10px] text-emerald-400 font-medium">Server Connected</span>
                </div>
              </div>
            </div>

            {/* Quick Menu Options */}
            <div className="bg-[#181818] border border-zinc-800 rounded-xl overflow-hidden divide-y divide-zinc-800 text-sm">
              <button
                type="button"
                onClick={() => setSettingsOpen(true)}
                className="w-full p-4 flex items-center justify-between text-left text-zinc-200 hover:bg-zinc-800 transition cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Sliders className="w-5 h-5 text-[#e50914]" />
                  <div>
                    <p className="font-semibold text-white">App Settings & Streaming Servers</p>
                    <p className="text-xs text-zinc-400">Configure VidSrc servers, custom domain, and audio</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              </button>

              <button
                type="button"
                onClick={() => setCurrentTab('downloads')}
                className="w-full p-4 flex items-center justify-between text-left text-zinc-200 hover:bg-zinc-800 transition cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Download className="w-5 h-5 text-[#e50914]" />
                  <div>
                    <p className="font-semibold text-white">My Downloads & Watchlist</p>
                    <p className="text-xs text-zinc-400">{myListIds.length} saved titles</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              </button>

              <button
                type="button"
                onClick={() => setCurrentTab('troubleshoot')}
                className="w-full p-4 flex items-center justify-between text-left text-zinc-200 hover:bg-zinc-800 transition cursor-pointer bg-amber-500/5"
              >
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-amber-400" />
                  <div>
                    <p className="font-semibold text-white flex items-center gap-2">
                      <span>Screen Issues & Stream Diagnostics</span>
                      <span className="bg-amber-500/20 text-amber-400 text-[10px] font-bold px-1.5 py-0.2 rounded border border-amber-500/30">
                        Fixer
                      </span>
                    </p>
                    <p className="text-xs text-zinc-400">Resolve video playback errors, test 6 nodes, fix layout</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              </button>

              <button
                type="button"
                onClick={() => setSettingsOpen(true)}
                className="w-full p-4 flex items-center justify-between text-left text-zinc-200 hover:bg-zinc-800 transition cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Server className="w-5 h-5 text-emerald-400" />
                  <div>
                    <p className="font-semibold text-white">Custom IP & Cloudflare CNAME</p>
                    <p className="text-xs text-zinc-400">vidsrc-ip.com custom domain setup</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              </button>
            </div>
          </div>
        ) : currentTab === 'troubleshoot' ? (
          /* VIEW 5: DEDICATED STREAM & SCREEN ISSUES RESOLVER SCREEN */
          <TroubleshootScreen
            settings={settings}
            onUpdateSettings={setSettings}
            onPlayMedia={handlePlayMedia}
            onNavigateHome={() => setCurrentTab('home')}
          />
        ) : (
          /* VIEW 6: STANDARD HOME / SHOWS / MOVIES VIEW (POLISHED & UNCRACKED) */
          <div>
            {/* Billboard Hero Spotlight */}
            <BillboardHero
              items={
                currentTab === 'shows'
                  ? CURATED_MEDIA.filter((m) => m.type === 'tv')
                  : currentTab === 'movies'
                  ? CURATED_MEDIA.filter((m) => m.type === 'movie')
                  : CURATED_MEDIA.slice(0, 5)
              }
              onPlay={handlePlayMedia}
              onOpenDetails={setActiveDetailItem}
              onToggleList={handleToggleList}
              isInList={isInList}
              currentLang="en"
            />

            {/* Content Rows with clean, uncracked spacing */}
            <div className="-mt-6 sm:-mt-10 md:-mt-12 relative z-20 space-y-4 md:space-y-6">
              {/* Continue Watching Row (if user has active titles) */}
              {continueWatchingList.length > 0 && (
                <ContinueWatchingRow
                  progressList={continueWatchingList}
                  onPlayResume={(prog) => {
                    const match = allMedia.find((m) => m.imdb_id === prog.imdb_id || m.id === prog.id);
                    if (match) {
                      handlePlayMedia(match, prog.season, prog.episode);
                    } else {
                      const fallback: MediaItem = {
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
                      handlePlayMedia(fallback, prog.season, prog.episode);
                    }
                  }}
                  onOpenDetails={setActiveDetailItem}
                  onRemoveProgress={handleRemoveProgress}
                  currentLang="en"
                />
              )}

              {/* Top 10 Today Row */}
              <Top10Row
                items={distinctRows.top10}
                onPlay={handlePlayMedia}
                onOpenDetails={setActiveDetailItem}
                currentLang="en"
              />

              {/* Row 1: Most Viewed Today (Dynamic Algorithm) */}
              <MediaRow
                title="🔥 Most-Viewed Today"
                items={distinctRows.mostViewedToday}
                onPlay={handlePlayMedia}
                onOpenDetails={setActiveDetailItem}
                onToggleList={handleToggleList}
                isInList={isInList}
                progressMap={watchProgressMap}
                compact={settings.compactPosters}
                currentLang="en"
              />

              {/* Row 2: Blockbuster Action & High Stakes */}
              <MediaRow
                title="Blockbuster Action & High Stakes"
                items={distinctRows.actionBlockbusters}
                onPlay={handlePlayMedia}
                onOpenDetails={setActiveDetailItem}
                onToggleList={handleToggleList}
                isInList={isInList}
                progressMap={watchProgressMap}
                compact={settings.compactPosters}
                currentLang="en"
              />

              {/* Row 3: Critically Acclaimed TV Masterpieces */}
              <MediaRow
                title="Critically Acclaimed TV Masterpieces"
                items={distinctRows.tvSeries}
                onPlay={handlePlayMedia}
                onOpenDetails={setActiveDetailItem}
                onToggleList={handleToggleList}
                isInList={isInList}
                progressMap={watchProgressMap}
                compact={settings.compactPosters}
                currentLang="en"
              />

              {/* Row 4: Mind-Bending Sci-Fi & Cosmic Epics */}
              <MediaRow
                title="Mind-Bending Sci-Fi & Cosmic Epics"
                items={distinctRows.sciFiEpics}
                onPlay={handlePlayMedia}
                onOpenDetails={setActiveDetailItem}
                onToggleList={handleToggleList}
                isInList={isInList}
                progressMap={watchProgressMap}
                compact={settings.compactPosters}
                currentLang="en"
              />

              {/* Row 5: Award-Winning Dramas & Stories */}
              <MediaRow
                title="Award-Winning Dramas & Stories"
                items={distinctRows.criticsDramas}
                onPlay={handlePlayMedia}
                onOpenDetails={setActiveDetailItem}
                onToggleList={handleToggleList}
                isInList={isInList}
                progressMap={watchProgressMap}
                compact={settings.compactPosters}
                currentLang="en"
              />

              {/* Row 6: Crime, Heists & Mystery Thrillers */}
              <MediaRow
                title="Crime, Heists & Mystery Thrillers"
                items={distinctRows.crimeThrillers}
                onPlay={handlePlayMedia}
                onOpenDetails={setActiveDetailItem}
                onToggleList={handleToggleList}
                isInList={isInList}
                progressMap={watchProgressMap}
                compact={settings.compactPosters}
                currentLang="en"
              />

              {/* Row 7: Fresh Arrivals on VidSrc Network */}
              <MediaRow
                title="Fresh Arrivals on VidSrc Network"
                items={distinctRows.allDiverse.slice(14, 28)}
                onPlay={handlePlayMedia}
                onOpenDetails={setActiveDetailItem}
                onToggleList={handleToggleList}
                isInList={isInList}
                progressMap={watchProgressMap}
                compact={settings.compactPosters}
                currentLang="en"
              />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 bg-[#0f0f0f] py-12 px-4 md:px-12 text-zinc-500 text-xs hidden md:block">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="font-brand text-2xl font-black text-[#e50914] tracking-wider">
                TITAN FLIX
              </span>
              <p className="text-zinc-400 mt-1">CINEMA, CONSIDERED.</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setSettingsOpen(true)}
                className="bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded transition cursor-pointer"
              >
                Settings
              </button>
              <button
                type="button"
                onClick={() => setSettingsOpen(true)}
                className="bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded transition cursor-pointer flex items-center gap-1.5"
              >
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>Diagnostics</span>
              </button>
            </div>
          </div>

          <p className="text-[11px] text-zinc-600 leading-relaxed">
            TITAN FLIX connects directly to VidSrc distributed streaming nodes with full HD playback and multi-subtitles. All trademarks and media remain property of their respective copyright holders.
          </p>
        </div>
      </footer>

      {/* Mobile Bottom Navigation matching IMG_20261019_190853.jpg (Home, Search, Coming Soon, Downloads, More [2]) */}
      <MobileBottomNav
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        downloadsCount={myListIds.length}
      />

      {/* Movie/Series Detail Modal with 4+ Photos Gallery & Episode Picker */}
      {activeDetailItem && (
        <MediaDetailModal
          item={activeDetailItem}
          onClose={() => setActiveDetailItem(null)}
          onPlay={(item, season, episode) => {
            setActiveDetailItem(null);
            handlePlayMedia(item, season, episode);
          }}
          onToggleList={handleToggleList}
          isSaved={isInList(activeDetailItem)}
          similarItems={allMedia.filter(
            (m) =>
              m.id !== activeDetailItem.id &&
              m.genres?.some((g) => activeDetailItem.genres?.includes(g))
          )}
          currentLang="en"
        />
      )}

      {/* Cinema Video Player Modal */}
      {activePlayer && (
        <PlayerModal
          item={activePlayer.item}
          initialSeason={activePlayer.season || 1}
          initialEpisode={activePlayer.episode || 1}
          savedProgress={
            watchProgressMap[activePlayer.item.imdb_id] ||
            watchProgressMap[activePlayer.item.id]
          }
          settings={settings}
          onClose={() => setActivePlayer(null)}
          onUpdateProgress={handleUpdateProgress}
          onOpenTroubleshootScreen={() => {
            setActivePlayer(null);
            setCurrentTab('troubleshoot');
          }}
          currentLang="en"
        />
      )}

      {/* Settings & Diagnostics Modal with Custom Domain / IP support */}
      {settingsOpen && (
        <SettingsModal
          settings={settings}
          onSaveSettings={setSettings}
          onClearHistory={handleClearAllHistory}
          onClose={() => setSettingsOpen(false)}
          currentLang="en"
        />
      )}
    </div>
  );
}
