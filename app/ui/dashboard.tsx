'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Player from '../components/player';
import CategorySection from './category_section';
import HeroBanner from './hero-banner';
import LatestList from './latest_list';
import SearchPanel from './search_panel';
import SportsStreams from './sports_streams';
import Watchlist, { WatchlistItem, WatchlistMediaKind } from './watchlist';

type MediaKind = 'movie' | 'tv' | 'sports';

type MediaItem = WatchlistItem & {
  media_type?: WatchlistMediaKind;
  summary?: string;
  competition?: string;
};

type StreamSource = {
  name: string;
  url: string;
};

type StreamData = {
  title: string;
  sources?: StreamSource[];
  isLive?: boolean;
};

type MediaIconName = 'film' | 'tv' | 'radio';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
const buildApiUrl = (path: string) => `${API_BASE.replace(/\/$/, '')}${path}`;

const tabs: { id: MediaKind; label: string; helper: string; icon: MediaIconName }[] = [
  { id: 'movie', label: 'Movies', helper: 'Trending films', icon: 'film' },
  { id: 'tv', label: 'Series', helper: 'Episodes and seasons', icon: 'tv' },
  { id: 'sports', label: 'Sports', helper: 'Live channels', icon: 'radio' },
];

const suggestedSearches: Record<MediaKind, string[]> = {
  movie: ['Dune', 'John Wick', 'Oppenheimer', 'Mission Impossible'],
  tv: ['Money Heist', 'Breaking Bad', 'The Boys', 'Severance'],
  sports: ['football', 'premier league', 'ufc', 'formula 1'],
};

