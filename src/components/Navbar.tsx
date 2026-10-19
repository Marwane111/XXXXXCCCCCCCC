import React, { useState, useEffect } from 'react';
import {
  Cast,
  Download,
  Bell,
  Search,
  ChevronDown,
  X,
  Volume2,
  VolumeX,
  Sliders,
  Check,
  Globe
} from 'lucide-react';
import { Language, NavigationTab } from '../types.ts';

interface NavbarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedGenre: string;
  onSelectGenre: (genre: string) => void;
  allGenres: string[];
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenSettings: () => void;
  onOpenDownloads: () => void;
  downloadsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  searchQuery,
  onSearchChange,
  selectedGenre,
  onSelectGenre,
  allGenres,
  soundEnabled,
  onToggleSound,
  onOpenSettings,
  onOpenDownloads,
  downloadsCount,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [notificationToast, setNotificationToast] = useState(false);
  const [castConnected, setCastConnected] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Compute title displayed next to N logo
  const pageTitle = (() => {
    switch (currentTab) {
      case 'shows':
        return 'TV Shows';
      case 'movies':
        return 'Movies';
      case 'categories':
        return 'Categories';
      case 'coming_soon':
        return 'Coming Soon';
      case 'downloads':
        return 'Downloads';
      case 'search':
        return 'Search';
      case 'more':
        return 'More';
      case 'troubleshoot':
        return 'Stream Issues & Diagnostics';
      default:
        return 'Home';
    }
  })();

  const handleCastClick = () => {
    setCastConnected(!castConnected);
  };

  const handleNotificationClick = () => {
    setNotificationToast(true);
    setTimeout(() => setNotificationToast(false), 3000);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 select-none ${
        isScrolled
          ? 'bg-[#141414]/98 shadow-2xl backdrop-blur-md'
          : 'bg-gradient-to-b from-black/95 via-black/70 to-transparent'
      }`}
    >
      {/* Top Bar matching Screenshot IMG_20261019_190836.jpg */}
      <div className="px-4 md:px-12 py-3 flex items-center justify-between">
        {/* Left: Netflix Red N Logo + Title */}
        <div className="flex items-center gap-3">
          {/* Netflix Red N Ribbon Logo */}
          <button
            type="button"
            onClick={() => onSelectTab('home')}
            className="flex items-center gap-2 cursor-pointer focus:outline-none group"
          >
            <div className="w-7 h-9 flex items-center justify-center relative">
              <span className="font-brand text-3xl font-black text-[#e50914] tracking-tight drop-shadow-[0_2px_8px_rgba(229,9,20,0.8)] scale-y-110">
                N
              </span>
            </div>
            {/* Bold Page Title as shown in screenshot: "Home" */}
            <span className="text-xl sm:text-2xl font-black text-white tracking-tight font-sans">
              {pageTitle}
            </span>
          </button>
        </div>

        {/* Right side icons matching screenshot: Cast, Downloads, Notification Bell */}
        <div className="flex items-center gap-4 sm:gap-5 text-white">
          {/* Search Trigger */}
          <div className="relative flex items-center">
            {searchExpanded || searchQuery ? (
              <div className="flex items-center bg-black/80 border border-zinc-700 rounded-full px-3 py-1 text-xs w-40 sm:w-56 shadow-lg">
                <Search className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Search movies, series..."
                  className="w-full bg-transparent text-white px-2 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    onSearchChange('');
                    setSearchExpanded(false);
                  }}
                  className="text-zinc-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setSearchExpanded(true)}
                className="text-zinc-300 hover:text-white transition cursor-pointer"
                title="Search"
              >
                <Search className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Cast Icon */}
          <button
            type="button"
            onClick={handleCastClick}
            className={`transition cursor-pointer ${
              castConnected ? 'text-[#e50914]' : 'text-zinc-300 hover:text-white'
            }`}
            title={castConnected ? 'Cast connected to Living Room TV' : 'Cast to Smart TV / AirPlay'}
          >
            <Cast className="w-5 h-5" />
          </button>

          {/* Download Icon */}
          <button
            type="button"
            onClick={onOpenDownloads}
            className="text-zinc-300 hover:text-white transition relative cursor-pointer"
            title="Downloads"
          >
            <Download className="w-5 h-5" />
            {downloadsCount > 0 && (
              <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 rounded-full bg-[#e50914] text-[9px] font-bold flex items-center justify-center text-white">
                {downloadsCount}
              </span>
            )}
          </button>

          {/* Notification Bell Icon */}
          <button
            type="button"
            onClick={handleNotificationClick}
            className="text-zinc-300 hover:text-white transition relative cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-[#e50914]" />
          </button>

          {/* Sound Effect Toggle */}
          <button
            type="button"
            onClick={onToggleSound}
            className="hidden sm:inline-block text-zinc-300 hover:text-white transition cursor-pointer"
            title={soundEnabled ? 'Mute Ta-dum sound' : 'Enable Ta-dum sound'}
          >
            {soundEnabled ? (
              <Volume2 className="w-5 h-5 text-[#e50914]" />
            ) : (
              <VolumeX className="w-5 h-5 text-zinc-500" />
            )}
          </button>

          {/* Settings icon */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="hidden sm:inline-block text-zinc-300 hover:text-white transition cursor-pointer"
            title="Settings & Servers"
          >
            <Sliders className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Sub-Header Navigation Pills matching Screenshot IMG_20261019_190836.jpg */}
      <div className="px-4 md:px-12 pb-3 pt-1 flex items-center gap-2.5 overflow-x-auto no-scrollbar">
        {/* Shows Pill */}
        <button
          type="button"
          onClick={() => onSelectTab('shows')}
          className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition cursor-pointer backdrop-blur-md shadow-sm border ${
            currentTab === 'shows'
              ? 'bg-white text-black font-bold border-white'
              : 'bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-200 border-zinc-700/60'
          }`}
        >
          Shows
        </button>

        {/* Movies Pill */}
        <button
          type="button"
          onClick={() => onSelectTab('movies')}
          className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition cursor-pointer backdrop-blur-md shadow-sm border ${
            currentTab === 'movies'
              ? 'bg-white text-black font-bold border-white'
              : 'bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-200 border-zinc-700/60'
          }`}
        >
          Movies
        </button>

        {/* Categories Pill with Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setCategoriesOpen(!categoriesOpen)}
            className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition cursor-pointer backdrop-blur-md shadow-sm border flex items-center gap-1.5 ${
              selectedGenre !== 'all' || currentTab === 'categories'
                ? 'bg-white text-black font-bold border-white'
                : 'bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-200 border-zinc-700/60'
            }`}
          >
            <span>{selectedGenre === 'all' ? 'Categories' : selectedGenre}</span>
            <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>

          {/* Categories Dropdown Menu */}
          {categoriesOpen && (
            <div className="absolute left-0 mt-2 w-52 bg-[#181818] border border-zinc-700 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 max-h-72 overflow-y-auto">
              <button
                type="button"
                onClick={() => {
                  onSelectGenre('all');
                  setCategoriesOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-zinc-800 flex items-center justify-between cursor-pointer ${
                  selectedGenre === 'all' ? 'text-[#e50914]' : 'text-zinc-200'
                }`}
              >
                <span>All Categories</span>
                {selectedGenre === 'all' && <Check className="w-3.5 h-3.5" />}
              </button>
              {allGenres.map((genre) => (
                <button
                  key={genre}
                  type="button"
                  onClick={() => {
                    onSelectGenre(genre);
                    setCategoriesOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-zinc-800 flex items-center justify-between cursor-pointer ${
                    selectedGenre === genre ? 'text-[#e50914]' : 'text-zinc-200'
                  }`}
                >
                  <span>{genre}</span>
                  {selectedGenre === genre && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Issues & Diagnostics Pill (The screen for issues) */}
        <button
          type="button"
          onClick={() => onSelectTab('troubleshoot')}
          className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition cursor-pointer backdrop-blur-md shadow-sm border flex items-center gap-1.5 shrink-0 ${
            currentTab === 'troubleshoot'
              ? 'bg-[#e50914] text-white font-bold border-[#e50914] shadow-[0_0_12px_rgba(229,9,20,0.6)]'
              : 'bg-zinc-800/80 hover:bg-zinc-700/80 text-amber-300 border-amber-500/40'
          }`}
          title="Resolve video playback and screen issues"
        >
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          <span>Issues & Fixer</span>
        </button>
      </div>

      {/* Notification Toast Alert */}
      {notificationToast && (
        <div className="absolute top-16 right-4 sm:right-12 bg-zinc-900 border border-zinc-700 text-white px-4 py-3 rounded-lg shadow-2xl text-xs flex items-center gap-3 z-50 animate-in slide-in-from-top-2">
          <span className="w-2 h-2 rounded-full bg-[#e50914] animate-pulse"></span>
          <div>
            <p className="font-bold">New release added to VidSrc</p>
            <p className="text-zinc-400">Dune: Part Two and Fallout are ready in 1080p Full HD.</p>
          </div>
        </div>
      )}
    </header>
  );
};
