'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { mapApiStatusToDomain } from '@/features/listings/lib/map-apt-sales';
import { ItemStatus } from '@/shared/api/generated/schemas/itemStatus';
import {
  SubscriptionStatusSchema,
  type SubscriptionStatus,
} from '@/shared/types/api';

/**
 * Backend `q` is bounded at 2~20 chars. Mirroring the lower bound on the
 * client lets us short-circuit the request for the common 0/1-char case
 * (typing the first jamo, IME composition not yet committed) so the
 * autocomplete endpoint never fields a query it would reject anyway.
 */
export const SEARCH_MIN_QUERY_LENGTH = 2;
export const SEARCH_MAX_QUERY_LENGTH = 20;

const SEARCH_LIMIT = 8;

/**
 * `/api/search` is a Next.js rewrite alias for the upstream
 * `/apt-sales/search`. The autocomplete endpoint returns a *narrow*
 * row shape — only the fields a search-result list needs:
 *
 *   { id, houseName, regionName, sigunguName, constructorName, status }
 *
 * That's a strict subset of the list endpoint's `Item`. We define a
 * dedicated `SearchItem` so the trust boundary is explicit and we don't
 * pretend fields that aren't there exist.
 */
const SEARCH_PATH = '/api/search';

const SearchItemSchema = z.object({
  id: z.number(),
  houseName: z.string(),
  regionName: z.string(),
  sigunguName: z.string().nullish(),
  constructorName: z.string().nullish(),
  status: z.nativeEnum(ItemStatus),
});
type SearchItem = z.infer<typeof SearchItemSchema>;

const SearchApiResponseSchema = z.object({
  data: z.object({
    totalCount: z.number(),
    items: z.array(SearchItemSchema),
  }),
});

/**
 * The shape SearchOverlay actually consumes from a result row. Smaller
 * than the full domain `Subscription` — search results never carry
 * dates, area, or supply counts, so we don't fake them.
 */
export interface SearchResultItem {
  id: string;
  name: string;
  region: string;
  builder: string;
  status: SubscriptionStatus;
}

const SearchResultItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  region: z.string(),
  builder: z.string(),
  status: SubscriptionStatusSchema,
});

function toSearchResult(item: SearchItem): SearchResultItem {
  const region = [item.regionName, item.sigunguName ?? '']
    .filter(Boolean)
    .join(' ');
  return SearchResultItemSchema.parse({
    id: String(item.id),
    name: item.houseName,
    region,
    builder: item.constructorName ?? '',
    status: mapApiStatusToDomain(item.status),
  });
}

export type SearchState =
  | 'idle' // 입력 없음 — 최근 검색 노출
  | 'too-short' // 1글자 — 안내 문구
  | 'loading' // 첫 응답 대기
  | 'error'
  | 'empty' // 결과 0건
  | 'ready';

export interface SearchResults {
  results: SearchResultItem[];
  state: SearchState;
  totalCount: number;
}

export function useSearchResults(committedQuery: string): SearchResults {
  const enabled = committedQuery.length >= SEARCH_MIN_QUERY_LENGTH;
  const q = committedQuery.slice(0, SEARCH_MAX_QUERY_LENGTH);

  const { data, isFetching, isError } = useQuery({
    queryKey: [SEARCH_PATH, { q, limit: SEARCH_LIMIT }] as const,
    queryFn: async ({ signal }) => {
      const params = new URLSearchParams({
        q,
        limit: String(SEARCH_LIMIT),
      });
      const res = await fetch(`${SEARCH_PATH}?${params.toString()}`, {
        method: 'GET',
        signal,
      });
      if (!res.ok) {
        throw new Error(`Search request failed: ${res.status}`);
      }
      const json: unknown = await res.json();
      // zod.parse: validates the shape and returns a typed value — no
      // `as` cast needed downstream.
      return SearchApiResponseSchema.parse(json);
    },
    enabled,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  });

  const items = data?.data.items;
  const totalCount = data?.data.totalCount ?? 0;

  const results = useMemo<SearchResultItem[]>(
    () => (enabled && items ? items.map(toSearchResult) : []),
    [enabled, items],
  );

  const state: SearchState = !enabled
    ? committedQuery.length === 0
      ? 'idle'
      : 'too-short'
    : isError
      ? 'error'
      : items === undefined && isFetching
        ? 'loading'
        : results.length === 0
          ? 'empty'
          : 'ready';

  return { results, state, totalCount };
}
