'use client';

import { useCallback, useState } from 'react';
import { Navigation } from '@/shared/components/navigation';
import { SearchOverlay } from '@/features/search/components/search-overlay';
import { useKeyboardShortcut } from '@/shared/hooks/use-keyboard-shortcut';

/**
 * Client island that owns search-overlay open state. Kept at the app-root
 * level so `Navigation` (shared/) no longer has to import SearchOverlay
 * (features/) — shared code must not reach into features per ARCHITECTURE.md.
 *
 * The parent `layout.tsx` stays a server component; only this island is
 * `'use client'`.
 */
export function SearchRoot() {
  const [open, setOpen] = useState(false);

  const openSearch = useCallback(() => setOpen(true), []);
  const closeSearch = useCallback(() => setOpen(false), []);

  useKeyboardShortcut('k', () => setOpen((prev) => !prev), {
    modifier: 'meta-or-ctrl',
  });

  return (
    <>
      <Navigation onSearchOpen={openSearch} />
      <SearchOverlay open={open} onClose={closeSearch} />
    </>
  );
}
