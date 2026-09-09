'use client';

type StreamSource = {
  name: string;
  url: string;
};

type SportsStreamsProps = {
  sources: StreamSource[];
  onSelectStream?: (source: StreamSource) => void;
};

const streamColors: Record<string, string> = {
  'Live Sports HD': 'from-red-600 to-red-700',
  'Red Bull TV': 'from-blue-600 to-blue-700',
  'Open Coverage': 'from-green-600 to-green-700',
  'Akamai Live Test 1': 'from-purple-600 to-purple-700',
  'Akamai Live Test 2': 'from-indigo-600 to-indigo-700',
  'Apple BipBop Sample': 'from-gray-700 to-gray-800',
  'Unified Stream Test': 'from-orange-600 to-orange-700',
};

export default function SportsStreams({ sources, onSelectStream }: SportsStreamsProps) {
  if (sources.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="mb-4">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-neutral-500">
          Live Channels
        </p>
        <h3 className="mt-1 text-lg font-black tracking-tight">Available Now</h3>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {sources.map((source) => {
          const colorClass = streamColors[source.name] || 'from-neutral-700 to-neutral-800';

          return (
            <button
              key={source.url}
              onClick={() => onSelectStream?.(source)}
              className={`group flex items-center gap-3 rounded-xl border border-white/10 bg-gradient-to-br ${colorClass} px-4 py-3 transition hover:border-white/40 hover:shadow-lg hover:shadow-white/20 active:scale-95`}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-black/40 group-hover:bg-black/60">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-5 w-5 fill-white"
                >
                  <path d="M5 11a7 7 0 0 1 14 0v5a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3v-5Zm4 2h6M9 16h2" />
                </svg>
              </span>
              <div className="min-w-0 text-left">
                <p className="truncate text-sm font-black text-white">{source.name}</p>
                <p className="truncate text-xs text-white/70">Live Stream</p>
              </div>
              <span className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20 group-hover:bg-white/40">
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-white">
                  <path d="M8 5v14l11-7L8 5Z" />
                </svg>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
