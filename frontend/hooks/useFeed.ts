'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { FeedPage } from '@/types/api';

export const useFeed = (page = 1, limit = 24, initialData?: FeedPage) =>
  useQuery({
    queryKey: ['feed', page, limit],
    queryFn: () => api.metadata.feed(page, limit),
    initialData,
    staleTime: 15_000,
  });
