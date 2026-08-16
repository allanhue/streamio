'use client';

export type WatchlistMediaKind = 'movie' | 'tv' | 'sports' | 'sports_channel';

export type WatchlistItem = {
  id: string;
  title: string;
  media_type?: WatchlistMediaKind;
  poster?: string;
  thumbnail?: string;
  published?: string;
  rating?: number;
  url?: string;
};

type WatchlistProps = {
  items: WatchlistItem[];
  activeId?: string;
  onSelect: (item: WatchlistItem) => void;
  onRemove: (id: string) => void;
};

function BookmarkIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 4h12v17l-6-4-6 4V4Z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export default function Watchlist({ items, activeId, onSelect, onRemove }: WatchlistProps) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-2xl shadow-black/30">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-white text-black">
            <BookmarkIcon />
          </span>
          <div>
            <h2 className="text-sm font-black text-white">Watchlist</h2>
            <p className="text-xs text-neutral-500">{items.length} saved</p>
          </div>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-white/10 bg-black/30 p-4 text-sm leading-6 text-neutral-500">
          Save movies, series, or live channels here so you can jump back quickly.
        </p>
      ) : (
        <div className="space-y-2">
          {items.slice(0, 8).map((item) => {
            const image = item.poster || item.thumbnail;
            const active = item.id === activeId;

            return (
              <div
                key={`${item.media_type || 'media'}-${item.id}`}
                className={`group grid grid-cols-[52px_minmax(0,1fr)_32px] items-center gap-3 rounded-xl border p-2 transition ${
                  active ? 'border-white bg-white text-black' : 'border-white/10 bg-black/40 text-white hover:border-white/30'
                }`}
              >
                <button onClick={() => onSelect(item)} className="contents text-left">
                  <div className="aspect-[2/3] overflow-hidden rounded-lg bg-neutral-900">
                    {image ? <img src={image} alt="" className="h-full w-full object-cover" /> : null}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black">{item.title}</p>
                    <p className={`mt-1 text-xs capitalize ${active ? 'text-black/60' : 'text-neutral-500'}`}>
                      {item.media_type?.replace('_', ' ') || 'saved'}
                    </p>
                  </div>
                </button>
                <button
                  onClick={() => onRemove(item.id)}
                  aria-label={`Remove ${item.title}`}
                  className={`grid h-8 w-8 place-items-center rounded-full transition ${
                    active ? 'hover:bg-black hover:text-white' : 'text-neutral-500 hover:bg-white hover:text-black'
                  }`}
                >
                  <XIcon />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
