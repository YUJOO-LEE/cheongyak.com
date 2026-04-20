/**
 * Shared search-param surface for the `/listings` route.
 *
 * Two call sites read this: the Server Component (`page.tsx`) for
 * prefetching, and the client component (`subscription-list-client.tsx`)
 * for its nuqs-backed filter state. Sharing one parser keeps the SSR
 * prefetch key and the client query key in lockstep — without this,
 * a deep-link refresh would issue a second request because the SSR
 * seed and the first client render would disagree on params.
 *
 * `keyword` is intentionally absent: the listings page delegates
 * free-text search to the global SearchOverlay (per Jobs UX decision),
 * so the surface here covers only status / type / region filters
 * plus pagination.
 */
import type { AptSalesListRequest } from '@/shared/api/generated/schemas/aptSalesListRequest';
import type { ItemHouseDetailType } from '@/shared/api/generated/schemas/itemHouseDetailType';
import { ItemHouseDetailType as ItemHouseDetailTypeEnum } from '@/shared/api/generated/schemas/itemHouseDetailType';
import type { ItemRegionCode } from '@/shared/api/generated/schemas/itemRegionCode';
import { ItemRegionCode as ItemRegionCodeEnum } from '@/shared/api/generated/schemas/itemRegionCode';
import type { ItemStatus } from '@/shared/api/generated/schemas/itemStatus';
import { ItemStatus as ItemStatusEnum } from '@/shared/api/generated/schemas/itemStatus';
import type {
  SubscriptionStatus,
  SubscriptionType,
} from '@/shared/types/api';

export const PAGE_SIZE = 20;

type RegionCode = NonNullable<ItemRegionCode>;
type DetailType = NonNullable<ItemHouseDetailType>;

const STATUS_DOMAIN_TO_API: Record<SubscriptionStatus, ItemStatus> = {
  upcoming: ItemStatusEnum.SUBSCRIPTION_SCHEDULED,
  accepting: ItemStatusEnum.SUBSCRIPTION_ACTIVE,
  pending: ItemStatusEnum.RESULT_PENDING,
  result_today: ItemStatusEnum.RESULT_TODAY,
  closed: ItemStatusEnum.SUBSCRIPTION_COMPLETED,
};

const TYPE_DOMAIN_TO_API: Record<SubscriptionType, DetailType> = {
  private: ItemHouseDetailTypeEnum.PRIVATE,
  public: ItemHouseDetailTypeEnum.NATIONAL,
};

const DOMAIN_STATUSES: readonly SubscriptionStatus[] = [
  'upcoming',
  'accepting',
  'pending',
  'result_today',
  'closed',
];

const DOMAIN_TYPES: readonly SubscriptionType[] = ['private', 'public'];

const REGION_CODES = Object.values(ItemRegionCodeEnum).filter(
  (v): v is RegionCode => v !== null,
);

export type RawSearchParams = Record<string, string | string[] | undefined>;

export interface ListingsFilterState {
  status: SubscriptionStatus[];
  type: SubscriptionType[];
  region: RegionCode[];
  /** 1-indexed UI page. Converted to 0-indexed at the API boundary. */
  page: number;
}

function readArray(value: string | string[] | undefined): string[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : value.split(',');
}

function parsePositiveInt(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
}

export function parseListingsSearchParams(
  params: RawSearchParams,
): ListingsFilterState {
  const status = readArray(params.status).filter((s): s is SubscriptionStatus =>
    (DOMAIN_STATUSES as readonly string[]).includes(s),
  );
  const type = readArray(params.type).filter((t): t is SubscriptionType =>
    (DOMAIN_TYPES as readonly string[]).includes(t),
  );
  const region = readArray(params.region).filter((r): r is RegionCode =>
    (REGION_CODES as readonly string[]).includes(r),
  );
  const page = parsePositiveInt(params.page);

  return { status, type, region, page };
}

/**
 * Map client filter state → wire-level `AptSalesListRequest`. Enum
 * rename (client `result_today` vs wire `RESULT_TODAY`) happens here
 * so the client domain enum can evolve independently of the backend.
 */
export function toAptSalesRequest(state: ListingsFilterState): AptSalesListRequest {
  const request: AptSalesListRequest = {
    page: Math.max(0, state.page - 1),
    size: PAGE_SIZE,
  };
  if (state.status.length > 0) {
    request.status = state.status.map((s) => STATUS_DOMAIN_TO_API[s]);
  }
  if (state.type.length > 0) {
    request.houseDetailType = state.type.map((t) => TYPE_DOMAIN_TO_API[t]);
  }
  if (state.region.length > 0) {
    request.regionCode = state.region;
  }
  return request;
}
