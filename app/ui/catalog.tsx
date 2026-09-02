'use client';

import type { WatchlistItem, WatchlistMediaKind } from './watchlist';

type CatalogItem = WatchlistItem & {
  media_type?: WatchlistMediaKind;
  competition?: string;
};

type CatalogProps = {
  items: CatalogItem[];
  activeTabLabel: string;
  activeIcon: 'film' | 'tv' | 'radio';
  query: string;
  loading: boolean;
  savedIds: Set<string>;
  onSelect: (item: CatalogItem) => void;
  onSave: (item: CatalogItem) => void;
};

function CatalogIcon({ name }: { name: CatalogProps['activeIcon'] }) {
  const paths = {
    film: 'M4 5h16v14H4V5Zm4 0v14m8-14v14M4 9h4m8 0h4M4 15h4m8 0h4',
    tv: 'M4 6h16v11H4V6Zm6 15h4m-2-4v4',
    radio: 'M5 11a7 7 0 0 1 14 0v5a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3v-5Zm4 2h6M9 16h2',
  };

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-8 w-8 fill-none stroke-current stroke-2" strokeLinecap="round" strokeLinejoin="round">
      <path d={paths[name]} />
    </svg>
  );
}

function CatalogCard({ item, activeIcon, saved, onSelect, onSave }: { item: CatalogItem; activeIcon: CatalogProps['activeIcon']; saved: boolean; onSelect: (item: CatalogItem) => void; onSave: (item: CatalogItem) => void }) {
  const image = item.poster || item.thumbnail;

  return (
    <article className="group cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-black transition duration-200 hover:-translate-y-1 hover:border-white/30 hover:shadow-xl hover:shadow-black/40">
      <button type="button" onClick={() => onSelect(item)} className="block w-full cursor-pointer text-left">
        <div className="relative aspect-[2/3] overflow-hidden bg-neutral-900">
          {image ? (
            <img src={image} alt={item.title} loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
          ) : (
            <div className="flex h-full items-center justify-center text-neutral-600"><CatalogIcon name={activeIcon} /></div>
          )}
          {item.rating ? <span className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-1 text-xs font-black text-white backdrop-blur">{item.rating}</span> : null}
        </div>
        <div className="min-h-[88px] p-3">
          <h3 className="line-clamp-2 text-sm font-black leading-tight">{item.title}</h3>
          <p className="mt-2 truncate text-xs font-semibold text-neutral-500">{item.published || item.competition || 'Ready to stream'}</p>
        </div>
      </button>
      <button
        type="button"
        onClick={() => onSave(item)}
        className={`flex h-10 w-full cursor-pointer items-center justify-center gap-2 border-t border-white/10 text-xs font-black uppercase tracking-[0.12em] transition ${saved ? 'bg-white text-black' : 'bg-white/[0.04] text-neutral-300 hover:bg-white hover:text-black'}`}
      >
        <span aria-hidden="true">{saved ? '✓' : '+'}</span>
        {saved ? 'Saved' : 'Save'}
      </button>
    </article>
  );
}

export default function Catalog({ items, activeTabLabel, activeIcon, query, loading, savedIds, onSelect, onSave }: CatalogProps) {
  return (
    <section id="catalog" className="rounded-[28px] border border-white/10 bg-white/[0.03] p-4 shadow-2xl shadow-black/30 sm:p-5">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-neutral-500">Browse all</div>
          <h2 className="text-2xl font-black tracking-tight">{query ? `Results for "${query}"` : activeTabLabel}</h2>
        </div>
        <p className="text-sm font-bold text-neutral-500">{loading ? 'Searching...' : `${items.length} titles`}</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {Array.from({ length: 10 }, (_, index) => <div key={index} className="h-72 animate-pulse rounded-2xl bg-white/5" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-black/30 p-10 text-center text-neutral-500">No items found for this catalog.</div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {items.map((item) => (
            <CatalogCard key={`${item.media_type || activeIcon}-${item.id}`} item={item} activeIcon={activeIcon} saved={savedIds.has(item.id)} onSelect={onSelect} onSave={onSave} />
          ))}
        </div>
      )}
    </section>
  );
}
