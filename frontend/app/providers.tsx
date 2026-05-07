'use client';

import { useEffect, useState } from 'react';
import {
  HydrationBoundary,
  QueryClientProvider,
  type DehydratedState,
} from '@tanstack/react-query';
import { makeQueryClient } from '@/lib/query-client';
import { configureAuth } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

export const Providers = ({
  children,
  dehydratedState,
}: {
  children: React.ReactNode;
  dehydratedState?: DehydratedState;
}) => {
  const [client] = useState(() => makeQueryClient());

  useEffect(() => {
    configureAuth({
      getToken: () => useAuthStore.getState().token,
      onUnauthorized: () => useAuthStore.getState().logout(),
    });
  }, []);

  return (
    <QueryClientProvider client={client}>
      <HydrationBoundary state={dehydratedState}>{children}</HydrationBoundary>
    </QueryClientProvider>
  );
};
