'use client';

type StreamSource = {
  name: string;
  url: string;
};

type LiveStreamsProps = {
  sources: StreamSource[];
  onSelectStream?: (source: StreamSource) => void;
};

const streamIcons: Record<string, string> = {
  'Live Sports HD': 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm-2 15h-2V9h2v8Zm4-8h2v8h-2v-8Zm4 6h-2V9h2v6Z',
  'Red Bull TV': 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16Zm3-8a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm-6 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z',
  'Open Coverage': 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8Zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5Zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11Zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5Z',
  'default': 'M19.35 10.04C18.67 6.59 15.64 4 12 4c-1.48 0-2.85.43-4.01 1.17l1.46 1.46C10.21 5.23 11.08 5 12 5c3.04 0 5.64 1.99 6.59 4.71l2.76-2.67zM4 12.01h9v2H4zm15.64 2.75c.9-1.76 1.36-3.74 1.36-5.76 0-2.77-.88-5.35-2.39-7.47L16 5.07C17.15 6.78 18 8.99 18 12.01h2z',
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

export default function LiveStreams({ sources, onSelectStream }: LiveStreamsProps) {
  if (sources.length === 0) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 shadow-2xl shadow-black/30 sm:p-5">
      <div className="mb-4">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-neutral-500">
          Live Streaming
        </p>
        <h2 className="mt-1 text-xl font-black tracking-tight">Available Streams</h2>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {sources.map((source) => {
          const colorClass = streamColors[source.name] || streamColors['Unified Stream Test'];
          const iconPath = streamIcons[source.name] || streamIcons.default;

          return (
            <button
              key={source.url}
              onClick={() => onSelectStream?.(source)}
              className={`group flex items-center gap-3 rounded-xl border border-white/10 bg-gradient-to-br ${colorClass} px-3 py-3 transition hover:border-white/40 hover:shadow-lg hover:shadow-white/20 active:scale-95`}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-black/40 group-hover:bg-black/60">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-5 w-5 fill-white"
                >
                  <path d={iconPath} />
                </svg>
              </span>
              <div className="min-w-0 text-left">
                <p className="truncate text-xs font-black text-white">{source.name}</p>
                <p className="truncate text-[10px] text-white/70">Stream source</p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
