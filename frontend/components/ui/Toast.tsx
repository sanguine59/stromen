'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, XCircle, Info } from 'lucide-react';
import { createContext, useCallback, useContext, useState } from 'react';

type Tone = 'success' | 'error' | 'info';
interface ToastItem {
  id: number;
  tone: Tone;
  message: string;
}

const ToastCtx = createContext<{
  push: (tone: Tone, message: string) => void;
} | null>(null);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<ToastItem[]>([]);

  const push = useCallback((tone: Tone, message: string) => {
    const id = Date.now() + Math.random();
    setItems((s) => [...s, { id, tone, message }]);
    setTimeout(() => {
      setItems((s) => s.filter((it) => it.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div className="fixed top-20 right-6 z-[60] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {items.map((it) => (
            <motion.div
              key={it.id}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              className="pointer-events-auto bg-bg-modal border border-white/10 rounded-card px-4 py-3 shadow-card flex items-start gap-2 min-w-[260px] max-w-sm"
            >
              {it.tone === 'success' && (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5" />
              )}
              {it.tone === 'error' && (
                <XCircle className="w-4 h-4 text-red-400 mt-0.5" />
              )}
              {it.tone === 'info' && (
                <Info className="w-4 h-4 text-white/70 mt-0.5" />
              )}
              <div className="text-sm text-white/90">{it.message}</div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
};
