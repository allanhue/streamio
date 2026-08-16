export interface StreamSource {
  name: string;
  url: string;
}

export interface StreamData {
  id: string;
  title: string;
  sources: StreamSource[];
  subtitles?: { lang: string; url: string }[];
  isLive?: boolean;
}

export interface RSSItem {
  id: string;
  title: string;
  link: string;
  published: string;
  summary: string;
  type: string;
}

export interface RSSFeedResponse {
  title: string;
  source_url?: string;
  type: string;
  items: RSSItem[];
}