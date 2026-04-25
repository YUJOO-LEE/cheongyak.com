/**
 * Regression tests for SubscriptionListClient.
 *
 * After the Phase 2.0 SSR cutover the component receives its result set
 * as props from the Server Component (`src/app/listings/page.tsx`) and
 * owns only the URL-bound filter state. These tests render the
 * component with stub data and assert on the resulting DOM.
 */
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, screen } from '@testing-library/react';
import { SubscriptionListClient } from './subscription-list-client';
import { renderWithNuqs as render } from '@/test/render';
import type { Subscription } from '@/shared/types/api';

afterEach(() => {
  cleanup();
});

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
/* These are pure math checks on the same mental model the     */
/* component uses — no rendering.                              */
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
    expect(applyFilter(subs, 'result_today')).toEqual([]);
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
});

/* ─────────────────────────────────────────────────────────── */
/* Props-bound rendering — populated, empty, and listings page */
/* should never ship a keyword input (spec §4.1).              */
/* ─────────────────────────────────────────────────────────── */

describe('SubscriptionListClient · props-bound rendering', () => {
  it('renders the "총 N건" count and one card per subscription prop', () => {
    const subs: Subscription[] = [
      makeSub('1', 'accepting'),
      makeSub('2', 'closed'),
      makeSub('3', 'upcoming'),
    ];

    render(
      <SubscriptionListClient
        subscriptions={subs}
        totalCount={subs.length}
        totalPages={1}
        currentPage={1}
      />,
    );

    expect(screen.getByText('총 3건')).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(3);
  });

  it('renders the empty-state CTA when an empty list is supplied', () => {
    render(
      <SubscriptionListClient
        subscriptions={[]}
        totalCount={0}
        totalPages={1}
        currentPage={1}
      />,
    );

    expect(
      screen.getByText('조건에 맞는 청약 정보가 없습니다.'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '필터 초기화' }),
    ).toBeInTheDocument();
  });

  it('does not render a listings-scoped keyword input (global SearchOverlay owns search)', () => {
    const { container } = render(
      <SubscriptionListClient
        subscriptions={[makeSub('1', 'accepting')]}
        totalCount={1}
        totalPages={1}
        currentPage={1}
      />,
    );

    expect(screen.getByText('총 1건')).toBeInTheDocument();
    expect(container.querySelector('input[type="search"]')).toBeNull();
    expect(screen.queryByPlaceholderText('단지명 검색')).toBeNull();
  });
});
