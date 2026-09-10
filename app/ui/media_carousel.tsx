'use client';

import Link from 'next/link';
import { buildWatchHref } from '../lib/watch';
import type { WatchlistItem } from './watchlist';

type MediaCarouselProps = {
  title: string;
  subtitle?: string;
  items: WatchlistItem[];
  loading?: boolean;
  direction?: 'left' | 'right';
};

export default function MediaCarousel({
  title,
  subtitle = 'From TMDB',
  items,
  loading = false,
  direction = 'right',
}: MediaCarouselProps) {
  const track = items.length > 0 ? [...items, ...items] : [];

  return (
    <section className="space-y-3">
      <div className="px-1">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-neutral-500">{subtitle}</p>
        <h2 className="text-xl font-black tracking-tight sm:text-2xl">{title}</h2>
      </div>

      {loading ? (
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="h-56 w-36 shrink-0 animate-pulse rounded-lg bg-white/5 sm:h-64 sm:w-40" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-white/10 bg-black/30 p-6 text-center text-sm text-neutral-500">
          No titles available
        </div>
      ) : (
        <div className="carousel-track relative overflow-hidden">
          <div
            className={`media-marquee flex w-max gap-3 ${direction === 'right' ? 'media-marquee-right' : 'media-marquee-left'}`}
          >
            {track.map((item, index) => {
              const image = item.poster || item.thumbnail;
              return (
                <Link
                  key={`${item.id}-${index}`}
                  href={buildWatchHref({
                    id: item.id,
                    title: item.title,
                    media_type: item.media_type || 'movie',
                    url: item.url,
                  })}
                  className="netflix-card group relative block w-36 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-black sm:w-40"
                >
                  <div className="relative aspect-[2/3] bg-neutral-900">
                    {image ? (
                      <img src={image} alt={item.title} loading="lazy" className="h-full w-full object-cover" />
                    ) : (
                      <div className="grid h-full place-items-center text-xs text-neutral-600">No art</div>
                    )}
                    <span className="absolute inset-0 grid place-items-center bg-black/0 opacity-0 transition group-hover:bg-black/35 group-hover:opacity-100">
                      <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-black">▶</span>
                    </span>
                    {item.rating ? (
                      <span className="absolute right-2 top-2 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-black backdrop-blur">
                        ★ {item.rating}
                      </span>
                    ) : null}
                  </div>
                  <div className="p-2">
                    <p className="line-clamp-1 text-xs font-black">{item.title}</p>
                    <p className="mt-0.5 line-clamp-1 text-[10px] text-neutral-500">{item.published || 'TMDB'}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
