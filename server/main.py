import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import httpx

try:
    from .db import DATABASE_URL, init_db, keep_database_awake
except ImportError:
    from db import DATABASE_URL, init_db, keep_database_awake

try:
    from .services.rss_services import fetch_live_sports, fetch_media, fetch_media_details
except ImportError:
    from services.rss_services import fetch_media, fetch_media_details, fetch_live_sports

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
# Universal permissions applied to handle cross-origin app calls safely
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

@app.get("/api/feed")
def get_feed(type: str = Query("movie"), query: str = Query(None), list: str = Query(None)):
    if type == "sports":
        return {"type": "sports", "items": fetch_live_sports(search_query=query)}
    else:
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
        
        # Rewriting the exposed url to point to our streaming proxy endpoint
        # This strips the cross-origin restriction from your frontend TV client!
        proxied_url = f"/api/proxy-stream?url={url}"
        
        items.append({
            "id": f"live-{type}-{index + 1}",
            "title": title,
            "url": proxied_url,
            "media_type": type,
            "published": "LIVE",
            "summary": "Live HLS channel",
        })
    return {"type": type, "items": items}

@app.get("/api/proxy-stream")
async def proxy_stream(url: str = Query(...)):
    """Acts as a secure intermediary layer, downloading media chunks and piping 
    them back to the user's browser or smart TV application.
    """
    # Spoof standard browser configuration patterns to prevent tracking firewalls from triggering blocks
    custom_headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://dai.google.com/"
    }
    
    async def stream_generator():
        async with httpx.AsyncClient(follow_redirects=True) as client:
            try:
                async with client.stream("GET", url, headers=custom_headers) as response:
                    if response.status_code >= 400:
                        yield b"Failed to proxy stream segment from original source server."
                        return
                    async for chunk in response.aiter_bytes(chunk_size=16384):
                        yield chunk
            except Exception as e:
                yield b"Stream pipeline error encountered."

    # Return stream directly with fixed content format definitions
    return StreamingResponse(
        stream_generator(), 
        media_type="application/x-mpegURL",
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*"
        }
    )
