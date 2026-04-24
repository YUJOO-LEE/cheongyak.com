/**
 * TanStack Query wiring for `GET /apt-sales/{id}`.
 *
 * Mirrors `apt-sales-query.ts` for the list endpoint. Kept in the
 * feature layer so the generated orval client stays untouched and the
 * fetch surface the rest of the app consumes has a single, typed entry.
 *
 * The SSR helper wraps Next's `revalidate` option so the route file can
 * opt into ISR without reaching into `api-client.ts` internals.
 */
import { queryOptions } from '@tanstack/react-query';
import type { MainApiResponseAptSalesDetailResponse } from '@/shared/api/generated/schemas/mainApiResponseAptSalesDetailResponse';
import { apiClientMutator } from '@/shared/lib/api-client';

export type AptSalesDetailEnvelope = {
  data: MainApiResponseAptSalesDetailResponse;
  status: number;
  headers: Headers;
};

export async function fetchAptSalesDetail(
  id: number,
  init: RequestInit & { next?: { revalidate?: number } } = {},
): Promise<AptSalesDetailEnvelope> {
  return apiClientMutator<AptSalesDetailEnvelope>(`/apt-sales/${id}`, {
    ...init,
    method: 'GET',
  });
}

/**
 * Server-side entry point with Next ISR defaults.
 * 300s matches `ARCHITECTURE.md` §3 rendering table for `/listings/[id]`.
 */
export function fetchAptSalesDetailSSR(id: number) {
  return fetchAptSalesDetail(id, { next: { revalidate: 300 } });
}

export function aptSalesDetailQueryOptions(id: number) {
  return queryOptions({
    queryKey: ['apt-sales', 'detail', id] as const,
    queryFn: ({ signal }) => fetchAptSalesDetail(id, { signal }),
    staleTime: 60_000,
  });
}
