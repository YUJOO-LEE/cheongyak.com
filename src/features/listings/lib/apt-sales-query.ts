/**
 * TanStack Query wiring for `GET /apt-sales`.
 *
 * Why this wrapper exists: orval generates `GetAptSalesListParams` as
 * `{ request: AptSalesListRequest }` and serializes the nested object
 * naively (`?request=[object Object]`), which does not match the
 * backend's flat array-param contract. Rather than fight the generator
 * per-field overrides at codegen time, we keep orval as the type
 * source-of-truth and own the fetch+serialize step here with a clean
 * single-argument signature the rest of the app consumes.
 *
 * Keeping this in the feature layer (not in `shared/api/generated`)
 * honors the "generated files stay untouched, mapping lives in the
 * feature" convention from `docs/apt-sales-binding-plan.md` §5.
 */
import { queryOptions } from '@tanstack/react-query';
import type { AptSalesListRequest } from '@/shared/api/generated/schemas/aptSalesListRequest';
import type { MainApiResponseAptSalesListResponse } from '@/shared/api/generated/schemas/mainApiResponseAptSalesListResponse';
import { apiClientMutator } from '@/shared/lib/api-client';

export type AptSalesListEnvelope = {
  data: MainApiResponseAptSalesListResponse;
  status: number;
  headers: Headers;
};

function buildAptSalesUrl(request: AptSalesListRequest): string {
  const sp = new URLSearchParams();

  const appendArray = <T extends string>(
    key: string,
    value: ReadonlyArray<T | null | undefined> | null | undefined,
  ) => {
    if (!value) return;
    for (const v of value) {
      if (v !== undefined && v !== null) sp.append(key, v);
    }
  };

  appendArray('status', request.status ?? undefined);
  appendArray('houseDetailType', request.houseDetailType ?? undefined);
  appendArray('regionCode', request.regionCode ?? undefined);

  if (request.page !== undefined) sp.append('page', String(request.page));
  if (request.size !== undefined) sp.append('size', String(request.size));

  const qs = sp.toString();
  return qs.length > 0 ? `/apt-sales?${qs}` : '/apt-sales';
}

export async function fetchAptSalesList(
  request: AptSalesListRequest,
  init: RequestInit = {},
): Promise<AptSalesListEnvelope> {
  return apiClientMutator<AptSalesListEnvelope>(buildAptSalesUrl(request), {
    ...init,
    method: 'GET',
  });
}

/**
 * Server-side entry point with Next ISR defaults.
 * 60s mirrors `ARCHITECTURE.md` §3 rendering table for `/listings` —
 * the URL+filter combo is the cache key, so cold filter combinations
 * pay a fresh backend hit, but the popular default (page=1, no
 * filters) and any repeated combo lands on a hot cache.
 */
export function fetchAptSalesListSSR(request: AptSalesListRequest) {
  // Next augments RequestInit with `next` at runtime but the lib type
  // doesn't include it on the cross-type we accept here, so cast at
  // the call site (mirrors `src/app/sitemap.ts`).
  return fetchAptSalesList(request, {
    next: { revalidate: 60 },
  } as RequestInit);
}

/**
 * Client-side query options. Kept for any future client-driven refresh
 * (e.g. background revalidation). The route currently fetches in the
 * Server Component so this is unused on `/listings` — keep it lean and
 * remove if no callers materialize.
 */
export function aptSalesQueryOptions(request: AptSalesListRequest) {
  return queryOptions({
    queryKey: ['apt-sales', request] as const,
    queryFn: ({ signal }) => fetchAptSalesList(request, { signal }),
    staleTime: 60_000,
  });
}
