import Link from 'next/link';
import { serverApi } from '@/lib/api-server';
import { VideoCard } from '@/components/home/VideoCard';

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export default async function BrowsePage({ searchParams }: Props) {
  const sp = await searchParams;
  const page = Math.max(1, Number.parseInt(sp.page ?? '1', 10) || 1);
  const limit = 30;

  let feed;
  try {
    feed = await serverApi.feed(page, limit);
  } catch {
    feed = { items: [], page, limit, total: 0 };
  }

  const totalPages = Math.max(1, Math.ceil(feed.total / limit));

  return (
    <div className="px-6 lg:px-12 py-12">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Browse</h1>
          <p className="text-white/60 mt-1 text-sm">
            {feed.total} {feed.total === 1 ? 'title' : 'titles'} available
          </p>
        </div>
      </div>

      {feed.items.length === 0 ? (
        <div className="py-20 text-center text-white/60">
          Nothing to browse yet.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {feed.items.map((item) => (
            <VideoCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-12">
          {Array.from({ length: totalPages }).map((_, i) => {
            const p = i + 1;
            const active = p === page;
            return (
              <Link
                key={p}
                href={`/browse?page=${p}`}
                className={`px-4 py-2 rounded-btn text-sm ${
                  active
                    ? 'bg-accent text-white'
                    : 'bg-bg-surface text-white/70 hover:bg-bg-elevated hover:text-white'
                }`}
              >
                {p}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
