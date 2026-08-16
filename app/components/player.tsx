'use client';

import { useEffect, useRef } from 'react';
import Hls from 'hls.js';

interface PlayerProps {
  src: string;
}

export default function Player({ src }: PlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(video);
      return () => hls.destroy();
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
    }
  }, [src]);

  return (
    <div className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
      <video ref={videoRef} controls className="w-full h-full" />
    </div>
  );
}