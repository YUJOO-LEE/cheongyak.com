/**
 * Regression tests for FilterBar (shell + slot compound).
 *
 * Three layers:
 *   1. Server-rendered option sets — every status and type label appears
 *      as a filter chip in both desktop and mobile trees.
 *   2. Reset-button and mobile-trigger-badge visibility gates.
 *   3. Mobile sheet open → close-with-delay → body scroll lock restore.
 *
 * The shell itself has no knowledge of specific filter values — those
 * live in the slot children (FilterField.Inline / Stacked). Tests assemble
 * a minimal harness that mirrors the production composition.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, screen } from '@testing-library/react';
import { FilterBar, FilterField } from './filter-bar';
import { statusOptions, typeOptions } from './filter-bar/filter-bar.options';
import {
  renderToStaticMarkupWithNuqs as renderToStaticMarkup,
  renderWithNuqs as render,
} from '@/test/render';
import { STATUS_LABELS, TYPE_LABELS } from '@/shared/lib/constants';
import type { SubscriptionStatus, SubscriptionType } from '@/shared/types/api';

function noop() {
  return undefined;
}

interface HarnessProps {
  activeCount?: number;
  selectedStatus?: SubscriptionStatus | null;
  selectedType?: SubscriptionType | null;
  onReset?: () => void;
}

function Harness({
  activeCount = 0,
  selectedStatus = null,
  selectedType = null,
  onReset = noop,
}: HarnessProps) {
  return (
    <FilterBar activeCount={activeCount} onReset={onReset}>
      <FilterBar.DesktopBar>
        <FilterField.Inline<SubscriptionStatus>
          label="상태"
          options={statusOptions}
          value={selectedStatus}
          onChange={noop}
        />
        <FilterField.Inline<SubscriptionType>
          label="유형"
          options={typeOptions}
          value={selectedType}
          onChange={noop}
        />
      </FilterBar.DesktopBar>
      <FilterBar.Sheet>
        <FilterField.Stacked<SubscriptionStatus>
          label="상태"
          options={statusOptions}
          value={selectedStatus}
          onChange={noop}
        />
        <FilterField.Stacked<SubscriptionType>
          label="유형"
          options={typeOptions}
          value={selectedType}
          onChange={noop}
        />
      </FilterBar.Sheet>
    </FilterBar>
  );
}

describe('FilterBar · server markup — labels and chips', () => {
  it('renders every status label from STATUS_LABELS at least once', () => {
    const html = renderToStaticMarkup(<Harness />);
    for (const label of Object.values(STATUS_LABELS)) {
      expect(html).toContain(label);
    }
  });

  it('renders every type label from TYPE_LABELS at least once', () => {
    const html = renderToStaticMarkup(<Harness />);
    for (const label of Object.values(TYPE_LABELS)) {
      expect(html).toContain(label);
    }
  });

  it('always renders the mobile 필터 trigger button', () => {
    const html = renderToStaticMarkup(<Harness />);
    expect(html).toContain('필터');
  });
});

describe('FilterBar · reset button visibility (activeCount gate)', () => {
  it('omits the 초기화 button when activeCount is 0', () => {
    const html = renderToStaticMarkup(<Harness activeCount={0} />);
    expect(html).not.toContain('초기화');
  });

  it('renders the 초기화 button once any filter is active', () => {
    const html = renderToStaticMarkup(
      <Harness activeCount={1} selectedStatus="accepting" />,
    );
    expect(html).toContain('초기화');
  });
});

describe('FilterBar · mobile trigger badge', () => {
  it('does not render a count badge when activeCount is 0', () => {
    const html = renderToStaticMarkup(<Harness activeCount={0} />);
    // The badge pill is gated on `activeCount > 0`. No "0" inside a
    // rounded-full neutral-500 span should be present.
    expect(html).not.toMatch(/rounded-full[^"]*bg-neutral-500[^>]*>0</);
  });

  it('renders the badge with the activeCount value when any filter is active', () => {
    const html = renderToStaticMarkup(<Harness activeCount={2} />);
    expect(html).toContain('>2<');
  });
});

/* ─────────────────────────────────────────────────────────── */
/* Mobile sheet interactive behavior — open, close-with-delay, */
/* and body scroll-lock restore. The 250ms setTimeout closing  */
/* animation + useEffect chain on the `closing` flag are the   */
/* highest-risk pieces of the shell.                           */
/* ─────────────────────────────────────────────────────────── */

describe('FilterBar · mobile sheet interactive', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    document.body.style.overflow = '';
    cleanup();
  });

  function renderBar() {
    return render(<Harness />);
  }

  it('opens the mobile sheet when the trigger button is clicked', () => {
    renderBar();
    expect(screen.queryByLabelText('필터 닫기')).toBeNull();

    const trigger = screen
      .getAllByRole('button', { name: /필터/ })
      .find((el) => !el.getAttribute('aria-label'))!;
    fireEvent.click(trigger);

    expect(screen.getByLabelText('필터 닫기')).toBeTruthy();
    expect(screen.getByRole('button', { name: '적용' })).toBeTruthy();
  });

  it('locks body overflow while the sheet is open and restores it after close', () => {
    renderBar();

    const trigger = screen
      .getAllByRole('button', { name: /필터/ })
      .find((el) => !el.getAttribute('aria-label'))!;
    fireEvent.click(trigger);
    expect(document.body.style.overflow).toBe('hidden');

    fireEvent.click(screen.getByLabelText('필터 닫기'));
    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(document.body.style.overflow).toBe('');
  });

  it('keeps the sheet mounted with closing classes until 250ms elapses, then unmounts', () => {
    const { container } = renderBar();
    const trigger = screen
      .getAllByRole('button', { name: /필터/ })
      .find((el) => !el.getAttribute('aria-label'))!;
    fireEvent.click(trigger);

    fireEvent.click(screen.getByLabelText('필터 닫기'));

    expect(container.querySelector('.overlay-closing')).not.toBeNull();
    expect(container.querySelector('.sheet-closing')).not.toBeNull();

    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(screen.queryByLabelText('필터 닫기')).toBeNull();
  });

  it('shows 적용 (not 닫기) because mobile chip changes batch into a draft until confirmed', () => {
    renderBar();

    const trigger = screen
      .getAllByRole('button', { name: /필터/ })
      .find((el) => !el.getAttribute('aria-label'))!;
    fireEvent.click(trigger);

    expect(screen.getByRole('button', { name: '적용' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: '닫기' })).toBeNull();
  });
});
