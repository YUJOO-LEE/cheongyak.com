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
import type { ItemRegionCode } from '@/shared/api/generated/schemas/itemRegionCode';
import type { ItemStatus } from '@/shared/api/generated/schemas/itemStatus';
import type { Subscription, SubscriptionStatus, SubscriptionType } from '@/shared/types/api';

const STATUS_MAP: Record<ItemStatus, SubscriptionStatus> = {
  SUBSCRIPTION_SCHEDULED: 'upcoming',
  SUBSCRIPTION_ACTIVE: 'accepting',
  RESULT_PENDING: 'pending',
  RESULT_TODAY: 'result_today',
  SUBSCRIPTION_COMPLETED: 'closed',
};

const DETAIL_TYPE_MAP: Record<'PRIVATE' | 'NATIONAL', SubscriptionType> = {
  PRIVATE: 'private',
  NATIONAL: 'public',
};

/**
 * 17개 시도 enum → 한국어 시도명. Phase 6 의 지역 드롭다운에서 라벨로
 * 사용합니다. `regionName` 은 서버에서 항상 내려오므로 mapping 함수는
 * 그 값을 그대로 쓰지만, 필터 UI 는 코드만 가지고 라벨을 표시해야 해서
 * 별도 맵이 필요합니다.
 */
export const REGION_LABEL_MAP: Record<ItemRegionCode, string> = {
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
  codes: ReadonlyArray<ItemRegionCode>;
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
  apiType: 'PRIVATE' | 'NATIONAL',
): SubscriptionType {
  return DETAIL_TYPE_MAP[apiType];
}

/**
 * `Item` → `Subscription` 도메인 매핑.
 *
 * - `sizeRange` 는 `minSupplyArea`/`maxSupplyArea` 가 분리된 숫자 필드로
 *   오기 때문에 한 줄로 합칩니다.
 * - `priceRange` 는 아직 이 엔드포인트가 안 내려주므로 미정.
 * - `id` 는 wire 에서 number 지만 도메인 규약상 string.
 * - `sigunguName`/`dongName`/`constructorName` 만 nullable → 빈 문자열로.
 */
export function mapItemToSubscription(item: Item): Subscription {
  return {
    id: String(item.id),
    name: item.houseName,
    location: {
      sido: item.regionName,
      gugun: item.sigunguName ?? '',
      dong: item.dongName ?? undefined,
    },
    builder: item.constructorName ?? '',
    status: mapApiStatusToDomain(item.status),
    type: mapApiDetailTypeToDomain(item.houseDetailType),
    applicationStart: item.subscriptionStartDate,
    applicationEnd: item.subscriptionEndDate,
    totalUnits: item.totalSupplyHousehold,
    sizeRange: formatSizeRange(item.minSupplyArea, item.maxSupplyArea),
  };
}

export function formatSizeRange(min: number, max: number): string {
  if (min !== max) {
    return `${formatArea(min)} ~ ${formatArea(max)}`;
  }
  return formatArea(min);
}

export function formatArea(value: number): string {
  const rounded = Number.isInteger(value) ? value : Number(value.toFixed(1));
  return `${rounded}㎡`;
}
