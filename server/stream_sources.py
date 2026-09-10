from __future__ import annotations

from typing import Any, Dict, List, Optional

# Direct HLS sources kept on the backend so the TV app plays from the server-side stream layer
DEFAULT_STREAMS: Dict[str, List[Dict[str, str]]] = {
    "sports": [
        {"name": "Live Sports HD", "url": "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"},
        {"name": "Red Bull TV", "url": "https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8"},
        {"name": "fubo Sports Network (FAST)", "url": "https://dai2-xumo.fubo.tv/ch1/manifest.m3u8"},
        {"name": "CBS Sports HQ (FAST)", "url": "https://cbsn-us.cbsnstat.com/m3u8/master.m3u8"},
        {"name": "Apple BipBop Sample", "url": "https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8"},
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

    if media_type in {"sports", "sports_channel"}:
        return {
            "id": media_id or "sports-live",
            "title": "Sports Coverage",
            "sources": DEFAULT_STREAMS.get("sports", []),
            "isLive": True,
            "isSeries": False,
        }

    if media_type == "tv":
        return {
            "id": media_id or f"tv-{season}-{episode}",
            "title": f"Series (S{season} E{episode})",
            "sources": [
                {"name": "VidSrc.me", "url": f"https://vidsrc.me/embed/tv?tmdb={media_id}&season={season}&episode={episode}"},
                {"name": "AutoEmbed", "url": f"https://player.autoembed.cc/embed/tv/{media_id}/{season}/{episode}"},
                {"name": "SuperEmbed", "url": f"https://multiembed.mov/?video_id={media_id}&tmdb=1&s={season}&e={episode}"},
            ],
            "isLive": False,
            "isSeries": True,
        }

    return {
        "id": media_id or "movie-stream",
        "title": "Movie Stream",
        "sources": [
            {"name": "VidSrc.me", "url": f"https://vidsrc.me/embed/movie?tmdb={media_id}"},
            {"name": "AutoEmbed", "url": f"https://player.autoembed.cc/embed/movie/{media_id}"},
            {"name": "SuperEmbed", "url": f"https://multiembed.mov/?video_id={media_id}&tmdb=1"},
        ],
        "isLive": False,
        "isSeries": False,
    }
