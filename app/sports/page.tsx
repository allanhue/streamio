'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CategorySection from '../ui/category_section';
import SearchPanel from '../ui/search_panel';
import SportsStreams, { type LiveStreamSource } from '../ui/sports_streams';
import Watchlist, { WatchlistItem } from '../ui/watchlist';
import { buildWatchHref } from '../lib/watch';

type MediaItem = WatchlistItem & {
  summary?: string;
  poster?: string;
  thumbnail?: string;
  media_type?: 'movie' | 'tv' | 'sports';
  rating?: number;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

function buildApiUrl(path: string): string {
  const base = API_URL.replace(/\/$/, '');
  return `${base}${path}`;
}

export default function SportsPage() {
  const router = useRouter();
  const [liveStreams, setLiveStreams] = useState<LiveStreamSource[]>([]);
  const [liveLoading, setLiveLoading] = useState(true);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
    setLiveLoading(true);
    fetch(buildApiUrl('/api/live-streams?type=sports'))
      .then((res) => res.json())
      .then((data) => {
        const next = (data.items || []).map((item: MediaItem & { name?: string }, index: number) => ({
          id: item.id || `live-${index + 1}`,
          title: item.title || item.name,
          name: item.name || item.title,
          url: item.url || '',
          poster: item.poster || item.thumbnail,
          published: item.published || 'LIVE',
        })).filter((item: LiveStreamSource) => Boolean(item.url));
        setLiveStreams(next);
        setLiveLoading(false);
      })
      .catch(() => {
        setLiveStreams([]);
        setLiveLoading(false);
      });
  }, []);

  useEffect(() => {
    const delay = window.setTimeout(() => {
      setLoading(true);
      fetch(buildApiUrl(`/api/feed?type=sports&query=${encodeURIComponent(searchQuery)}`))
        .then((res) => res.json())
        .then((data) => {
          const nextItems = (data.items || []).map((item: MediaItem) => ({
            ...item,
            media_type: 'sports' as const,
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

  const openItem = (item: WatchlistItem) => {
    router.push(
      buildWatchHref({
        id: item.id,
        title: item.title,
        media_type: item.media_type || 'sports',
        url: item.url,
      }),
    );
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

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <section className="mx-auto max-w-[1500px] px-4 py-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-white/10 bg-neutral-950/90 p-4 shadow-xl shadow-black sm:p-5">
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Sports</h1>
          <p className="mt-2 text-sm text-neutral-400">Live channels from the server stream list</p>
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] space-y-6 px-4 pb-8 sm:px-6 lg:px-8">
        <SportsStreams sources={liveStreams} loading={liveLoading} />

        <div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="space-y-5">
            <SearchPanel
              activeTabLabel="Sports"
              query={searchQuery}
              showKeyboard={showKeyboard}
              suggestions={['football', 'premier league', 'ufc', 'formula 1']}
              onQueryChange={setSearchQuery}
              onToggleKeyboard={() => setShowKeyboard((current) => !current)}
              onSelectSuggestion={(suggestion) => setSearchQuery(suggestion)}
            />

            <Watchlist
              items={watchlist}
              activeId={undefined}
              onSelect={openItem}
              onRemove={removeFromWatchlist}
            />
          </aside>

          <CategorySection
            title="More sports"
            icon="radio"
            items={items}
            loading={loading}
            savedIds={new Set(watchlist.map((entry) => entry.id))}
            onSelect={openItem}
            onSave={(item: WatchlistItem) => toggleWatchlist(item)}
            showHero={false}
          />
        </div>
      </section>
    </div>
  );
}
