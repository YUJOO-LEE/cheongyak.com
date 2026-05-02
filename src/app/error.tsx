'use client';

import { RefreshCw } from 'lucide-react';
import { Button, ErrorNotice } from '@/shared/components';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ reset }: ErrorPageProps) {
  // Override the default CTA so it calls Next's `reset()` — that's
  // what unmounts and remounts the error boundary. `router.refresh()`
  // alone leaves the boundary in place.
  return (
    <ErrorNotice
      action={
        <Button
          variant="secondary"
          size="md"
          onClick={reset}
          aria-label="페이지 다시 불러오기"
        >
          <RefreshCw size={16} strokeWidth={2} aria-hidden="true" />
          다시 시도
        </Button>
      }
    />
  );
}