const defaultLiveStreams = [
  { name: 'Live Sports HD', url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' },
  { name: 'Red Bull TV', url: 'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8' },
  { name: 'Open Coverage', url: 'https://d3rlna7iyuk8km.cloudfront.net/ATVafrica/atvamericas/s.m3u8' },
  { name: 'Akamai Live Test 1', url: 'https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8' },
  { name: 'Akamai Live Test 2', url: 'https://moctobpltc-i.akamaihd.net/hls/live/571329/eight/playlist.m3u8' },
  { name: 'Apple BipBop Sample', url: 'https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8' },
  { name: 'Unified Stream Test', url: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8' },
];

const defaultSeriesMeta = {
  number_of_seasons: 1,
  number_of_episodes: 1,
  seasons: [{ season_number: 1, episode_count: 1 }],
};

const supportedPlatforms = [
  { name: 'Netflix', color: 'from-red-600 to-red-700', svg: 'M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2Zm-10 10H8v4h2v-4Zm4-2h2v6h-2v-6Zm4-2h2v8h-2v-8Z' },
  { name: 'Hulu', color: 'from-green-500 to-green-600', svg: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm-2 15h-2V9h2v8Zm4-8h2v8h-2v-8Zm4 6h-2V9h2v6Z' },
  { name: 'HBO Max', color: 'from-purple-700 to-purple-800', svg: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8Zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5Zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11Zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5Z' },
  { name: 'Disney+', color: 'from-blue-500 to-blue-600', svg: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm-4 15h2V9h-2v8Zm4-8h2v8h-2v-8Zm4 6h-2V9h2v6Z' },
  { name: 'Prime Video', color: 'from-blue-600 to-blue-700', svg: 'M19.35 10.04C18.67 6.59 15.64 4 12 4c-1.48 0-2.85.43-4.01 1.17l1.46 1.46C10.21 5.23 11.08 5 12 5c3.04 0 5.64 1.99 6.59 4.71l2.76-2.67zM4 12.01h9v2H4zm15.64 2.75c.9-1.76 1.36-3.74 1.36-5.76 0-2.77-.88-5.35-2.39-7.47L16 5.07C17.15 6.78 18 8.99 18 12.01h2z' },
  { name: 'Apple TV+', color: 'from-gray-800 to-gray-900', svg: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm-2 15h-2V9h2v8Zm4-8h2v8h-2v-8Zm4 6h-2V9h2v6Z' },
];

export type IconName = 'search' | 'bookmark' | 'check' | 'play' | 'tv' | 'film' | 'radio' | 'spark' | 'grid' | 'keyboard';

function Icon({ name, className = 'h-4 w-4' }: { name: IconName; className?: string }) {
  if (name === 'play') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className={`${className} fill-current`}>
        <path d="M8 5v14l11-7L8 5Z" />
      </svg>
    );
  }

  const paths: Record<Exclude<IconName, 'play'>, string> = {
    search: 'm21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z',
    bookmark: 'M6 4h12v17l-6-4-6 4V4Z',
    check: 'm5 12 4 4L19 6',
    film: 'M4 5h16v14H4V5Zm4 0v14m8-14v14M4 9h4m8 0h4M4 15h4m8 0h4',
    tv: 'M4 6h16v11H4V6Zm6 15h4m-2-4v4',
    radio: 'M5 11a7 7 0 0 1 14 0v5a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3v-5Zm4 2h6M9 16h2',
    spark: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z',
    grid: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
    keyboard: 'M3 6h18v12H3V6Zm3 3h.01M9 9h.01M12 9h.01M15 9h.01M18 9h.01M6 12h.01M9 12h.01M12 12h.01M15 12h.01M18 12h.01M8 15h8',
  };

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={`${className} fill-none stroke-current stroke-2`} strokeLinecap="round" strokeLinejoin="round">
      <path d={paths[name]} />
    </svg>
  );
}

function normalizeItem(item: MediaItem, fallbackType: MediaKind): MediaItem {
  return {
    ...item,
    poster: item.poster || item.thumbnail,
    media_type: item.media_type || fallbackType,
  };
}

export default function DashboardUI() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<MediaKind>('movie');
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState<MediaItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [selectedStream, setSelectedStream] = useState<StreamData | null>(null);
  const [activeMirror, setActiveMirror] = useState(0);
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const [loading, setLoading] = useState(true);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [playerLocked, setPlayerLocked] = useState(true);
  const [inlinePlayer, setInlinePlayer] = useState(false);
  const [seriesMeta, setSeriesMeta] = useState(defaultSeriesMeta);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [loadingEpisode, setLoadingEpisode] = useState(false);

  useEffect(() => {
    const requestedType = searchParams.get('type');
    if (requestedType === 'movie' || requestedType === 'tv' || requestedType === 'sports') {
      setActiveTab(requestedType);
      setSearchQuery('');
    }
  }, [searchParams]);

  useEffect(() => {
    const stored = window.localStorage.getItem('streamio-watchlist');
    if (!stored) return;

    try {
      setWatchlist(JSON.parse(stored));
    } catch {
      setWatchlist([]);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem('streamio-watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  useEffect(() => {
    const delay = window.setTimeout(() => {
      setLoading(true);
      const url = buildApiUrl(`/api/feed?type=${activeTab}&query=${encodeURIComponent(searchQuery)}`);

      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          const nextItems = (data.items || []).map((item: MediaItem) => normalizeItem(item, activeTab));
          setItems(nextItems);
          setLoading(false);
        })
        .catch(() => {
          setItems([]);
          setLoading(false);
        });
    }, 320);

    return () => window.clearTimeout(delay);
  }, [activeTab, searchQuery]);

  const selectedSaved = useMemo(
    () => selectedItem ? watchlist.some((item) => item.id === selectedItem.id) : false,
    [selectedItem, watchlist],
  );

  const loadStream = async (rawItem: WatchlistItem, nextSeason = season, nextEpisode = episode) => {
    const item = normalizeItem(rawItem as MediaItem, activeTab);
    setSelectedItem(item);
    setActiveMirror(0);
    setSeason(nextSeason);
    setEpisode(nextEpisode);
    setLoadingEpisode(true);

    try {
      if ((item.media_type || activeTab) === 'tv') {
        await loadSeriesMeta(item);
      }

      const urlParam = item.url ? `&url=${encodeURIComponent(item.url)}` : '';
      const type = item.media_type || activeTab;
      const res = await fetch(buildApiUrl(`/api/stream?id=${item.id}&type=${type}&season=${nextSeason}&episode=${nextEpisode}${urlParam}`));
      const data = await res.json();
      setSelectedStream(data);
      setPlayerLocked(true);
      setInlinePlayer(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingEpisode(false);
    }
  };

  const switchTab = (tab: MediaKind) => {
    setActiveTab(tab);
    setSearchQuery('');
    setSelectedItem(null);
    setSelectedStream(null);
    setPlayerLocked(true);
    setInlinePlayer(false);
    setSeriesMeta(defaultSeriesMeta);
    setSeason(1);
    setEpisode(1);
  };

  const toggleWatchlist = (rawItem: MediaItem) => {
    const item = normalizeItem(rawItem, activeTab);

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

  const updateSeriesPosition = (nextSeason: number, nextEpisode: number) => {
    const safeSeason = Math.min(Math.max(1, nextSeason), seasonOptions.length || 1);
    const safeEpisodeCount = Math.max(1, seriesMeta.seasons.find((item) => item.season_number === safeSeason)?.episode_count || 1);
    const safeEpisode = Math.min(Math.max(1, nextEpisode), safeEpisodeCount);

    setSeason(safeSeason);
    setEpisode(safeEpisode);
  };

  const loadSelectedEpisode = () => {
    if (selectedItem) {
      loadStream(selectedItem, season, episode);
    }
  };

  const activeSources = selectedStream?.sources || [];
  const currentSource = activeSources[activeMirror]?.url;
  const isDirectHls = Boolean(currentSource?.split('?')[0].toLowerCase().endsWith('.m3u8'));
  const activeTabMeta = tabs.find((tab) => tab.id === activeTab) || tabs[0];

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(target.tagName)) {
        return;
      }

      if (event.code === 'Space' && selectedItem && !selectedStream?.isLive) {
        event.preventDefault();
        setPlayerLocked((current) => !current);
      }

      if (event.code === 'Enter' && currentSource && !selectedStream?.isLive) {
        event.preventDefault();
        if (playerLocked) {
          setPlayerLocked(false);
          return;
        }
        window.open(currentSource, '_blank', 'noopener,noreferrer');
      }

      if ((event.code === 'ArrowLeft' || event.code === 'ArrowRight') && activeSources.length > 1) {
        event.preventDefault();
        const nextIndex = event.code === 'ArrowRight'
          ? (activeMirror + 1) % activeSources.length
          : (activeMirror - 1 + activeSources.length) % activeSources.length;
        setActiveMirror(nextIndex);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItem, selectedStream, activeSources, activeMirror, currentSource, playerLocked]);

  const nextEpisodePosition = useMemo(() => {
    if (episode < currentSeasonEpisodeCount) {
      return { season, episode: episode + 1 };
    }

    if (season < seasonOptions.length) {
      return { season: season + 1, episode: 1 };
    }

    return null;
  }, [currentSeasonEpisodeCount, episode, season, seasonOptions.length]);

  const loadNextEpisode = () => {
    if (selectedItem && nextEpisodePosition) {
      loadStream(selectedItem, nextEpisodePosition.season, nextEpisodePosition.episode);
    }
  };

  const loadSeriesMeta = async (item: MediaItem) => {
    if ((item.media_type || activeTab) !== 'tv') {
      setSeriesMeta(defaultSeriesMeta);
      return;
    }

    try {
      const res = await fetch(buildApiUrl(`/api/media-details?id=${item.id}&type=tv`));
      const data = await res.json();
      const seasons = Array.isArray(data.seasons) && data.seasons.length > 0 ? data.seasons : defaultSeriesMeta.seasons;
      setSeriesMeta({
        number_of_seasons: Math.max(1, Number(data.number_of_seasons || seasons.length || 1)),
        number_of_episodes: Math.max(1, Number(data.number_of_episodes || seasons.reduce((sum: number, current: any) => sum + (Number(current.episode_count) || 0), 0) || 1)),
        seasons: seasons.map((item: any) => ({
          season_number: Number(item.season_number || 1),
          episode_count: Number(item.episode_count || 1),
        })).sort((a: any, b: any) => a.season_number - b.season_number),
      });
    } catch {
      setSeriesMeta(defaultSeriesMeta);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <section className="mx-auto max-w-[1500px] px-4 py-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-white/10 bg-neutral-950/90 p-4 shadow-xl shadow-black sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">Find your next watch.</h1>
            </div>

            <div className="grid gap-2 sm:grid-cols-3 lg:w-[520px]">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => switchTab(tab.id)}
                  className={`rounded-xl border px-3 py-2 text-left transition ${
                    activeTab === tab.id
                      ? 'border-white bg-white text-black shadow-xl shadow-white/10'
                      : 'border-white/10 bg-black/40 text-white hover:border-white/30 hover:bg-white/10'
                  }`}
                >
                  <span className="flex items-center gap-2 text-sm font-black">
                    <Icon name={tab.icon} className="h-4 w-4" />
                    {tab.label}
                  </span>
                  <span className="mt-0.5 block text-xs opacity-60">{tab.helper}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-4 pb-5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">Supported platforms</p>
          </div>
        </div>
        <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
          {supportedPlatforms.map((platform) => (
            <div 
              key={platform.name} 
              className={`flex min-w-[140px] items-center gap-3 rounded-xl border border-white/10 bg-gradient-to-br ${platform.color} px-3 py-3 transition hover:border-white/40 hover:shadow-lg hover:shadow-white/20`}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-black/40">
                <svg 
                  aria-hidden="true"
                  viewBox="0 0 24 24" 
                  className="h-5 w-5 fill-white"
                >
                  <path d={platform.svg} />
                </svg>
              </span>
              <span className="whitespace-nowrap text-xs font-black text-white">{platform.name}</span>
            </div>
          ))}
        </div>
      </section>



      {selectedStream && selectedItem && (
        <section className="px-4 pb-5 sm:px-6 lg:px-8">
          <div className="grid min-w-0 max-w-full gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(260px,340px)]">
            <div className="min-w-0 max-w-full overflow-hidden rounded-[24px] border border-white/10 bg-black shadow-2xl shadow-black">
              <div className="flex flex-col gap-4 border-b border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-500">Now streaming</p>
                  <h2 className="mt-1 truncate text-xl font-black">{selectedItem.title}</h2>
                  <p className="text-sm text-neutral-500">{selectedStream.title}</p>
                </div>
                <button
                  onClick={() => toggleWatchlist(selectedItem)}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white px-4 py-2 text-sm font-black text-black transition hover:bg-neutral-200"
                >
                  <Icon name={selectedSaved ? 'check' : 'bookmark'} />
                  {selectedSaved ? 'Saved' : 'Save'}
                </button>
              </div>

              <div className="relative aspect-video w-full overflow-hidden bg-black">
                {isDirectHls && currentSource ? (
                  <Player src={currentSource} />
                ) : selectedStream.isLive && activeSources[0] ? (
                  <div className="flex h-full flex-col items-center justify-center gap-4">
                    <span className="grid h-14 w-14 place-items-center rounded-full bg-white text-black">
                      <Icon name="radio" className="h-6 w-6" />
                    </span>
                    <a href={activeSources[0].url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-black transition hover:bg-neutral-200">
                      <Icon name="play" />
                      Open live stream
                    </a>
                  </div>
                ) : (
                  <>
                    {inlinePlayer && currentSource ? (
                      <>
                        <iframe
                          src={currentSource}
                          title={selectedItem.title}
                          className={`h-full w-full border-0 ${playerLocked ? 'pointer-events-none' : 'pointer-events-auto'}`}
                          allowFullScreen
                          allow="autoplay; fullscreen; picture-in-picture; clipboard-write"
                          referrerPolicy="strict-origin-when-cross-origin"
                        />

                        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-3 opacity-0 transition duration-200 hover:opacity-100 group-hover:opacity-100">
                          <div className="flex justify-end">
                            <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-white/10 bg-black/55 px-2 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-200 backdrop-blur-sm">
                              <span className="h-2 w-2 rounded-full bg-emerald-400" />
                              Live protected
                            </div>
                          </div>

                          <div className="pointer-events-auto rounded-2xl border border-white/10 bg-black/55 p-3 backdrop-blur-sm">
                            <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                              <div className="h-full w-1/3 rounded-full bg-white" />
                            </div>
                            <div className="flex items-center justify-between gap-3 text-white">
                              <div className="flex items-center gap-2">
                                <button type="button" className="grid h-9 w-9 place-items-center rounded-full bg-white text-black transition hover:bg-neutral-200">
                                  <Icon name="play" className="h-4 w-4" />
                                </button>
                                <button type="button" className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/15">
                                  <span className="text-sm font-black">10s</span>
                                </button>
                                <button type="button" className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/15">
                                  <span className="text-sm font-black">+10s</span>
                                </button>
                              </div>

                              <div className="flex items-center gap-2">
                                <button type="button" className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/15">
                                  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                                    <path d="M3 9v6h4l5 5V4L7 9H3Zm13.5 3a4.5 4.5 0 0 0-2.5-4.03v8.06A4.5 4.5 0 0 0 16.5 12ZM18 3.5v2.06a7 7 0 0 1 0 12.88v2.06A9 9 0 0 0 18 3.5Z"/>
                                  </svg>
                                </button>
                                <button type="button" className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/15">
                                  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                                    <path d="M7 14v-4h3L12 7v10l-2-3H7Zm9-8h2v12h-2V6Zm-4 1.5V16.5L9.5 14H7v-4h2.5L12 7.5Z"/>
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div
                          className={`absolute inset-0 z-20 flex items-end justify-center bg-black/55 backdrop-blur-[1px] transition-opacity duration-200 ${playerLocked ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}
                          onMouseDown={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                          }}
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            setPlayerLocked(false);
                          }}
                        >
                          <button
                            type="button"
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              setPlayerLocked(false);
                            }}
                            className="mb-4 cursor-pointer rounded-full border border-white/20 bg-white px-4 py-2 text-sm font-black text-black shadow-lg shadow-black/40 transition hover:bg-neutral-200"
                          >
                            Unlock player
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),_transparent_45%),_linear-gradient(180deg,_#0b0b0b,_#030303)] p-6">
                        <div className="w-full max-w-xl rounded-[28px] border border-white/10 bg-black/55 p-5 shadow-2xl shadow-black/50 backdrop-blur-sm">
                          <div className="mb-4 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <span className="grid h-11 w-11 place-items-center rounded-full bg-white text-black">
                                <Icon name="play" className="h-5 w-5" />
                              </span>
                              <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-300">Safe playback</p>
                                <h3 className="text-xl font-black">Protected stream view</h3>
                              </div>
                            </div>
                            <span className="rounded-full border border-yellow-400/40 bg-yellow-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-yellow-200">Secure</span>
                          </div>

                          <div className="mb-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left">
                            <p className="text-sm leading-6 text-neutral-300">
                              Some third-party embed sources can trigger file downloads or ad popups. This app keeps the stream protected by default and only opens the inline player when you choose to trust the source.
                            </p>
                          </div>

                          <div className="mb-5 space-y-3">
                            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2">
                              <span className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-500">Playback mode</span>
                              <span className="text-sm font-black text-white">Protected</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-white/10">
                              <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-white via-neutral-200 to-neutral-400" />
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center justify-center gap-3">
                            <button
                              type="button"
                              onClick={() => {
                                if (currentSource) {
                                  window.open(currentSource, '_blank', 'noopener,noreferrer');
                                }
                              }}
                              className="rounded-full bg-white px-5 py-3 text-sm font-black text-black transition hover:bg-neutral-200"
                            >
                              Open stream safely
                            </button>
                            <button
                              type="button"
                              onClick={() => setInlinePlayer(true)}
                              className="rounded-full border border-white/15 bg-black px-5 py-3 text-sm font-black text-white transition hover:border-white/30 hover:bg-white/10"
                            >
                              Try inline player
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            <aside className="min-w-0 max-w-full space-y-4">
              {selectedItem.media_type === 'tv' && (
                <div className="overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-sm font-black">Series picker</h3>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-black">S{season} E{episode}</span>
                  </div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-neutral-500" htmlFor="season-select">Season</label>
                  <select
                    id="season-select"
                    value={season}
                    onChange={(event) => updateSeriesPosition(Number(event.target.value), 1)}
                    className="h-11 w-full rounded-xl border border-white/10 bg-black px-3 text-sm font-black text-white outline-none transition focus:border-white/50"
                  >
                    {seasonOptions.map((option) => (
                      <option key={option} value={option}>Season {option}</option>
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
                        className={`flex min-h-14 items-center justify-between rounded-xl border px-3 text-left transition ${episode === option ? 'border-white bg-white text-black' : 'border-white/10 bg-black text-neutral-300 hover:border-white/30 hover:bg-white/10 hover:text-white'}`}
                      >
                        <span>
                          <span className="block text-[10px] font-black uppercase tracking-[0.16em] opacity-60">Episode</span>
                          <span className="text-sm font-black">{option}</span>
                        </span>
                        <span className="text-xs font-bold opacity-60">S{season} E{option}</span>
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
              )}

              <div className="overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
                <h3 className="text-sm font-black">Stream sources</h3>
                <div className="mt-3 grid gap-2">
                  {activeSources.map((src, idx) => (
                    <button
                      key={`${src.name}-${idx}`}
                      onClick={() => setActiveMirror(idx)}
                      className={`min-w-0 truncate rounded-xl px-3 py-3 text-left text-sm font-bold transition ${activeMirror === idx ? 'bg-white text-black' : 'bg-black text-neutral-300 hover:bg-white/10 hover:text-white'}`}
                    >
                      {src.name || `Mirror ${idx + 1}`}
                    </button>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </section>
      )}

      <div className="mx-auto max-w-[1500px] space-y-5 px-4 pb-8 sm:px-6 lg:grid lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-5 lg:space-y-0 lg:px-8">

      </div>

      <div className="mx-auto max-w-[1500px] space-y-5 px-4 pb-8 sm:px-6 lg:grid lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-5 lg:space-y-0 lg:px-8">
        <aside className="space-y-5">
          <LatestList
            items={items}
            activeId={selectedItem?.id}
            loading={loading}
            onSelect={(item) => loadStream(item, 1, 1)}
            onSave={(item: WatchlistItem) => toggleWatchlist(item)}
            savedIds={new Set(watchlist.map((entry) => entry.id))}
          />

          <SearchPanel
            activeTabLabel={activeTabMeta.label}
            query={searchQuery}
            showKeyboard={showKeyboard}
            suggestions={suggestedSearches[activeTab]}
            onQueryChange={setSearchQuery}
            onToggleKeyboard={() => setShowKeyboard((current) => !current)}
            onSelectSuggestion={(suggestion) => setSearchQuery(suggestion)}
          />

          <Watchlist
            items={watchlist}
            activeId={selectedItem?.id}
            onSelect={(item) => loadStream(item, 1, 1)}
            onRemove={removeFromWatchlist}
          />
        </aside>

        <div className="space-y-6">
          {selectedItem && <HeroBanner item={selectedItem} onSelect={() => {}} />}

          <CategorySection
            title="Movies"
            icon="film"
            items={items.filter((i) => (i.media_type || activeTab) === 'movie')}
            loading={loading && activeTab === 'movie'}
            savedIds={new Set(watchlist.map((entry) => entry.id))}
            onSelect={(item: WatchlistItem) => loadStream(item, 1, 1)}
            onSave={(item: WatchlistItem) => toggleWatchlist(item)}
          />

          <CategorySection
            title="Series"
            icon="tv"
            items={items.filter((i) => (i.media_type || activeTab) === 'tv')}
            loading={loading && activeTab === 'tv'}
            savedIds={new Set(watchlist.map((entry) => entry.id))}
            onSelect={(item: WatchlistItem) => loadStream(item, 1, 1)}
            onSave={(item: WatchlistItem) => toggleWatchlist(item)}
          />

          <div>
            <SportsStreams
              sources={defaultLiveStreams}
              onSelectStream={(source) => {
                if (selectedItem) {
                  loadStream({ ...selectedItem, url: source.url }, 1, 1);
                }
              }}
            />

            <CategorySection
              title="Sports On Demand"
              icon="radio"
              items={items.filter((i) => (i.media_type || activeTab) === 'sports')}
              loading={loading && activeTab === 'sports'}
              savedIds={new Set(watchlist.map((entry) => entry.id))}
              onSelect={(item: WatchlistItem) => loadStream(item, 1, 1)}
              onSave={(item: WatchlistItem) => toggleWatchlist(item)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}