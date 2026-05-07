'use client';

import { Film, UploadCloud } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { formatBytes } from '@/lib/format';

interface Props {
  onFile: (file: File) => void;
  selectedFile?: File | null;
}

export const UploadZone = ({ onFile, selectedFile }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDrag(false);
      const file = e.dataTransfer.files?.[0];
      if (file) onFile(file);
    },
    [onFile],
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      className={`relative border-2 border-dashed rounded-card p-12 text-center cursor-pointer transition-colors ${
        drag
          ? 'border-accent bg-accent/5'
          : 'border-white/15 bg-bg-surface/40 hover:border-white/30'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
        }}
      />

      {selectedFile ? (
        <div className="flex flex-col items-center gap-3">
          <Film className="w-10 h-10 text-accent" />
          <div className="text-white font-semibold">{selectedFile.name}</div>
          <div className="text-sm text-white/60">
            {formatBytes(selectedFile.size)} · {selectedFile.type || 'video/*'}
          </div>
          <div className="text-xs text-white/40 mt-2">
            Click or drop another file to replace
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <UploadCloud className="w-12 h-12 text-white/60" />
          <div className="text-white font-semibold">
            Drag & drop a video, or click to browse
          </div>
          <div className="text-sm text-white/50">
            MP4, MOV, MKV — up to a few GB
          </div>
        </div>
      )}
    </div>
  );
};
