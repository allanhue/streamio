'use client';

import { useEffect } from 'react';

export default function PwaRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    void navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {
      // Installation is optional when the TV browser does not support service workers.
    });
  }, []);

  return null;
}
