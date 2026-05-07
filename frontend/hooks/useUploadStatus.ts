'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export const useUploadStatus = (uploadId: string | null, enabled = true) =>
  useQuery({
    queryKey: ['upload-status', uploadId],
    queryFn: () => api.uploads.status(uploadId!),
    enabled: !!uploadId && enabled,
    refetchInterval: (q) => {
      const s = q.state.data?.status?.toUpperCase();
      if (s === 'READY' || s === 'FAILED') return false;
      return 3000;
    },
    refetchIntervalInBackground: false,
  });
