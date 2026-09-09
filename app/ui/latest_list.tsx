'use client';

import type { WatchlistItem } from './watchlist';

type LatestListProps = {
  items: WatchlistItem[];
  activeId?: string;
  loading: boolean;
  onSelect: (item: WatchlistItem) => void;
  onSave: (item: WatchlistItem) => void;
  savedIds: Set<string>;
};

function LatestListItem({
  item,
  active,
  onSelect,
  onSave,
  saved,
}: {
  item: WatchlistItem;
  active: boolean;
  onSelect: (item: WatchlistItem) => void;
  onSave: (item: WatchlistItem) => void;
  saved: boolean;
}) {
  const image = item.poster || item.thumbnail;
  const description = (item as any).summary || (item as any).description || '';

  return (
    <div
      className={`group grid cursor-pointer grid-cols-[80px_minmax(0,1fr)_32px] gap-3 rounded-lg border p-2 transition ${
        active
          ? 'border-white bg-white text-black'
          : 'border-white/10 bg-black/40 text-white hover:border-white/30 hover:bg-white/10'
      }`}
    >
      <button onClick={() => onSelect(item)} className="contents text-left">
        <div className="aspect-[2/3] overflow-hidden rounded-md bg-neutral-900">
          {image && <img src={image} alt={item.title} className="h-full w-full object-cover" />}
        </div>

        <div className="min-w-0">
          <p className={`truncate font-black ${active ? 'text-black' : 'text-white'}`}>
            {item.title}
          </p>
          <p className={`mt-0.5 truncate text-xs ${active ? 'text-black/60' : 'text-neutral-400'}`}>
            {description}
          </p>
          <p className={`mt-1 text-[10px] ${active ? 'text-black/50' : 'text-neutral-500'}`}>
            {item.published || 'New'}
          </p>
        </div>
      </button>

      <button
        onClick={() => onSave(item)}
        className={`grid place-items-center rounded transition ${
          active
            ? 'text-black hover:bg-black/10'
            : 'text-neutral-500 hover:bg-white hover:text-black'
        }`}
      >
        {saved ? '✓' : '+'}
      </button>
    </div>
  );
}

export default function LatestList({
  items,
  activeId,
  loading,
  onSelect,
  onSave,
  savedIds,
}: LatestListProps) {
  const displayItems = items.slice(0, 10);

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 shadow-2xl shadow-black/30 sm:p-5">
      <div className="mb-4">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-neutral-500">
          Featured
        </p>
        <h2 className="mt-1 text-2xl font-black tracking-tight">Latest Releases</h2>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-white/5" />
          ))}
        </div>
      ) : displayItems.length === 0 ? (
        <div className="rounded-lg border border-dashed border-white/10 bg-black/30 p-6 text-center text-sm text-neutral-500">
          No releases available
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {displayItems.map((item, idx) => (
            <div key={`${item.id}-${idx}`} className="flex items-center gap-2">
              <span className="text-xs font-black text-neutral-600 w-5">{idx + 1}.</span>
              <div className="flex-1">
                <LatestListItem
                  item={item}
                  active={item.id === activeId}
                  onSelect={onSelect}
                  onSave={onSave}
                  saved={savedIds.has(item.id)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
