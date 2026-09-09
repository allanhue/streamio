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
  const description = (item as any).summary || (item as any).description || '';

  return (
    <article className="netflix-card group flex flex-col overflow-hidden rounded-lg border border-white/10 bg-black">
      <button type="button" onClick={() => onSelect(item)} className="block flex-1 cursor-pointer text-left">
        <div className="relative aspect-[2/3] w-full overflow-hidden bg-neutral-900">
          {image ? (
            <img src={image} alt={item.title} loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-110" />
          ) : (
            <div className="flex h-full items-center justify-center text-neutral-600"><CatalogIcon name={activeIcon} /></div>
          )}
          {item.rating && (
            <span className="absolute right-2 top-2 rounded-lg bg-black/70 px-2 py-1 text-xs font-black text-white backdrop-blur-md">
              {item.rating}
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-1.5 p-2">
          <h3 className="line-clamp-1 text-xs font-black leading-tight">{item.title}</h3>
          {description && <p className="line-clamp-1 text-[11px] text-neutral-400 leading-relaxed">{description}</p>}
          <p className="line-clamp-1 text-[10px] font-semibold text-neutral-500">{item.published || item.competition || 'Ready'}</p>
        </div>
      </button>
      <button
        type="button"
        onClick={() => onSave(item)}
        className={`flex h-8 w-full cursor-pointer items-center justify-center gap-1.5 border-t border-white/10 text-[10px] font-black uppercase tracking-[0.08em] transition ${saved ? 'bg-white text-black' : 'bg-white/[0.04] text-neutral-300 hover:bg-white hover:text-black'}`}
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
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {Array.from({ length: 12 }, (_, index) => <div key={index} className="aspect-[2/3] animate-pulse rounded-lg bg-white/5" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-black/30 p-10 text-center text-neutral-500">No items found for this catalog.</div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {items.map((item) => (
            <CatalogCard key={`${item.media_type || activeIcon}-${item.id}`} item={item} activeIcon={activeIcon} saved={savedIds.has(item.id)} onSelect={onSelect} onSave={onSave} />
          ))}
        </div>
      )}
    </section>
  );
}
