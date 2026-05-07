'use client';

import {
  Maximize,
  Minimize,
  Pause,
  Play,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { formatDuration } from '@/lib/format';

interface Props {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export const PlayerControls = ({ videoRef, containerRef }: Props) => {
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const seekRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onTime = () => setCurrent(v.currentTime);
    const onMeta = () => setDuration(v.duration || 0);
    const onVol = () => {
      setMuted(v.muted);
      setVolume(v.volume);
    };
    v.addEventListener('play', onPlay);
    v.addEventListener('pause', onPause);
    v.addEventListener('timeupdate', onTime);
    v.addEventListener('loadedmetadata', onMeta);
    v.addEventListener('volumechange', onVol);
    return () => {
      v.removeEventListener('play', onPlay);
      v.removeEventListener('pause', onPause);
      v.removeEventListener('timeupdate', onTime);
      v.removeEventListener('loadedmetadata', onMeta);
      v.removeEventListener('volumechange', onVol);
    };
  }, [videoRef]);

  useEffect(() => {
    const onFs = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play();
    else v.pause();
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
  };

  const onSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    if (!v) return;
    const pct = Number(e.target.value) / 100;
    v.currentTime = pct * (v.duration || 0);
  };

  const onVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    if (!v) return;
    const val = Number(e.target.value) / 100;
    v.volume = val;
    v.muted = val === 0;
  };

  const toggleFullscreen = async () => {
    const c = containerRef.current;
    if (!c) return;
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await c.requestFullscreen();
    }
  };

  const pct = duration > 0 ? (current / duration) * 100 : 0;

  return (
    <div className="absolute inset-x-0 bottom-0 px-6 py-4 bg-gradient-to-t from-black/95 via-black/40 to-transparent">
      <div className="mb-2">
        <input
          ref={seekRef}
          type="range"
          min={0}
          max={100}
          step={0.1}
          value={pct}
          onChange={onSeek}
          className="w-full accent-accent cursor-pointer h-1"
          aria-label="Seek"
        />
      </div>
      <div className="flex items-center gap-4 text-white">
        <button
          onClick={togglePlay}
          aria-label={playing ? 'Pause' : 'Play'}
          className="hover:scale-110 transition-transform"
        >
          {playing ? (
            <Pause className="w-7 h-7 fill-current" />
          ) : (
            <Play className="w-7 h-7 fill-current" />
          )}
        </button>

        <div className="flex items-center gap-2 group/vol">
          <button onClick={toggleMute} aria-label="Mute">
            {muted || volume === 0 ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </button>
          <input
            type="range"
            min={0}
            max={100}
            value={muted ? 0 : volume * 100}
            onChange={onVolume}
            className="w-0 group-hover/vol:w-24 transition-[width] duration-300 accent-accent"
            aria-label="Volume"
          />
        </div>

        <span className="text-xs text-white/80 tabular-nums">
          {formatDuration(current)} / {formatDuration(duration)}
        </span>

        <div className="ml-auto">
          <button onClick={toggleFullscreen} aria-label="Fullscreen">
            {fullscreen ? (
              <Minimize className="w-5 h-5" />
            ) : (
              <Maximize className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
