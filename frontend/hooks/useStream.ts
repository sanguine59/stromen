'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export const useStream = (uploadId: string | null) =>
  useQuery({
    queryKey: ['stream', uploadId],
    queryFn: () => api.stream.resolve(uploadId!),
    enabled: !!uploadId,
    retry: 0,
    staleTime: 60_000,
  });
