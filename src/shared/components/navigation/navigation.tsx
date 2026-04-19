'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Home, Building2, TrendingUp, Search } from 'lucide-react';
import { SearchOverlay } from '@/features/search/components/search-overlay';
import { useKeyboardShortcut } from '@/shared/hooks/use-keyboard-shortcut';
import type { LucideIcon } from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { href: '/', label: '홈', icon: Home },
  { href: '/listings', label: '청약', icon: Building2 },
  { href: '/trades', label: '실거래가', icon: TrendingUp },
];

export function Navigation() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);

  const openSearch = useCallback(() => setSearchOpen(true), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  useKeyboardShortcut('k', () => setSearchOpen((prev) => !prev), {
    modifier: 'meta-or-ctrl',
  });

  function isActive(href: string) {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }

  return (
    <>
      {/* Desktop: Top header */}
      <header className="hidden lg:block fixed top-0 left-0 right-0 z-sticky bg-bg-page/55 backdrop-blur-glass shadow-[0_0.5px_0_rgba(15,23,42,0.06),0_4px_16px_rgba(15,23,42,0.05)]">
        <div className="mx-auto max-w-300 px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2" aria-label="청약닷컴 홈">
            <Image src="/logo.svg" alt="" width={22} height={20} aria-hidden="true" />
            <span className="text-headline-sm text-brand-primary-500">
              청약닷컴
            </span>
          </Link>

          <nav className="flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  'text-label-lg transition-colors duration-fast ease-default',
                  isActive(item.href)
                    ? 'text-brand-primary-500'
                    : 'text-text-secondary hover:text-text-primary',
                ].join(' ')}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <button
            onClick={openSearch}
            className="p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-bg-hover active:scale-95 transition-all duration-fast ease-default cursor-pointer"
            aria-label="검색 (⌘K)"
          >
            <Search size={24} />
          </button>
        </div>
      </header>

      {/* Mobile: Bottom nav bar */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-sticky bg-bg-page/55 backdrop-blur-glass shadow-[0_-0.5px_0_rgba(15,23,42,0.06),0_-4px_16px_rgba(15,23,42,0.05)] pb-[env(safe-area-inset-bottom)]"
        aria-label="주요 탐색"
      >
        <div className="flex items-center justify-center h-16 gap-4">
          {/* Home with logo — horizontal capsule pill */}
          <Link
            href="/"
            className="flex flex-col items-center justify-center gap-0.5 min-w-14 transition-colors duration-fast ease-default"
            aria-current={isActive('/') ? 'page' : undefined}
            aria-label="홈"
          >
            <span className={[
              'flex items-center justify-center size-8 rounded-lg transition-all duration-fast ease-default active:scale-90',
              isActive('/') ? 'bg-brand-primary-500/10' : 'bg-transparent',
            ].join(' ')}>
              <Image
                src="/logo.svg"
                alt=""
                width={24}
                height={22}
                aria-hidden="true"
                className="transition-opacity duration-fast"
              />
            </span>
            <span className={[
              'text-caption transition-colors duration-fast',
              isActive('/') ? 'text-brand-primary-500 font-medium' : 'text-text-secondary',
            ].join(' ')}>홈</span>
          </Link>

          {/* Other nav items — horizontal capsule pill */}
          {navItems.slice(1).map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center gap-0.5 min-w-14 transition-colors duration-fast ease-default"
                aria-current={active ? 'page' : undefined}
              >
                <span className={[
                  'flex items-center justify-center size-8 rounded-lg transition-all duration-fast ease-default active:scale-90',
                  active ? 'bg-brand-primary-500/10' : 'bg-transparent',
                ].join(' ')}>
                  <Icon
                    size={22}
                    aria-hidden="true"
                    className={[
                      'transition-colors duration-fast',
                      active ? 'text-brand-primary-500' : 'text-text-secondary',
                    ].join(' ')}
                  />
                </span>
                <span className={[
                  'text-caption transition-colors duration-fast',
                  active ? 'text-brand-primary-500 font-medium' : 'text-text-secondary',
                ].join(' ')}>{item.label}</span>
              </Link>
            );
          })}

          {/* Search button — same capsule pattern */}
          <button
            onClick={openSearch}
            className="flex flex-col items-center justify-center gap-0.5 min-w-14 transition-colors duration-fast ease-default text-text-secondary cursor-pointer"
            aria-label="검색"
          >
            <span className="flex items-center justify-center size-8 rounded-lg bg-transparent">
              <Search size={22} aria-hidden="true" />
            </span>
            <span className="text-caption">검색</span>
          </button>
        </div>
      </nav>

      {/* Search Overlay */}
      <SearchOverlay open={searchOpen} onClose={closeSearch} />
    </>
  );
}
