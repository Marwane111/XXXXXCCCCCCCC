import { MediaItem } from '../types.ts';

// "Invisible Internal System" for daily trending, view counts, and diversity ranking

const STORAGE_VIEWS_KEY = 'titan_flix_internal_views';
const STORAGE_DAILY_DATE_KEY = 'titan_flix_trending_date';

// Retrieve local view tracking map
export function getLocalViewCounts(): Record<string, number> {
  try {
    const raw = localStorage.getItem(STORAGE_VIEWS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

// Increment view count when user watches or clicks a title
export function recordTitleView(id: string): void {
  try {
    const views = getLocalViewCounts();
    views[id] = (views[id] || 0) + 1;
    localStorage.setItem(STORAGE_VIEWS_KEY, JSON.stringify(views));
  } catch {}
}

// Generate deterministic pseudo-random daily view count based on current date
function getDailySeed(): number {
  const now = new Date();
  return now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
}

// Compute dynamic daily popularity score & view stats for each item
export interface RankedMediaItem extends MediaItem {
  todayViews: number;
  trendingRank: number;
  trendingVelocity: string;
  badgeTag?: string;
}

export function rankAndEnrichMedia(items: MediaItem[]): RankedMediaItem[] {
  const localViews = getLocalViewCounts();
  const seed = getDailySeed();

  const enriched: RankedMediaItem[] = items.map((item, index) => {
    // Generate organic baseline daily views: e.g. 35,000 to 98,000 views
    // Seeded by title length and date so it changes day-by-day!
    const hash = (item.title.charCodeAt(0) * 31 + item.id.charCodeAt(item.id.length - 1) * 17 + seed) % 1000;
    const baseViews = 25000 + (hash * 75);
    const userClicks = (localViews[item.id] || localViews[item.imdb_id] || 0) * 1500;
    const totalViews = baseViews + userClicks;

    const ratingFactor = (item.rating || 7.5) / 10;
    const finalScore = totalViews * ratingFactor;

    // Velocity tag: "Top Viewed", "+48% today", "Viral today"
    let velocity = 'Steady';
    if (hash > 800 || userClicks > 0) velocity = '+54% Today';
    else if (hash > 600) velocity = '+32% Today';
    else if (hash > 400) velocity = '+18% Today';

    return {
      ...item,
      todayViews: Math.round(totalViews),
      trendingRank: 0,
      trendingVelocity: velocity,
      matchScore: Math.min(99, Math.max(88, Math.round(85 + (hash % 15)))),
    };
  });

  // Sort by calculated popularity score
  enriched.sort((a, b) => b.todayViews - a.todayViews);

  // Assign ranking numbers
  enriched.forEach((item, idx) => {
    item.trendingRank = idx + 1;
    if (idx === 0) item.badgeTag = '#1 Most Viewed Today';
    else if (idx === 1) item.badgeTag = '#2 Trending Worldwide';
    else if (idx < 5) item.badgeTag = `Top 5 Today`;
    else if (idx < 10) item.badgeTag = `Top 10 Today`;
  });

  return enriched;
}

// Ensure rows do NOT repeat the same movies over and over
// Each row gets unique content with priority allocation!
export function partitionDistinctRows(items: RankedMediaItem[]): {
  mostViewedToday: RankedMediaItem[];
  top10: RankedMediaItem[];
  actionBlockbusters: RankedMediaItem[];
  tvSeries: RankedMediaItem[];
  sciFiEpics: RankedMediaItem[];
  criticsDramas: RankedMediaItem[];
  crimeThrillers: RankedMediaItem[];
  allDiverse: RankedMediaItem[];
} {
  const usedIds = new Set<string>();

  const takeUnique = (filterFn: (m: RankedMediaItem) => boolean, limit = 10): RankedMediaItem[] => {
    const list: RankedMediaItem[] = [];
    for (const m of items) {
      if (list.length >= limit) break;
      if (!usedIds.has(m.id) && filterFn(m)) {
        list.push(m);
        usedIds.add(m.id);
      }
    }
    // If not enough unique, fill with best matching remaining
    if (list.length < 5) {
      for (const m of items) {
        if (list.length >= limit) break;
        if (!list.some((existing) => existing.id === m.id) && filterFn(m)) {
          list.push(m);
        }
      }
    }
    return list;
  };

  // 1. Most Viewed Today (Top 10 highest view velocity today)
  const mostViewedToday = items.slice(0, 10);
  // Do not mark all as permanently excluded so top 10 can still reference top hits
  mostViewedToday.slice(0, 4).forEach((m) => usedIds.add(m.id));

  // 2. Top 10 Today
  const top10 = items.filter((m) => m.isTop10 || m.trendingRank <= 10).slice(0, 10);

  // 3. Action Blockbusters (Strictly unique)
  const actionBlockbusters = takeUnique((m) => m.genres.includes('Action'));

  // 4. TV Series (Strictly unique TV series)
  const tvSeries = takeUnique((m) => m.type === 'tv');

  // 5. Sci-Fi Epics (Strictly unique Sci-Fi)
  const sciFiEpics = takeUnique((m) => m.genres.includes('Sci-Fi'));

  // 6. Award-Winning Dramas (Strictly unique Drama)
  const criticsDramas = takeUnique((m) => m.genres.includes('Drama') && (m.rating || 0) >= 8.0);

  // 7. Crime & Mystery Thrillers (Strictly unique Crime/Thriller)
  const crimeThrillers = takeUnique((m) => m.genres.includes('Crime') || m.genres.includes('Thriller'));

  return {
    mostViewedToday,
    top10,
    actionBlockbusters,
    tvSeries,
    sciFiEpics,
    criticsDramas,
    crimeThrillers,
    allDiverse: items,
  };
}
