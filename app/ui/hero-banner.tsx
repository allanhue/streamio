'use client';

import { useEffect, useState } from 'react';

type HeroBannerProps = {
  item?: {
    id: string;
    title: string;
    poster?: string;
    thumbnail?: string;
    summary?: string;
    description?: string;
    rating?: number;
    published?: string;
    competition?: string;
  };
  onSelect?: (id: string) => void;
};

export default function HeroBanner({ item, onSelect }: HeroBannerProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  if (!item) {
    return (
      <div className="hero-banner mb-8 bg-gradient-to-b from-white/10 to-black">
        <div className="hero-content">
          <div className="h-12 w-64 animate-pulse rounded-lg bg-white/10" />
          <div className="mt-4 h-20 w-full max-w-xl animate-pulse space-y-2">
            <div className="h-4 rounded bg-white/10" />
            <div className="h-4 w-5/6 rounded bg-white/10" />
          </div>
        </div>
      </div>
    );
  }

  const backgroundImage = item.poster || item.thumbnail;
  const description = item.summary || item.description || '';

  return (
    <div
      className={`hero-banner mb-8 transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
      style={{
        backgroundImage: backgroundImage ? `url('${backgroundImage}')` : 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, #141414 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="hero-content fade-in-up">
        <h1 className="line-clamp-3 text-white drop-shadow-lg">{item.title}</h1>
        
        <p className="line-clamp-2 text-neutral-200 drop-shadow-md">{description || 'Watch now'}</p>

        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={() => onSelect?.(item.id)}
            className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-black text-black transition hover:bg-neutral-200 active:scale-95"
          >
            <span>▶</span>
            Play
          </button>

          {item.rating && (
            <div className="flex items-center gap-2 rounded-lg bg-black/60 px-4 py-2 backdrop-blur-md">
              <span className="text-sm font-black text-yellow-400">★</span>
              <span className="font-black text-white">{item.rating}</span>
            </div>
          )}

          {item.published && (
            <div className="rounded-lg bg-black/60 px-4 py-2 text-sm font-bold text-neutral-300 backdrop-blur-md">
              {item.published}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
