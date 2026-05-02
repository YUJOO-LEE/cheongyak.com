/**
 * Behavioural pin for ErrorNotice.
 *
 * Shared fallback used by the home page (full backend outage), the
 * route-level error boundary (`app/error.tsx`), and the 404 page
 * (`app/not-found.tsx`). Losing its visibility class or its retry
 * wiring silently regresses the "잠시 정보를 불러오지 못하고 있어요"
 * experience. The tests cover four contracts:
 *   1. Accessibility shape (role="status", aria-live polite).
 *   2. The `error-notice` class is present — globals.css keys the
 *      home-shell `:has()` toggle off this exact name.
 *   3. With no `action` prop, the default CTA calls `router.refresh()`
 *      so ISR-revalidated Server Components retry the upstream API.
 *   4. With an `action` prop, the custom CTA replaces the default —
 *      this is what `app/error.tsx` and `app/not-found.tsx` rely on.
 */
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

const refreshMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: refreshMock,
    push: () => undefined,
    replace: () => undefined,
    prefetch: () => undefined,
    back: () => undefined,
    forward: () => undefined,
  }),
}));

import { ErrorNotice } from './error-notice';

describe('ErrorNotice', () => {
  it('exposes a polite live region with the default copy', () => {
    render(<ErrorNotice />);
    const region = screen.getByRole('status');
    expect(region).toHaveAttribute('aria-live', 'polite');
    expect(
      screen.getByText('잠시 정보를 불러오지 못하고 있어요'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/청약 데이터를 정리 중이에요/),
    ).toBeInTheDocument();
  });

  it('keeps the error-notice class so globals.css :has() toggle works', () => {
    render(<ErrorNotice />);
    expect(screen.getByRole('status')).toHaveClass('error-notice');
  });

  it('falls back to router.refresh() when no action prop is provided', () => {
    refreshMock.mockClear();
    render(<ErrorNotice />);
    // aria-label is more descriptive than the visible "다시 시도" text,
    // so the accessible name is the aria-label value.
    fireEvent.click(
      screen.getByRole('button', { name: /페이지 데이터 다시 불러오기/ }),
    );
    expect(refreshMock).toHaveBeenCalledTimes(1);
  });

  it('renders the custom action node and skips the default CTA', () => {
    refreshMock.mockClear();
    const onCustom = vi.fn();
    render(
      <ErrorNotice
        action={
          <button type="button" onClick={onCustom}>
            홈으로 돌아가기
          </button>
        }
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: '홈으로 돌아가기' }));
    expect(onCustom).toHaveBeenCalledTimes(1);
    expect(refreshMock).not.toHaveBeenCalled();
    // Default retry button must not coexist with the custom action.
    expect(
      screen.queryByRole('button', { name: /페이지 데이터 다시 불러오기/ }),
    ).not.toBeInTheDocument();
  });

  it('renders custom title and description props when provided', () => {
    render(
      <ErrorNotice
        title="요청하신 페이지를 찾을 수 없어요"
        description="주소가 정확한지 확인하시거나 홈에서 다시 탐색해 주세요."
      />,
    );
    expect(
      screen.getByText('요청하신 페이지를 찾을 수 없어요'),
    ).toBeInTheDocument();
    expect(screen.getByText(/주소가 정확한지 확인/)).toBeInTheDocument();
  });
});
