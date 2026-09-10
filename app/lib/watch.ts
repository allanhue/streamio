export type WatchTarget = {
  id: string;
  title: string;
  media_type?: string;
  url?: string;
  season?: number;
  episode?: number;
};

export function buildWatchHref(target: WatchTarget): string {
  const params = new URLSearchParams({
    id: String(target.id),
    type: target.media_type || 'movie',
    title: target.title || 'Stream',
  });

  if (target.url) {
    params.set('url', target.url);
  }
  if (target.season) {
    params.set('season', String(target.season));
  }
  if (target.episode) {
    params.set('episode', String(target.episode));
  }

  return `/watch?${params.toString()}`;
}
