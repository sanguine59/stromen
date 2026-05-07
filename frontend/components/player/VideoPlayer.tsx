'use client';

import { useEffect, useRef, useState } from 'react';
import { attachHls } from '@/lib/hls';
import { Spinner } from '@/components/ui/Spinner';
import { PlayerControls } from './PlayerControls';
import { PlayerOverlay } from './PlayerOverlay';

interface Props {
  src: string;
  title: string;
  poster?: string | null;
}

export const VideoPlayer = ({ src, title, poster }: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !src) return;
    setError(null);
    setLoading(true);
    const handle = attachHls({
      video: v,
      src,
      onError: (msg) => setError(msg),
    });

    const onCanPlay = () => setLoading(false);
    v.addEventListener('canplay', onCanPlay);

    return () => {
      v.removeEventListener('canplay', onCanPlay);
      handle.destroy();
    };
  }, [src]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-black overflow-hidden group"
    >
      <PlayerOverlay title={title} />

      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-contain bg-black"
        playsInline
        controls={false}
        poster={poster ?? undefined}
        crossOrigin="anonymous"
      />

      {loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Spinner className="w-8 h-8" />
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center text-center px-6">
          <div className="bg-red-500/15 border border-red-500/30 rounded-card px-6 py-4 max-w-md">
            <div className="text-red-300 font-semibold mb-1">
              Playback error
            </div>
            <div className="text-white/70 text-sm">{error}</div>
          </div>
        </div>
      )}

      <PlayerControls videoRef={videoRef} containerRef={containerRef} />
    </div>
  );
};
