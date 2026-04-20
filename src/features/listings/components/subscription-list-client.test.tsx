/**
 * Regression tests for SubscriptionListClient.
 *
 * Layers:
 *   1. Pure filter / pagination math (reference implementation mirrors the
 *      component body).
 *   2. Server-rendered output — populated and empty branches.
 *   3. Interactive filter — status and type chips both reduce the rendered
 *      card set; combined filters intersect.
 */
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, screen } from '@testing-library/react';
import { SubscriptionListClient } from './subscription-list-client';
import {
  renderToStaticMarkupWithNuqs as renderToStaticMarkup,
  renderWithNuqs as render,
} from '@/test/render';
import type { Subscription } from '@/shared/types/api';

const ITEMS_PER_PAGE = 20;

function makeSub(
  id: string,
  status: Subscription['status'],
  type: Subscription['type'] = 'private',
): Subscription {
  return {
    id,
    name: `청약 ${id}`,
    location: { sido: '서울특별시', gugun: '강남구' },
    builder: '테스트 건설',
    status,
    type,
    applicationStart: '2026-04-10',
    applicationEnd: '2026-04-12',
    totalUnits: 100,
    sizeRange: '59㎡',
  };
}

/* ─────────────────────────────────────────────────────────── */
/* Reference filter/pagination logic (mirrors component body). */
/* Page reset invariant: changing a filter resets page to 1.   */
/* ─────────────────────────────────────────────────────────── */

function applyFilter(
  subs: Subscription[],
  selectedStatus: string | null,
): Subscription[] {
  let result = [...subs];
  if (selectedStatus) {
    result = result.filter((s) => s.status === selectedStatus);
  }
  return result;
}

function paginate<T>(items: T[], page: number, pageSize: number): T[] {
  return items.slice((page - 1) * pageSize, page * pageSize);
}

describe('SubscriptionListClient · filter math (reference)', () => {
  const subs: Subscription[] = [
    makeSub('a', 'accepting'),
    makeSub('b', 'accepting'),
    makeSub('c', 'closed'),
    makeSub('d', 'upcoming'),
  ];

  it('passes all subscriptions through when no status filter is set', () => {
    expect(applyFilter(subs, null).map((s) => s.id)).toEqual(['a', 'b', 'c', 'd']);
  });

  it('keeps only subscriptions whose status matches the selected filter', () => {
    expect(applyFilter(subs, 'accepting').map((s) => s.id)).toEqual(['a', 'b']);
    expect(applyFilter(subs, 'closed').map((s) => s.id)).toEqual(['c']);
    expect(applyFilter(subs, 'upcoming').map((s) => s.id)).toEqual(['d']);
  });

  it('returns an empty array when the filter matches nothing', () => {
    expect(applyFilter(subs, 'contracting')).toEqual([]);
  });
});

describe('SubscriptionListClient · pagination math (reference)', () => {
  const many = Array.from({ length: 45 }, (_, i) =>
    makeSub(`x${i}`, 'accepting'),
  );

  it('slices ITEMS_PER_PAGE entries per page', () => {
    expect(paginate(many, 1, ITEMS_PER_PAGE)).toHaveLength(20);
    expect(paginate(many, 2, ITEMS_PER_PAGE)).toHaveLength(20);
    expect(paginate(many, 3, ITEMS_PER_PAGE)).toHaveLength(5);
  });

  it('computes totalPages as ceil(total / ITEMS_PER_PAGE)', () => {
    expect(Math.ceil(45 / ITEMS_PER_PAGE)).toBe(3);
    expect(Math.ceil(20 / ITEMS_PER_PAGE)).toBe(1);
    expect(Math.ceil(21 / ITEMS_PER_PAGE)).toBe(2);
    expect(Math.ceil(0 / ITEMS_PER_PAGE)).toBe(0);
  });

  it('uses first-page slicing when currentPage is 1 after a filter reset', () => {
    // Regression target: after status/type/reset change, currentPage must be 1.
    // This verifies the slice math that position resetting is observable on.
    const first = paginate(many, 1, ITEMS_PER_PAGE);
    expect(first[0]!.id).toBe('x0');
    expect(first[19]!.id).toBe('x19');
  });
});

