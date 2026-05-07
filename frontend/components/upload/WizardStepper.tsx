import clsx from 'clsx';
import { Check } from 'lucide-react';

const STEPS = ['Choose file', 'Upload', 'Details', 'Process'];

export const WizardStepper = ({ active }: { active: number }) => (
  <ol className="flex items-center justify-between max-w-xl mx-auto mb-10">
    {STEPS.map((label, i) => {
      const idx = i + 1;
      const done = idx < active;
      const current = idx === active;
      return (
        <li key={label} className="flex items-center gap-3 flex-1">
          <div
            className={clsx(
              'w-8 h-8 rounded-full border flex items-center justify-center text-xs font-semibold shrink-0 transition-colors',
              done
                ? 'bg-accent border-accent text-white'
                : current
                  ? 'border-accent text-accent'
                  : 'border-white/20 text-white/50',
            )}
          >
            {done ? <Check className="w-4 h-4" /> : idx}
          </div>
          <span
            className={clsx(
              'text-xs uppercase tracking-wide font-semibold whitespace-nowrap',
              current ? 'text-white' : 'text-white/40',
            )}
          >
            {label}
          </span>
          {idx < STEPS.length && (
            <div className="h-px flex-1 bg-white/10" />
          )}
        </li>
      );
    })}
  </ol>
);
