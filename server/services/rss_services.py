import requests

TMDB_API_KEY = "15d2ea6d0dc1d476efbca3eba2b9bbfb"
ESPN_SOCCER_API = "https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

def fetch_live_sports():
    try:
        res = requests.get(ESPN_SOCCER_API, headers=HEADERS, timeout=8)
        data = res.json()
        matches = []
        for event in data.get("events", [])[:10]:
            competitors = event.get("competitions", [{}])[0].get("competitors", [])
            thumbnail = competitors[0].get("team", {}).get("logo", "") if competitors else ""
            matches.append({
                "id": str(event.get("id")),
                "title": event.get("name", "Unknown Match"),
                "competition": "Football",
                "thumbnail": thumbnail,
                "published": event.get("status", {}).get("type", {}).get("description", "Live"),
                "media_type": "sports"
            })
        if not matches:
            raise ValueError()
        return matches
    except:
        return [
            {"id": "redbull", "title": "Red Bull TV", "competition": "Extreme Sports", "thumbnail": "", "published": "24/7 LIVE", "media_type": "sports_channel", "url": "https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8"}
        ]

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
            if not item.get('poster_path'): continue
            title = item.get("title") if media_type == "movie" else item.get("name")
            results.append({
                "id": str(item.get("id")),
                "title": title,
                "rating": round(item.get("vote_average", 0), 1),
                "poster": f"https://image.tmdb.org/t/p/w500{item.get('poster_path')}",
                "published": item.get("release_date") or item.get("first_air_date") or "N/A",
                "media_type": media_type
            })
        return results
    except Exception as e:
        print(f"Error fetching {media_type}: {e}")
        return []