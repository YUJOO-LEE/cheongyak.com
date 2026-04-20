import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { setupServer } from 'msw/node';
import { handlers } from './handlers';
import type { Item } from '@/shared/api/generated/schemas/item';

const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

interface Envelope {
  data: {
    totalCount: number;
    page: number;
    size: number;
    items: Item[];
  };
}

async function fetchList(qs: string): Promise<Envelope> {
  const res = await fetch(`${API_BASE}/apt-sales${qs}`);
  expect(res.ok).toBe(true);
  return (await res.json()) as Envelope;
}

describe('GET /apt-sales (MSW)', () => {
  it('returns the full fixture with default paging', async () => {
    const body = await fetchList('');
    expect(body.data.page).toBe(0);
    expect(body.data.size).toBe(20);
    expect(body.data.totalCount).toBe(30);
    expect(body.data.items).toHaveLength(20);
  });

  it('filters by status (OR semantics for multiple values)', async () => {
    const body = await fetchList(
      '?status=SUBSCRIPTION_ACTIVE&status=SUBSCRIPTION_SCHEDULED',
    );
    for (const item of body.data.items) {
      expect(['SUBSCRIPTION_ACTIVE', 'SUBSCRIPTION_SCHEDULED']).toContain(
        item.status,
      );
    }
  });

  it('filters by regionCode', async () => {
    const body = await fetchList('?regionCode=SEOUL');
    expect(body.data.totalCount).toBeGreaterThan(0);
    for (const item of body.data.items) {
      expect(item.regionCode).toBe('SEOUL');
    }
  });

  it('matches keyword as case-insensitive substring on houseName', async () => {
    const body = await fetchList('?keyword=래미안');
    expect(body.data.items.every((i) => (i.houseName ?? '').includes('래미안'))).toBe(
      true,
    );
  });

  it('honours page and size paging', async () => {
    const first = await fetchList('?size=5&page=0');
    const second = await fetchList('?size=5&page=1');
    expect(first.data.items).toHaveLength(5);
    expect(second.data.items).toHaveLength(5);
    const firstIds = first.data.items.map((i) => i.id);
    const secondIds = second.data.items.map((i) => i.id);
    expect(firstIds).not.toEqual(secondIds);
  });

  it('sorts by subscriptionStartDate descending', async () => {
    const body = await fetchList('?size=100');
    const dates = body.data.items
      .map((i) => i.subscriptionStartDate ?? '')
      .filter(Boolean);
    const sorted = [...dates].sort((a, b) => b.localeCompare(a));
    expect(dates).toEqual(sorted);
  });

  it('clamps invalid size back to default', async () => {
    const body = await fetchList('?size=9999');
    expect(body.data.size).toBe(20);
  });
});
