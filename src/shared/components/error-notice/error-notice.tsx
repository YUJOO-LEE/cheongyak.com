'use client';

import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { CloudOff, RefreshCw, type LucideIcon } from 'lucide-react';
import { Button } from '@/shared/components';

interface ErrorNoticeProps {
  title?: string;
  description?: string;
  /**
   * Lucide icon to render above the title. Defaults to `CloudOff`
   * (server-side disconnect metaphor). The 404 page passes
   * `FileQuestion` for a "page-not-found" semantic.
   */
  icon?: LucideIcon;
  /**
   * Optional CTA slot. When omitted the component renders the default
   * "다시 시도" button wired to `router.refresh()`. Provide a custom
   * node when the situation calls for a different action — e.g. the
   * route-level error boundary needs to call Next's `reset()` to
   * remount, and the 404 page wants a "홈으로 돌아가기" navigation.
   */
  action?: ReactNode;
}

/**
 * Shared fallback used whenever a route cannot present its data. Three
 * call sites today share the same visual and copy, so users do not see
 * disjoint "this site is broken" experiences:
 *
 *   1. `app/page.tsx` — surfaces only when every Suspense boundary on
 *      the home shell resolves to null (full backend outage). The
 *      `home-shell:not(:has(> section))` rule in globals.css keys
 *      visibility off the `.error-notice` class.
 *   2. `app/error.tsx` — Next's nearest error boundary catches a
 *      thrown exception (server or client) and renders this notice.
 *   3. `app/not-found.tsx` — 404. CTA is replaced via `action` since a
 *      retry is meaningless when the route doesn't exist.
 */
export function ErrorNotice({
  title = '잠시 정보를 불러오지 못하고 있어요',
  description = '청약 데이터를 정리 중이에요. 잠시 후 다시 시도해 주세요.',
  icon: Icon = CloudOff,
  action,
}: ErrorNoticeProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      data-testid="error-notice"
      className="error-notice flex flex-col items-center justify-center min-h-[60vh] px-6 py-16 text-center"
    >
      <Icon
        size={48}
        strokeWidth={1.5}
        className="text-text-tertiary mb-6"
        aria-hidden="true"
      />

      <h2 className="text-headline-lg text-text-primary mb-3">{title}</h2>

      <p className="text-body-md text-text-secondary mb-8 max-w-sm">
        {description}
      </p>

      {action ?? <DefaultRetryAction />}
    </div>
  );
}

/**
 * Fallback CTA used when no `action` prop is provided. Issues
 * `router.refresh()` so ISR-revalidated Server Components retry the
 * upstream API. Lives in this file so the home-page outage path stays
 * one-import simple.
 */
function DefaultRetryAction() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  function handleRetry() {
    setLoading(true);
    router.refresh();
    // router.refresh() does not signal completion; release the spinner
    // after a short window so the button stays responsive.
    setTimeout(() => setLoading(false), 1500);
  }

  return (
    <Button
      variant="secondary"
      size="md"
      loading={loading}
      onClick={handleRetry}
      aria-label="페이지 데이터 다시 불러오기"
    >
      {!loading && <RefreshCw size={16} strokeWidth={2} aria-hidden="true" />}
      다시 시도
    </Button>
  );
}

export type { ErrorNoticeProps };
