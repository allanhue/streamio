'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import SportsStreams, { type LiveStreamSource } from '../ui/sports_streams';
import Watchlist, { WatchlistItem } from '../ui/watchlist';

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


  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <section className="mx-auto max-w-[1500px] px-4 py-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-white/10 bg-neutral-950/90 p-4 shadow-xl shadow-black sm:p-5">
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Sports</h1>
          <p className="mt-2 text-sm text-neutral-400">Live channels from the server stream list</p>
        </div>
      </section>


    
        </div>
  
  );
}
