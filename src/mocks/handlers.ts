import { http, HttpResponse } from 'msw';
import { subscriptions, subscriptionDetail } from './fixtures/subscriptions';
import { aptSalesItems } from './fixtures/apt-sales';
import type { Item } from '@/shared/api/generated/schemas/item';
import type { ItemHouseDetailType } from '@/shared/api/generated/schemas/itemHouseDetailType';
import type { ItemRegionCode } from '@/shared/api/generated/schemas/itemRegionCode';
import type { ItemStatus } from '@/shared/api/generated/schemas/itemStatus';
import {
  mainFeatured,
  mainStats,
  mainWeeklySchedule,
  mainTopTrades,
} from './fixtures/main';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

/**
 * Filter an `Item` list against the query-param surface defined for
 * `GET /apt-sales` by the backend. Kept separate from the handler so
 * the matching rules are easy to unit-test and reason about.
 *
 * - Array filters (`status`, `houseDetailType`, `regionCode`) combine
 *   with OR semantics per the API description.
 * - `keyword` matches `houseName` case-insensitively, substring.
 * - Sorting: fixed by `subscriptionStartDate` descending per the API.
 */
function filterAptSales(
  items: Item[],
  options: {
    status: ItemStatus[];
    houseDetailType: ItemHouseDetailType[];
    regionCode: ItemRegionCode[];
    keyword: string;
  },
): Item[] {
  const { status, houseDetailType, regionCode, keyword } = options;
  const needle = keyword.trim().toLowerCase();

  return items
    .filter((item) => (status.length === 0 ? true : status.includes(item.status)))
    .filter((item) =>
      houseDetailType.length === 0
        ? true
        : houseDetailType.includes(item.houseDetailType ?? null),
    )
    .filter((item) =>
      regionCode.length === 0 ? true : regionCode.includes(item.regionCode ?? null),
    )
    .filter((item) =>
      needle.length === 0
        ? true
        : (item.houseName ?? '').toLowerCase().includes(needle),
    )
    .sort((a, b) =>
      (b.subscriptionStartDate ?? '').localeCompare(a.subscriptionStartDate ?? ''),
    );
}

function readArrayParam<T extends string>(
  url: URL,
  key: string,
  allowed: readonly T[],
): T[] {
  const raw = url.searchParams.getAll(key).flatMap((v) => v.split(','));
  return raw.filter((v): v is T => (allowed as readonly string[]).includes(v));
}

const STATUS_VALUES = [
  'SUBSCRIPTION_SCHEDULED',
  'SUBSCRIPTION_ACTIVE',
  'RESULT_PENDING',
  'RESULT_TODAY',
  'SUBSCRIPTION_COMPLETED',
] as const satisfies readonly ItemStatus[];

const DETAIL_TYPE_VALUES = ['PRIVATE', 'NATIONAL'] as const;

const REGION_VALUES = [
  'SEOUL',
  'GANGWON',
  'DAEJEON',
  'CHUNGNAM',
  'SEJONG',
  'CHUNGBUK',
  'INCHEON',
  'GYEONGGI',
  'GWANGJU',
  'JEONNAM',
  'JEONBUK',
  'BUSAN',
  'GYEONGNAM',
  'ULSAN',
  'JEJU',
  'DAEGU',
  'GYEONGBUK',
] as const;

export const handlers = [
  // ─── /main/* — DTO endpoints the home page actually calls today.
  // Envelope shape `{ data: ... }` matches createEnvelopeParser (main-api.ts).
  http.get(`${API_BASE}/main/featured`, () =>
    HttpResponse.json({ data: mainFeatured }),
  ),

  http.get(`${API_BASE}/main/stats`, () =>
    HttpResponse.json({ data: mainStats }),
  ),

  http.get(`${API_BASE}/main/weekly-schedule`, () =>
    HttpResponse.json({ data: mainWeeklySchedule }),
  ),

  http.get(`${API_BASE}/main/top-trades`, () =>
    HttpResponse.json({ data: mainTopTrades }),
  ),

  // ─── /apt-sales — new production binding (orval-generated client).
  // Response envelope matches `MainApiResponseAptSalesListResponse`:
  //   { data: { totalCount, page, size, items: Item[] } }
  http.get(`${API_BASE}/apt-sales`, ({ request }) => {
    const url = new URL(request.url);

    const status = readArrayParam(url, 'status', STATUS_VALUES);
    const detailType = readArrayParam(url, 'houseDetailType', DETAIL_TYPE_VALUES);
    const region = readArrayParam(url, 'regionCode', REGION_VALUES);
    const keyword = url.searchParams.get('keyword') ?? '';

    const rawPage = Number(url.searchParams.get('page') ?? 0);
    const page = Number.isFinite(rawPage) && rawPage >= 0 ? Math.floor(rawPage) : 0;

    const rawSize = Number(url.searchParams.get('size') ?? 20);
    const size =
      Number.isFinite(rawSize) && rawSize >= 1 && rawSize <= 100
        ? Math.floor(rawSize)
        : 20;

    const filtered = filterAptSales(aptSalesItems, {
      status,
      houseDetailType: detailType,
      regionCode: region,
      keyword,
    });

    const items = filtered.slice(page * size, page * size + size);

    return HttpResponse.json({
      data: {
        totalCount: filtered.length,
        page,
        size,
        items,
      },
    });
  }),

  // Subscription list (paginated)
  http.get(`${API_BASE}/subscriptions`, ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') || '1');
    const perPage = 20;
    const status = url.searchParams.get('status');
    const region = url.searchParams.get('region');

    let filtered = [...subscriptions];
    if (status) filtered = filtered.filter((s) => s.status === status);
    if (region) filtered = filtered.filter((s) => s.location.sido === region);

    const total = filtered.length;
    const items = filtered.slice((page - 1) * perPage, page * perPage);

    return HttpResponse.json({
      items,
      total,
      page,
      totalPages: Math.ceil(total / perPage),
    });
  }),

  // Subscription detail
  http.get(`${API_BASE}/subscriptions/:id`, ({ params }) => {
    const { id } = params;
    if (id === subscriptionDetail.id) {
      return HttpResponse.json(subscriptionDetail);
    }
    const sub = subscriptions.find((s) => s.id === id);
    if (!sub) {
      return HttpResponse.json(
        { status: 404, code: 'LISTING_NOT_FOUND', message: '해당 청약 정보를 찾을 수 없습니다.' },
        { status: 404 },
      );
    }
    return HttpResponse.json({ ...subscriptionDetail, ...sub });
  }),

  // Search
  http.get(`${API_BASE}/search`, ({ request }) => {
    const url = new URL(request.url);
    const q = (url.searchParams.get('q') || '').toLowerCase();

    const matchedSubscriptions = subscriptions.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.location.sido.includes(q) ||
        s.location.gugun.includes(q) ||
        s.builder.toLowerCase().includes(q),
    );

    return HttpResponse.json({
      subscriptions: matchedSubscriptions.slice(0, 5),
    });
  }),
];
