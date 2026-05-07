import clsx from 'clsx';
import type { ProcessingState, UploadStatus } from '@/types/api';

const TONE: Record<string, string> = {
  READY: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  PROCESSING: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  DRAFT: 'bg-white/10 text-white/70 border-white/10',
  FAILED: 'bg-red-500/15 text-red-300 border-red-500/30',
  PUBLIC: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  PRIVATE: 'bg-white/10 text-white/70 border-white/10',
  UNLISTED: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
};

export const Badge = ({
  status,
  className,
}: {
  status: ProcessingState | UploadStatus | string;
  className?: string;
}) => {
  const key = (status ?? '').toString().toUpperCase();
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide rounded-btn border',
        TONE[key] ?? 'bg-white/10 text-white/70 border-white/10',
        className,
      )}
    >
      {key}
    </span>
  );
};
