'use client';

import { useEffect, useMemo, useState } from 'react';
import Player from '../components/player';
import { isHttpUrl } from '../lib/watch';
import CategorySection from '../ui/category_section';
import SearchPanel from '../ui/search_panel';
import Watchlist, { WatchlistItem } from '../ui/watchlist';

type MediaItem = WatchlistItem & {
  summary?: string;
  poster?: string;
  thumbnail?: string;
  media_type?: 'movie' | 'tv' | 'sports';
  rating?: number;
};

type StreamSource = {
  name: string;
  url: string;
};

type StreamData = {
  title?: string;
  sources?: StreamSource[];
  isLive?: boolean;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

function buildApiUrl(path: string): string {
  const base = API_URL.replace(/\/$/, '');
  return `${base}${path}`;
}

const defaultSeriesMeta = {
  number_of_seasons: 1,
  number_of_episodes: 1,
  seasons: [{ season_number: 1, episode_count: 1 }],
};

export default function SeriesPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [selectedStream, setSelectedStream] = useState<StreamData | null>(null);
  const [activeMirror, setActiveMirror] = useState(0);
  const [loading, setLoading] = useState(true);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const [seriesMeta, setSeriesMeta] = useState(defaultSeriesMeta);
  const [loadingEpisode, setLoadingEpisode] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem('streamio-watchlist');
    if (stored) {
      try {
        setWatchlist(JSON.parse(stored));
      } catch {
        setWatchlist([]);
      }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem('streamio-watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  useEffect(() => {
    const delay = window.setTimeout(() => {
      setLoading(true);
      fetch(buildApiUrl(`/api/feed?type=tv&query=${encodeURIComponent(searchQuery)}`))
        .then((res) => res.json())
        .then((data) => {
          const nextItems = (data.items || []).map((item: MediaItem) => ({
            ...item,
            media_type: 'tv' as const,
            poster: item.poster || item.thumbnail,
          }));
          setItems(nextItems);
          setLoading(false);
        })
        .catch(() => {
          setItems([]);
          setLoading(false);
        });
    }, 320);

    return () => window.clearTimeout(delay);
  }, [searchQuery]);

  const seasonOptions = useMemo(
    () => Array.from({ length: Math.max(1, seriesMeta.number_of_seasons) }, (_, index) => index + 1),
    [seriesMeta.number_of_seasons],
  );

  const currentSeasonEpisodeCount = useMemo(() => {
    const seasonData = seriesMeta.seasons.find((item) => item.season_number === season);
    return Math.max(1, seasonData?.episode_count || 1);
  }, [season, seriesMeta.seasons]);

  const episodeOptions = useMemo(
    () => Array.from({ length: currentSeasonEpisodeCount }, (_, index) => index + 1),
    [currentSeasonEpisodeCount],
  );

  const nextEpisodePosition = useMemo(() => {
    if (episode < currentSeasonEpisodeCount) {
      return { season, episode: episode + 1 };
    }
    if (season < seasonOptions.length) {
      return { season: season + 1, episode: 1 };
    }
    return null;
  }, [currentSeasonEpisodeCount, episode, season, seasonOptions.length]);

  const loadSeriesMeta = async (item: MediaItem) => {
    try {
      const res = await fetch(buildApiUrl(`/api/media-details?id=${item.id}&type=tv`));
      const data = await res.json();
      const seasons =
        Array.isArray(data.seasons) && data.seasons.length > 0 ? data.seasons : defaultSeriesMeta.seasons;
      setSeriesMeta({
        number_of_seasons: Math.max(1, Number(data.number_of_seasons || seasons.length || 1)),
        number_of_episodes: Math.max(
          1,
          Number(
            data.number_of_episodes ||
              seasons.reduce((sum: number, current: { episode_count?: number }) => sum + (Number(current.episode_count) || 0), 0) ||
              1,
          ),
        ),
        seasons: seasons
          .map((entry: { season_number?: number; episode_count?: number }) => ({
            season_number: Number(entry.season_number || 1),
            episode_count: Number(entry.episode_count || 1),
          }))
          .sort((a: { season_number: number }, b: { season_number: number }) => a.season_number - b.season_number),
      });
    } catch {
      setSeriesMeta(defaultSeriesMeta);
    }
  };

  const loadStream = async (rawItem: WatchlistItem, nextSeason = season, nextEpisode = episode) => {
    const item = { ...rawItem, media_type: 'tv' as const, poster: rawItem.poster || rawItem.thumbnail };
    setSelectedItem(item);
    setActiveMirror(0);
    setSeason(nextSeason);
    setEpisode(nextEpisode);
    setLoadingEpisode(true);

    try {
      await loadSeriesMeta(item);
      const urlParam = item.url ? `&url=${encodeURIComponent(item.url)}` : '';
      const res = await fetch(
        buildApiUrl(`/api/stream?id=${item.id}&type=tv&season=${nextSeason}&episode=${nextEpisode}${urlParam}`),
      );
      const data = await res.json();
      setSelectedStream(data);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingEpisode(false);
    }
  };

  const updateSeriesPosition = (nextSeason: number, nextEpisode: number) => {
    const safeSeason = Math.min(Math.max(1, nextSeason), seasonOptions.length || 1);
    const safeEpisodeCount = Math.max(
      1,
      seriesMeta.seasons.find((item) => item.season_number === safeSeason)?.episode_count || 1,
    );
    const safeEpisode = Math.min(Math.max(1, nextEpisode), safeEpisodeCount);
    setSeason(safeSeason);
    setEpisode(safeEpisode);
  };

  const loadSelectedEpisode = () => {
    if (selectedItem) {
      void loadStream(selectedItem, season, episode);
    }
  };

  const loadNextEpisode = () => {
    if (selectedItem && nextEpisodePosition) {
      void loadStream(selectedItem, nextEpisodePosition.season, nextEpisodePosition.episode);
    }
  };

  const toggleWatchlist = (item: WatchlistItem) => {
    setWatchlist((current) => {
      if (current.some((saved) => saved.id === item.id)) {
        return current.filter((saved) => saved.id !== item.id);
      }
      return [item, ...current].slice(0, 24);
    });
  };

  const removeFromWatchlist = (id: string) => {
    setWatchlist((current) => current.filter((item) => item.id !== id));
  };

  const activeSources = selectedStream?.sources || [];
  const currentSource = activeSources[activeMirror]?.url;
  const isDirectHls = Boolean(currentSource?.split('?')[0].toLowerCase().endsWith('.m3u8'));
  const selectedSaved = selectedItem ? watchlist.some((item) => item.id === selectedItem.id) : false;

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <section className="mx-auto max-w-[1500px] px-4 py-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-white/10 bg-neutral-950/90 p-4 shadow-xl shadow-black sm:p-5">
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Series</h1>
          <p className="mt-2 text-sm text-neutral-400">Watch all seasons and episodes</p>
        </div>
      </section>

      {selectedStream && selectedItem ? (
        <section className="px-4 pb-5 sm:px-6 lg:px-8">
          <div className="mx-auto grid min-w-0 max-w-[1500px] gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(260px,340px)]">
            <div className="min-w-0 max-w-full overflow-hidden rounded-[24px] border border-white/10 bg-black shadow-2xl shadow-black">
              <div className="flex flex-col gap-4 border-b border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-500">Now streaming</p>
                  <h2 className="mt-1 truncate text-xl font-black">{selectedItem.title}</h2>
                  <p className="text-sm text-neutral-500">
                    {selectedStream.title || `Season ${season} · Episode ${episode}`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleWatchlist(selectedItem)}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white px-4 py-2 text-sm font-black text-black transition hover:bg-neutral-200"
                >
                  {selectedSaved ? 'Saved' : 'Save'}
                </button>
              </div>

              <div className="relative aspect-video w-full overflow-hidden bg-black">
                {isDirectHls && currentSource && isHttpUrl(currentSource) ? (
                  <Player src={currentSource} />
                ) : currentSource && isHttpUrl(currentSource) ? (
                  <div className="flex h-full flex-col items-center justify-center gap-4 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),_transparent_45%)] p-6">
                    <h3 className="text-xl font-black">Ready to play</h3>
                    <p className="max-w-md text-center text-sm text-neutral-300">
                      Open this stream in a separate window to play it.
                    </p>
                    <a
                      href={currentSource}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full bg-white px-5 py-3 text-sm font-black text-black transition hover:bg-neutral-200"
                    >
                      Play in new window
                    </a>
                  </div>
                ) : (
                  <div className="grid h-full place-items-center p-6 text-sm text-neutral-400">
                    No playable stream found.
                  </div>
                )}
              </div>
            </div>

            <aside className="min-w-0 max-w-full space-y-4">
              <div className="overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-black">Series picker</h3>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-black">
                    S{season} E{episode}
                  </span>
                </div>

                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-neutral-500" htmlFor="season-select">
                  Season
                </label>
                <select
                  id="season-select"
                  value={season}
                  onChange={(event) => updateSeriesPosition(Number(event.target.value), 1)}
                  className="h-11 w-full rounded-xl border border-white/10 bg-black px-3 text-sm font-black text-white outline-none transition focus:border-white/50"
                >
                  {seasonOptions.map((option) => (
                    <option key={option} value={option}>
                      Season {option}
                    </option>
                  ))}
                </select>

                <div className="mb-2 mt-4 flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Episodes</p>
                  <span className="text-xs font-bold text-neutral-500">Choose, then load</span>
                </div>

                <div className="grid max-h-64 gap-2 overflow-y-auto pr-1">
                  {episodeOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => updateSeriesPosition(season, option)}
                      className={`flex min-h-14 items-center justify-between rounded-xl border px-3 text-left transition ${
                        episode === option
                          ? 'border-white bg-white text-black'
                          : 'border-white/10 bg-black text-neutral-300 hover:border-white/30 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <span>
                        <span className="block text-[10px] font-black uppercase tracking-[0.16em] opacity-60">Episode</span>
                        <span className="text-sm font-black">{option}</span>
                      </span>
                      <span className="text-xs font-bold opacity-60">
                        S{season} E{option}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={loadSelectedEpisode}
                    disabled={loadingEpisode}
                    className="rounded-xl bg-white px-3 py-3 text-sm font-black text-black transition hover:bg-neutral-200 disabled:cursor-wait disabled:opacity-60"
                  >
                    {loadingEpisode ? 'Loading...' : `Load S${season} E${episode}`}
                  </button>
                  <button
                    type="button"
                    onClick={loadNextEpisode}
                    disabled={!nextEpisodePosition || loadingEpisode}
                    className="rounded-xl border border-white/15 bg-black px-3 py-3 text-sm font-black text-white transition hover:border-white/40 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next episode
                  </button>
                </div>
              </div>

              <div className="overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
                <h3 className="text-sm font-black">Stream sources</h3>
                <div className="mt-3 grid gap-2">
                  {activeSources.map((src, idx) => (
                    <button
                      key={`${src.name}-${idx}`}
                      type="button"
                      onClick={() => {
                        setActiveMirror(idx);
                      }}
                      className={`min-w-0 truncate rounded-xl px-3 py-3 text-left text-sm font-bold transition ${
                        activeMirror === idx
                          ? 'bg-white text-black'
                          : 'bg-black text-neutral-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {src.name || `Mirror ${idx + 1}`}
                    </button>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-[1500px] space-y-5 px-4 pb-8 sm:px-6 lg:grid lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-5 lg:space-y-0 lg:px-8">
        <aside className="space-y-5">
          <SearchPanel
            activeTabLabel="Series"
            query={searchQuery}
            showKeyboard={showKeyboard}
            suggestions={['Money Heist', 'Breaking Bad', 'The Boys', 'Severance']}
            onQueryChange={setSearchQuery}
            onToggleKeyboard={() => setShowKeyboard((current) => !current)}
            onSelectSuggestion={(suggestion) => setSearchQuery(suggestion)}
          />

          <Watchlist
            items={watchlist}
            activeId={selectedItem?.id}
            onSelect={(item) => void loadStream(item, 1, 1)}
            onRemove={removeFromWatchlist}
          />
        </aside>

        <div className="space-y-6">
          <CategorySection
            title="Latest Series"
            icon="tv"
            items={items}
            loading={loading}
            savedIds={new Set(watchlist.map((entry) => entry.id))}
            onSelect={(item: WatchlistItem) => void loadStream(item, 1, 1)}
            onSave={(item: WatchlistItem) => toggleWatchlist(item)}
          />
        </div>
      </section>
    </div>
  );
}
