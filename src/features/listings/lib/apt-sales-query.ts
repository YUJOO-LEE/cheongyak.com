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
 * Cache key is the normalized request object. The server-side prefetch
 * and the client-side `useSuspenseQuery` read from the same key as
 * long as they both start from `parseListingsSearchParams`.
 */
export function aptSalesQueryOptions(request: AptSalesListRequest) {
  return queryOptions({
    queryKey: ['apt-sales', request] as const,
    queryFn: ({ signal }) => fetchAptSalesList(request, { signal }),
    staleTime: 60_000,
  });
}
