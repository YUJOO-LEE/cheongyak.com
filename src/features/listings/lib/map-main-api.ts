import { z } from 'zod';
import {
  createEnvelopeParser,
  MainFeaturedResponseSchema,
  MainStatsResponseSchema,
  MainWeeklyScheduleResponseSchema,
  TopTradeResponseSchema,
  type ApiAnnouncementStatus,
  type ApiHouseDetailType,
  type MainFeaturedResponse,
  type MainStatsResponse,
  type MainWeeklyAnnouncement,
  type MainWeeklyScheduleResponse,
  type TopTradeResponse,
} from '@/shared/types/main-api';
import type {
  MarketInsight,
  Subscription,
  SubscriptionStatus,
  SubscriptionType,
  TopTrade,
} from '@/shared/types/api';

// ============================================================
// Envelope parsers (safeParse at trust boundary)
// ============================================================

export const parseFeaturedEnvelope: (raw: unknown) => MainFeaturedResponse =
  createEnvelopeParser(MainFeaturedResponseSchema, '/main/featured');

export const parseStatsEnvelope: (raw: unknown) => MainStatsResponse =
  createEnvelopeParser(MainStatsResponseSchema, '/main/stats');

export const parseWeeklyScheduleEnvelope: (raw: unknown) => MainWeeklyScheduleResponse =
  createEnvelopeParser(MainWeeklyScheduleResponseSchema, '/main/weekly-schedule');

export const parseTopTradesEnvelope: (raw: unknown) => TopTradeResponse[] =
  createEnvelopeParser(z.array(TopTradeResponseSchema), '/main/top-trades');

// ============================================================
// Enum mappers
// ============================================================

// TODO(RESULT_TODAY): "오늘 발표"는 행동 유발 신호인데 현재 도메인 enum에
// 대응 상태가 없어 pending으로 merge 중. StatusChip 디자인 확장 + 도메인
// enum에 'result-today' 추가는 후속 티켓에서 처리.
export function mapStatus(api: ApiAnnouncementStatus): SubscriptionStatus {
  switch (api) {
    case 'SUBSCRIPTION_ACTIVE':
      return 'accepting';
    case 'ANNOUNCEMENT_SCHEDULED':
    case 'SUBSCRIPTION_SCHEDULED':
      return 'upcoming';
    case 'RESULT_PENDING':
    case 'RESULT_TODAY':
      return 'pending';
    case 'SUBSCRIPTION_COMPLETED':
      return 'closed';
  }
}

export function mapType(detail: ApiHouseDetailType): SubscriptionType {
  return detail === 'PRIVATE' ? 'private' : 'public';
}

// ============================================================
// Format helpers
// ============================================================

export function formatArea(value: number): string {
  return Number.isInteger(value) ? `${value}㎡` : `${value.toFixed(2)}㎡`;
}

export function formatAreaRange(
  min: number | null | undefined,
  max: number | null | undefined,
): string {
  if (min == null && max == null) return '-';
  if (min != null && max != null) {
    if (min === max) return formatArea(min);
    return `${Math.round(min)}~${Math.round(max)}㎡`;
  }
  return formatArea((min ?? max) as number);
}

// 실거래가 카드용: 소수점 반올림 + 평 병기 (예: 84.99 → "85㎡ (25평)")
// 한국 부동산 관례상 평형 단위가 여전히 지배적이므로 병기 노출.
export function formatAreaWithPyeong(value: number): string {
  const rounded = Math.round(value);
  const pyeong = Math.floor(value / 3.3058);
  return `${rounded}㎡ (${pyeong}평)`;
}

export function formatAmount(value: number): string {
  // 서버 값은 만원 단위 (예: 50000 → 5억).
  if (value >= 10000) {
    const eok = Math.floor(value / 10000);
    const rem = value % 10000;
    return rem === 0 ? `${eok}억` : `${eok}억 ${rem.toLocaleString()}만`;
  }
  return `${value.toLocaleString()}만`;
}

export function formatPriceRange(
  min: number | null | undefined,
  max: number | null | undefined,
): string | undefined {
  if (min == null && max == null) return undefined;
  if (min != null && max != null) {
    if (min === max) return formatAmount(min);
    return `${formatAmount(min)} ~ ${formatAmount(max)}`;
  }
  return formatAmount((min ?? max) as number);
}

// ============================================================
// Object mappers
// ============================================================

export function mapFeaturedToSubscription(raw: MainFeaturedResponse): Subscription {
  return {
    id: String(raw.id),
    name: raw.houseName,
    location: {
      sido: raw.sidoName ?? '',
      gugun: raw.sigunguName ?? '',
      dong: raw.dongName ?? undefined,
    },
    builder: raw.constructorName ?? '-',
    status: mapStatus(raw.status),
    type: mapType(raw.houseDetailType),
    applicationStart: raw.subscriptionStartDate ?? '',
    applicationEnd: raw.subscriptionEndDate ?? '',
    totalUnits: raw.totalSupplyHousehold ?? 0,
    sizeRange: formatAreaRange(raw.minSupplyArea, raw.maxSupplyArea),
    priceRange: formatPriceRange(raw.minTopAmount, raw.maxTopAmount),
  };
}

