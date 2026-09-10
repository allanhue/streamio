'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import FeaturedPlatforms from './featured_platforms';
import LatestList from './latest_list';
import MediaCarousel from './media_carousel';
import type { WatchlistItem } from './watchlist';
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

const featuredPlatforms = [
  {
    name: 'Netflix',
    image: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=900&q=80',
    color: 'from-red-700 to-red-900',
    svg: 'M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2Zm-10 10H8v4h2v-4Zm4-2h2v6h-2v-6Zm4-2h2v8h-2v-8Z',
  },
  {
    name: 'Hulu',
    image: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?auto=format&fit=crop&w=900&q=80',
    color: 'from-emerald-700 to-green-900',
    svg: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm-2 15h-2V9h2v8Zm4-8h2v8h-2v-8Zm4 6h-2V9h2v6Z',
  },
  {
    name: 'HBO Max',
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=900&q=80',
    color: 'from-purple-800 to-indigo-950',
    svg: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8Zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5Zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11Zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5Z',
  },
  {
    name: 'Disney+',
    image: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&w=900&q=80',
    color: 'from-sky-700 to-blue-950',
    svg: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm-4 15h2V9h-2v8Zm4-8h2v8h-2v-8Zm4 6h-2V9h2v6Z',
  },
  {
    name: 'Prime Video',
    image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=900&q=80',
    color: 'from-blue-800 to-slate-950',
    svg: 'M19.35 10.04C18.67 6.59 15.64 4 12 4c-1.48 0-2.85.43-4.01 1.17l1.46 1.46C10.21 5.23 11.08 5 12 5c3.04 0 5.64 1.99 6.59 4.71l2.76-2.67zM4 12.01h9v2H4zm15.64 2.75c.9-1.76 1.36-3.74 1.36-5.76 0-2.77-.88-5.35-2.39-7.47L16 5.07C17.15 6.78 18 8.99 18 12.01h2z',
  },
  {
    name: 'Apple TV+',
    image: 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?auto=format&fit=crop&w=900&q=80',
    color: 'from-zinc-800 to-black',
    svg: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm-2 15h-2V9h2v8Zm4-8h2v8h-2v-8Zm4 6h-2V9h2v6Z',
  },
];

export default function HomeUI() {
  const router = useRouter();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [popular, setPopular] = useState<MediaItem[]>([]);
  const [upcoming, setUpcoming] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [carouselLoading, setCarouselLoading] = useState(true);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);

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
      fetch(buildApiUrl('/api/feed?type=movie&query='))
        .then((res) => res.json())
        .then((data) => {
          const nextItems = (data.items || []).slice(0, 10).map((item: MediaItem) => ({
            ...item,
            media_type: item.media_type || 'movie',
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
  }, []);

  useEffect(() => {
    setCarouselLoading(true);
    Promise.all([
      fetch(buildApiUrl('/api/feed?type=movie&list=popular')).then((res) => res.json()),
      fetch(buildApiUrl('/api/feed?type=movie&list=upcoming')).then((res) => res.json()),
    ])
      .then(([popularData, upcomingData]) => {
        setPopular(
          (popularData.items || []).map((item: MediaItem) => ({
            ...item,
            media_type: 'movie' as const,
            poster: item.poster || item.thumbnail,
          })),
        );
        setUpcoming(
          (upcomingData.items || []).map((item: MediaItem) => ({
            ...item,
            media_type: 'movie' as const,
            poster: item.poster || item.thumbnail,
          })),
        );
        setCarouselLoading(false);
      })
      .catch(() => {
        setPopular([]);
        setUpcoming([]);
        setCarouselLoading(false);
      });
  }, []);

  const openItem = (item: WatchlistItem) => {
    router.push(
      buildWatchHref({
        id: item.id,
        title: item.title,
        media_type: item.media_type || 'movie',
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

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <section className="mx-auto max-w-[1500px] px-4 py-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-white/10 bg-neutral-950/90 p-4 shadow-xl shadow-black sm:p-5">
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Welcome back.</h1>
          <p className="mt-2 text-sm text-neutral-400">Pick up where you left off or discover something new</p>
        </div>
      </section>

      <FeaturedPlatforms platforms={featuredPlatforms} />

      <section className="mx-auto max-w-[1500px] space-y-6 px-4 pb-4 sm:px-6 lg:px-8">
        <MediaCarousel
          title="Popular Movies"
          subtitle="TMDB · Popular"
          items={popular}
          loading={carouselLoading}
          direction="right"
        />
        <MediaCarousel
          title="Upcoming Releases"
          subtitle="TMDB · Upcoming"
          items={upcoming}
          loading={carouselLoading}
          direction="left"
        />
      </section>

      <section className="mx-auto max-w-[1500px] px-4 pb-8 sm:px-6 lg:px-8">
        <div className="max-w-xl">
          <LatestList
            items={items}
            activeId={undefined}
            loading={loading}
            onSelect={openItem}
            onSave={(item) => toggleWatchlist(item)}
            savedIds={new Set(watchlist.map((entry) => entry.id))}
          />
        </div>
      </section>
    </div>
  );
}
