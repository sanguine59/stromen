import { serverApi } from '@/lib/api-server';
import { Hero } from '@/components/home/Hero';
import { ContentRow } from '@/components/home/ContentRow';
import type { FeedPage } from '@/types/api';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let feed: FeedPage = { items: [], page: 1, limit: 24, total: 0 };
  try {
    feed = await serverApi.feed(1, 24);
  } catch (err) {
    console.error('feed fetch failed', err);
  }

  const hero = feed.items[0] ?? null;
  const recent = feed.items.slice(0, 12);
  const all = feed.items.slice(0);

  return (
    <>
      <Hero item={hero} />
      <ContentRow title="New uploads" items={recent} />
      <ContentRow title="Browse all" items={all} />
      {feed.items.length === 0 && (
        <div className="px-6 lg:px-12 py-20 text-center text-white/60">
          The feed is empty. Once a video is uploaded and transcoded it will
          appear here.
        </div>
      )}
    </>
  );
}
