'use client';

import { useState, useCallback, useRef } from 'react';

interface UseInViewOptions {
  threshold?: number;
  triggerOnce?: boolean;
  rootMargin?: string;
}

export function useInView({
  threshold = 0.1,
  triggerOnce = true,
  rootMargin = '0px 0px -40px 0px',
}: UseInViewOptions = {}) {
  const [inView, setInView] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const ref = useCallback(
    (node: HTMLElement | null) => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }

      if (!node) return;

      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          const isIntersecting = entry.isIntersecting;
          setInView(isIntersecting);

          if (isIntersecting && triggerOnce) {
            observerRef.current?.disconnect();
            observerRef.current = null;
          }
        },
        { threshold, rootMargin },
      );

      observerRef.current.observe(node);
    },
    [threshold, triggerOnce, rootMargin],
  );

  return { ref, inView };
}
