'use client';

import { useEffect, useMemo, useState } from 'react';
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

const tabs: { id: MediaKind; label: string; helper: string; icon: IconName }[] = [
  { id: 'movie', label: 'Movies', helper: 'Trending films', icon: 'film' },
  { id: 'tv', label: 'Series', helper: 'Episodes and seasons', icon: 'tv' },
  { id: 'sports', label: 'Sports', helper: 'Live channels', icon: 'radio' },
];

const suggestedSearches: Record<MediaKind, string[]> = {
  movie: ['Dune', 'John Wick', 'Oppenheimer', 'Mission Impossible'],
  tv: ['Money Heist', 'Breaking Bad', 'The Boys', 'Severance'],
  sports: ['football', 'premier league', 'ufc', 'formula 1'],
};

const seasonOptions = Array.from({ length: 10 }, (_, index) => index + 1);
const episodeOptions = Array.from({ length: 24 }, (_, index) => index + 1);

type IconName = 'search' | 'bookmark' | 'check' | 'play' | 'tv' | 'film' | 'radio' | 'spark' | 'grid';

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
      const url = `http://127.0.0.1:8000/api/feed?type=${activeTab}&query=${encodeURIComponent(searchQuery)}`;

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

    try {
      const urlParam = item.url ? `&url=${encodeURIComponent(item.url)}` : '';
      const type = item.media_type || activeTab;
      const res = await fetch(`http://127.0.0.1:8000/api/stream?id=${item.id}&type=${type}&season=${nextSeason}&episode=${nextEpisode}${urlParam}`);
      const data = await res.json();
      setSelectedStream(data);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
    }
  };

  const switchTab = (tab: MediaKind) => {
    setActiveTab(tab);
    setSearchQuery('');
    setSelectedItem(null);
    setSelectedStream(null);
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

  const updateSeriesPosition = (nextSeason: number, nextEpisode: number) => {
    setSeason(nextSeason);
    setEpisode(nextEpisode);
    if (selectedItem) {
      loadStream(selectedItem, nextSeason, nextEpisode);
    }
  };

  const activeSources = selectedStream?.sources || [];
  const activeTabMeta = tabs.find((tab) => tab.id === activeTab) || tabs[0];

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <section className="px-4 py-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-white/10 bg-neutral-950 p-3 shadow-xl shadow-black sm:p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-black">
                <Icon name="spark" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Stream workspace</p>
                <h1 className="text-xl font-black tracking-tight text-white sm:text-2xl">Watch smarter</h1>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-3 lg:w-[500px]">
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

      {selectedStream && selectedItem && (
        <section className="px-4 pb-5 sm:px-6 lg:px-8">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="overflow-hidden rounded-[24px] border border-white/10 bg-black shadow-2xl shadow-black">
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

              <div className="aspect-video w-full bg-black">
                {selectedStream.isLive && activeSources[0] ? (
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
                  <iframe
                    src={activeSources[activeMirror]?.url}
                    className="h-full w-full border-0"
                    allowFullScreen
                    allow="autoplay; fullscreen"
                    referrerPolicy="no-referrer"
                  />
                )}
              </div>
            </div>

            <aside className="space-y-4">
              {selectedItem.media_type === 'tv' && (
                <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-sm font-black">Series picker</h3>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-black">S{season} E{episode}</span>
                  </div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Season</p>
                  <div className="grid grid-cols-5 gap-2">
                    {seasonOptions.map((option) => (
                      <button
                        key={option}
                        onClick={() => updateSeriesPosition(option, 1)}
                        className={`h-10 rounded-xl text-sm font-black transition ${season === option ? 'bg-white text-black' : 'bg-black text-neutral-300 hover:bg-white/10 hover:text-white'}`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                  <p className="mb-2 mt-4 text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Episode</p>
                  <div className="grid max-h-40 grid-cols-6 gap-2 overflow-y-auto pr-1">
                    {episodeOptions.map((option) => (
                      <button
                        key={option}
                        onClick={() => updateSeriesPosition(season, option)}
                        className={`h-10 rounded-xl text-sm font-black transition ${episode === option ? 'bg-white text-black' : 'bg-black text-neutral-300 hover:bg-white/10 hover:text-white'}`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
                <h3 className="text-sm font-black">Stream sources</h3>
                <div className="mt-3 grid gap-2">
                  {activeSources.map((src, idx) => (
                    <button
                      key={`${src.name}-${idx}`}
                      onClick={() => setActiveMirror(idx)}
                      className={`rounded-xl px-3 py-3 text-left text-sm font-bold transition ${activeMirror === idx ? 'bg-white text-black' : 'bg-black text-neutral-300 hover:bg-white/10 hover:text-white'}`}
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

      <div className="grid gap-5 px-4 pb-8 sm:px-6 lg:grid-cols-[340px_minmax(0,1fr)] lg:px-8">
        <aside className="space-y-5">
          <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-2xl shadow-black/30">
            <label htmlFor="stream-search" className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-neutral-500">
              <Icon name="search" />
              Search
            </label>
            <input
              id="stream-search"
              type="search"
              placeholder={`Search ${activeTabMeta.label.toLowerCase()}`}
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="h-12 w-full rounded-xl border border-white/10 bg-black px-4 text-base font-semibold text-white outline-none transition placeholder:text-neutral-600 focus:border-white/50"
            />

            <div className="mt-4 flex flex-wrap gap-2">
              {suggestedSearches[activeTab].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setSearchQuery(suggestion)}
                  className="rounded-full border border-white/10 bg-black px-3 py-2 text-xs font-bold text-neutral-300 transition hover:border-white/40 hover:text-white"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </section>

          <Watchlist
            items={watchlist}
            activeId={selectedItem?.id}
            onSelect={(item) => loadStream(item, 1, 1)}
            onRemove={removeFromWatchlist}
          />
        </aside>

        <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-4 shadow-2xl shadow-black/30 sm:p-5">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-neutral-500">
                <Icon name="grid" />
                Catalog
              </div>
              <h2 className="text-2xl font-black tracking-tight">
                {searchQuery ? `Results for "${searchQuery}"` : activeTabMeta.label}
              </h2>
            </div>
            <p className="text-sm font-bold text-neutral-500">{loading ? 'Searching...' : `${items.length} titles`}</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {Array.from({ length: 10 }, (_, index) => (
                <div key={index} className="h-72 animate-pulse rounded-2xl bg-white/5" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-black/30 p-10 text-center text-neutral-500">
              No items found for this catalog.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {items.map((item) => {
                const saved = watchlist.some((savedItem) => savedItem.id === item.id);
                const image = item.poster || item.thumbnail;

                return (
                  <article key={`${item.media_type || activeTab}-${item.id}`} className="group overflow-hidden rounded-2xl border border-white/10 bg-black transition hover:-translate-y-1 hover:border-white/30">
                    <button onClick={() => loadStream(item, 1, 1)} className="block w-full text-left">
                      <div className="relative aspect-[2/3] overflow-hidden bg-neutral-900">
                        {image ? (
                          <img src={image} alt={item.title} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-neutral-600">
                            <Icon name={activeTabMeta.icon} className="h-8 w-8" />
                          </div>
                        )}
                        {item.rating ? (
                          <span className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-1 text-xs font-black text-white backdrop-blur">
                            {item.rating}
                          </span>
                        ) : null}
                      </div>
                      <div className="min-h-[88px] p-3">
                        <h3 className="line-clamp-2 text-sm font-black leading-tight">{item.title}</h3>
                        <p className="mt-2 truncate text-xs font-semibold text-neutral-500">{item.published || item.competition || 'Ready to stream'}</p>
                      </div>
                    </button>
                    <button
                      onClick={() => toggleWatchlist(item)}
                      className={`flex h-10 w-full items-center justify-center gap-2 border-t border-white/10 text-xs font-black uppercase tracking-[0.12em] transition ${
                        saved ? 'bg-white text-black' : 'bg-white/[0.04] text-neutral-300 hover:bg-white hover:text-black'
                      }`}
                    >
                      <Icon name={saved ? 'check' : 'bookmark'} />
                      {saved ? 'Saved' : 'Save'}
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
