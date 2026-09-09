'use client';

import { useEffect, useState } from 'react';
import CategorySection from '../ui/category_section';
import HeroBanner from '../ui/hero-banner';
import Watchlist, { WatchlistItem } from '../ui/watchlist';

type MediaItem = WatchlistItem & {
  summary?: string;
  poster?: string;
  thumbnail?: string;
  media_type?: 'movie' | 'tv' | 'sports';
  rating?: number;
};

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);

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

  const removeFromWatchlist = (id: string) => {
    setWatchlist((current) => {
      const updated = current.filter((item) => item.id !== id);
      window.localStorage.setItem('streamio-watchlist', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <section className="mx-auto max-w-[1500px] px-4 py-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-white/10 bg-neutral-950/90 p-4 shadow-xl shadow-black sm:p-5">
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">My Watchlist</h1>
          <p className="mt-2 text-sm text-neutral-400">
            {watchlist.length === 0 ? 'No items saved yet' : `You have ${watchlist.length} item${watchlist.length === 1 ? '' : 's'}`}
          </p>
        </div>
      </section>

      {watchlist.length > 0 ? (
        <section className="mx-auto max-w-[1500px] px-4 pb-8 sm:px-6 lg:px-8">
          {selectedItem && <HeroBanner item={selectedItem} onSelect={() => {}} />}

          <div className="mt-6">
            <CategorySection
              title="Saved Items"
              icon="film"
              items={watchlist}
              loading={false}
              savedIds={new Set(watchlist.map((entry) => entry.id))}
              onSelect={(item: WatchlistItem) => setSelectedItem(item as MediaItem)}
              onSave={(item: WatchlistItem) => removeFromWatchlist(item.id)}
            />
          </div>
        </section>
      ) : (
        <section className="mx-auto max-w-[1500px] px-4 pb-8 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center sm:p-12">
            <p className="text-lg font-black">No bookmarks yet</p>
            <p className="mt-2 text-sm text-neutral-400">Start adding your favorite shows and movies to your watchlist</p>
          </div>
        </section>
      )}
    </div>
  );
}
