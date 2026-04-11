'use client';

import { type ReactNode, Children, createElement, isValidElement, cloneElement } from 'react';
import { useInView } from '@/shared/hooks/use-in-view';

type Animation = 'fade-in-up' | 'fade-in' | 'scale-in';

const animationClassMap: Record<Animation, string> = {
  'fade-in-up': 'animate-fade-in-up',
  'fade-in': 'animate-fade-in',
  'scale-in': 'animate-scale-in',
};

interface StaggerChildrenProps {
  children: ReactNode;
  animation?: Animation;
  interval?: number;
  maxItems?: number;
  className?: string;
  as?: 'div' | 'section';
}

export function StaggerChildren({
  children,
  animation = 'fade-in-up',
  interval = 60,
  maxItems = 6,
  className = '',
  as = 'div',
}: StaggerChildrenProps) {
  const { ref, inView } = useInView();
  const animClass = animationClassMap[animation];

  const staggeredChildren = Children.map(children, (child, index) => {
    if (!isValidElement(child)) return child;

    const withinStagger = index < maxItems;
    const delay = withinStagger ? index * interval : 0;

    if (!inView) {
      return cloneElement(child as React.ReactElement<Record<string, unknown>>, {
        style: { ...((child.props as { style?: React.CSSProperties }).style || {}), opacity: 0 },
      });
    }

    const childClassName = ((child.props as { className?: string }).className || '');
    const newClassName = withinStagger
      ? `${childClassName} ${animClass}`.trim()
      : `${childClassName} ${animClass}`.trim();

    return cloneElement(child as React.ReactElement<Record<string, unknown>>, {
      className: newClassName,
      style: {
        ...((child.props as { style?: React.CSSProperties }).style || {}),
        animationDelay: withinStagger ? `${delay}ms` : '0ms',
      },
    });
  });

  return createElement(
    as,
    { ref, className },
    staggeredChildren,
  );
}
