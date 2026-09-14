'use client';

import { useRouter } from 'next/navigation';
import { buildWatchHref } from '../lib/watch';

export type LiveStreamSource = {
  id?: string;
  name?: string;
  title?: string;
  url: string;
  poster?: string;
  published?: string;
};

type SportsStreamsProps = {
  sources: LiveStreamSource[];
  loading?: boolean;
  onSelectStream?: (source: LiveStreamSource) => void;
};

const CARD_COLORS = [
  'from-red-700 via-rose-600 to-orange-500',
  'from-blue-800 via-sky-600 to-cyan-400',
  'from-emerald-800 via-green-600 to-lime-400',
  'from-violet-800 via-purple-600 to-fuchsia-500',
  'from-indigo-900 via-indigo-600 to-blue-400',
  'from-amber-800 via-orange-600 to-yellow-400',
  'from-zinc-800 via-neutral-700 to-stone-500',
  'from-teal-900 via-teal-600 to-emerald-400',
];

function streamLabel(source: LiveStreamSource, index: number): string {
  const named = (source.title || source.name || '').trim();
  if (named) return named;

  try {
    const host = new URL(source.url).hostname.replace(/^www\./, '');
    const part = host.split('.')[0] || host;
    return part.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || `Live Channel ${index + 1}`;
  } catch {
    return `Live Channel ${index + 1}`;
  }
}

function streamHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return 'HLS';
  }
}

export default function SportsStreams({ sources, loading = false, onSelectStream }: SportsStreamsProps) {
  const router = useRouter();

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 shadow-2xl shadow-black/30 sm:p-5">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-neutral-500">Live Channels</p>
        </div>
        <p className="text-xs font-bold text-neutral-500">
          {loading ? 'Loading…' : `${sources.length} channel${sources.length === 1 ? '' : 's'}`}
        </p>
      </div>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="aspect-[2/3] animate-pulse rounded-xl bg-white/5" />
          ))}
        </div>
      ) : sources.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 bg-black/30 p-8 text-center text-sm text-neutral-500">
          No live streams available from the server
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {sources.map((source, index) => {
            const label = streamLabel(source, index);
            const color = CARD_COLORS[index % CARD_COLORS.length];
            const host = streamHost(source.url);

            return (
              <article
                key={source.id || source.url}
                className="netflix-card group overflow-hidden rounded-xl border border-white/10 bg-black"
              >
                <button
                  type="button"
                  onClick={() => {
                    if (onSelectStream) {
                      onSelectStream(source);
                      return;
                    }
                    router.push(
                      buildWatchHref({
                        id: source.id || `live-${index + 1}`,
                        title: label,
                        media_type: 'sports',
                        url: source.url,
                      }),
                    );
                  }}
                  className="block w-full cursor-pointer text-left"
                >
                  <div className={`relative aspect-[2/3] overflow-hidden bg-gradient-to-br ${color}`}>
                    {source.poster ? (
                      <img
                        src={source.poster}
                        alt={label}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-110"
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 text-center">
                        <span className="grid h-14 w-14 place-items-center rounded-full bg-black/40 text-2xl text-white backdrop-blur">
                          ▶
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-[0.18em] text-white/85">Live HLS</span>
                      </div>
                    )}

                    <span className="absolute left-2 top-2 rounded bg-red-600 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-white">
                      Live
                    </span>

                    <span className="absolute inset-0 grid place-items-center bg-black/0 opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100">
                      <span className="grid h-12 w-12 place-items-center rounded-full bg-white text-lg text-black">▶</span>
                    </span>
                  </div>

                  <div className="space-y-1 p-3">
                    <h3 className="line-clamp-2 text-sm font-black leading-snug">{label}</h3>
                    <p className="truncate text-[11px] text-neutral-400">{host}</p>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                      {source.published || 'Tap to play'}
                    </p>
                  </div>
                </button>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
