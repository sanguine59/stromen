'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, ChevronDown, LogOut, Search, Upload, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/browse', label: 'Browse' },
];

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, hydrated, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        scrolled
          ? 'bg-bg-base/95 backdrop-blur-sm border-b border-white/5'
          : 'bg-gradient-to-b from-bg-base/90 to-transparent'
      }`}
    >
      <nav className="flex items-center gap-8 px-6 lg:px-12 py-4">
        <Link
          href="/"
          className="text-accent font-black tracking-tight text-2xl select-none"
          aria-label="Stromen home"
        >
          STROMEN
        </Link>

        <ul className="hidden md:flex items-center gap-6 text-sm">
          {NAV_LINKS.map((l) => {
            const active = pathname === l.href;
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={`transition-colors ${
                    active ? 'text-white' : 'text-white/70 hover:text-white'
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            );
          })}
          {isAuthenticated && (
            <li>
              <Link
                href="/upload"
                className="text-white/70 hover:text-white transition-colors flex items-center gap-1"
              >
                <Upload className="w-4 h-4" /> Upload
              </Link>
            </li>
          )}
          {isAdmin && (
            <li>
              <Link
                href="/admin"
                className="text-white/70 hover:text-white transition-colors"
              >
                Admin
              </Link>
            </li>
          )}
        </ul>

        <div className="ml-auto flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.push('/browse')}
            className="text-white/80 hover:text-white"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>
          <Bell className="w-5 h-5 text-white/60" />

          {!hydrated ? (
            <div className="w-8 h-8 rounded-full shimmer" />
          ) : isAuthenticated ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 group"
              >
                <div className="w-8 h-8 rounded-card bg-accent/90 flex items-center justify-center text-sm font-semibold uppercase">
                  {(user?.email ?? '?').charAt(0)}
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-white/60 transition-transform ${
                    menuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-56 bg-bg-modal border border-white/10 rounded-card shadow-card overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-white/10">
                      <div className="text-sm text-white truncate">
                        {user?.email}
                      </div>
                      <div className="text-xs text-muted">{user?.role}</div>
                    </div>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-white/80 hover:bg-white/5 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" /> Sign out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="bg-accent hover:bg-accent-hover text-white text-sm font-semibold px-4 py-1.5 rounded-btn flex items-center gap-1.5"
            >
              <User className="w-4 h-4" /> Sign in
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
};
