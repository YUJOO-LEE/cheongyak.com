'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Home, Building2, Newspaper, Search } from 'lucide-react';
import { SearchOverlay } from '@/features/search/components/search-overlay';
import type { LucideIcon } from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { href: '/', label: '홈', icon: Home },
  { href: '/listings', label: '청약', icon: Building2 },
  { href: '/news', label: '뉴스', icon: Newspaper },
];

export function Navigation() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);

  const openSearch = useCallback(() => setSearchOpen(true), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  function isActive(href: string) {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }

  return (
    <>
      {/* Desktop: Top header */}
      <header className="hidden lg:block fixed top-0 left-0 right-0 z-sticky bg-bg-page/80 backdrop-blur-glass shadow-sm">
        <div className="mx-auto max-w-300 px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2" aria-label="청약닷컴 홈">
            <Image src="/logo.svg" alt="" width={22} height={20} aria-hidden="true" />
            <span className="text-headline-sm text-brand-primary-500 font-bold">
              청약닷컴
            </span>
          </Link>

          <nav className="flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  'text-label-lg font-semibold transition-colors duration-fast ease-default',
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
            className="p-2 rounded-md text-text-secondary hover:text-text-primary transition-colors duration-fast ease-default cursor-pointer"
            aria-label="검색 (⌘K)"
          >
            <Search size={24} />
          </button>
        </div>
      </header>

      {/* Mobile: Bottom nav bar */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-sticky bg-bg-page/90 backdrop-blur-md shadow-[0_-1px_8px_rgba(15,23,42,0.04)]"
        aria-label="주요 탐색"
      >
        <div className="flex items-center justify-around h-14 pb-[env(safe-area-inset-bottom)]">
          {/* Home with logo — brand badge pattern */}
          <Link
            href="/"
            className="flex flex-col items-center justify-center gap-0.5 min-w-11 min-h-11 transition-all duration-fast ease-default"
            aria-current={isActive('/') ? 'page' : undefined}
            aria-label="홈"
          >
            <span
              className={[
                'flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-fast ease-default',
                isActive('/')
                  ? 'bg-brand-primary-500/10'
                  : 'bg-neutral-100',
              ].join(' ')}
            >
              <Image
                src="/logo.svg"
                alt=""
                width={18}
                height={16}
                aria-hidden="true"
                className={[
                  'transition-opacity duration-fast',
                  isActive('/') ? 'opacity-100' : 'opacity-35',
                ].join(' ')}
              />
            </span>
            <span className={[
              'text-caption',
              isActive('/') ? 'text-brand-primary-500' : 'text-neutral-400',
            ].join(' ')}>홈</span>
          </Link>

          {/* Other nav items */}
          {navItems.slice(1).map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  'flex flex-col items-center justify-center gap-0.5',
                  'min-w-11 min-h-11',
                  'transition-colors duration-fast ease-default',
                  active
                    ? 'text-brand-primary-500'
                    : 'text-neutral-400',
                ].join(' ')}
                aria-current={active ? 'page' : undefined}
              >
                <Icon size={22} aria-hidden="true" />
                <span className="text-caption">{item.label}</span>
              </Link>
            );
          })}

          {/* Search button in mobile nav */}
          <button
            onClick={openSearch}
            className={[
              'flex flex-col items-center justify-center gap-0.5',
              'min-w-11 min-h-11',
              'transition-colors duration-fast ease-default',
              'text-neutral-400 cursor-pointer',
            ].join(' ')}
            aria-label="검색"
          >
            <Search size={22} aria-hidden="true" />
            <span className="text-caption">검색</span>
          </button>
        </div>
      </nav>

      {/* Search Overlay */}
      <SearchOverlay open={searchOpen} onClose={closeSearch} />
    </>
  );
}
