# Streamio System Documentation

## Overview
Streamio is a TV-first streaming app that combines a  live media source handling. The app is designed to work as a browser-based streaming hub /

## Architecture

### Frontend
- Built with Next.js app-router frontend in the root `app/` folder.
- Main dashboard UI is handled in `app/ui/dashboard.tsx`.
- TV-friendly UI sections are split into reusable UI components under `app/ui/`.
- The app uses a browser-based HLS player via `hls.js` for direct `.m3u8` playback.

## Core Features

### Catalog browsing
- Movies, series, and sports can be browsed in a single-page interface.
- Search supports tab-based filtering and suggestion chips.

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
