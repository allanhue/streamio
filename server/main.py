import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

try:
    from .db import DATABASE_URL, init_db, keep_database_awake
except ImportError:
    from db import DATABASE_URL, init_db, keep_database_awake

try:
    from .services.rss_services import fetch_live_sports, fetch_media, fetch_media_details
except ImportError:
    from services.rss_services import fetch_live_sports, fetch_media, fetch_media_details

try:
    from .stream_sources import DEFAULT_STREAMS, resolve_stream_sources
except ImportError:
    from stream_sources import DEFAULT_STREAMS, resolve_stream_sources

@asynccontextmanager
async def lifespan(_: FastAPI):
    keepalive_task = None
    if DATABASE_URL:
        await asyncio.to_thread(init_db)
        keepalive_task = asyncio.create_task(keep_database_awake())

    try:
        yield
    finally:
        if keepalive_task:
            keepalive_task.cancel()
            await asyncio.gather(keepalive_task, return_exceptions=True)


app = FastAPI(lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

@app.get("/api/feed")
def get_feed(type: str = Query("movie"), query: str = Query(None), list: str = Query(None)):
    if type == "sports":
        return {"type": "sports", "items": fetch_live_sports(search_query=query)}
    else:
        # type can be 'movie' or 'tv'; list can be popular / upcoming / top_rated
        return {"type": type, "items": fetch_media(media_type=type, search_query=query, list_name=list)}

@app.get("/api/media-details")
def get_media_details(id: str = Query(...), type: str = Query("movie")):
    return fetch_media_details(media_type=type, media_id=id)

@app.get("/api/stream")
def get_stream(id: str = Query(...), type: str = Query("movie"), season: int = Query(1), episode: int = Query(1), url: str = Query(None)):
    return resolve_stream_sources(
        media_type=type,
        media_id=id,
        season=season,
        episode=episode,
        requested_url=url,
    )

@app.get("/api/live-streams")
def get_live_streams(type: str = Query("sports")):
    sources = DEFAULT_STREAMS.get(type, [])
    items = []
    for index, source in enumerate(sources):
        url = (source.get("url") or "").strip()
        if not url:
            continue
        title = (source.get("name") or "").strip() or f"Live Channel {index + 1}"
        items.append({
            "id": f"live-{type}-{index + 1}",
            "title": title,
            "url": url,
            "media_type": type,
            "published": "LIVE",
            "summary": "Live HLS channel",
        })
    return {"type": type, "items": items}
