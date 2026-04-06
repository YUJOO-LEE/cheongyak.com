'use client';

import { Button } from '@/shared/components';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ reset }: ErrorPageProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <h1 className="text-display-sm text-text-primary mb-4">
        오류가 발생했습니다
      </h1>
      <p className="text-body-lg text-text-secondary mb-8">
        일시적인 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.
      </p>
      <Button variant="primary" size="lg" onClick={reset}>
        다시 시도
      </Button>
    </div>
  );
}
