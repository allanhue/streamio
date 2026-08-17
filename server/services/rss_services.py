import requests
import xml.etree.ElementTree as ET
from hashlib import sha1

TMDB_API_KEY = "15d2ea6d0dc1d476efbca3eba2b9bbfb"
ESPN_SOCCER_API = "https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard"
SPORTS_RSS_FEEDS = [
    ("IPTV-Org Sports", "https://github.io"),
    ("Doms9 Live Sports", "https://s.id"),
]

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

def _text(node, tag):
    child = node.find(tag)
    return child.text.strip() if child is not None and child.text else ""

def _media_thumbnail(node):
    for child in node:
        if child.tag.endswith("thumbnail") or child.tag.endswith("content"):
            url = child.attrib.get("url")
            if url:
                return url
    enclosure = node.find("enclosure")
    if enclosure is not None and enclosure.attrib.get("type", "").startswith("image/"):
        return enclosure.attrib.get("url", "")
    return ""

def _fetch_sports_rss(search_query=None):
    items = []
    seen = set()

    for source_name, feed_url in SPORTS_RSS_FEEDS:
        try:
            res = requests.get(feed_url, headers=HEADERS, timeout=8)
            res.raise_for_status()
            root = ET.fromstring(res.content)

            for entry in root.findall(".//item"):
                title = _text(entry, "title")
                link = _text(entry, "link")
                if not title or not link or link in seen:
                    continue
                if search_query and search_query.lower() not in title.lower():
                    continue

                seen.add(link)
                thumbnail = _media_thumbnail(entry)
                items.append({
                    "id": sha1(link.encode("utf-8")).hexdigest()[:16],
                    "title": title,
                    "competition": source_name,
                    "thumbnail": thumbnail,
                    "poster": thumbnail,
                    "published": _text(entry, "pubDate") or source_name,
                    "media_type": "sports",
                    "url": link
                })

                if len(items) == 18:
                    return items
        except Exception as e:
            print(f"Error fetching sports RSS from {source_name}: {e}")

    return items

def fetch_live_sports(search_query=None):
    rss_items = _fetch_sports_rss(search_query=search_query)
    if rss_items:
        return rss_items

    try:
        res = requests.get(ESPN_SOCCER_API, headers=HEADERS, timeout=8)
        data = res.json()
        matches = []
        for event in data.get("events", []):
            title = event.get("name", "Unknown Match")
            if search_query and search_query.lower() not in title.lower():
                continue

            competitors = event.get("competitions", [{}])[0].get("competitors", [])
            thumbnail = competitors[0].get("team", {}).get("logo", "") if competitors else ""
            matches.append({
                "id": str(event.get("id")),
                "title": title,
                "competition": "Football",
                "thumbnail": thumbnail,
                "poster": thumbnail,
                "published": event.get("status", {}).get("type", {}).get("description", "Live"),
                "media_type": "sports"
            })
            if len(matches) == 12:
                break

        if not matches:
            raise ValueError()
        return matches
    except:
        return [
            {
                "id": "redbull",
                "title": "Red Bull TV",
                "competition": "Extreme Sports",
                "thumbnail": "",
                "poster": "",
                "published": "24/7 LIVE",
                "media_type": "sports_channel",
                "url": "https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8"
            }
        ]

def fetch_media_details(media_type="movie", media_id=None):
    """Fetches detailed metadata for a movie or TV series from TMDB."""
    if not media_id:
        return {}

    try:
        url = f"https://api.themoviedb.org/3/{media_type}/{media_id}?api_key={TMDB_API_KEY}"
        res = requests.get(url, headers=HEADERS, timeout=8)
        data = res.json()

        if media_type == "tv":
            seasons = []
            for season in data.get("seasons", []) or []:
                if season.get("season_number") is None:
                    continue
                seasons.append({
                    "season_number": int(season.get("season_number", 1)),
                    "episode_count": int(season.get("episode_count", 0) or 0),
                })

            seasons.sort(key=lambda item: item["season_number"])
            total_episodes = sum(item["episode_count"] for item in seasons) or int(data.get("number_of_episodes", 0) or 0)
            total_seasons = max(len(seasons), int(data.get("number_of_seasons", 0) or 0) or 1)

            return {
                "id": str(data.get("id")),
                "title": data.get("name") or data.get("title") or "Unknown",
                "number_of_seasons": total_seasons,
                "number_of_episodes": max(1, total_episodes),
                "seasons": seasons or [{"season_number": 1, "episode_count": 1}],
                "overview": data.get("overview"),
                "poster": f"https://image.tmdb.org/t/p/w500{data.get('poster_path')}" if data.get('poster_path') else "",
                "published": data.get("first_air_date") or "N/A",
            }

        return {
            "id": str(data.get("id")),
            "title": data.get("title") or data.get("name") or "Unknown",
            "runtime": data.get("runtime"),
            "overview": data.get("overview"),
            "poster": f"https://image.tmdb.org/t/p/w500{data.get('poster_path')}" if data.get('poster_path') else "",
            "published": data.get("release_date") or "N/A",
        }
    except Exception as e:
        print(f"Error fetching details for {media_type}/{media_id}: {e}")
        return {}


def fetch_media(media_type="movie", search_query=None):
    """Fetches Movies or TV Series (like Money Heist) from TMDB."""
    try:
        if search_query:
            url = f"https://api.themoviedb.org/3/search/{media_type}?api_key={TMDB_API_KEY}&query={search_query}&page=1"
        else:
            url = f"https://api.themoviedb.org/3/trending/{media_type}/day?api_key={TMDB_API_KEY}"

        res = requests.get(url, headers=HEADERS, timeout=8)
        data = res.json()
        results = []
        for item in data.get("results", [])[:18]:
            if not item.get('poster_path'):
                continue

            title = item.get("title") if media_type == "movie" else item.get("name")
            details = fetch_media_details(media_type, item.get("id")) if media_type == "tv" else {}
            results.append({
                "id": str(item.get("id")),
                "title": title,
                "rating": round(item.get("vote_average", 0), 1),
                "poster": f"https://image.tmdb.org/t/p/w500{item.get('poster_path')}",
                "published": item.get("release_date") or item.get("first_air_date") or "N/A",
                "media_type": media_type,
                "number_of_seasons": details.get("number_of_seasons"),
                "number_of_episodes": details.get("number_of_episodes"),
                "seasons": details.get("seasons", [{"season_number": 1, "episode_count": 1}]),
            })
        return results
    except Exception as e:
        print(f"Error fetching {media_type}: {e}")
        return []
