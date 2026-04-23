'use client';

import { useEffect } from 'react';

/**
 * Sets `document.body.dataset.appReady = 'true'` after hydration so the
 * CSS rule `body[data-app-ready] #app-splash { opacity: 0 }` in
 * `globals.css` can fade out the bootstrap splash. Runs once per full
 * page load — subsequent in-app navigations keep the flag set, so the
 * splash only appears on cold refresh / initial entry.
 */
export function AppReadyMarker() {
  useEffect(() => {
    document.body.dataset.appReady = 'true';
  }, []);
  return null;
}
