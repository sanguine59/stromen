'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Play, Eye, Clock } from 'lucide-react';
import type { MetadataItem } from '@/types/api';
import { formatDuration, formatViews } from '@/lib/format';

const gradientFor = (id: string): string => {
  const palette = [
    'from-indigo-700 via-fuchsia-700 to-rose-700',
    'from-emerald-700 via-cyan-700 to-sky-700',
    'from-amber-700 via-rose-700 to-purple-700',
    'from-slate-800 via-zinc-700 to-stone-700',
    'from-red-800 via-rose-700 to-amber-700',
    'from-blue-800 via-indigo-700 to-violet-700',
  ];
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return palette[h % palette.length];
};

export const VideoCard = ({ item }: { item: MetadataItem }) => {
  const grad = gradientFor(item.id);

  return (
    <motion.div
      whileHover={{ scale: 1.18, zIndex: 30, y: -6 }}
      transition={{ type: 'spring', stiffness: 280, damping: 22 }}
      className="relative shrink-0 w-[260px] md:w-[300px] origin-center"
    >
      <Link href={`/watch/${item.uploadId}`} className="block group">
        <div className="relative aspect-video rounded-card overflow-hidden bg-bg-surface shadow-card">
          {item.thumbnailUrl ? (
            <img
              src={item.thumbnailUrl}
              alt={item.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div
              className={`absolute inset-0 bg-gradient-to-br ${grad} opacity-90`}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-3">
            <div className="text-white font-semibold text-[15px] line-clamp-1">
              {item.title}
            </div>
            <div className="text-white/70 text-[11px] mt-0.5 flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDuration(item.durationSeconds)}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {formatViews(item.views)}
              </span>
            </div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="bg-white text-black rounded-full p-3 shadow-lg">
              <Play className="w-5 h-5 fill-current" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
