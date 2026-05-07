'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef } from 'react';
import { VideoCard } from './VideoCard';
import type { MetadataItem } from '@/types/api';

export const ContentRow = ({
  title,
  items,
}: {
  title: string;
  items: MetadataItem[];
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const scroll = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const delta = el.clientWidth * 0.85 * dir;
    el.scrollBy({ left: delta, behavior: 'smooth' });
  };

  if (items.length === 0) return null;

  return (
    <section className="relative px-6 lg:px-12 my-10 group/row">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-bold tracking-tight">{title}</h2>
      </div>

      <button
        type="button"
        onClick={() => scroll(-1)}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-20 h-full px-2 lg:px-3 bg-gradient-to-r from-bg-base to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity"
        aria-label="Scroll left"
      >
        <ChevronLeft className="w-7 h-7 text-white" />
      </button>
      <button
        type="button"
        onClick={() => scroll(1)}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-20 h-full px-2 lg:px-3 bg-gradient-to-l from-bg-base to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity"
        aria-label="Scroll right"
      >
        <ChevronRight className="w-7 h-7 text-white" />
      </button>

      <div
        ref={ref}
        className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth py-6 -my-6"
      >
        {items.map((item) => (
          <VideoCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
};
