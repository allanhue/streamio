from __future__ import annotations

from typing import Any, Dict, List, Optional

# Direct HLS sources kept on the backend so the TV app plays from the server-side stream layer
DEFAULT_STREAMS: Dict[str, List[Dict[str, str]]] = {
    "sports": [
        {"name": "Live Sports HD", "url": "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"},
        {"name": "Red Bull TV", "url": "https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8"},
        {"name": "Open Coverage", "url": "https://d3rlna7iyuk8km.cloudfront.net/ATVafrica/atvamericas/s.m3u8"},
    ],
    "tv": [
        {"name": "Backend TV HD", "url": "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"},
        {"name": "Arena World", "url": "https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8"},
    ],
    "movie": [
        {"name": "Cinema HD", "url": "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"},
        {"name": "Movie Stream", "url": "https://d3rlna7iyuk8km.cloudfront.net/ATVafrica/atvamericas/s.m3u8"},
    ],
}






def _normalize_url(url: Optional[str]) -> Optional[str]:
    if not url:
        return None
    value = url.strip()
    return value if value else None


def resolve_stream_sources(
    media_type: str,
    media_id: Optional[str] = None,
    season: int = 1,
    episode: int = 1,
    requested_url: Optional[str] = None,
) -> Dict[str, Any]:
    """Return direct backend stream sources for the app. If the caller passes a real stream URL,
    we use it; otherwise we serve a curated live HLS stream list so the TV client can consume it.
    """
    cleaned_url = _normalize_url(requested_url)
    if cleaned_url:
        return {
            "id": media_id or "custom-stream",
            "title": "Live stream",
            "sources": [{"name": "Backend source", "url": cleaned_url}],
            "isLive": True,
            "isSeries": media_type == "tv",
        }

    stream_pool = DEFAULT_STREAMS.get(media_type, DEFAULT_STREAMS["movie"])[:]
    if media_type in {"sports", "sports_channel"}:
        return {
            "id": media_id or "sports-live",
            "title": "Sports Coverage",
            "sources": stream_pool,
            "isLive": True,
            "isSeries": False,
        }

    if media_type == "tv":
        return {
            "id": media_id or f"tv-{season}-{episode}",
            "title": f"Series playback (S{season} E{episode})",
            "sources": stream_pool,
            "isLive": False,
            "isSeries": True,
        }

    return {
        "id": media_id or "movie-stream",
        "title": "Movie playback",
        "sources": stream_pool,
        "isLive": False,
        "isSeries": False,
    }
