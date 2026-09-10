'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Player from '../components/player';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
const buildApiUrl = (path: string) => `${API_BASE.replace(/\/$/, '')}${path}`;

type StreamSource = {
  name: string;
  url: string;
};

type StreamData = {
  title?: string;
  sources?: StreamSource[];
  isLive?: boolean;
};

function WatchClient() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id') || '';
  const type = searchParams.get('type') || 'movie';
  const title = searchParams.get('title') || 'Stream';
  const url = searchParams.get('url') || '';
  const season = Number(searchParams.get('season') || 1);
  const episode = Number(searchParams.get('episode') || 1);

  const [stream, setStream] = useState<StreamData | null>(null);
  const [activeMirror, setActiveMirror] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inlinePlayer, setInlinePlayer] = useState(false);

  useEffect(() => {
    if (!id && !url) {
      setError('Missing stream id');
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError('');
    setActiveMirror(0);
    setInlinePlayer(false);

    const urlParam = url ? `&url=${encodeURIComponent(url)}` : '';
    const streamId = id || 'custom-stream';

    fetch(
      buildApiUrl(
        `/api/stream?id=${encodeURIComponent(streamId)}&type=${encodeURIComponent(type)}&season=${season}&episode=${episode}${urlParam}`,
      ),
      { signal: controller.signal },
    )
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load stream');
        return res.json();
      })
      .then((data: StreamData) => {
        setStream(data);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setError('Could not load stream sources');
        setLoading(false);
      });

    return () => controller.abort();
  }, [id, type, url, season, episode]);

  const sources = stream?.sources || [];
  const currentSource = sources[activeMirror]?.url;
  const isDirectHls = Boolean(currentSource?.split('?')[0].toLowerCase().endsWith('.m3u8'));
  const backHref = useMemo(() => {
    if (type === 'tv') return '/series';
    if (type === 'sports' || type === 'sports_channel') return '/sports';
    return '/movies';
  }, [type]);

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <section className="mx-auto max-w-[1200px] space-y-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-neutral-500">Now playing</p>
            <h1 className="text-2xl font-black tracking-tight sm:text-3xl">{title}</h1>
            {stream?.title ? <p className="mt-1 text-sm text-neutral-400">{stream.title}</p> : null}
          </div>
          <Link
            href={backHref}
            className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-black transition hover:bg-white hover:text-black"
          >
            Back
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl shadow-black">
          {loading ? (
            <div className="grid aspect-video place-items-center text-sm text-neutral-400">Loading stream...</div>
          ) : error ? (
            <div className="grid aspect-video place-items-center text-sm text-red-300">{error}</div>
          ) : isDirectHls && currentSource ? (
            <Player src={currentSource} />
          ) : currentSource ? (
            inlinePlayer ? (
              <iframe
                src={currentSource}
                title={title}
                className="aspect-video h-auto w-full border-0"
                allowFullScreen
                allow="autoplay; fullscreen; picture-in-picture; clipboard-write"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            ) : (
              <div className="flex aspect-video flex-col items-center justify-center gap-4 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.1),_transparent_45%)] p-6">
                <p className="max-w-md text-center text-sm text-neutral-300">
                  Ready to play. Open the protected stream or try the inline player.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <a
                    href={currentSource}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full bg-white px-5 py-3 text-sm font-black text-black transition hover:bg-neutral-200"
                  >
                    Open stream
                  </a>
                  <button
                    type="button"
                    onClick={() => setInlinePlayer(true)}
                    className="rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-black transition hover:bg-white hover:text-black"
                  >
                    Try inline player
                  </button>
                </div>
              </div>
            )
          ) : (
            <div className="grid aspect-video place-items-center text-sm text-neutral-400">No playable source found</div>
          )}
        </div>

        {sources.length > 1 ? (
          <div className="flex flex-wrap gap-2">
            {sources.map((source, index) => (
              <button
                key={`${source.name}-${index}`}
                type="button"
                onClick={() => {
                  setActiveMirror(index);
                  setInlinePlayer(false);
                }}
                className={`rounded-full border px-3 py-1.5 text-xs font-black transition ${
                  index === activeMirror
                    ? 'border-white bg-white text-black'
                    : 'border-white/15 bg-white/5 text-neutral-300 hover:border-white/40'
                }`}
              >
                {source.name}
              </button>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}

export default function WatchPage() {
  return (
    <Suspense fallback={<div className="grid min-h-screen place-items-center text-neutral-400">Loading player...</div>}>
      <WatchClient />
    </Suspense>
  );
}
