'use client';

import { useMemo } from 'react';
import type { WatchlistItem } from './watchlist';

type LatestSectionProps = {
  items: Array<WatchlistItem & { media_type?: string; poster?: string; thumbnail?: string; rating?: number; competition?: string; published?: string }>; 
  title: string;
  subtitle?: string;
  onSelect: (item: WatchlistItem) => void;
  onSave: (item: WatchlistItem) => void;
  savedIds: Set<string>;
};

function LatestCard({ item, onSelect, onSave, saved }: { item: LatestSectionProps['items'][number]; onSelect: (item: WatchlistItem) => void; onSave: (item: WatchlistItem) => void; saved: boolean }) {
  const image = item.poster || item.thumbnail;
  const description = (item as any).summary || (item as any).description || '';

  return (
    <article className="netflix-card group min-w-[160px] flex flex-col overflow-hidden rounded-lg border border-white/10 bg-black">
      <button onClick={() => onSelect(item)} className="block flex-1 cursor-pointer text-left">
        <div className="relative aspect-[2/3] w-full overflow-hidden bg-neutral-900">
          {image ? (
            <img src={image} alt={item.title} className="h-full w-full object-cover transition duration-300 group-hover:scale-110" />
          ) : (
            <div className="flex h-full items-center justify-center text-neutral-600">
              <span className="text-xs font-black uppercase tracking-[0.1em]">TV</span>
            </div>
          )}
          {typeof item.rating === 'number' && (
            <span className="absolute right-1.5 top-1.5 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-black text-white backdrop-blur-md">
              {item.rating}
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-1 p-2">
          <h3 className="line-clamp-1 text-xs font-black leading-tight">{item.title}</h3>
          {description && <p className="line-clamp-1 text-[10px] text-neutral-400 leading-relaxed">{description}</p>}
          <p className="line-clamp-1 text-[10px] font-semibold text-neutral-500">{item.published || item.competition || 'New'}</p>
        </div>
      </button>
      <button
        type="button"
        onClick={() => onSave(item)}
        className={`flex h-7 w-full cursor-pointer items-center justify-center gap-1 border-t border-white/10 text-[9px] font-black uppercase tracking-[0.08em] transition ${
          saved ? 'bg-white text-black' : 'bg-white/[0.04] text-neutral-300 hover:bg-white hover:text-black'
        }`}
      >
        {saved ? 'Saved' : 'Save'}
      </button>
    </article>
  );
}

export default function LatestSection({ items, title, subtitle, onSelect, onSave, savedIds }: LatestSectionProps) {
  const cards = useMemo(() => items.slice(0, 10), [items]);

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 shadow-2xl shadow-black/30 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-neutral-500">Latest releases</p>
          <h2 className="mt-1 text-2xl font-black tracking-tight">{title}</h2>
        </div>
        {subtitle ? <p className="text-sm font-bold text-neutral-500">{subtitle}</p> : null}
      </div>

      <div className="content-row">
        {cards.map((item) => (
          <LatestCard
            key={`${item.media_type || 'media'}-${item.id}`}
            item={item}
            onSelect={onSelect}
            onSave={onSave}
            saved={savedIds.has(item.id)}
          />
        ))}
      </div>
    </section>
  );
}
