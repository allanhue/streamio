'use client';

import { useState, useEffect } from 'react';

export default function DashboardUI() {
  const [activeTab, setActiveTab] = useState<'movie' | 'tv' | 'sports'>('movie');
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedStream, setSelectedStream] = useState<any>(null);
  const [activeMirror, setActiveMirror] = useState<number>(0);
  
  // Series Specific State
  const [season, setSeason] = useState<number>(1);
  const [episode, setEpisode] = useState<number>(1);
  
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch feeds based on tab & query
  useEffect(() => {
    const delay = setTimeout(() => {
      setLoading(true);
      const url = `http://127.0.0.1:8000/api/feed?type=${activeTab}&query=${encodeURIComponent(searchQuery)}`;
      
      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          setItems(data.items || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }, 400);

    return () => clearTimeout(delay);
  }, [activeTab, searchQuery]);

  // Load stream when media or season/episode updates
  const loadStream = async (item: any, s = season, e = episode) => {
    setSelectedItem(item);
    try {
      const urlParam = item.url ? `&url=${encodeURIComponent(item.url)}` : '';
      const res = await fetch(`http://127.0.0.1:8000/api/stream?id=${item.id}&type=${item.media_type || activeTab}&season=${s}&episode=${e}${urlParam}`);
      const data = await res.json();
      setSelectedStream(data);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen space-y-6 font-sans pb-12">
      
      {/* Navigation Header / Search */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => { setActiveTab('movie'); setSearchQuery(''); setSelectedItem(null); }}
            className={`px-4 py-2 font-bold rounded-lg transition-all ${activeTab === 'movie' ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            🎬 Movies
          </button>
          <button
            onClick={() => { setActiveTab('tv'); setSearchQuery(''); setSelectedItem(null); }}
            className={`px-4 py-2 font-bold rounded-lg transition-all ${activeTab === 'tv' ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            📺 TV Series
          </button>
          <button
            onClick={() => { setActiveTab('sports'); setSearchQuery(''); setSelectedItem(null); }}
            className={`px-4 py-2 font-bold rounded-lg transition-all ${activeTab === 'sports' ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            ⚽ Live Sports
          </button>
        </div>

        <input
          type="text"
          placeholder={`Search ${activeTab === 'tv' ? 'series (e.g. Money Heist)' : activeTab} ...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:w-72 px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-red-500 text-sm"
        />
      </div>

      {/* Media Player Section */}
      {selectedStream && (
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-2xl space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">{selectedItem?.title}</h2>
              <p className="text-xs text-slate-400">{selectedStream.title}</p>
            </div>

            {/* Server Mirrors Switcher */}
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs text-slate-400">Mirrors:</span>
              {selectedStream.sources?.map((src: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setActiveMirror(idx)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${activeMirror === idx ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                >
                  {src.name}
                </button>
              ))}
            </div>
          </div>

          {/* Series Season & Episode Selector */}
          {activeTab === 'tv' && (
            <div className="flex gap-4 items-center bg-slate-950 p-3 rounded-xl border border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Season:</span>
                <input 
                  type="number" min={1} max={20} value={season} 
                  onChange={(e) => {
                    const s = parseInt(e.target.value) || 1;
                    setSeason(s);
                    loadStream(selectedItem, s, episode);
                  }}
                  className="w-16 bg-slate-900 border border-slate-800 px-2 py-1 rounded text-center text-sm font-bold"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Episode:</span>
                <input 
                  type="number" min={1} max={50} value={episode} 
                  onChange={(e) => {
                    const ep = parseInt(e.target.value) || 1;
                    setEpisode(ep);
                    loadStream(selectedItem, season, ep);
                  }}
                  className="w-16 bg-slate-900 border border-slate-800 px-2 py-1 rounded text-center text-sm font-bold"
                />
              </div>
            </div>
          )}

          {/* Player Display */}
          <div className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-inner">
            {selectedStream.isLive ? (
              <div className="h-full flex flex-col items-center justify-center space-y-3">
                <span className="text-4xl">📡</span>
                <a href={selectedStream.sources[0].url} target="_blank" rel="noreferrer" className="px-5 py-2 bg-red-600 rounded-lg text-sm font-bold">
                  Open Stream Link
                </a>
              </div>
            ) : (
              <iframe
                src={selectedStream.sources[activeMirror]?.url}
                className="w-full h-full border-0"
                allowFullScreen
                allow="autoplay; fullscreen"
                referrerPolicy="no-referrer"
              />
            )}
          </div>
        </section>
      )}

      {/* Grid Display */}
      {loading ? (
        <div className="text-center py-20 text-slate-500 animate-pulse font-medium">Loading catalog...</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {items.map((item) => (
            <div 
              key={item.id} 
              onClick={() => loadStream(item, 1, 1)}
              className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col justify-between hover:-translate-y-1 hover:border-red-500/50 transition-all cursor-pointer group"
            >
              <div className="relative aspect-[2/3] overflow-hidden rounded-lg mb-3 bg-slate-950">
                {item.poster ? (
                  <img src={item.poster} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">📺</div>
                )}
                {item.rating > 0 && (
                  <span className="absolute top-2 right-2 bg-black/70 backdrop-blur-md text-yellow-400 text-xs font-bold px-2 py-1 rounded-md">
                    ⭐ {item.rating}
                  </span>
                )}
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-100 line-clamp-1">{item.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{item.published}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}