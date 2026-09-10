'use client';

import { useRouter } from 'next/navigation';
import { buildWatchHref } from '../lib/watch';

type StreamSource = {
  name: string;
  url: string;
  poster?: string;
};

type SportsStreamsProps = {
  sources: StreamSource[];
  onSelectStream?: (source: StreamSource) => void;
};

const streamMeta: Record<string, { color: string; badge: string }> = {
  'Live Sports HD': { color: 'from-red-700 via-red-600 to-orange-500', badge: 'Sports' },
  'Red Bull TV': { color: 'from-blue-800 via-blue-600 to-cyan-500', badge: 'Extreme' },
  'Open Coverage': { color: 'from-emerald-800 via-green-600 to-lime-500', badge: 'Live' },
  'Akamai Live Test 1': { color: 'from-purple-800 via-violet-600 to-fuchsia-500', badge: 'Test' },
  'Akamai Live Test 2': { color: 'from-indigo-800 via-indigo-600 to-sky-500', badge: 'Test' },
  'Apple BipBop Sample': { color: 'from-zinc-800 via-neutral-700 to-stone-500', badge: 'Sample' },
  'Unified Stream Test': { color: 'from-orange-800 via-amber-600 to-yellow-500', badge: 'Demo' },
};

export default function SportsStreams({ sources, onSelectStream }: SportsStreamsProps) {
  const router = useRouter();

  if (sources.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 shadow-2xl shadow-black/30 sm:p-5">
        <div className="mb-4">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-neutral-500">Live Channels</p>
          <h2 className="text-xl font-black tracking-tight">Available Now</h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {sources.map((source) => {
            const meta = streamMeta[source.name] || {
              color: 'from-neutral-800 via-neutral-700 to-neutral-600',
              badge: 'Live',
            };

            return (
              <article
                key={source.url}
                className="netflix-card group flex flex-col overflow-hidden rounded-lg border border-white/10 bg-black"
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
                        id: `live-${source.name.toLowerCase().replace(/\s+/g, '-')}`,
                        title: source.name,
                        media_type: 'sports',
                        url: source.url,
                      }),
                    );
                  }}
                  className="block flex-1 cursor-pointer text-left"
                >
                  <div className={`relative aspect-[2/3] w-full overflow-hidden bg-gradient-to-br ${meta.color}`}>
                    {source.poster ? (
                      <img
                        src={source.poster}
                        alt={source.name}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-110"
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 text-center">
                        <span className="grid h-14 w-14 place-items-center rounded-full bg-black/35 text-2xl text-white backdrop-blur">
                          ▶
                        </span>
                        <span className="text-xs font-black uppercase tracking-[0.16em] text-white/80">Live HLS</span>
                      </div>
                    )}

                    <span className="absolute left-2 top-2 rounded bg-red-600 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-white">
                      Live
                    </span>
                    <span className="absolute right-2 top-2 rounded bg-black/60 px-2 py-0.5 text-[10px] font-black text-white backdrop-blur">
                      {meta.badge}
                    </span>

                    <span className="absolute inset-0 grid place-items-center bg-black/0 opacity-0 transition group-hover:bg-black/35 group-hover:opacity-100">
                      <span className="grid h-12 w-12 place-items-center rounded-full bg-white text-lg text-black">▶</span>
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col gap-1.5 p-2">
                    <h3 className="line-clamp-1 text-xs font-black leading-tight">{source.name}</h3>
                    <p className="line-clamp-1 text-[11px] text-neutral-400">Live stream · HLS</p>
                    <p className="line-clamp-1 text-[10px] font-semibold text-neutral-500">Tap to play</p>
                  </div>
                </button>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