function mapWeeklyAnnouncementToSubscription(
  ann: MainWeeklyAnnouncement,
  date: string,
): Subscription {
  return {
    id: String(ann.id),
    name: ann.houseName,
    location: {
      // weekly 응답에는 sidoName 이 없음 — 빈 값으로 둔다
      sido: '',
      gugun: ann.sigunguName ?? '',
      dong: ann.dongName ?? undefined,
    },
    builder: ann.constructorName ?? '-',
    status: mapStatus(ann.status),
    type: mapType(ann.houseDetailType),
    applicationStart: date,
    applicationEnd: date,
    totalUnits: ann.totalSupplyHousehold ?? 0,
    sizeRange: formatAreaRange(ann.minSupplyArea, ann.maxSupplyArea),
  };
}

// TODO(region-sido): API 응답에 sidoName 이 없어 "중구"/"서구" 등 동명이명
// 시군구 발생 시 사용자가 어느 시·도인지 구분 불가. 백엔드 스펙 확장 혹은
// 프론트 시군구↔시도 매핑 테이블 도입은 후속 티켓.
// TODO(units): dealAmount 는 만원 단위 long 으로 스펙 명시. 1,000,000(1000억)
// 초과 값은 원 단위 혼입 가능성으로 warn 로그.
export function mapTopTradeResponseToTopTrade(dto: TopTradeResponse): TopTrade {
  const regionParts = [dto.sigunguName, dto.dongName].filter(
    (v): v is string => !!v,
  );
  if (dto.dealAmount != null && dto.dealAmount > 1_000_000) {
    console.warn(
      `[top-trades] dealAmount ${dto.dealAmount} exceeds 만원 expected range; possible unit mismatch`,
    );
  }
  return {
    id: String(dto.id),
    aptName: dto.aptName,
    region: regionParts.length > 0 ? regionParts.join(' ') : '-',
    area: dto.exclusiveArea != null ? formatAreaWithPyeong(dto.exclusiveArea) : undefined,
    floor: dto.floor ?? undefined,
    dealAmount: dto.dealAmount != null ? formatAmount(dto.dealAmount) : '-',
    dealDate: dto.dealDate,
  };
}

// 같은 공고가 여러 day 에 중복 포함되어 내려온다는 서버 동작에 의존한다
// (/main/weekly-schedule 응답에서 실측 확인). 각 day.announcements 를
// day.date 로 stamping 해 flat 한 Subscription[] 으로 펼친다.
export function mapWeeklyScheduleToSubscriptions(
  raw: MainWeeklyScheduleResponse,
): Subscription[] {
  return raw.days.flatMap((day) =>
    day.announcements.map((ann) =>
      mapWeeklyAnnouncementToSubscription(ann, day.date),
    ),
  );
}

// ============================================================
// Stats → MarketInsight[]
// ============================================================

function trendFromChange(change: number | null | undefined): MarketInsight['trend'] {
  if (change == null || change === 0) return 'flat';
  return change > 0 ? 'up' : 'down';
}

// 음수일 때만 `-` 가 자연스럽게 붙고, 양수/0 은 부호 없이 숫자만 노출.
function changeValueString(value: number, suffix = ''): string {
  return `${value.toLocaleString()}${suffix}`;
}

export function mapStatsToInsights(raw: MainStatsResponse): MarketInsight[] {
  const insights: MarketInsight[] = [
    {
      label: '평균 경쟁률',
      value: `${raw.avgCompetitionRate.toFixed(1)}:1`,
      trend: trendFromChange(raw.competitionRateChange),
      trendValue:
        raw.competitionRateChange == null
          ? '변동 없음'
          : changeValueString(Number(raw.competitionRateChange.toFixed(1))),
    },
    {
      label: '총 공급세대',
      value: `${raw.totalSupplyHousehold.toLocaleString()}세대`,
      trend: trendFromChange(raw.supplyHouseholdChange),
      trendValue:
        raw.supplyHouseholdChange == null
          ? '변동 없음'
          : changeValueString(raw.supplyHouseholdChange, '세대'),
    },
    raw.popularRegion
      ? {
          label: '인기 지역',
          value: raw.popularRegion.sigunguName,
          trend: 'flat',
          trendValue: `${raw.popularRegion.avgCompetitionRate.toFixed(1)}:1`,
        }
      : {
          label: '인기 지역',
          value: '집계 중',
          trend: 'flat',
          trendValue: '-',
        },
  ];

  return insights;
}
