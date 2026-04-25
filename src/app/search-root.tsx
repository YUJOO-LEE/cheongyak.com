'use client';

/**
 * @deprecated Beta-launch deferral.
 * NOT mounted in app/layout.tsx — see TODO(beta-deferred) markers there
 * and in src/shared/components/navigation/navigation.tsx for the full set
 * of restoration points. Re-mount this component once the backend search
 * endpoint ships. Tracking: docs/beta-launch-deferred-features.md#search
 */

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

  // TODO(beta-deferred): openSearch unused while Navigation no longer accepts
  // onSearchOpen. Restore alongside the prop in navigation.tsx.
  // const openSearch = useCallback(() => setOpen(true), []);
  const closeSearch = useCallback(() => setOpen(false), []);

  useKeyboardShortcut('k', () => setOpen((prev) => !prev), {
    modifier: 'meta-or-ctrl',
  });

  return (
    <>
      {/* TODO(beta-deferred): once Navigation accepts onSearchOpen again,
          restore: <Navigation onSearchOpen={openSearch} /> */}
      <Navigation />
      <SearchOverlay open={open} onClose={closeSearch} />
    </>
  );
}
