from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

try:
    from .services.rss_services import fetch_live_sports, fetch_media, fetch_media_details
except ImportError:
    from services.rss_services import fetch_live_sports, fetch_media, fetch_media_details

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

@app.get("/api/feed")
def get_feed(type: str = Query("movie"), query: str = Query(None)):
    if type == "sports":
        return {"type": "sports", "items": fetch_live_sports(search_query=query)}
    else:
        # type can be 'movie' or 'tv'
        return {"type": type, "items": fetch_media(media_type=type, search_query=query)}

@app.get("/api/media-details")
def get_media_details(id: str = Query(...), type: str = Query("movie")):
    return fetch_media_details(media_type=type, media_id=id)

@app.get("/api/stream")
def get_stream(id: str = Query(...), type: str = Query("movie"), season: int = Query(1), episode: int = Query(1), url: str = Query(None)):
    if type in ["sports", "sports_channel"]:
        source_name = "Open Coverage" if url else "HLS Stream"
        return {
            "id": id, "title": "Sports Coverage",
            "sources": [{"name": source_name, "url": url or "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"}],
            "isLive": True
        }
    elif type == "tv":
        # TV series embed structure requires season & episode parameters
        return {
            "id": id, "title": f"Series (S{season} E{episode})",
            "sources": [
                {"name": "VidSrc.me", "url": f"https://vidsrc.me/embed/tv?tmdb={id}&season={season}&episode={episode}"},
                {"name": "AutoEmbed", "url": f"https://player.autoembed.cc/embed/tv/{id}/{season}/{episode}"},
                {"name": "SuperEmbed", "url": f"https://multiembed.mov/?video_id={id}&tmdb=1&s={season}&e={episode}"}
            ],
            "isLive": False, "isSeries": True
        }
    else:
        # Standard movie embed structure
        return {
            "id": id, "title": "Movie Stream",
            "sources": [
                {"name": "VidSrc.me", "url": f"https://vidsrc.me/embed/movie?tmdb={id}"},
                {"name": "AutoEmbed", "url": f"https://player.autoembed.cc/embed/movie/{id}"},
                {"name": "SuperEmbed", "url": f"https://multiembed.mov/?video_id={id}&tmdb=1"}
            ],
            "isLive": False, "isSeries": False
        }
