import Hls from 'hls.js';

export interface AttachOptions {
  video: HTMLVideoElement;
  src: string;
  onError?: (msg: string) => void;
}

export interface HlsHandle {
  destroy: () => void;
}

export const attachHls = ({ video, src, onError }: AttachOptions): HlsHandle => {

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = src;
    return { destroy: () => { video.removeAttribute('src'); video.load(); } };
  }

  if (!Hls.isSupported()) {
    onError?.('HLS playback is not supported in this browser');
    return { destroy: () => {} };
  }

  const hls = new Hls({ enableWorker: true, lowLatencyMode: false });
  hls.loadSource(src);
  hls.attachMedia(video);
  hls.on(Hls.Events.ERROR, (_evt, data) => {
    if (data.fatal) onError?.(data.details ?? 'Fatal HLS error');
  });
  return { destroy: () => hls.destroy() };
};
