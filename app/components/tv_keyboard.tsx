'use client';

import { useState } from 'react';

type TvKeyboardProps = {
  value: string;
  onChange: (next: string) => void;
  onSubmit?: () => void;
  onClose?: () => void;
};

const ROWS = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
];

export default function TvKeyboard({ value, onChange, onSubmit, onClose }: TvKeyboardProps) {
  const [shift, setShift] = useState(false);

  const typeChar = (char: string) => {
    onChange(value + (shift ? char.toUpperCase() : char.toLowerCase()));
    if (shift) setShift(false);
  };

  const backspace = () => onChange(value.slice(0, -1));
  const clear = () => onChange('');

  return (
    <div
      role="group"
      aria-label="On-screen keyboard"
      className="rounded-2xl border border-white/10 bg-black/60 p-3 backdrop-blur"
    >
      <div className="space-y-1.5">
        {ROWS.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-1.5">
            {row.map((char) => (
              <button
                key={char}
                type="button"
                onClick={() => typeChar(char)}
                className="h-10 w-9 shrink-0 rounded-lg bg-white/10 text-sm font-black text-white transition hover:bg-white hover:text-black sm:h-11 sm:w-10"
              >
                {shift ? char.toUpperCase() : char.toLowerCase()}
              </button>
            ))}
          </div>
        ))}

        <div className="flex flex-wrap justify-center gap-1.5 pt-1">
          <button
            type="button"
            onClick={() => setShift((current) => !current)}
            aria-pressed={shift}
            className={`h-10 rounded-lg px-3 text-xs font-black transition sm:h-11 ${
              shift ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            Shift
          </button>
          <button
            type="button"
            onClick={() => typeChar(' ')}
            className="h-10 max-w-xs flex-1 rounded-lg bg-white/10 text-xs font-black text-white transition hover:bg-white/20 sm:h-11"
          >
            Space
          </button>
          <button
            type="button"
            onClick={backspace}
            disabled={!value}
            className="h-10 rounded-lg bg-white/10 px-3 text-xs font-black text-white transition hover:bg-white/20 disabled:opacity-30 sm:h-11"
          >
            ⌫ Delete
          </button>
          <button
            type="button"
            onClick={clear}
            disabled={!value}
            className="h-10 rounded-lg bg-white/10 px-3 text-xs font-black text-white transition hover:bg-white/20 disabled:opacity-30 sm:h-11"
          >
            Clear
          </button>
          {onSubmit && (
            <button
              type="button"
              onClick={onSubmit}
              className="h-10 rounded-lg bg-white px-4 text-xs font-black text-black transition hover:bg-neutral-200 sm:h-11"
            >
              Search
            </button>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-lg border border-white/15 px-3 text-xs font-black text-neutral-300 transition hover:border-white/30 hover:text-white sm:h-11"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}