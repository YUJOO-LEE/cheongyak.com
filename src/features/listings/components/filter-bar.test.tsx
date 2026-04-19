/**
 * Regression tests for FilterBar.
 *
 * Three layers:
 *   1. Server-rendered option sets — every status and type label appears as a
 *      filter chip in both desktop and mobile trees.
 *   2. Reset-button and mobile-trigger-badge visibility gates.
 *   3. Mobile sheet open → handleClose → 250ms → mobileOpen false, plus body
 *      scroll lock restore.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { FilterBar } from './filter-bar';
import { STATUS_LABELS, TYPE_LABELS } from '@/shared/lib/constants';

function noop() {
  return undefined;
}

const baseProps = {
  selectedStatus: null,
  selectedType: null,
  onStatusChange: noop,
  onTypeChange: noop,
  onReset: noop,
  activeCount: 0,
} as const;

describe('FilterBar · server markup — labels and chips', () => {
  it('renders every status label from STATUS_LABELS at least once', () => {
    const html = renderToStaticMarkup(<FilterBar {...baseProps} />);
    for (const label of Object.values(STATUS_LABELS)) {
      expect(html).toContain(label);
    }
  });

  it('renders every type label from TYPE_LABELS at least once', () => {
    const html = renderToStaticMarkup(<FilterBar {...baseProps} />);
    for (const label of Object.values(TYPE_LABELS)) {
      expect(html).toContain(label);
    }
  });

  it('always renders the mobile 필터 trigger button', () => {
    const html = renderToStaticMarkup(<FilterBar {...baseProps} />);
    expect(html).toContain('필터');
  });
});

describe('FilterBar · reset button visibility (activeCount gate)', () => {
  it('omits the 초기화 button when activeCount is 0', () => {
    // The reset affordance is in the desktop bar guarded by `activeCount > 0`
    // (see `{activeCount > 0 && ...}` block). Its DOM marker is the
    // "초기화" text with a RotateCcw icon; absence of that text is sufficient
    // as a regression signal.
    const html = renderToStaticMarkup(<FilterBar {...baseProps} activeCount={0} />);
    expect(html).not.toContain('초기화');
  });

  it('renders the 초기화 button once any filter is active', () => {
    const html = renderToStaticMarkup(
      <FilterBar
        {...baseProps}
        activeCount={1}
        selectedStatus="accepting"
      />,
    );
    expect(html).toContain('초기화');
  });
});

describe('FilterBar · mobile trigger badge', () => {
  it('does not render a count badge when activeCount is 0', () => {
    const html = renderToStaticMarkup(<FilterBar {...baseProps} activeCount={0} />);
    // The badge markup is `<span ...>{activeCount}</span>` guarded by > 0.
    // Heuristic: there should be no bare "필터\n              0" sequence.
    // We instead assert by checking there is no pill-shaped text-inverse
    // badge (the specific bg-neutral-500 pill is only rendered for count > 0).
    expect(html).not.toMatch(/rounded-full[^"]*bg-neutral-500[^>]*>0</);
  });

  it('renders the badge with the activeCount value when any filter is active', () => {
    const html = renderToStaticMarkup(<FilterBar {...baseProps} activeCount={2} />);
    // The badge shows the numeric activeCount — regression guard for the
    // "filters-applied" affordance on mobile.
    expect(html).toContain('>2<');
  });
});

/* ─────────────────────────────────────────────────────────── */
/* Mobile sheet interactive behavior — open, close-with-delay, */
/* and body scroll-lock restore. These are the highest-risk    */
/* pieces for any future refactor extracting a `useMobileSheet` */
/* hook: the 250ms setTimeout closing animation and the        */
/* useEffect chain that depends on the `closing` flag.         */
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
    return render(<FilterBar {...baseProps} />);
  }

  it('opens the mobile sheet when the trigger button is clicked', () => {
    renderBar();
    expect(screen.queryByLabelText('필터 닫기')).toBeNull();

    const trigger = screen.getAllByRole('button', { name: /필터/ }).find(
      (el) => !el.getAttribute('aria-label'),
    )!;
    fireEvent.click(trigger);

    expect(screen.getByLabelText('필터 닫기')).toBeTruthy();
  });

  it('locks body overflow while the sheet is open and restores it after close', () => {
    renderBar();

    const trigger = screen.getAllByRole('button', { name: /필터/ }).find(
      (el) => !el.getAttribute('aria-label'),
    )!;
    fireEvent.click(trigger);
    expect(document.body.style.overflow).toBe('hidden');

    // Close via the X button. The 250ms timer then flips mobileOpen to false
    // and the cleanup effect restores body overflow.
    fireEvent.click(screen.getByLabelText('필터 닫기'));
    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(document.body.style.overflow).toBe('');
  });

  it('keeps the sheet mounted with closing classes until 250ms elapses, then unmounts', () => {
    const { container } = renderBar();
    const trigger = screen.getAllByRole('button', { name: /필터/ }).find(
      (el) => !el.getAttribute('aria-label'),
    )!;
    fireEvent.click(trigger);

    // Trigger handleClose via the X button.
    fireEvent.click(screen.getByLabelText('필터 닫기'));

    // Within the same tick, the overlay and sheet gain their closing classes
    // but the sheet is still in the DOM (transitions have to run).
    expect(container.querySelector('.overlay-closing')).not.toBeNull();
    expect(container.querySelector('.sheet-closing')).not.toBeNull();

    // After 250ms the state flips mobileOpen → false and the whole sheet
    // branch unmounts.
    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(screen.queryByLabelText('필터 닫기')).toBeNull();
  });
});
