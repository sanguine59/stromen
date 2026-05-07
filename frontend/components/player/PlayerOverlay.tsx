'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const PlayerOverlay = ({ title }: { title: string }) => (
  <div className="absolute inset-x-0 top-0 px-6 py-5 bg-gradient-to-b from-black/85 to-transparent flex items-center gap-4 z-10">
    <Link
      href="/"
      className="text-white/90 hover:text-white flex items-center gap-2"
    >
      <ArrowLeft className="w-5 h-5" />
      <span className="hidden sm:inline">Back</span>
    </Link>
    <h1 className="text-lg lg:text-xl font-semibold truncate">{title}</h1>
  </div>
);