/* ─────────────────────────────────────────────────────────── */
/* Server-rendered output captures the two initial-render      */
/* branches: populated list with count text, or empty-state    */
/* with reset CTA.                                             */
/* ─────────────────────────────────────────────────────────── */

describe('SubscriptionListClient · server markup', () => {
  it('renders the "총 N건" count and one card per subscription on first page', () => {
    const subs = [
      makeSub('a', 'accepting'),
      makeSub('b', 'closed'),
      makeSub('c', 'upcoming'),
    ];
    const html = renderToStaticMarkup(<SubscriptionListClient subscriptions={subs} />);
    expect(html).toContain('총 3건');
    expect(html).toContain('href="/listings/a"');
    expect(html).toContain('href="/listings/b"');
    expect(html).toContain('href="/listings/c"');
  });

  it('renders the empty-state CTA and reset button when the input list is empty', () => {
    const html = renderToStaticMarkup(<SubscriptionListClient subscriptions={[]} />);
    expect(html).toContain('조건에 맞는 청약 정보가 없습니다.');
    expect(html).toContain('필터 초기화');
  });
});

/* ─────────────────────────────────────────────────────────── */
/* Interactive filter — status and type chips both reduce the  */
/* rendered card set; combined filters intersect.              */
/* ─────────────────────────────────────────────────────────── */

describe('SubscriptionListClient · interactive status filter', () => {
  afterEach(() => {
    cleanup();
  });

  it('reduces the rendered cards to those matching the clicked status chip', () => {
    render(
      <SubscriptionListClient
        subscriptions={[
          makeSub('a', 'accepting'),
          makeSub('b', 'accepting'),
          makeSub('c', 'closed'),
        ]}
      />,
    );

    // Sanity: all three render initially.
    expect(screen.getAllByRole('article')).toHaveLength(3);

    // Click the "접수중" (accepting) chip in the desktop bar. The mobile
    // sheet renders a duplicate chip; we pick the first occurrence. Chips
    // now carry a composite aria-label ("{label}, 선택됨/선택 안 됨"), so
    // we match by regex rather than exact string.
    const chip = screen.getAllByRole('button', { name: /^접수중,/ })[0]!;
    fireEvent.click(chip);

    expect(screen.getAllByRole('article')).toHaveLength(2);
  });
});

describe('SubscriptionListClient · interactive type filter (regression gate)', () => {
  afterEach(() => {
    cleanup();
  });

  it('filters rendered cards to selectedType', () => {
    render(
      <SubscriptionListClient
        subscriptions={[
          makeSub('a', 'accepting', 'public'),
          makeSub('b', 'accepting', 'private'),
          makeSub('c', 'closed', 'private'),
        ]}
      />,
    );
    expect(screen.getAllByRole('article')).toHaveLength(3);

    // Click the "민간" (private) type chip in the desktop bar.
    const chip = screen.getAllByRole('button', { name: /^민간,/ })[0]!;
    fireEvent.click(chip);

    expect(screen.getAllByRole('article')).toHaveLength(2);
  });

  it('combines selectedStatus and selectedType', () => {
    render(
      <SubscriptionListClient
        subscriptions={[
          makeSub('a', 'accepting', 'public'),
          makeSub('b', 'accepting', 'private'),
          makeSub('c', 'closed', 'private'),
          makeSub('d', 'upcoming', 'private'),
        ]}
      />,
    );

    fireEvent.click(screen.getAllByRole('button', { name: /^접수중,/ })[0]!);
    fireEvent.click(screen.getAllByRole('button', { name: /^민간,/ })[0]!);

    expect(screen.getAllByRole('article')).toHaveLength(1);
  });
});
