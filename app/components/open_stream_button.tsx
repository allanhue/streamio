'use client';

import { useState, type ReactNode } from 'react';
import { openStreamWindow } from '../lib/watch';

type OpenStreamButtonProps = {
  src: string;
  className: string;
  children: ReactNode;
};

export default function OpenStreamButton({ src, className, children }: OpenStreamButtonProps) {
  const [error, setError] = useState('');

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => {
          setError(
            openStreamWindow(src)
              ? ''
              : 'The player window could not open. Allow pop-ups and try again.',
          );
        }}
        className={className}
      >
        {children}
      </button>
      {error ? <p role="alert" className="text-center text-sm text-red-300">{error}</p> : null}
    </div>
  );
}
