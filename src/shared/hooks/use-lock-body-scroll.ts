import { useEffect } from 'react';

interface UseLockBodyScrollOptions {
  preserveScrollbarGutter?: boolean;
}

export function useLockBodyScroll(
  locked: boolean,
  { preserveScrollbarGutter = false }: UseLockBodyScrollOptions = {},
): void {
  useEffect(() => {
    if (locked) {
      document.body.style.overflow = 'hidden';
      if (preserveScrollbarGutter) {
        const scrollbarWidth =
          window.innerWidth - document.documentElement.clientWidth;
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
    } else {
      document.body.style.overflow = '';
      if (preserveScrollbarGutter) {
        document.body.style.paddingRight = '';
      }
    }
    return () => {
      document.body.style.overflow = '';
      if (preserveScrollbarGutter) {
        document.body.style.paddingRight = '';
      }
    };
  }, [locked, preserveScrollbarGutter]);
}
