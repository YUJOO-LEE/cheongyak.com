/**
 * API ↔ domain mapping for the `/apt-sales` endpoint.
 *
 * The client keeps a stable domain enum (`SubscriptionStatus`, `SubscriptionType`)
 * regardless of backend renames. This module absorbs the rename surface:
 * every value that leaves the generated orval layer on its way to feature
 * code passes through one of the `map*` functions below.
 *
 * See `docs/apt-sales-binding-plan.md` §5 for the full enum policy.
 */
import type { Item } from '@/shared/api/generated/schemas/item';
import type { ItemHouseDetailType } from '@/shared/api/generated/schemas/itemHouseDetailType';
import type { ItemRegionCode } from '@/shared/api/generated/schemas/itemRegionCode';
import type { ItemStatus } from '@/shared/api/generated/schemas/itemStatus';
import type { Subscription, SubscriptionStatus, SubscriptionType } from '@/shared/types/api';

const STATUS_MAP: Record<ItemStatus, SubscriptionStatus> = {
  SUBSCRIPTION_SCHEDULED: 'upcoming',
  SUBSCRIPTION_ACTIVE: 'accepting',
  RESULT_PENDING: 'pending',
  // TODO(phase-6): API 의 RESULT_TODAY("발표일 당일") 와 클라이언트의
  // contracting("계약중") 은 의미가 다릅니다. Jobs 의 UX 결정 후
  // (a) 클라이언트 enum 을 result_today 로 리네임하거나
  // (b) RESULT_TODAY → pending 으로 합치는 방향 중 하나를 선택.
  // 현 PR 에서는 기존 라벨을 건드리지 않는 옵션 (a) 의 임시 형태로 contracting 유지.
  RESULT_TODAY: 'contracting',
  SUBSCRIPTION_COMPLETED: 'closed',
};

const DETAIL_TYPE_MAP: Record<'PRIVATE' | 'NATIONAL', SubscriptionType> = {
  PRIVATE: 'private',
  NATIONAL: 'public',
};

/**
 * 17개 시도 enum → 한국어 시도명. `regionName` 이 서버에서 올라오면
 * 그 값을 우선 쓰지만, null 이면 enum 기반 fallback 이 필요합니다.
 * Phase 6 의 지역 드롭다운도 이 맵의 라벨을 그대로 씁니다.
 */
export const REGION_LABEL_MAP: Record<NonNullable<ItemRegionCode>, string> = {
  SEOUL: '서울특별시',
  GANGWON: '강원도',
  DAEJEON: '대전광역시',
  CHUNGNAM: '충청남도',
  SEJONG: '세종특별자치시',
  CHUNGBUK: '충청북도',
  INCHEON: '인천광역시',
  GYEONGGI: '경기도',
  GWANGJU: '광주광역시',
  JEONNAM: '전라남도',
  JEONBUK: '전라북도',
  BUSAN: '부산광역시',
  GYEONGNAM: '경상남도',
  ULSAN: '울산광역시',
  JEJU: '제주특별자치도',
  DAEGU: '대구광역시',
  GYEONGBUK: '경상북도',
};

/**
 * Region dropdown grouping — preserves the Korean mental model of
 * 수도권 → 광역시 → 도 rather than alphabetical order. Consumed by
 * the Phase 6 region multi-select per `docs/filter-ui-spec.md` §3.2.
 */
export const REGION_GROUPS: ReadonlyArray<{
  label: string;
  codes: ReadonlyArray<NonNullable<ItemRegionCode>>;
}> = [
  { label: '수도권', codes: ['SEOUL', 'GYEONGGI', 'INCHEON'] },
  {
    label: '광역시',
    codes: ['BUSAN', 'DAEGU', 'GWANGJU', 'DAEJEON', 'ULSAN', 'SEJONG'],
  },
  {
    label: '도',
    codes: [
      'GANGWON',
      'CHUNGBUK',
      'CHUNGNAM',
      'JEONBUK',
      'JEONNAM',
      'GYEONGBUK',
      'GYEONGNAM',
      'JEJU',
    ],
  },
];

export function mapApiStatusToDomain(apiStatus: ItemStatus): SubscriptionStatus {
  return STATUS_MAP[apiStatus];
}

export function mapApiDetailTypeToDomain(
  apiType: ItemHouseDetailType | undefined,
): SubscriptionType {
  if (!apiType) return 'private';
  return DETAIL_TYPE_MAP[apiType];
}

/**
 * `AptSalesListItem` → `Subscription` 도메인 타입.
 *
 * - Nullable wire fields are collapsed to safe display defaults so the
 *   UI never has to branch on "maybe missing" everywhere.
 * - `sizeRange` is reconstructed from `minSupplyArea`/`maxSupplyArea`
 *   because the API ships them as separate numeric fields.
 * - `priceRange` is not yet available on this endpoint — left undefined.
 * - `id` is a numeric PK on the wire; we stringify to match the
 *   domain's string-id convention.
 */
export function mapItemToSubscription(item: Item): Subscription {
  const sido =
    item.regionName ?? (item.regionCode ? REGION_LABEL_MAP[item.regionCode] : '');

  return {
    id: String(item.id),
    name: item.houseName ?? '',
    location: {
      sido,
      gugun: item.sigunguName ?? '',
      dong: item.dongName ?? undefined,
    },
    builder: item.constructorName ?? '',
    status: mapApiStatusToDomain(item.status),
    type: mapApiDetailTypeToDomain(item.houseDetailType),
    applicationStart: item.subscriptionStartDate ?? '',
    applicationEnd: item.subscriptionEndDate ?? '',
    totalUnits: item.totalSupplyHousehold ?? 0,
    sizeRange: formatSizeRange(item.minSupplyArea, item.maxSupplyArea),
  };
}

function formatSizeRange(
  min: number | null | undefined,
  max: number | null | undefined,
): string {
  if (min == null && max == null) return '';
  if (min != null && max != null && min !== max) {
    return `${formatArea(min)} ~ ${formatArea(max)}`;
  }
  return formatArea(min ?? max ?? 0);
}

function formatArea(value: number): string {
  const rounded = Number.isInteger(value) ? value : Number(value.toFixed(1));
  return `${rounded}㎡`;
}
