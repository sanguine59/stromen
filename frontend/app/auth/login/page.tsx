'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from '@/components/ui/Spinner';
import { ApiHttpError } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') ?? '/';
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      await login(email, password);
      router.push(next);
    } catch (err) {
      const msg =
        err instanceof ApiHttpError
          ? err.status === 429
            ? 'Too many attempts. Wait a minute and try again.'
            : err.status === 401
              ? 'Wrong email or password.'
              : err.message
          : 'Login failed';
      setError(msg);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-bg-modal/80 backdrop-blur border border-white/10 rounded-card p-8 shadow-glow"
      >
        <div className="text-center mb-6">
          <div className="text-accent font-black text-3xl tracking-tight">
            STROMEN
          </div>
          <div className="text-white/60 text-sm mt-1">Sign in to continue</div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block">
            <span className="text-xs text-white/60 uppercase">Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full bg-bg-base/80 border border-white/10 rounded-btn px-3 py-2.5 text-white focus:outline-none focus:border-accent"
            />
          </label>
          <label className="block">
            <span className="text-xs text-white/60 uppercase">Password</span>
            <input
              type="password"
              required
              minLength={4}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full bg-bg-base/80 border border-white/10 rounded-btn px-3 py-2.5 text-white focus:outline-none focus:border-accent"
            />
          </label>

          {error && (
            <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-btn px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white font-semibold py-2.5 rounded-btn transition-colors disabled:opacity-60"
          >
            {pending ? <Spinner /> : 'Sign in'}
          </button>
        </form>

        <p className="text-sm text-white/60 text-center mt-6">
          New to Stromen?{' '}
          <Link
            href={`/auth/register${next !== '/' ? `?next=${encodeURIComponent(next)}` : ''}`}
            className="text-white hover:underline"
          >
            Create an account
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
