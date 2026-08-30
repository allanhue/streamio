import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Streamio',
    short_name: 'Streamio',
    description: 'Streaming App',
    start_url: '/',
    scope: '/',
    display: 'browser',
    background_color: '#050505',
    theme_color: '#050505',
    orientation: 'landscape',
    categories: ['video', 'entertainment', 'media'],
    lang: 'en',
    id: '/streamio',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
  };
}
