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

  return (
    <article className="group min-w-[180px] cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-black transition hover:-translate-y-1 hover:border-white/30">
      <button onClick={() => onSelect(item)} className="block w-full cursor-pointer text-left">
        <div className="relative aspect-[2/3] overflow-hidden bg-neutral-900">
          {image ? (
            <img src={image} alt={item.title} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
          ) : (
            <div className="flex h-full items-center justify-center text-neutral-600">
              <span className="text-sm font-black uppercase tracking-[0.2em]">TV</span>
            </div>
          )}
          {typeof item.rating === 'number' ? (
            <span className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-1 text-xs font-black text-white backdrop-blur">
              {item.rating}
            </span>
          ) : null}
        </div>
        <div className="min-h-[92px] p-3">
          <h3 className="line-clamp-2 text-sm font-black leading-tight">{item.title}</h3>
          <p className="mt-2 truncate text-xs font-semibold text-neutral-500">{item.published || item.competition || 'New release'}</p>
        </div>
      </button>
      <button
        type="button"
        onClick={() => onSave(item)}
        className={`flex h-10 w-full cursor-pointer items-center justify-center gap-2 border-t border-white/10 text-xs font-black uppercase tracking-[0.12em] transition ${
          saved ? 'bg-white text-black' : 'bg-white/[0.04] text-neutral-300 hover:bg-white hover:text-black'
        }`}
      >
        {saved ? 'Saved' : 'Save'}
      </button>
    </article>
  );
}

export default function LatestSection({ items, title, subtitle, onSelect, onSave, savedIds }: LatestSectionProps) {
  const cards = useMemo(() => items.slice(0, 8), [items]);

  return (
    <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-4 shadow-2xl shadow-black/30 sm:p-5">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-neutral-500">Latest</p>
          <h2 className="mt-1 text-2xl font-black tracking-tight">{title}</h2>
        </div>
        {subtitle ? <p className="text-sm font-bold text-neutral-500">{subtitle}</p> : null}
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2">
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
