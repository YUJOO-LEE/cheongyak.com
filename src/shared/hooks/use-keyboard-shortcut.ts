import { useEffect, useRef } from 'react';

export type KeyboardShortcutModifier = 'meta' | 'ctrl' | 'meta-or-ctrl';

export interface UseKeyboardShortcutOptions {
  modifier?: KeyboardShortcutModifier;
  enabled?: boolean;
}

/**
 * Register a document-level keydown shortcut.
 *
 * When a `modifier` is supplied the hook calls `preventDefault()` on matched
 * events before invoking the handler — this mirrors the previous inline
 * implementations in `navigation.tsx` and `search-overlay.tsx` that swallowed
 * the browser's native ⌘K / Ctrl+K. Plain (modifier-less) shortcuts such as
 * `Escape` are not prevented.
 *
 * `enabled: false` unmounts the listener entirely so callers can gate on
 * external state (e.g. overlay open) without checking inside the handler.
 */
export function useKeyboardShortcut(
  key: string,
  handler: (event: KeyboardEvent) => void,
  options: UseKeyboardShortcutOptions = {},
): void {
  const { modifier, enabled = true } = options;

  const handlerRef = useRef(handler);
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!enabled) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== key) return;
      if (modifier && !matchesModifier(event, modifier)) return;
      if (modifier) event.preventDefault();
      handlerRef.current(event);
    }

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [key, modifier, enabled]);
}

function matchesModifier(
  event: KeyboardEvent,
  modifier: KeyboardShortcutModifier,
): boolean {
  if (modifier === 'meta') return event.metaKey;
  if (modifier === 'ctrl') return event.ctrlKey;
  return event.metaKey || event.ctrlKey;
}
