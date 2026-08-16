import { StreamData, RSSFeedResponse } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Now supports 'movie', 'tv', and 'sports'
export async function fetchStreamSource(id: string, type: string = 'movie'): Promise<StreamData> {
  const res = await fetch(`${API_BASE}/api/stream?id=${id}&type=${type}`);
  if (!res.ok) throw new Error('Failed to fetch stream details');

  const data = await res.json();
  return {
    ...data,
    streamUrl: data.streamUrl ?? data.sources?.[0]?.url ?? '',
  };
}

// Added the type parameter to filter feeds
export async function fetchRssFeed(feedUrl: string, type: string = 'general'): Promise<RSSFeedResponse> {
  const res = await fetch(`${API_BASE}/api/rss?url=${encodeURIComponent(feedUrl)}&type=${type}`);
  if (!res.ok) throw new Error('Failed to fetch RSS feed');
  return res.json();
}