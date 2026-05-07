'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Info, Play } from 'lucide-react';
import type { MetadataItem } from '@/types/api';

export const Hero = ({ item }: { item: MetadataItem | null }) => {
  if (!item) {
    return (
      <section className="relative h-[78vh] min-h-[520px] flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-bg-surface via-bg-base to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(229,9,20,0.18),transparent_60%)]" />
        <div className="relative z-10 px-6 lg:px-12 pb-24 max-w-2xl">
          <h1 className="text-4xl lg:text-6xl font-black tracking-tight mb-4">
            Stream the world.
          </h1>
          <p className="text-white/70 text-lg">
            No videos are ready yet. Upload one to get started.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative h-[80vh] min-h-[560px] flex items-end overflow-hidden">
      {item.thumbnailUrl ? (
        <>
          <img
            src={item.thumbnailUrl}
            alt={item.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-accent/40 via-fuchsia-900 to-bg-base" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-bg-base via-bg-base/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-bg-base/90 via-bg-base/40 to-transparent" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 px-6 lg:px-12 pb-20 max-w-2xl"
      >
        <h1 className="text-4xl lg:text-6xl font-black tracking-tight leading-[1.05] mb-4 drop-shadow-lg">
          {item.title}
        </h1>
        {item.description && (
          <p className="text-white/85 text-base lg:text-lg max-w-xl line-clamp-3 mb-6">
            {item.description}
          </p>
        )}
        <div className="flex items-center gap-3">
          <Link
            href={`/watch/${item.uploadId}`}
            className="flex items-center gap-2 bg-white text-black font-semibold px-6 py-2.5 rounded-btn hover:bg-white/90 transition-colors"
          >
            <Play className="w-5 h-5 fill-current" /> Play
          </Link>
          <Link
            href={`/watch/${item.uploadId}`}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-semibold px-6 py-2.5 rounded-btn backdrop-blur-sm transition-colors"
          >
            <Info className="w-5 h-5" /> More info
          </Link>
        </div>
      </motion.div>
    </section>
  );
};
