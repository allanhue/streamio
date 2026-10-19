'use client';

import { useEffect, useState } from 'react';

import SportsStreams, { type LiveStreamSource } from '../ui/sports_streams';

type LiveStreamApiItem = {
  id?: string;
  title?: string;
  name?: string;
  url?: string;
  poster?: string;
  thumbnail?: string;
  published?: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

function buildApiUrl(path: string): string {
  const base = API_URL.replace(/\/$/, '');
  return `${base}${path}`;
}

export default function SportsPage() {
  const [liveStreams, setLiveStreams] = useState<LiveStreamSource[]>([]);
  const [liveLoading, setLiveLoading] = useState(true);

  useEffect(() => {
    fetch(buildApiUrl('/api/live-streams?type=sports'))
      .then((res) => res.json())
      .then((data) => {
        const next = (data.items || []).map((item: LiveStreamApiItem, index: number) => ({
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

      <section className="mx-auto max-w-[1500px] px-4 pb-8 sm:px-6 lg:px-8">
        <SportsStreams sources={liveStreams} loading={liveLoading} />
      </section>
    </div>
  );
}
