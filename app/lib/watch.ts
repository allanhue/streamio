export type WatchTarget = {
  id: string;
  title: string;
  media_type?: string;
  url?: string;
  season?: number;
  episode?: number;
};

let streamWindow: WindowProxy | null = null;

export function isHttpUrl(value: string): boolean {
  try {
    const protocol = new URL(value).protocol;
    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
}

export function openStreamWindow(value: string): boolean {
  if (!isHttpUrl(value)) return false;

  if (!streamWindow || streamWindow.closed) {
    streamWindow = window.open('about:blank', 'streamio-player');
    if (!streamWindow) return false;
    streamWindow.opener = null;
  }

  streamWindow.location.replace(value);
  return true;
}

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
