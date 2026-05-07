export const UploadProgress = ({
  pct,
  label,
}: {
  pct: number;
  label?: string;
}) => (
  <div>
    <div className="flex items-center justify-between mb-2 text-sm text-white/70">
      <span>{label ?? 'Uploading…'}</span>
      <span className="tabular-nums">{pct}%</span>
    </div>
    <div className="h-2 bg-bg-surface rounded-full overflow-hidden">
      <div
        className="h-full bg-accent transition-[width] duration-200"
        style={{ width: `${pct}%` }}
      />
    </div>
  </div>
);
