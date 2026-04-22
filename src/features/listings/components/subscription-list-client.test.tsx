/**
 * Regression tests for SubscriptionListClient.
 *
 * After the Phase 7 API binding, the component fetches from
 * `/apt-sales` via a Suspense query instead of receiving a prop.
 * These tests spin up MSW, let the query resolve, and assert on the
 * rendered DOM. The reference math suites (filter / pagination) stay
 * as lightweight unit checks against the same mental model.
 */
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
} from 'vitest';
import { cleanup, screen, waitFor } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { SubscriptionListClient } from './subscription-list-client';
import { renderWithNuqs as render } from '@/test/render';
import { handlers } from '@/mocks/handlers';
import type { Item } from '@/shared/api/generated/schemas/item';
import type { Subscription } from '@/shared/types/api';

const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  cleanup();
});
afterAll(() => server.close());

// Mirrors the browser-side base in `src/shared/lib/api-client.ts`. happy-dom
// resolves relative URLs against its own origin, but MSW matches on pathname
// so any origin works here.
const API_BASE = 'http://localhost:3000/api/backend';
const ITEMS_PER_PAGE = 20;

function makeItem(
  id: number,
  status: Item['status'],
  detailType: Item['houseDetailType'] = 'PRIVATE',
  overrides: Partial<Item> = {},
): Item {
  return {
    id,
    houseName: `청약 ${id}`,
    status,
    houseDetailType: detailType,
    regionCode: 'SEOUL',
    regionName: '서울특별시',
    sigunguName: '강남구',
    dongName: '역삼동',
    constructorName: '테스트건설',
    subscriptionStartDate: '2026-04-10',
    subscriptionEndDate: '2026-04-12',
    totalSupplyHousehold: 100,
    minSupplyArea: 59,
    maxSupplyArea: 59,
    ...overrides,
  };
}

function mockAptSales(items: Item[]) {
  server.use(
    http.get(`${API_BASE}/apt-sales`, () => {
      return HttpResponse.json({
        data: {
          totalCount: items.length,
          page: 0,
          size: ITEMS_PER_PAGE,
          items,
        },
      });
    }),
  );
}

/* ─────────────────────────────────────────────────────────── */
/* Reference filter/pagination logic (mirrors component body). */
/* These are pure math checks on the same mental model the     */
/* component uses — no rendering.                              */
/* ─────────────────────────────────────────────────────────── */

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
/* API-bound rendering — populated, empty, and listings page   */
/* should never ship a keyword input (spec §4.1).              */
/* ─────────────────────────────────────────────────────────── */

describe('SubscriptionListClient · API-bound rendering', () => {
  it('renders the "총 N건" count and one card per item returned by /apt-sales', async () => {
    mockAptSales([
      makeItem(1, 'SUBSCRIPTION_ACTIVE'),
      makeItem(2, 'SUBSCRIPTION_COMPLETED'),
      makeItem(3, 'SUBSCRIPTION_SCHEDULED'),
    ]);

    render(<SubscriptionListClient />);

    await waitFor(() => {
      expect(screen.getByText('총 3건')).toBeInTheDocument();
    });
    expect(screen.getAllByRole('article')).toHaveLength(3);
  });

  it('renders the empty-state CTA when /apt-sales returns an empty list', async () => {
    mockAptSales([]);

    render(<SubscriptionListClient />);

    await waitFor(() => {
      expect(
        screen.getByText('조건에 맞는 청약 정보가 없습니다.'),
      ).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: '필터 초기화' })).toBeInTheDocument();
  });

  it('does not render a listings-scoped keyword input (global SearchOverlay owns search)', async () => {
    mockAptSales([makeItem(1, 'SUBSCRIPTION_ACTIVE')]);

    const { container } = render(<SubscriptionListClient />);

    await waitFor(() => {
      expect(screen.getByText('총 1건')).toBeInTheDocument();
    });
    expect(container.querySelector('input[type="search"]')).toBeNull();
    expect(screen.queryByPlaceholderText('단지명 검색')).toBeNull();
  });
});
