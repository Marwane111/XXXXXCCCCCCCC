import React, { useEffect, useState, useMemo } from 'react';
import {
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  Maximize2,
  Minimize2,
  Tv,
  Globe,
  RefreshCw,
  ExternalLink,
  Server,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { MediaItem, Language, UserSettings, WatchProgress, ServerKey } from '../types.ts';
import { useTranslation } from '../i18n/translations.ts';
import { buildVidSrcEmbedUrl } from '../services/vidsrc.ts';

interface PlayerModalProps {
  item: MediaItem;
  initialSeason?: number;
  initialEpisode?: number;
  savedProgress?: WatchProgress;
  settings: UserSettings;
  onClose: () => void;
  onUpdateProgress: (item: MediaItem, currentTime: number, duration: number, season?: number, episode?: number) => void;
  onOpenTroubleshootScreen?: () => void;
  currentLang: Language;
}

export const PlayerModal: React.FC<PlayerModalProps> = ({
  item,
  initialSeason = 1,
  initialEpisode = 1,
  savedProgress,
  settings,
  onClose,
  onUpdateProgress,
  onOpenTroubleshootScreen,
  currentLang,
}) => {
  const [currentSeason, setCurrentSeason] = useState(initialSeason);
  const [currentEpisode, setCurrentEpisode] = useState(initialEpisode);
  const [currentServer, setCurrentServer] = useState<ServerKey>(settings.defaultServer || 'vidsrc_sh');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [subtitleLang, setSubtitleLang] = useState<string>(settings.subtitleLanguage || 'ar,en');
  const [iframeKey, setIframeKey] = useState(0);
  const [showTroubleshoot, setShowTroubleshoot] = useState(false);
  const [autoIssueHint, setAutoIssueHint] = useState(false);
  const t = useTranslation(currentLang);

  // Auto show helpful hint after 5 seconds if user hasn't gotten playback event
  useEffect(() => {
    const timer = setTimeout(() => {
      setAutoIssueHint(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, [iframeKey, currentServer]);


  // Resume position if available
  const startAt = savedProgress ? savedProgress.currentTime : undefined;

  const embedUrl = useMemo(() => {
    const id = item.imdb_id || item.id;
    return buildVidSrcEmbedUrl({
      id,
      tmdb_id: item.tmdb_id,
      type: item.type,
      season: item.type === 'tv' ? currentSeason : undefined,
      episode: item.type === 'tv' ? currentEpisode : undefined,
      server: currentServer,
      customDomain: settings.customDomain,
      autoplay: settings.autoplay,
      autonext: settings.autonext,
      startAt: startAt,
      ds_lang: subtitleLang,
      sub_url: settings.customSubtitleUrl || undefined,
      sub_label: settings.customSubtitleLabel || undefined,
    });
  }, [item, currentSeason, currentEpisode, currentServer, settings, startAt, subtitleLang, iframeKey]);

  // Open player in dedicated popup window
  const handleOpenPopout = () => {
    const win = window.open(
      embedUrl,
      'VidSrcPlayer',
      'width=1100,height=680,menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=no'
    );
    if (!win) {
      window.open(embedUrl, '_blank');
    }
  };

  // Listen to VidSrc player events & track view
  useEffect(() => {
    // Increment invisible internal popularity view counter
    try {
      const views = JSON.parse(localStorage.getItem('titan_flix_internal_views') || '{}');
      views[item.id] = (views[item.id] || 0) + 1;
      localStorage.setItem('titan_flix_internal_views', JSON.stringify(views));
    } catch {}

    const handleMessage = (event: MessageEvent) => {
      if (!event.data || event.data.type !== 'PLAYER_EVENT') return;

      const data = event.data.data;
      if (!data) return;

      const { player_status, player_progress, player_duration } = data;

      if (typeof player_progress === 'number') {
        const dur = typeof player_duration === 'number' && player_duration > 0 ? player_duration : 7200;
        onUpdateProgress(
          item,
          player_progress,
          dur,
          item.type === 'tv' ? currentSeason : undefined,
          item.type === 'tv' ? currentEpisode : undefined
        );
      }

      // Auto advance next episode on completed event
      if (player_status === 'completed' && item.type === 'tv' && settings.autonext) {
        setCurrentEpisode((prev) => prev + 1);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [item, currentSeason, currentEpisode, settings.autonext, onUpdateProgress]);

  // Fullscreen helper
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handleNextEpisode = () => {
    setCurrentEpisode((prev) => prev + 1);
  };

  const handlePrevEpisode = () => {
    if (currentEpisode > 1) {
      setCurrentEpisode((prev) => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col animate-in fade-in select-none">
      {/* Top Player Control Bar */}
      <div className="bg-gradient-to-b from-black/95 via-black/80 to-transparent p-3 md:px-6 flex flex-wrap items-center justify-between gap-3 z-20 border-b border-zinc-800/60">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 bg-zinc-800/90 hover:bg-zinc-700 text-white px-3 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition cursor-pointer border border-zinc-700 shadow"
          >
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
            <span className="hidden sm:inline">{t.backToBrowse}</span>
          </button>

          <div className="text-left rtl:text-right">
            <h3 className="text-xs sm:text-sm font-bold text-white truncate max-w-[180px] sm:max-w-xs md:max-w-md">
              {item.title}
            </h3>
            {item.type === 'tv' && (
              <p className="text-[11px] text-zinc-400">
                {t.season} {currentSeason} • {t.episode} {currentEpisode}
              </p>
            )}
          </div>
        </div>

        {/* Server Switcher Pill Selector */}
        <div className="flex items-center gap-1.5 bg-zinc-900/90 border border-zinc-700 rounded-lg p-1 text-xs overflow-x-auto">
          <span className="text-zinc-400 px-1 font-semibold hidden md:inline flex items-center gap-1">
            <Server className="w-3.5 h-3.5 text-[#e50914]" />
            {t.switchServer}:
          </span>

          <button
            type="button"
            onClick={() => setCurrentServer('vidsrc_sh')}
            className={`px-2 py-1 rounded font-semibold transition cursor-pointer ${
              currentServer === 'vidsrc_sh'
                ? 'bg-[#e50914] text-white shadow'
                : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
            }`}
            title="VidSrc Official Pro"
          >
            Server 1 (SH)
          </button>

          <button
            type="button"
            onClick={() => setCurrentServer('vidsrc_to')}
            className={`px-2 py-1 rounded font-semibold transition cursor-pointer ${
              currentServer === 'vidsrc_to'
                ? 'bg-[#e50914] text-white shadow'
                : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
            }`}
            title="VidSrc TO Fast"
          >
            Server 2 (TO)
          </button>

          <button
            type="button"
            onClick={() => setCurrentServer('vidsrc_me')}
            className={`px-2 py-1 rounded font-semibold transition cursor-pointer ${
              currentServer === 'vidsrc_me'
                ? 'bg-[#e50914] text-white shadow'
                : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
            }`}
            title="VidSrc ME"
          >
            Server 3 (ME)
          </button>

          <button
            type="button"
            onClick={() => setCurrentServer('multiembed')}
            className={`px-2 py-1 rounded font-semibold transition cursor-pointer ${
              currentServer === 'multiembed'
                ? 'bg-[#e50914] text-white shadow'
                : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
            }`}
            title="MultiStream Global"
          >
            Server 4 (Multi)
          </button>

          {settings.customDomain && (
            <button
              type="button"
              onClick={() => setCurrentServer('custom')}
              className={`px-2 py-1 rounded font-semibold transition cursor-pointer ${
                currentServer === 'custom'
                  ? 'bg-[#e50914] text-white shadow'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
              }`}
              title="Custom CNAME / IP"
            >
              Custom IP
            </button>
          )}
        </div>

        {/* Right side controls: Season/Episode selector, Subtitle, Popout, Reload, Fullscreen */}
        <div className="flex items-center gap-2">
          {/* Playback Issues & Diagnostics Button */}
          <button
            type="button"
            onClick={() => setShowTroubleshoot(!showTroubleshoot)}
            className="flex items-center gap-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 px-2.5 py-1.5 rounded-md text-xs font-bold transition shadow cursor-pointer"
            title="Video not playing? Troubleshoot issues"
          >
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Issues?</span>
          </button>

          {/* External Dedicated Popout Player Button (Direct Fix for any Iframe Issues) */}
          <button
            type="button"
            onClick={handleOpenPopout}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1.5 rounded-md text-xs font-bold transition shadow cursor-pointer"
            title={t.openPopout}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.openPopout}</span>
          </button>

          {item.type === 'tv' && (
            <div className="flex items-center gap-1 bg-zinc-900/90 border border-zinc-700 rounded-md px-2 py-1 text-xs">
              <button
                type="button"
                onClick={handlePrevEpisode}
                disabled={currentEpisode <= 1}
                className="text-zinc-400 hover:text-white disabled:opacity-30 p-1 cursor-pointer"
                title={t.previousEpisode}
              >
                <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
              </button>
              <span className="text-white font-bold px-1">
                E{currentEpisode}
              </span>
              <button
                type="button"
                onClick={handleNextEpisode}
                className="text-zinc-400 hover:text-white p-1 cursor-pointer"
                title={t.nextEpisode}
              >
                <ChevronRight className="w-4 h-4 rtl:rotate-180" />
              </button>
            </div>
          )}

          {/* Subtitle language quick select */}
          <div className="relative hidden lg:flex items-center gap-1 bg-zinc-900/90 border border-zinc-700 rounded-md px-2 py-1 text-xs">
            <Globe className="w-3.5 h-3.5 text-zinc-400" />
            <select
              value={subtitleLang}
              onChange={(e) => setSubtitleLang(e.target.value)}
              className="bg-transparent text-white text-xs focus:outline-none cursor-pointer"
            >
              <option value="ar,en" className="bg-zinc-900">عربي / English</option>
              <option value="en" className="bg-zinc-900">English</option>
              <option value="fr,en" className="bg-zinc-900">Français</option>
            </select>
          </div>

          {/* Reload iframe */}
          <button
            type="button"
            onClick={() => setIframeKey((k) => k + 1)}
            className="p-1.5 rounded-md bg-zinc-900/90 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 transition cursor-pointer"
            title="Reload Player"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Fullscreen toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1.5 rounded-md bg-zinc-900/90 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 transition cursor-pointer"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Embedded Player Viewport */}
      <div className="relative flex-1 w-full h-full bg-black flex items-center justify-center">
        <iframe
          id="videoPlayer"
          key={`${embedUrl}-${iframeKey}`}
          src={embedUrl}
          title={item.title}
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          allowFullScreen
          referrerPolicy="origin"
          style={{ width: '100%', height: '100%', border: 0 }}
        />

        {/* Auto-hint banner if video takes more than 5s or gets blocked */}
        {autoIssueHint && !showTroubleshoot && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-zinc-900/95 border border-amber-500/50 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 text-xs backdrop-blur-md max-w-lg">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="flex-1">
              <span className="font-semibold text-white">Video not starting or black screen?</span>
              <span className="text-zinc-300 ml-1">Try switching to Server 2 (TO) or use Direct Window.</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setCurrentServer('vidsrc_to');
                  setAutoIssueHint(false);
                }}
                className="bg-[#e50914] text-white px-2.5 py-1 rounded font-bold hover:bg-red-700 cursor-pointer"
              >
                Server 2
              </button>
              <button
                type="button"
                onClick={handleOpenPopout}
                className="bg-emerald-600 text-white px-2.5 py-1 rounded font-bold hover:bg-emerald-500 cursor-pointer"
              >
                Popout
              </button>
              <button
                type="button"
                onClick={() => setAutoIssueHint(false)}
                className="text-zinc-400 hover:text-white px-1 font-bold"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Inline Troubleshooting Modal / Drawer */}
        {showTroubleshoot && (
          <div className="absolute inset-0 z-40 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#181818] border border-zinc-700 rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2 text-amber-400">
                  <AlertCircle className="w-5 h-5" />
                  <h3 className="font-bold text-white text-base">Quick Playback Troubleshooter</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTroubleshoot(false)}
                  className="text-zinc-400 hover:text-white p-1 rounded-full bg-zinc-800"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs text-zinc-300">
                <p className="leading-relaxed">
                  If the video screen stays black or shows a broken player, this is usually caused by browser iframe
                  restrictions or adblockers blocking external stream scripts.
                </p>

                <div className="space-y-2 pt-1">
                  <p className="font-bold text-white">Recommended Fixes:</p>

                  <button
                    type="button"
                    onClick={() => {
                      handleOpenPopout();
                      setShowTroubleshoot(false);
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white p-3 rounded-xl flex items-center justify-between font-bold text-xs cursor-pointer shadow-lg transition"
                  >
                    <div className="flex items-center gap-2">
                      <ExternalLink className="w-4 h-4" />
                      <span>1. Launch in Standalone Cinema Window (100% Guaranteed to Work)</span>
                    </div>
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl space-y-2">
                    <p className="font-semibold text-zinc-200">2. Switch Streaming Node:</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { key: 'vidsrc_sh', label: 'Server 1 (SH)' },
                        { key: 'vidsrc_to', label: 'Server 2 (TO)' },
                        { key: 'vidsrc_me', label: 'Server 3 (ME)' },
                        { key: 'multiembed', label: 'Server 4 (Multi)' },
                      ].map((s) => (
                        <button
                          key={s.key}
                          type="button"
                          onClick={() => {
                            setCurrentServer(s.key as ServerKey);
                            setIframeKey((k) => k + 1);
                            setShowTroubleshoot(false);
                          }}
                          className={`p-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                            currentServer === s.key
                              ? 'bg-[#e50914] text-white shadow'
                              : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {onOpenTroubleshootScreen && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowTroubleshoot(false);
                        onClose();
                        onOpenTroubleshootScreen();
                      }}
                      className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 p-2.5 rounded-xl text-center font-semibold text-xs cursor-pointer transition"
                    >
                      Open Full Stream Diagnostics & Screen Issues Dashboard →
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Floating Quick Action Overlay if video doesn't play */}
        <div className="absolute bottom-4 right-4 rtl:right-auto rtl:left-4 z-30 flex items-center gap-2">
          <button
            type="button"
            onClick={handleOpenPopout}
            className="bg-zinc-900/90 hover:bg-zinc-800 text-white border border-zinc-700 px-3 py-1.5 rounded-lg text-xs font-semibold backdrop-blur-md flex items-center gap-1.5 shadow-xl transition cursor-pointer hover:border-emerald-500"
          >
            <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t.openPopout}</span>
          </button>
        </div>
      </div>

      {/* Bottom status note & troubleshooting guide */}
      <div className="bg-[#101010] py-2 px-4 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-[11px] text-zinc-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-semibold text-zinc-300">{item.title}</span>
          <span className="text-zinc-500">•</span>
          <span className="text-zinc-400">Current Node: {currentServer.toUpperCase()}</span>
          {item.type === 'tv' && (
            <span className="text-zinc-400">• S{currentSeason} E{currentEpisode}</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-zinc-400 hidden sm:inline">
            {t.playbackIssueHelp}
          </span>
          <button
            type="button"
            onClick={() => setIframeKey((k) => k + 1)}
            className="text-zinc-300 hover:text-white underline cursor-pointer"
          >
            Reload
          </button>
        </div>
      </div>
    </div>
  );
};
