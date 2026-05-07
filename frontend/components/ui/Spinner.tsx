export const Spinner = ({ className = '' }: { className?: string }) => (
  <span
    role="status"
    aria-label="Loading"
    className={`inline-block w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin ${className}`}
  />
);
