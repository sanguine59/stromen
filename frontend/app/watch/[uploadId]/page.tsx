'use client';

import { use } from 'react';
import { useStream } from '@/hooks/useStream';
import { VideoPlayer } from '@/components/player/VideoPlayer';
import { Spinner } from '@/components/ui/Spinner';

interface Props {
  params: Promise<{ uploadId: string }>;
}

export default function WatchPage({ params }: Props) {
  const { uploadId } = use(params);
  const { data, isLoading, error } = useStream(uploadId);

  return (
    <div className="-mt-16 min-h-screen bg-black">
      {isLoading && (
        <div className="h-screen flex items-center justify-center">
          <Spinner className="w-8 h-8" />
        </div>
      )}
      {error && (
        <div className="h-screen flex items-center justify-center px-6 text-center">
          <div className="bg-red-500/15 border border-red-500/30 rounded-card px-6 py-4 max-w-md">
            <div className="text-red-300 font-semibold mb-1">
              Unable to load stream
            </div>
            <div className="text-white/70 text-sm">
              {error instanceof Error ? error.message : 'Unknown error'}
            </div>
          </div>
        </div>
      )}
      {data && (
        <div className="h-screen">
          <VideoPlayer
            src={data.hlsStreamUrl}
            title={data.uploadId}
            poster={data.thumbnailUrl}
          />
        </div>
      )}
    </div>
  );
}
