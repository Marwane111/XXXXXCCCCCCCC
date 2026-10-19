import React from 'react';
import { Home, Search, Film, Download, Menu } from 'lucide-react';
import { NavigationTab } from '../types.ts';

interface MobileBottomNavProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  downloadsCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onSelectTab,
  downloadsCount,
}) => {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#121212]/98 backdrop-blur-lg border-t border-zinc-800/80 py-2 px-2 flex items-center justify-around select-none shadow-2xl"
      aria-label="Mobile Bottom Navigation"
    >
      {/* 1. Home */}
      <button
        type="button"
        onClick={() => onSelectTab('home')}
        className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 cursor-pointer transition-colors ${
          currentTab === 'home' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
        }`}
      >
        <Home className={`w-5 h-5 ${currentTab === 'home' ? 'stroke-[2.5]' : 'stroke-2'}`} />
        <span className={`text-[11px] font-medium tracking-tight ${currentTab === 'home' ? 'font-bold text-white' : ''}`}>
          Home
        </span>
      </button>

      {/* 2. Search */}
      <button
        type="button"
        onClick={() => onSelectTab('search')}
        className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 cursor-pointer transition-colors ${
          currentTab === 'search' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
        }`}
      >
        <Search className={`w-5 h-5 ${currentTab === 'search' ? 'stroke-[2.5]' : 'stroke-2'}`} />
        <span className={`text-[11px] font-medium tracking-tight ${currentTab === 'search' ? 'font-bold text-white' : ''}`}>
          Search
        </span>
      </button>

      {/* 3. Coming Soon */}
      <button
        type="button"
        onClick={() => onSelectTab('coming_soon')}
        className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 cursor-pointer transition-colors ${
          currentTab === 'coming_soon' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
        }`}
      >
        <div className="relative">
          <Film className={`w-5 h-5 ${currentTab === 'coming_soon' ? 'stroke-[2.5]' : 'stroke-2'}`} />
        </div>
        <span className={`text-[11px] font-medium tracking-tight ${currentTab === 'coming_soon' ? 'font-bold text-white' : ''}`}>
          Coming Soon
        </span>
      </button>

      {/* 4. Downloads */}
      <button
        type="button"
        onClick={() => onSelectTab('downloads')}
        className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 cursor-pointer transition-colors ${
          currentTab === 'downloads' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
        }`}
      >
        <div className="relative">
          <Download className={`w-5 h-5 ${currentTab === 'downloads' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          {downloadsCount > 0 && (
            <span className="absolute -top-1 -right-2 bg-zinc-600 text-[9px] text-white rounded-full w-3.5 h-3.5 flex items-center justify-center font-bold">
              {downloadsCount}
            </span>
          )}
        </div>
        <span className={`text-[11px] font-medium tracking-tight ${currentTab === 'downloads' ? 'font-bold text-white' : ''}`}>
          Downloads
        </span>
      </button>

      {/* 5. More (with red badge 2 as seen in screenshot IMG_20261019_190853.jpg) */}
      <button
        type="button"
        onClick={() => onSelectTab('more')}
        className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 cursor-pointer transition-colors relative ${
          currentTab === 'more' || currentTab === 'troubleshoot' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
        }`}
      >
        <div className="relative">
          <Menu className={`w-5 h-5 ${currentTab === 'more' || currentTab === 'troubleshoot' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          {/* Netflix Red notification badge 2 */}
          <span className="absolute -top-1.5 -right-2.5 bg-[#e50914] text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-md">
            2
          </span>
        </div>
        <span className={`text-[11px] font-medium tracking-tight ${currentTab === 'more' || currentTab === 'troubleshoot' ? 'font-bold text-white' : ''}`}>
          More
        </span>
      </button>
    </nav>
  );
};
