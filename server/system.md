# Streamio System Documentation

## Overview
Streamio is a TV-first streaming app that combines a frontend catalog, a backend API, and live media source handling. The app is designed to work as a browser-based streaming hub on smart TVs, set-top boxes, and other large-screen web clients.

## Architecture

### Frontend
- Built with Next.js app-router frontend in the root `app/` folder.
- Main dashboard UI is handled in `app/ui/dashboard.tsx`.
- TV-friendly UI sections are split into reusable UI components under `app/ui/`.
- The app uses a browser-based HLS player via `hls.js` for direct `.m3u8` playback.

### Backend
- FastAPI app lives in `server/main.py`.
- Database initialization and PostgreSQL keepalive logic live in `server/db.py`.
- Media fetch and metadata logic live in `server/services/rss_services.py`.
- Server-side stream resolution logic lives in `server/stream_sources.py`.

### Data flow
1. The frontend requests `/api/feed` for movies, series, or sports.
2. The backend pulls metadata from TMDB and live RSS/sports sources.
3. The frontend selects a title and calls `/api/stream`.
4. The backend resolves the final media source list and returns direct HLS stream URLs.
5. The frontend loads the selected stream in the player for the TV browser.

## Core Features

### Catalog browsing
- Movies, series, and sports can be browsed in a single-page interface.
- Search supports tab-based filtering and suggestion chips.
- Mobile and TV layout is tuned for large-screen browsing and remote-control navigation.

### Latest section
- A dedicated latest carousel keeps recent content visible without crowding the main view.
- This matches a Netflix-inspired browsing structure for one-page discovery.

### Search and keyboard support
- Search panel supports text input and a TV-friendly on-screen keyboard.
- The UI is built for TV remote or pointer navigation.

### Watchlist
- Users can save titles to a local watchlist.
- Watchlist entries persist in browser storage.

### Live stream support
- The backend provides direct HLS URLs for movie, series, and sports playback.
- Fallback stream sources are available when external channel data is unavailable.

### Player behavior
- The app tries direct HLS playback through the browser video element.
- Protected/embed fallback logic remains available when third-party sources are required.

## Backend API

### /api/feed
Returns catalog data for a selected media type.

Query params:
- `type`: `movie`, `tv`, or `sports`
- `query`: optional search string

### /api/media-details
Returns metadata for a selected movie or series.

Query params:
- `id`
- `type`

### /api/stream
Returns playable stream sources for a selected item.

Query params:
- `id`
- `type`
- `season`
- `episode`
- `url` (optional custom stream URL)

Example response shape:
```json
{
  "id": "123",
  "title": "Movie playback",
  "sources": [
    { "name": "Backend source", "url": "https://example.com/live/stream.m3u8" }
  ],
  "isLive": false,
  "isSeries": false
}
```

## Streaming Strategy
The app follows a server-first media model:
- the backend owns the stream URL resolution logic
- the frontend consumes those URLs
- the TV browser renders the media directly via the HLS player

This avoids relying only on remote embed pages that are unstable in smart TV browser environments.

## Deployment Notes
- The frontend is meant to run as a Next.js web app.
- The backend runs as a separate FastAPI service in `server/`.
- Local development typically uses the frontend app on port 3000 and the Python API on port 8000.
- In production, the backend should be exposed behind a stable origin and the frontend should point to it with `NEXT_PUBLIC_API_URL`.

## Files of interest
- `app/page.tsx`
- `app/ui/dashboard.tsx`
- `app/ui/latest.tsx`
- `app/ui/search-panel.tsx`
- `app/ui/watchlist.tsx`
- `app/components/player.tsx`
- `server/main.py`
- `server/db.py`
- `server/stream_sources.py`
- `server/services/rss_services.py`

## Current status
The project is in a TV-first streaming app state with:
- a working single-page dashboard
- a live stream backend API
- direct HLS source handling
- a Netflix-style browsing UI layout
- a redirect-safe root route for TV app launch behavior
