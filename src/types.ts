export type MediaType = 'movie' | 'tv';

export type ServerKey =
  | 'vidsrc_sh'
  | 'vidsrc_to'
  | 'vidsrc_me'
  | 'vidsrc_net'
  | 'vidsrc_pm'
  | 'multiembed'
  | 'autoembed'
  | 'custom';

export interface SeasonInfo {
  season: number;
  episodes: number;
  first_episode?: number;
  last_episode?: number;
  quality?: string;
}

export interface EpisodeInfo {
  season: number;
  episode: number;
  title: string;
  overview?: string;
  thumbnail?: string;
  duration?: string;
  quality?: string;
}

export interface CastMember {
  name: string;
  character: string;
  photo?: string;
}

export interface MediaItem {
  id: string;
  imdb_id: string;
  tmdb_id?: string | null;
  type: MediaType;
  title: string;
  original_title?: string;
  year: string;
  quality?: string;
  poster: string;
  backdrop: string;
  gallery?: string[]; // Multiple scene pictures and stills (1st, 2nd, 3rd, 4th image)
  overview: string;
  rating?: number | null;
  matchScore?: number;
  ageRating?: string;
  duration?: string;
  genres: string[];
  seasons?: SeasonInfo[];
  total_episodes?: number;
  cast?: CastMember[];
  director?: string;
  embed_url?: string;
  time_added?: string;
  isTop10?: boolean;
  top10Rank?: number;
}

export interface WatchProgress {
  id: string;
  imdb_id: string;
  tmdb_id?: string | null;
  type: MediaType;
  title: string;
  poster: string;
  backdrop?: string;
  season?: number;
  episode?: number;
  currentTime: number;
  duration: number;
  percentage: number;
  lastWatched: number;
}

export interface UserSettings {
  authorized: boolean;
  compactPosters: boolean;
  autoplay: boolean;
  autonext: boolean;
  subtitleLanguage: 'ar,en' | 'en' | 'fr,en' | 'en,ar,fr';
  customSubtitleUrl: string;
  customSubtitleLabel: string;
  soundEffects: boolean;
  defaultServer: ServerKey;
  customDomain: string; // e.g. https://vidsrc-ip.com or user's custom player domain/IP
}

export type Language = 'ar' | 'en' | 'fr';

export type NavigationTab =
  | 'home'
  | 'shows'
  | 'movies'
  | 'categories'
  | 'coming_soon'
  | 'downloads'
  | 'search'
  | 'more'
  | 'troubleshoot';

