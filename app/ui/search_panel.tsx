'use client';

import TvKeyboard from '../components/tv_keyboard';
import type { IconName } from './dashboard';

type SearchPanelProps = {
  activeTabLabel: string;
  query: string;
  showKeyboard: boolean;
  suggestions: string[];
  onQueryChange: (value: string) => void;
  onToggleKeyboard: () => void;
  onSelectSuggestion: (value: string) => void;
};

function Icon({ name, className = 'h-4 w-4' }: { name: IconName; className?: string }) {
  if (name === 'search') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className={`${className} fill-none stroke-current stroke-2`} strokeLinecap="round" strokeLinejoin="round">
        <path d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" />
      </svg>
    );
  }

  if (name === 'keyboard') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className={`${className} fill-none stroke-current stroke-2`} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h18v12H3V6Zm3 3h.01M9 9h.01M12 9h.01M15 9h.01M18 9h.01M6 12h.01M9 12h.01M12 12h.01M15 12h.01M18 12h.01M8 15h8" />
      </svg>
    );
  }

  return null;
}

export default function SearchPanel({
  activeTabLabel,
  query,
  showKeyboard,
  suggestions,
  onQueryChange,
  onToggleKeyboard,
  onSelectSuggestion,
}: SearchPanelProps) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-2xl shadow-black/30">
      <div className="mb-2 flex items-center justify-between gap-2">
        <label htmlFor="stream-search" className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-neutral-500">
          <Icon name="search" className="h-4 w-4" />
          Search
        </label>
        <button
          type="button"
          onClick={onToggleKeyboard}
          aria-pressed={showKeyboard}
          aria-label="Toggle on-screen keyboard"
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] transition ${
            showKeyboard ? 'bg-white text-black' : 'bg-black text-neutral-400 hover:text-white'
          }`}
        >
          <Icon name="keyboard" className="h-3.5 w-3.5" />
          Keyboard
        </button>
      </div>

      <input
        id="stream-search"
        type="search"
        placeholder={`Search ${activeTabLabel.toLowerCase()}`}
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        onFocus={onToggleKeyboard}
        className="h-12 w-full rounded-xl border border-white/10 bg-black px-4 text-base font-semibold text-white outline-none transition placeholder:text-neutral-600 focus:border-white/50"
      />

      {showKeyboard && (
        <div className="mt-3">
          <TvKeyboard
            value={query}
            onChange={onQueryChange}
            onSubmit={() => onToggleKeyboard()}
            onClose={() => onToggleKeyboard()}
          />
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => onSelectSuggestion(suggestion)}
            className="rounded-full border border-white/10 bg-black px-3 py-2 text-xs font-bold text-neutral-300 transition hover:border-white/40 hover:text-white"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </section>
  );
}
