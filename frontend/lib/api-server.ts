import 'server-only';
import type { FeedPage, MetadataItem } from '@/types/api';

const serverBase = (): string =>
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  'http://localhost:3000';

async function serverFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${serverBase()}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.headers as Record<string, string> | undefined),
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Server fetch failed: ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as T;
}

export const serverApi = {
  feed: (page = 1, limit = 24) =>
    serverFetch<FeedPage>(`/api/v1/metadata/feed?page=${page}&limit=${limit}`),
  byId: (id: string) => serverFetch<MetadataItem>(`/api/v1/metadata/${id}`),
};
