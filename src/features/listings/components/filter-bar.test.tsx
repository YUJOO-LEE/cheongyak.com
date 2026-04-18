// @vitest-environment node
/**
 * Baseline regression tests for FilterBar.
 *
 * jsdom is unavailable, so the 250ms close timeout, body scroll-lock, and
 * overlay-closing / sheet-closing class transitions cannot run here. Those
 * belong in Playwright E2E once the runner is configured (see team plan).
 *
 * What we pin today:
 *   1. Server-rendered option sets — every status label from STATUS_LABELS
 *      and every type label from TYPE_LABELS appears as a filter chip, both
 *      in the desktop bar and inside the mobile sheet.
 *   2. "초기화" (reset) chip only appears when activeCount > 0.
 *   3. Mobile trigger badge count — activeCount rendered as a pill.
 *
 * NOTE on P0.5 (Task #2 — onTypeChange not applied in the list client):
 * these tests intentionally capture CURRENT rendered behavior, not the
 * repaired behavior. When the bug is fixed, this file will need to update
 * together with subscription-list-client.tsx; that is the whole point of a
 * baseline snapshot.
 */
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
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
