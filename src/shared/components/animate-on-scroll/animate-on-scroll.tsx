'use client';

import { type ReactNode, createElement } from 'react';
import { useInView } from '@/shared/hooks/use-in-view';

type Animation = 'fade-in-up' | 'fade-in' | 'slide-in-right' | 'scale-in' | 'slide-down' | 'count-up-fade';

const animationClassMap: Record<Animation, string> = {
  'fade-in-up': 'animate-fade-in-up',
  'fade-in': 'animate-fade-in',
  'slide-in-right': 'animate-slide-in-right',
  'scale-in': 'animate-scale-in',
  'slide-down': 'animate-slide-down',
  'count-up-fade': 'animate-count-up-fade',
};

interface AnimateOnScrollProps {
  children: ReactNode;
  animation?: Animation;
  delay?: number;
  className?: string;
  as?: 'div' | 'section' | 'article';
}

export function AnimateOnScroll({
  children,
  animation = 'fade-in-up',
  delay,
  className = '',
  as = 'div',
}: AnimateOnScrollProps) {
  const { ref, inView } = useInView();

  return createElement(
    as,
    {
      ref,
      className: [
        inView ? animationClassMap[animation] : 'opacity-0',
        className,
      ]
        .filter(Boolean)
        .join(' '),
      style: delay && inView ? { animationDelay: `${delay}ms` } : undefined,
    },
    children,
  );
}
